# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 14 TypeScript app for a Python learning experience. App Router pages live in `src/app`, with routes such as `src/app/learn/[lessonId]/page.tsx`. Reusable UI components are in `src/components/ui`, learning flow components in `src/components/learning`, and Blockly/runtime engines in `src/components/engines`. Shared state is kept in `src/store` using Zustand. Runtime helpers live in `src/lib/runtime`, Blockly definitions and generators in `src/lib/blockly`, and shared TypeScript types in `src/types`. Course content is stored as JSON in `public/courses/level-1`. Planning and architecture notes are in `docs`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next.js development server at `http://localhost:3000`.
- `npm run build`: create a production build and run Next.js compile-time checks.
- `npm run start`: serve the production build after `npm run build`.
- `npm run lint`: run Next.js ESLint rules.

Use `npm install` to restore dependencies from `package-lock.json`.

Do not run `npm run build` while `npm run dev` is still running. The shared `.next` output can become inconsistent and cause transient 500 errors such as missing `vendor-chunks/*.js`. Stop the dev server first; if the error has already happened, stop dev, remove `.next`, and restart/build from a clean generated output directory.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode enabled. Prefer functional React components and hooks. Use the `@/` path alias for imports from `src`, for example `@/components/ui/button`. Follow existing filename patterns: PascalCase for React components (`LessonPage.tsx`), kebab-case for utility modules (`skulpt-runner.ts`), and descriptive JSON lesson files (`lesson_001.json`). Keep Tailwind classes readable and colocated with the component they style. ESLint extends `next/core-web-vitals`; `react-hooks/exhaustive-deps` is a warning and `no-explicit-any` is disabled, but prefer precise types where practical.

## Testing Guidelines

No automated test framework or `npm test` script is currently configured. Before submitting changes, run `npm run lint` and `npm run build`. For UI changes, manually verify the affected route in the browser. When adding tests later, place them near the feature or in a clear test directory, and use names that identify behavior, such as `lesson-store.test.ts` or `BlockEditor.test.tsx`.

## Commit & Pull Request Guidelines

The Git history currently contains only the initial Create Next App commit, so no project-specific commit convention is established. Use short, imperative commit messages such as `Add lesson progress store` or `Fix turtle canvas sizing`. Pull requests should include a brief summary, test/build results, linked issues when applicable, and screenshots or screen recordings for visible UI changes.

## Agent-Specific Instructions

Keep edits scoped to the requested feature or fix. Do not rewrite course content, architecture docs, or generated build output unless the task explicitly requires it. Never commit `.next`, `node_modules`, or local environment files.
