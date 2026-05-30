---
name: classifier
description: Classify a free-text elder-care event description into a severity tier (minor / medium / major) and return plain-language reasoning for on-screen display. Use whenever turning a typed incident description into a structured severity judgment for the escalation engine.
---

# Severity Classifier

Turns a free-text description of a routine disruption into a **severity tier**
plus **reasoning**. The reasoning is not optional — the UI renders it so the
user sees *why* an event was graded the way it was, not just the label. This
visible reasoning is the product's clearest signal of intelligence over a dumb
if-statement.

## Where this runs

- Called from the Vercel proxy `api/classify.ts`, never from the browser.
- SDK: `@google/genai`, env var: `GEMINI_API_KEY`.
- Model: `gemini-2.0-flash` (primary).
- Fallback on error: `gemini-1.5-flash`.
- Keep `maxOutputTokens` modest; reasoning should be 1–3 sentences.
- Use `responseMimeType: 'application/json'` to guarantee JSON output.

## Scope rule

Classify from the **description text only**. Do **not** factor in medical
history (a deliberate day-one scope decision). If the text is vague, say so in
the reasoning and grade conservatively toward the safer (higher) tier when a
serious reading is plausible.

## Severity tiers

| Tier | Meaning | Examples |
|------|---------|----------|
| **minor** | Slightly off a normal routine; no sign of harm. | Late to the kitchen; mail not collected; up later than usual. |
| **medium** | A clear deviation that could signal a problem; warrants prompt human contact. | Hasn't gotten out of bed by early afternoon; missed two routine checkpoints; unusual prolonged inactivity. |
| **major** | Signs of a fall, medical event, or unresponsiveness; needs the fastest, most intensive response, up to 911. | On the floor; not responding; detected down for several minutes; signs of a medical emergency. |

When between two tiers, choose the **higher** one and explain the uncertainty in
the reasoning. A survivable incident becoming serious is the failure mode we
are guarding against.

## Output schema (STRICT)

Return **only** a single JSON object, no prose, no markdown fences:

```json
{
  "tier": "minor | medium | major",
  "reasoning": "1–3 plain sentences explaining why this tier was chosen."
}
```

Rules:
- `tier` MUST be exactly one of `minor`, `medium`, `major` (lowercase).
- `reasoning` MUST be present and non-empty — the UI depends on it.
- No additional keys. No text outside the JSON object.
- This matches the `ClassifierResult` type in `src/types/classifier.ts`.

## Prompt (system) for the classifier call

> You are a triage classifier for an elder-care escalation system. You receive a
> short free-text description of a possible problem with an older adult living
> alone. Classify the situation into exactly one severity tier — `minor`,
> `medium`, or `major` — using only the description provided (do not assume
> medical history). `minor` = slightly off a normal routine, no sign of harm.
> `medium` = a clear deviation that could signal a problem and warrants prompt
> human contact. `major` = signs of a fall, medical event, or unresponsiveness
> needing the fastest response, up to emergency services. If you are between two
> tiers, choose the higher one. Respond with ONLY a JSON object of the form
> {"tier": "...", "reasoning": "..."} where reasoning is 1–3 plain sentences
> explaining your choice. Output nothing else.

The user's typed description is passed as the user message.

## Parsing guidance for `api/classify.ts`

- Parse the response as JSON. If parsing fails or `tier` is invalid, retry once
  with the Haiku fallback model.
- Validate `tier` against the allowed set before returning to the client.
- Never leak the API key or raw model errors to the client; return a clean
  `{ tier, reasoning }` or a safe error shape.
