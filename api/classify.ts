import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ClassifierResult } from '../src/types/classifier';
import type { SeverityTier } from '../src/types/escalation';

const SYSTEM_PROMPT =
  'You are a triage classifier for an elder-care escalation system. You receive a ' +
  'short free-text description of a possible problem with an older adult living alone. ' +
  'Classify the situation into exactly one severity tier — `minor`, `medium`, or `major` — ' +
  'using only the description provided (do not assume medical history). ' +
  '`minor` = slightly off a normal routine, no sign of harm. ' +
  '`medium` = a clear deviation that could signal a problem and warrants prompt human contact. ' +
  '`major` = signs of a fall, medical event, or unresponsiveness needing the fastest response, ' +
  'up to emergency services. If you are between two tiers, choose the higher one. ' +
  'Respond with ONLY a JSON object of the form {"tier": "...", "reasoning": "..."} ' +
  'where reasoning is 1–3 plain sentences explaining your choice. Output nothing else.';

const VALID_TIERS = new Set<string>(['minor', 'medium', 'major']);

async function callModel(
  client: Anthropic,
  model: string,
  text: string,
): Promise<ClassifierResult> {
  const msg = await client.messages.create({
    model,
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: text }],
  });

  const block = msg.content[0];
  if (block.type !== 'text') throw new Error('unexpected content type');

  const raw = JSON.parse(block.text) as unknown;
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

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const result = await callModel(client, 'claude-sonnet-4-6', text);
    res.status(200).json(result);
  } catch {
    try {
      const result = await callModel(client, 'claude-haiku-4-5-20251001', text);
      res.status(200).json(result);
    } catch {
      res.status(500).json({ error: 'classification failed' });
    }
  }
}
