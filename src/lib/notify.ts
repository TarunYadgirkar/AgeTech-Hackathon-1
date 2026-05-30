const TERMINAL_STATUSES = new Set(['busy', 'failed', 'no-answer', 'canceled']);
const ANSWERED_STATUSES = new Set(['in-progress', 'completed']);

export async function notifyCall(to: string, message: string): Promise<string | null> {
  const res = await fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, message }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    console.warn('[notify] failed:', body.error ?? res.status);
    return null;
  }
  const body = await res.json() as { success: boolean; sid?: string };
  return body.sid ?? null;
}

export async function pollCallResponse(
  sid: string,
  onAnswered: () => void,
  signal: AbortSignal,
): Promise<void> {
  while (!signal.aborted) {
    await new Promise<void>(r => setTimeout(r, 2500));
    if (signal.aborted) return;
    try {
      const res = await fetch(`/api/call-status?sid=${encodeURIComponent(sid)}`);
      if (!res.ok || signal.aborted) return;
      const { status } = await res.json() as { status: string };
      if (ANSWERED_STATUSES.has(status)) {
        onAnswered();
        return;
      }
      if (TERMINAL_STATUSES.has(status)) return;
    } catch {
      // transient — keep polling
    }
  }
}
