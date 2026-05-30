import type { ClassifierResult } from '../types/classifier';

export class ClassifyError extends Error {
  readonly status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

export async function classify(text: string): Promise<ClassifierResult> {
  const res = await fetch('/api/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg = typeof body.error === 'string' ? body.error : 'classify request failed';
    throw new ClassifyError(msg, res.status);
  }

  return res.json() as Promise<ClassifierResult>;
}
