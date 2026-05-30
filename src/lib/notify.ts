export async function notifyCall(to: string, message: string): Promise<void> {
  const res = await fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, message }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    console.warn('[notify] failed:', body.error ?? res.status);
  }
}
