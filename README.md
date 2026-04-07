# 🌈 pi-shimmer ✨

> *Because "Working..." is so last season.*

Rainbow shimmer spinner with Claude Code verbs for [Pi coding agent](https://github.com/badlogic/pi-mono).

Replaces Pi's boring default spinner with a **magenta → purple → cyan gradient** that dances across 170+ delightfully absurd verbs. Watch your terminal *Combobulate*, *Percolate*, and *Flibbertigibbet* in technicolor glory while Claude thinks.

## ✨ Features

- 🎨 **Rainbow shimmer** — A smooth gradient sweeps across the text character by character, 50ms per frame. It's like a tiny aurora borealis in your terminal.
- 🎲 **170+ random verbs** — "Combobulating…", "Percolating…", "Clauding…", "Razzmatazzing…", "Boondoggling…" — every spinner is a surprise.
- 🔴 **Stall detection** — When tokens stop flowing for >3 seconds, the rainbow gracefully fades to a pulsing red. You'll *feel* the existential dread.
- ⏱️ **Elapsed time & token count** — After 30 seconds, stats appear so you know just how long you've been Lollygagging.

## 📦 Install

```bash
pi install git:github.com/Jabbslad/pi-shimmer
```

That's it. No config. No build step. Just vibes. 🫧

## 🎬 How it works

```
agent_start  →  🌈 pick a verb, start the shimmer loop
                    ↕ track token flow from message events
                    ↕ no tokens for 3s? fade to 🔴
                    ↕ 30s elapsed? show ⏱️ stats
agent_end    →  ✅ restore default spinner
```

Under the hood, `setWorkingMessage()` gets called every 50ms with hand-crafted ANSI escape codes. No dependencies. Just math, sine waves, and ✨ whimsy ✨.

## 🙏 Credits & Attribution

The rainbow shimmer effect — the sine-wave highlight, gradient bounce, and
base color blending — is derived from the **shimmer-text** animation in
[pi-animations](https://github.com/arpagon/pi-animations) by **arpagon** 🎨
(MIT license). See [`explorations/22-shimmer-text.ts`](https://github.com/arpagon/pi-animations/blob/main/explorations/22-shimmer-text.ts)
for the original. Stall detection, token tracking, and the Pi extension
wrapper are additions in this repo.

The 170+ whimsical verb list is ported from **Claude Code**'s spinner 🤖.

## 📄 License

MIT — go forth and shimmer. 🌟

See [LICENSE](LICENSE) for the full text, including third-party notices
for pi-animations.
