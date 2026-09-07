# PRD: Pitch Email Generator

## 1. Problem
PR consultants spend significant time drafting personalized pitch emails to journalists — connecting a client's story to a relevant news hook, in a tone that doesn't read as generic spam. This tool generates a first-draft pitch from minimal input, which a human then reviews and edits before sending.

## 2. Goal
A small, end-to-end working app that:
- Takes structured input about a client and a news angle
- Generates a personalized pitch email via an LLM
- Lets the user review and regenerate before sending (mock send — no real email delivery)
- Demonstrates real verification of AI output quality, not just displaying whatever the API returns

## 3. User flow
1. User lands on a single-page form
2. Fields:
   - Client/company name
   - One-line description of what the client does
   - News hook / angle (e.g. "raised $2M seed round", "launched new sustainability initiative")
   - Target journalist name + publication (optional, improves personalization)
   - Tone selector (Formal / Conversational) — optional
3. User clicks "Generate Pitch"
4. App calls the LLM, returns a draft pitch email (subject line + body)
5. User can:
   - Edit the draft inline
   - Regenerate with the same inputs
   - Copy to clipboard / mock "Send"
6. (Stretch) Save past generated pitches to a simple history view

## 4. Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Next.js route handler calling the Anthropic API for generation
- No database for MVP — local/in-memory state; if a history feature is added, browser localStorage is sufficient
- Deployed on Vercel

## 5. Prompt design
System prompt encodes:
- Role: expert PR pitch writer
- Constraints: concise (under ~150 words), specific hook-to-story connection required (not generic praise), no overuse of superlatives or marketing fluff, must include a clear, specific ask (e.g. a 15-minute call)
- Output format: structured JSON with `subject` and `body` fields, so the frontend can render them without fragile string-parsing

## 6. Output validation
- **Automated checks**: word count within range, no leaked placeholder text (e.g. "[Journalist Name]") when a real name was provided, non-empty subject line, no refusal/apology language indicating the model didn't follow the format
- **Manual review**: multiple generations across varied inputs, evaluated for genericness, overselling, and whether a journalist would plausibly respond — prompt iterated based on these findings

## 7. Out of scope
- Real email sending/integration
- User accounts / authentication
- Persisted database storage
- Journalist database/lookup (name + publication entered as free text)

## 8. Future improvements
- Journalist/publication lookup with tone/style matching per outlet
- A/B testing different prompt variants against response-rate proxies
- Multi-language pitch generation for international outreach
