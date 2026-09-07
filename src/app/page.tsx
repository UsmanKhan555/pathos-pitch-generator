"use client";

import { useState } from "react";
import type { PitchInput, Tone } from "@/lib/types";

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

  function update<K extends keyof PitchInput>(key: K, value: PitchInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Generation wiring lands in a later commit — for now this just proves
    // out the form's local state.
    console.log("Pitch request", input);
    setSubmitting(false);
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
