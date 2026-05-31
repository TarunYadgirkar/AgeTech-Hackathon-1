import { GoogleGenAI } from '@google/genai';
import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

async function logIncident(description: string, tier: string, reasoning: string) {
  if (!process.env.DATABASE_URL) return;
  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`CREATE TABLE IF NOT EXISTS incidents (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      description TEXT NOT NULL,
      tier VARCHAR(10),
      reasoning TEXT
    )`;
    await sql`INSERT INTO incidents (description, tier, reasoning) VALUES (${description}, ${tier}, ${reasoning})`;
  } catch (e) {
    console.warn('[classify] neon log failed:', e instanceof Error ? e.message : e);
  }
}

type SeverityTier = 'minor' | 'medium' | 'major';
interface ClassifierResult { tier: SeverityTier; reasoning: string; }

const SYSTEM_PROMPT =
  'You are a triage classifier for an elder-care escalation system. You receive a ' +
  'short free-text description of a possible problem with an older adult living alone. ' +
  'Classify the situation into exactly one severity tier — minor, medium, or major — ' +
  'using only the description provided (do not assume medical history). ' +
  'minor = slightly off a normal routine, no sign of harm. ' +
  'medium = a clear deviation that could signal a problem and warrants prompt human contact. ' +
  'major = signs of a fall, medical event, or unresponsiveness needing the fastest response, ' +
  'up to emergency services. If you are between two tiers, choose the higher one. ' +
  'Respond with ONLY a JSON object: {"tier": "minor|medium|major", "reasoning": "1-3 sentences"}. ' +
  'Output nothing else.';

const VALID_TIERS = new Set<string>(['minor', 'medium', 'major']);

const MAJOR_KEYWORDS = ['fall', 'fell', 'floor', 'unresponsive', 'unconscious', 'collapsed', 'not breathing', 'chest pain', 'stroke', 'seizure', 'emergency', 'blood', 'injured', 'injury'];
const MEDIUM_KEYWORDS = ['not responded', 'not responding', "hasn't gotten up", 'no activity', 'prolonged', 'unusual', 'missed', 'hasn\'t moved', 'hours', 'curtains', 'lights', 'door'];

function keywordFallback(text: string): ClassifierResult {
  const lower = text.toLowerCase();
  if (MAJOR_KEYWORDS.some(k => lower.includes(k))) {
    return { tier: 'major', reasoning: 'Keyword analysis detected signs of a serious medical event or fall requiring immediate response.' };
  }
  if (MEDIUM_KEYWORDS.some(k => lower.includes(k))) {
    return { tier: 'medium', reasoning: 'Keyword analysis detected an unusual deviation from routine that warrants prompt human contact.' };
  }
  return { tier: 'minor', reasoning: 'Keyword analysis found no immediate red flags — slight deviation from normal routine.' };
}

function isRateLimit(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
}

async function callModel(
  ai: GoogleGenAI,
  model: string,
  text: string,
): Promise<ClassifierResult> {
  const response = await ai.models.generateContent({
    model,
    contents: text,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 512,
    },
  });

  const raw_text = response.text ?? '';
  // Extract JSON object from response (handles any wrapping text from thinking models)
  const match = raw_text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('no JSON in response');
  const raw = JSON.parse(match[0]) as unknown;
  if (typeof raw !== 'object' || raw === null) throw new Error('non-object response');

  const { tier, reasoning } = raw as Record<string, unknown>;
  if (typeof tier !== 'string' || !VALID_TIERS.has(tier)) throw new Error(`invalid tier: ${String(tier)}`);
  if (typeof reasoning !== 'string' || !reasoning.trim()) throw new Error('empty reasoning');

  return { tier: tier as SeverityTier, reasoning };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const body = req.body as Record<string, unknown> | undefined;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];
  let lastErr: unknown;
  for (const model of models) {
    try {
      const result = await callModel(ai, model, text);
      logIncident(text, result.tier, result.reasoning).catch(() => {});
      res.status(200).json(result);
      return;
    } catch (e) {
      lastErr = e;
      console.error(`[classify] ${model} failed:`, e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    }
  }
  const fallback = keywordFallback(text);
  logIncident(text, fallback.tier, fallback.reasoning).catch(() => {});
  res.status(200).json({ ...fallback, _debug_err: lastErr instanceof Error ? `${lastErr.name}: ${lastErr.message?.slice(0, 300)}` : String(lastErr).slice(0, 300) });
}
