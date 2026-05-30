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
      maxOutputTokens: 256,
      responseMimeType: 'application/json',
    },
  });

  const raw = JSON.parse(response.text ?? '') as unknown;
  if (typeof raw !== 'object' || raw === null) throw new Error('non-object response');

  const { tier, reasoning } = raw as Record<string, unknown>;
  if (typeof tier !== 'string' || !VALID_TIERS.has(tier)) throw new Error('invalid tier');
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

  try {
    const result = await callModel(ai, 'gemini-2.0-flash', text);
    res.status(200).json(result);
  } catch (e1) {
    console.error('[classify] primary failed:', e1);
    try {
      const result = await callModel(ai, 'gemini-1.5-flash', text);
      res.status(200).json(result);
    } catch (e2) {
      console.error('[classify] fallback failed:', e2);
      res.status(500).json({ error: 'classification failed' });
    }
  }
}
