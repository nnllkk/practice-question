# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Development commands

- `pnpm install` — install dependencies.
- `pnpm run dev` — start the Vite dev server on port 3000, bound to `0.0.0.0`.
- `pnpm run build` — create a production build in `dist/`.
- `pnpm run preview` — serve the production build locally.
- `pnpm run lint` — run the TypeScript check (`tsc --noEmit`).

## Environment

- Local development expects `GEMINI_API_KEY` in `.env.local` per [README.md](README.md).
- `vite.config.ts` injects `process.env.GEMINI_API_KEY` into the client bundle from Vite env loading, so treat it as browser-exposed config rather than a server-only secret.
- Vite HMR can be disabled with `DISABLE_HMR=true`; this is already wired in [vite.config.ts](vite.config.ts).

## Architecture overview

- This is a single-page React 19 + Vite app for practicing quiz questions imported from Excel spreadsheets.
- The app entry point is [src/main.tsx](src/main.tsx), which renders a single top-level component, [src/App.tsx](src/App.tsx).
- [src/App.tsx](src/App.tsx) owns the full app state machine:
  - `home` — upload screen and last-score summary.
  - `quiz` — active answering flow.
  - `result` — score report and wrong-answer review.
- `App` also owns the question dataset lifecycle:
  - receives parsed questions from [src/components/FileUpload.tsx](src/components/FileUpload.tsx),
  - stores the full uploaded bank in `allQuestions`,
  - samples up to 20 random questions into `quizQuestions` when a round starts,
  - grades submitted answers and persists the most recent result to `localStorage` under `quiz_last_result`.

## Data model and flow

- Shared types live in [src/types.ts](src/types.ts):
  - `Question` is a normalized quiz record with `type`, `title`, `analysis`, `correctAnswer`, and `options.A`–`D`.
  - `QuizResult` captures score, wrong questions, and completion timestamp.
- [src/components/FileUpload.tsx](src/components/FileUpload.tsx) is the ingestion boundary. It reads the first worksheet from an uploaded `.xlsx` file with `xlsx`, then maps Chinese spreadsheet headers (`题型`, `标题`, `解析`, `正确答案`, `选项A`-`选项D`) into the `Question` shape.
- [src/components/Quiz.tsx](src/components/Quiz.tsx) is a controlled quiz runner:
  - stores selected answers in a local `Record<questionId, option>` map,
  - groups question indexes by `Question.type` for the sidebar navigator,
  - leaves scoring to `App` by returning the answer map through `onSubmit`.
- [src/components/Results.tsx](src/components/Results.tsx) is purely presentational. It renders aggregate stats plus per-question review for `wrongQuestions`, including the stored analysis text when present.

## UI structure

- `src/components/` contains the app-specific workflow components (`FileUpload`, `Quiz`, `Results`).
- `components/ui/` contains reusable shadcn/base-nova primitives such as `Button`, `Card`, `Badge`, and `ScrollArea`.
- The `@` alias points to the repository root, so imports like `@/components/ui/button` resolve to [components/ui/](components/ui/) while `@/src/types` resolves to [src/types.ts](src/types.ts).
- [lib/utils.ts](lib/utils.ts) provides the shared `cn()` helper for merging Tailwind class names.
- Styling is driven by Tailwind CSS v4 via [src/index.css](src/index.css), which imports Tailwind, `tw-animate-css`, shadcn styles, and Geist font tokens.

## Notes for future edits

- There is currently no automated test suite in this repository; validation is via `npm run lint` and `npm run build`.
- The build currently succeeds but emits a Vite chunk-size warning because the main JS bundle is ~737 kB; keep that in mind before adding more client-side dependencies.
