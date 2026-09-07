import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import type { PitchInput, PitchOutput } from "@/lib/types";

const PitchSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

const client = new Anthropic();

export async function generatePitch(input: PitchInput): Promise<PitchOutput> {
  const response = await client.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(input) }],
    output_config: { format: zodOutputFormat(PitchSchema) },
  });

  if (!response.parsed_output) {
    throw new Error("Model did not return parseable output");
  }

  return response.parsed_output;
}
