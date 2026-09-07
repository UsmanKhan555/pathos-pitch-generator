import type { PitchOutput } from "@/lib/types";

const MIN_WORDS = 25;
const MAX_WORDS = 180;

const PLACEHOLDER_PATTERN = /\[[^\]\n]{1,40}\]/;

const REFUSAL_PATTERN =
  /\b(i'?m sorry|i apologize|as an ai|i cannot assist|i can'?t assist|i'?m not able to|i am not able to|i cannot help|i can'?t help|as a language model)\b/i;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validatePitch(pitch: PitchOutput): string[] {
  const warnings: string[] = [];
  const combined = `${pitch.subject}\n${pitch.body}`;

  if (pitch.subject.trim() === "") {
    warnings.push("Subject line is empty.");
  }

  const words = wordCount(pitch.body);
  if (words < MIN_WORDS) {
    warnings.push(`Body is only ${words} words - looks incomplete.`);
  } else if (words > MAX_WORDS) {
    warnings.push(`Body is ${words} words - over the ~150 word target, consider trimming.`);
  }

  if (PLACEHOLDER_PATTERN.test(combined)) {
    warnings.push("Looks like a placeholder (e.g. \"[Name]\") leaked into the draft.");
  }

  if (REFUSAL_PATTERN.test(combined)) {
    warnings.push("Draft contains refusal/apology language - the model may not have followed the format.");
  }

  return warnings;
}
