import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
  let lastErr: unknown;
  for (const model of models) {
    try {
      const result = await callModel(ai, model, text);
      res.status(200).json(result);
      return;
    } catch (e) {
      lastErr = e;
      console.error(`[classify] ${model} failed:`, e instanceof Error ? e.message : e);
    }
  }
  if (isRateLimit(lastErr)) {
    res.status(429).json({ error: 'rate limited — try again in a moment' });
  } else {
    res.status(500).json({ error: 'classification failed' });
  }
}
