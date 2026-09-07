import { NextResponse } from "next/server";
import type { GeneratePitchResponse, PitchInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as PitchInput;

  if (!input.clientName || !input.description || !input.hook) {
    return NextResponse.json(
      { error: "clientName, description, and hook are required" },
      { status: 400 },
    );
  }

  // Hardcoded response for now - real Anthropic call lands in a later commit.
  const response: GeneratePitchResponse = {
    pitch: {
      subject: `${input.clientName} + your beat: a quick one`,
      body: `Hi${input.journalistName ? ` ${input.journalistName}` : ""},\n\n${input.clientName} (${input.description}) just had news: ${input.hook}. Thought it might be relevant to what you cover${input.publication ? ` at ${input.publication}` : ""}.\n\nWould you be open to a 15-minute call this week to hear more?\n\nBest,\n[Your name]`,
    },
    warnings: [],
  };

  return NextResponse.json(response);
}
