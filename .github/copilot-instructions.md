# Copilot instructions

Project context Copilot should apply to every session in this repository.

## Stack

- Framework: Astro (static output).
- Language: TypeScript.
- Styling: plain CSS in the base layout.

## Conventions

- Keep components small and focused.
- Prefer semantic HTML and accessible markup.
- Do not close, or add closing keywords for, the exercise walkthrough issue (issue #1) in any pull request. The exercise's GitHub Actions workflows manage that issue. When you open a pull request for app work, link only the specific app work-item issue you are implementing.

## Persistence and hydration rules

- Persistence: bookmarks are persisted in the browser using `localStorage`. There is no server or database.
- Hydration: all browser-only code (including any `localStorage` access) must run inside a component hydrated with the `client:load` directive. Never access `localStorage` or other browser APIs in Astro frontmatter or at module top level, so SSR and the static build never touch them.
