import twilio from 'twilio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
  const target = typeof body?.target === 'string' ? body.target.trim() : 'a resident';
  const incident = typeof body?.incident === 'string' ? body.incident.trim() : 'a possible emergency';

  if (!to) {
    res.status(400).json({ error: 'to is required' });
    return;
  }

  const message = `This is Guardian Alert. ${target} may need your immediate attention. ${incident} Please check on them as soon as possible.`;

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.calls.create({
      from: TWILIO_FROM_NUMBER,
      to,
      twiml: `<Response><Say voice="Polly.Joanna">${message}</Say><Pause length="1"/><Say voice="Polly.Joanna">This message was sent by Guardian Alert. Please respond promptly.</Say></Response>`,
    });
    res.status(200).json({ success: true });
  } catch (e) {
    console.error('[notify] Twilio call failed:', e instanceof Error ? e.message : e);
    res.status(500).json({ error: 'call failed' });
  }
}
