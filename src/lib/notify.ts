export async function notifyCall(to: string, target: string, incident: string): Promise<string | null> {
  const res = await fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, target, incident }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    console.warn('[notify] failed:', body.error ?? res.status);
    return null;
  }
  const body = await res.json() as { success: boolean; call_id?: string };
  return body.call_id ?? null;
}

export async function pollCallResponse(
  call_id: string,
  onAnswered: () => void,
  onNotAnswered: () => void,
  signal: AbortSignal,
): Promise<void> {
  while (!signal.aborted) {
    await new Promise<void>(r => setTimeout(r, 2500));
    if (signal.aborted) return;
    try {
      const res = await fetch(`/api/call-status?call_id=${encodeURIComponent(call_id)}`);
      if (!res.ok || signal.aborted) return;
      const { status } = await res.json() as { status: string };
      if (status === 'answered') { onAnswered(); return; }
      if (status === 'no_answer') { onNotAnswered(); return; }
      if (status === 'ended') { onAnswered(); return; } // completed conversation
    } catch {
      // transient — keep polling
    }
  }
}
