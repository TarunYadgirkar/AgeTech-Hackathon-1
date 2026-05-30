import Retell from 'retell-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { RETELL_API_KEY, RETELL_AGENT_ID, RETELL_FROM_NUMBER } = process.env;
  if (!RETELL_API_KEY || !RETELL_AGENT_ID || !RETELL_FROM_NUMBER) {
    res.status(503).json({ error: 'notify not configured' });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const to = typeof body?.to === 'string' ? body.to.trim() : '';
  const target = typeof body?.target === 'string' ? body.target.trim() : 'Contact';
  const incident = typeof body?.incident === 'string' ? body.incident.trim() : 'Elder care alert';

  if (!to) {
    res.status(400).json({ error: 'to is required' });
    return;
  }

  try {
    const client = new Retell({ apiKey: RETELL_API_KEY });
    const call = await client.call.createPhoneCall({
      from_number: RETELL_FROM_NUMBER,
      to_number: to,
      override_agent_id: RETELL_AGENT_ID,
      retell_llm_dynamic_variables: {
        target_name: target,
        incident_description: incident,
      },
    });
    res.status(200).json({ success: true, call_id: call.call_id });
  } catch (e) {
    console.error('[notify] Retell call failed:', e instanceof Error ? e.message : e);
    res.status(500).json({ error: 'call failed' });
  }
}
