import twilio from 'twilio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const sid = typeof req.query.sid === 'string' ? req.query.sid.trim() : '';
  if (!sid) {
    res.status(400).json({ error: 'sid required' });
    return;
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    res.status(503).json({ error: 'not configured' });
    return;
  }

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const call = await client.calls(sid).fetch();
    res.status(200).json({ status: call.status });
  } catch (e) {
    console.error('[call-status] fetch failed:', e instanceof Error ? e.message : e);
    res.status(500).json({ error: 'status fetch failed' });
  }
}
