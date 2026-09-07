import type { PitchInput } from "@/lib/types";

export function buildSystemPrompt(): string {
  return `You are an expert PR pitch writer with years of experience getting journalists to respond to cold outreach. You write concise, specific pitch emails that connect a client's news to a reporter's beat - never generic press-release copy.

Rules:
- Body under 150 words.
- Open with the news hook, not company boilerplate.
- Draw an explicit, specific connection between the hook and why this journalist (or "a journalist covering this space" if none given) would care. No vague claims like "this is exciting" or "a game changer."
- No superlatives or marketing fluff (avoid words like "revolutionary," "game-changing," "thrilled to announce").
- End with exactly one clear, specific ask (e.g. a 15-minute call this week, an interview slot) - never a vague "let me know if interested."
- Never use placeholder brackets like [Name] or [Company]. Use the real values given, or write naturally around missing information.
- Output only the structured subject/body fields - no preamble, no markdown.`;
}

export function buildUserPrompt(input: PitchInput): string {
  const lines = [
    `Client/company name: ${input.clientName}`,
    `What the client does: ${input.description}`,
    `News hook/angle: ${input.hook}`,
  ];

  if (input.journalistName) {
    lines.push(`Journalist name: ${input.journalistName}`);
  }
  if (input.publication) {
    lines.push(`Publication: ${input.publication}`);
  }
  lines.push(`Tone: ${input.tone === "formal" ? "Formal" : input.tone === "conversational" ? "Conversational" : "Use your judgment"}`);

  return `Write a pitch email for the following:\n\n${lines.join("\n")}`;
}
