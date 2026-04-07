/**
 * Spinner renderer using pi-animations' shimmer effect with Claude Code verbs.
 *
 * The shimmer sweeps a rainbow gradient (magenta → purple → cyan) across
 * the verb text, character by character via a sine wave.
 *
 * The shimmer algorithm (sine-wave highlight, gradient bounce, base color
 * blending) is derived from the "shimmer-text" exploration in pi-animations
 * by arpagon (MIT license):
 *   https://github.com/arpagon/pi-animations
 *   Source: explorations/22-shimmer-text.ts
 *
 * Additions in this file: stall detection (rainbow → red fade when tokens
 * stop flowing for >3s), elapsed time / token count display, and the
 * SpinnerFrameInput interface for integration with Pi's extension API.
 *
 * Called every 50ms, result passed to setWorkingMessage().
 */

// ============================================================================
// ANSI helpers
// ============================================================================

const rgb = (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`;
const bold = "\x1b[1m";
const nobold = "\x1b[22m";
const reset = "\x1b[0m";

function lerp(a: number, b: number, t: number): number {
	return Math.round(a + (b - a) * t);
}

// ============================================================================
// Pi gradient (magenta → purple → cyan) — from pi-animations
// ============================================================================

const PI_GRAD = [
	[255, 0, 135],
	[175, 95, 175],
	[135, 95, 215],
	[95, 95, 255],
	[95, 175, 255],
	[0, 255, 255],
];

// Base text color (light gray) and stall color (error red)
const BASE = [200, 200, 200];
const STALL_RED = [171, 43, 63];
const STALL_BASE = [140, 60, 60]; // dimmed red-gray for base when stalled

// ============================================================================
// Stall tracking
// ============================================================================

const STALL_START_MS = 3000;
const STALL_FADE_MS = 2000;

let stalledIntensity = 0;

function computeStallIntensity(timeSinceToken: number): number {
	const target = timeSinceToken > STALL_START_MS
		? Math.min((timeSinceToken - STALL_START_MS) / STALL_FADE_MS, 1)
		: 0;

	// Smooth transition
	const diff = target - stalledIntensity;
	if (Math.abs(diff) < 0.01) {
		stalledIntensity = target;
	} else {
		stalledIntensity += diff * 0.1;
	}
	return stalledIntensity;
}

export function resetStallState(): void {
	stalledIntensity = 0;
}

// ============================================================================
// Shimmer renderer — pi-animations shimmer + stall blending
// ============================================================================

function renderShimmer(text: string, frame: number, stall: number): string {
	// Blend base color toward stall red
	const baseR = lerp(BASE[0], STALL_BASE[0], stall);
	const baseG = lerp(BASE[1], STALL_BASE[1], stall);
	const baseB = lerp(BASE[2], STALL_BASE[2], stall);

	let line = "";
	for (let i = 0; i < text.length; i++) {
		const wave = Math.sin((i - frame * 0.3) * 0.8);
		if (wave > 0.3) {
			// Character is in the shimmer highlight
			const intensity = (wave - 0.3) / 0.7;
			const gi = Math.floor((i + frame * 0.5) % (PI_GRAD.length * 2));
			const gIdx = gi < PI_GRAD.length ? gi : PI_GRAD.length * 2 - 1 - gi;
			const gc = PI_GRAD[Math.min(gIdx, PI_GRAD.length - 1)];

			// Blend the gradient color toward stall red
			const gcR = lerp(gc[0], STALL_RED[0], stall);
			const gcG = lerp(gc[1], STALL_RED[1], stall);
			const gcB = lerp(gc[2], STALL_RED[2], stall);

			const r = lerp(baseR, gcR, intensity);
			const g = lerp(baseG, gcG, intensity);
			const b = lerp(baseB, gcB, intensity);
			line += bold + rgb(r, g, b) + text[i] + nobold;
		} else {
			line += rgb(baseR, baseG, baseB) + text[i];
		}
	}
	return line + reset;
}

// ============================================================================
// Duration / Number Formatting
// ============================================================================

function formatDuration(ms: number): string {
	const s = Math.floor(ms / 1000);
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	return `${m}m${(s % 60).toString().padStart(2, "0")}s`;
}

function formatNumber(n: number): string {
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return `${n}`;
}

// ============================================================================
// Public API
// ============================================================================

const SHOW_TIMER_AFTER_MS = 30000;

export interface SpinnerFrameInput {
	frame: number;
	verb: string;
	startTime: number;
	lastTokenTime: number;
	tokenCount: number;
}

export function renderSpinnerFrame(input: SpinnerFrameInput): string {
	const { frame, verb, startTime, lastTokenTime, tokenCount } = input;

	// Compute stall intensity
	const timeSinceToken = Date.now() - lastTokenTime;
	const stall = computeStallIntensity(timeSinceToken);

	// Shimmer the verb text (rainbow fading to red when stalled)
	const text = `${verb}…`;
	const shimmer = renderShimmer(text, frame, stall);

	// Status suffix (elapsed time + tokens after 30s)
	const elapsed = Date.now() - startTime;
	let suffix = "";
	if (elapsed > SHOW_TIMER_AFTER_MS) {
		const parts: string[] = [formatDuration(elapsed)];
		if (tokenCount > 0) {
			parts.push(`↓ ${formatNumber(tokenCount)} tokens`);
		}
		suffix = " " + rgb(140, 140, 140) + "(" + parts.join(" · ") + ")";
	}

	return shimmer + suffix + reset;
}
