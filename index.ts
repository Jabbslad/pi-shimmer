/**
 * Claude Code-style spinner extension for Pi.
 *
 * Replaces the default working message with a rainbow shimmer effect
 * (from pi-animations) combined with Claude Code's random verb list.
 * When tokens stop flowing for >3s, the shimmer fades from rainbow to red.
 */
import type {
	ExtensionAPI,
	ExtensionContext,
	AgentStartEvent,
	AgentEndEvent,
	MessageStartEvent,
	MessageUpdateEvent,
	SessionStartEvent,
} from "@mariozechner/pi-coding-agent";
import { renderSpinnerFrame, resetStallState } from "./spinner-renderer.js";
import { randomVerb } from "./spinner-verbs.js";

const FRAME_INTERVAL_MS = 50;

export default function (pi: ExtensionAPI) {
	let timer: ReturnType<typeof setInterval> | null = null;
	let frame = 0;
	let verb = "";
	let tokenCount = 0;
	let startTime = 0;
	let lastTokenTime = 0;

	function touchToken() {
		if (timer) lastTokenTime = Date.now();
	}

	function startAnimation(ctx: ExtensionContext) {
		stopAnimation();
		frame = 0;
		verb = randomVerb();
		tokenCount = 0;
		startTime = Date.now();
		lastTokenTime = Date.now();
		resetStallState();

		timer = setInterval(() => {
			frame++;
			const line = renderSpinnerFrame({
				frame,
				verb,
				startTime,
				lastTokenTime,
				tokenCount,
			});
			ctx.ui.setWorkingMessage(line);
		}, FRAME_INTERVAL_MS);
	}

	function stopAnimation() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}

	pi.on("session_start", async (_event: SessionStartEvent, _ctx: ExtensionContext) => {
		stopAnimation();
	});

	pi.on("agent_start", async (_event: AgentStartEvent, ctx: ExtensionContext) => {
		if (!ctx.hasUI) return;
		startAnimation(ctx);
	});

	pi.on("message_start", async (event: MessageStartEvent) => {
		if (event.message.role === "assistant") touchToken();
	});

	pi.on("message_update", async (event: MessageUpdateEvent) => {
		if (!timer || event.message.role !== "assistant") return;
		lastTokenTime = Date.now();
		let totalLen = 0;
		for (const content of event.message.content) {
			if (content.type === "text") totalLen += content.text.length;
		}
		tokenCount = Math.round(totalLen / 4);
	});

	pi.on("message_end", async () => touchToken());
	pi.on("tool_execution_start", async () => touchToken());
	pi.on("tool_execution_end", async () => touchToken());

	pi.on("agent_end", async (_event: AgentEndEvent, ctx: ExtensionContext) => {
		stopAnimation();
		if (ctx.hasUI) {
			ctx.ui.setWorkingMessage(); // restore default
		}
	});
}
