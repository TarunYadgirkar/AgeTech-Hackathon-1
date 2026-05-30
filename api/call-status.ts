import Retell from 'retell-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const NO_ANSWER_REASONS = new Set(['no_answer', 'voicemail_reach', 'line_error', 'user_busy']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const call_id = typeof req.query.call_id === 'string' ? req.query.call_id.trim() : '';
  if (!call_id) {
    res.status(400).json({ error: 'call_id required' });
    return;
  }

  const { RETELL_API_KEY } = process.env;
  if (!RETELL_API_KEY) {
    res.status(503).json({ error: 'not configured' });
    return;
  }

  try {
    const client = new Retell({ apiKey: RETELL_API_KEY });
    const call = await client.call.retrieve(call_id);
    const disconnectReason = (call as unknown as Record<string, unknown>).disconnection_reason as string | undefined;

    let status: 'ringing' | 'answered' | 'no_answer' | 'ended';
    if (call.call_status === 'ongoing') {
      status = 'answered';
    } else if (call.call_status === 'ended') {
      status = disconnectReason && NO_ANSWER_REASONS.has(disconnectReason) ? 'no_answer' : 'ended';
    } else if (call.call_status === 'error') {
      status = 'no_answer';
    } else {
      status = 'ringing';
    }

    res.status(200).json({ status, raw: call.call_status, disconnect_reason: disconnectReason });
  } catch (e) {
    console.error('[call-status] fetch failed:', e instanceof Error ? e.message : e);
    res.status(500).json({ error: 'status fetch failed' });
  }
}
