export type Tone = "formal" | "conversational";

export interface PitchInput {
  clientName: string;
  description: string;
  hook: string;
  journalistName?: string;
  publication?: string;
  tone?: Tone;
}

export interface PitchOutput {
  subject: string;
  body: string;
}

export interface GeneratePitchResponse {
  pitch: PitchOutput;
  warnings: string[];
}
