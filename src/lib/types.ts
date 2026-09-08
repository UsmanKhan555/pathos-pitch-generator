export type Tone = "formal" | "conversational";

export interface PitchInput {
  clientName: string;
  description: string;
  hook: string;
  journalistName?: string;
  publication?: string;
  tone?: Tone;
  senderName?: string;
}

export interface PitchOutput {
  subject: string;
  body: string;
}

export interface GeneratePitchResponse {
  pitch: PitchOutput;
  warnings: string[];
}

export interface HistoryEntry {
  id: string;
  createdAt: number;
  input: PitchInput;
  pitch: PitchOutput;
  warnings: string[];
}
