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
    throw new ClassifyError('classify request failed', res.status);
  }

  return res.json() as Promise<ClassifierResult>;
}
