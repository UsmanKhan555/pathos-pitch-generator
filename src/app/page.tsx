"use client";

import { useState, useSyncExternalStore } from "react";
import {
  clearHistory,
  getHistorySnapshot,
  getHistoryServerSnapshot,
  saveHistoryEntry,
  subscribeToHistory,
} from "@/lib/history";
import type {
  GeneratePitchResponse,
  HistoryEntry,
  PitchInput,
  PitchOutput,
  Tone,
} from "@/lib/types";

const initialInput: PitchInput = {
  clientName: "",
  description: "",
  hook: "",
  journalistName: "",
  publication: "",
  tone: undefined,
  senderName: "",
};

export default function Home() {
  const [input, setInput] = useState<PitchInput>(initialInput);
  const [submitting, setSubmitting] = useState(false);
  const [pitch, setPitch] = useState<PitchOutput | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const history = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getHistoryServerSnapshot,
  );

  function update<K extends keyof PitchInput>(key: K, value: PitchInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    setSubmitting(true);
    setError(null);
    setCopied(false);
    setSent(false);

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

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        input,
        pitch: data.pitch,
        warnings: data.warnings,
      };
      saveHistoryEntry(entry, history);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void generate();
  }

  async function handleCopy() {
    if (!pitch) return;
    await navigator.clipboard.writeText(`Subject: ${pitch.subject}\n\n${pitch.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLoadHistoryEntry(entry: HistoryEntry) {
    setInput(entry.input);
    setPitch(entry.pitch);
    setWarnings(entry.warnings);
    setError(null);
    setCopied(false);
    setSent(false);
  }

  function handleClearHistory() {
    clearHistory();
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

          <div className="grid grid-cols-2 gap-4">
            <Field label="Your name (optional)">
              <input
                type="text"
                value={input.senderName}
                onChange={(e) => update("senderName", e.target.value)}
                placeholder="Alex Rivera"
                className={inputClass}
              />
            </Field>

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
          </div>

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

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => void generate()}
                disabled={submitting}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {submitting ? "Regenerating..." : "Regenerate"}
              </button>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {copied ? "Copied!" : "Copy to clipboard"}
              </button>
              <button
                type="button"
                onClick={() => setSent(true)}
                disabled={sent}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {sent ? "Sent" : "Send"}
              </button>
            </div>
            {sent && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                This is a mock send - no email was actually delivered.
              </p>
            )}
          </div>
        )}

        {history.length > 0 && (
          <details className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <summary className="cursor-pointer text-sm font-medium text-zinc-500 dark:text-zinc-400">
              History ({history.length})
            </summary>

            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleClearHistory}
                className="self-start rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Clear history
              </button>

              <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
                {history.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => handleLoadHistoryEntry(entry)}
                      className="flex w-full flex-col gap-0.5 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {entry.pitch.subject || "(no subject)"}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {entry.input.clientName} &middot;{" "}
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </details>
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
