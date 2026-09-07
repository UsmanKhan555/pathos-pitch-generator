"use client";

import { useState } from "react";
import type { GeneratePitchResponse, PitchInput, PitchOutput, Tone } from "@/lib/types";

const initialInput: PitchInput = {
  clientName: "",
  description: "",
  hook: "",
  journalistName: "",
  publication: "",
  tone: undefined,
};

export default function Home() {
  const [input, setInput] = useState<PitchInput>(initialInput);
  const [submitting, setSubmitting] = useState(false);
  const [pitch, setPitch] = useState<PitchOutput | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof PitchInput>(key: K, value: PitchInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const data = (await res.json()) as GeneratePitchResponse;
      setPitch(data.pitch);
      setWarnings(data.warnings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    input.clientName.trim() !== "" &&
    input.description.trim() !== "" &&
    input.hook.trim() !== "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Pitch Email Generator
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Draft a first-pass PR pitch email from a client and a news hook.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Client / company name" required>
            <input
              type="text"
              value={input.clientName}
              onChange={(e) => update("clientName", e.target.value)}
              placeholder="Acme Robotics"
              className={inputClass}
            />
          </Field>

          <Field label="What does the client do?" required>
            <input
              type="text"
              value={input.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Builds warehouse picking robots for mid-size distributors"
              className={inputClass}
            />
          </Field>

          <Field label="News hook / angle" required>
            <input
              type="text"
              value={input.hook}
              onChange={(e) => update("hook", e.target.value)}
              placeholder="Raised a $2M seed round led by..."
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Journalist name (optional)">
              <input
                type="text"
                value={input.journalistName}
                onChange={(e) => update("journalistName", e.target.value)}
                placeholder="Jane Doe"
                className={inputClass}
              />
            </Field>

            <Field label="Publication (optional)">
              <input
                type="text"
                value={input.publication}
                onChange={(e) => update("publication", e.target.value)}
                placeholder="TechCrunch"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Tone (optional)">
            <select
              value={input.tone ?? ""}
              onChange={(e) =>
                update(
                  "tone",
                  e.target.value === "" ? undefined : (e.target.value as Tone),
                )
              }
              className={inputClass}
            >
              <option value="">Default</option>
              <option value="formal">Formal</option>
              <option value="conversational">Conversational</option>
            </select>
          </Field>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="mt-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Generating..." : "Generate Pitch"}
          </button>
        </form>

        {error && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}

        {warnings.length > 0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <p className="font-medium">Worth a second look:</p>
            <ul className="mt-1 list-inside list-disc">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {pitch && (
          <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Draft pitch (edit as needed)
            </h2>
            <Field label="Subject">
              <input
                type="text"
                value={pitch.subject}
                onChange={(e) => setPitch({ ...pitch, subject: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Body">
              <textarea
                value={pitch.body}
                onChange={(e) => setPitch({ ...pitch, body: e.target.value })}
                rows={10}
                className={inputClass}
              />
            </Field>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-zinc-400"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500";
