# Pitch Email Generator

A small tool that drafts a first-pass PR pitch email from a client, a description of what
they do, and a news hook — the kind of thing a PR consultant would then review and edit
before sending to a journalist. See [PRD.md](./PRD.md) for the full spec.

## What it does

1. Fill in a client/company name, a one-line description, and a news hook (required).
   Optionally add a target journalist's name, their publication, and a tone.
2. Click **Generate Pitch** — this calls Claude (via a Next.js route handler) with a
   system prompt tuned for concise, non-generic PR pitches, and gets back structured
   `{subject, body}` JSON.
3. The draft is checked automatically for word count, leaked placeholder text (e.g.
   `[Journalist Name]`), an empty subject line, and refusal/apology language. Any issues
   show up as a warning banner — a signal to look closer, not a hard block.
4. Edit the subject/body inline, **Regenerate** with the same inputs, **Copy to
   clipboard**, or **Send** (mocked — no email is actually delivered).
5. Every generation is saved to a **History** list (browser localStorage, last 20),
   viewable at the bottom of the page. Click a past entry to restore its inputs and
   draft back into the editable panel.

## Running locally

```bash
npm install
cp .env.example .env.local   # then paste in your own ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll need an Anthropic API key
(console.anthropic.com) with access to `claude-sonnet-5`.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, with a route handler
(`src/app/api/generate-pitch`) calling the Anthropic API server-side. No database, no
auth, no real email sending — see [PRD.md](./PRD.md) for the full scope and what's
explicitly out of it.

## What I'd do next

- **Fabrication is the main remaining risk.** The prompt now explicitly forbids
  inventing facts not in the input (an earlier draft was fabricating statistics and
  program details for vague inputs — see the `fix: tighten pitch prompt based on manual
  review` commit), but this is a soft instruction, not a guarantee. A stronger next step
  would be a second automated pass that checks the draft only references entities/nouns
  present in the input, or a lower-stakes model-graded check.
- **Output quality tracks input specificity.** A vague hook still produces a
  correspondingly vague (if honest) pitch. A "hook strength" hint in the UI, or a
  follow-up question flow to extract more specifics before generating, would help.
- **No journalist database/lookup** — deliberately out of scope for this exercise, but a
  real version would benefit from matching tone/style to the specific outlet.
- **History is local to one browser.** It's stored in localStorage, so it doesn't
  survive clearing site data and isn't shared across devices. Fine for this exercise;
  a real version with accounts would move it server-side.
