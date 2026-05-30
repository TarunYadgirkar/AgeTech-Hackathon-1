import twilio from 'twilio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    res.status(503).json({ error: 'notify not configured' });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const to = typeof body?.to === 'string' ? body.to.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : 'Elder care alert.';

  if (!to) {
    res.status(400).json({ error: 'to is required' });
    return;
  }

  const safe = esc(message);
  const twiml = `<Response><Say voice="alice" rate="slow">${safe}</Say><Pause length="2"/><Say voice="alice" rate="slow">${safe}</Say></Response>`;

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const call = await client.calls.create({ to, from: TWILIO_FROM_NUMBER, twiml });
    res.status(200).json({ success: true, sid: call.sid });
  } catch (e) {
    console.error('[notify] call failed:', e instanceof Error ? e.message : e);
    res.status(500).json({ error: 'call failed' });
  }
}
