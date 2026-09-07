import { NextResponse } from "next/server";
import { generatePitch } from "@/lib/anthropic";
import { validatePitch } from "@/lib/validation";
import type { GeneratePitchResponse, PitchInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as PitchInput;

  if (!input.clientName || !input.description || !input.hook) {
    return NextResponse.json(
      { error: "clientName, description, and hook are required" },
      { status: 400 },
    );
  }

  try {
    const pitch = await generatePitch(input);

    const response: GeneratePitchResponse = {
      pitch,
      warnings: validatePitch(pitch),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Pitch generation failed", err);
    return NextResponse.json(
      { error: "Failed to generate pitch" },
      { status: 502 },
    );
  }
}
