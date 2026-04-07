# pi-shimmer

A Pi extension that replaces the default "Working..." spinner with a rainbow shimmer effect and whimsical Claude Code verbs.

## Repo structure

| File | Purpose |
|---|---|
| `index.ts` | Extension entry point. Registers Pi event listeners to start/stop the spinner animation and track token flow. |
| `spinner-renderer.ts` | Pure rendering logic. Produces ANSI-colored shimmer frames (magenta→purple→cyan gradient) with stall detection (fades to red after 3s of no tokens). |
| `spinner-verbs.ts` | 170+ random verb strings ("Combobulating", "Percolating", etc.) shown during the animation. |
| `package.json` | npm package config. Uses `pi.extensions` to register `index.ts` as a Pi extension. |

## How it works

1. On `agent_start`, a 50ms interval renders shimmer frames via `ctx.ui.setWorkingMessage()`.
2. `message_update` events track token flow; if tokens stop for >3s the gradient fades from rainbow to red (stall detection).
3. After 30s, elapsed time and approximate token count are appended.
4. On `agent_end`, the animation stops and the default working message is restored.

## Key concepts

- **Pi extension API** — the default export receives `ExtensionAPI` and subscribes to lifecycle events (`agent_start`, `message_update`, `agent_end`, etc.).
- **`setWorkingMessage()`** — Pi TUI API that replaces the spinner line. Accepts raw ANSI strings.
- **Stall intensity** — smoothly interpolated 0→1 value controlling rainbow-to-red blend, computed each frame.

## Development notes

- No build step — Pi loads `.ts` files directly.
- No test suite currently exists.
- The shimmer algorithm is ported from [pi-animations](https://github.com/arpagon/pi-animations) by arpagon.
- Verb list is ported from Claude Code's spinner.
- Published as `@jabbslad/pi-shimmer` via `pi install npm:@jabbslad/pi-shimmer`.

## Change guidelines

- Keep the extension lightweight — it runs on a 50ms interval in the UI thread.
- Avoid adding dependencies; all rendering is done with inline ANSI escape codes.
- `spinner-renderer.ts` should stay pure (no Pi imports) so rendering logic is easy to reason about.
- When adding verbs, append to the array in `spinner-verbs.ts` and keep them alphabetically sorted.
