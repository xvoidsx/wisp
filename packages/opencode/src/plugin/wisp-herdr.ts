import { execFileSync } from "child_process"
import type { Hooks, PluginInput } from "@opencode-ai/plugin"

/**
 * wisp-herdr: report wisp lifecycle state to the herdr pane hosting
 * this wisp session, so herdr — and navi's agent center / waybar agent mod —
 * show wisp as working/idle instead of unknown.
 *
 * This is herdr's official "custom socket integration" path: herdr sets
 * HERDR_ENV=1 and HERDR_PANE_ID in every pane, and agents report their own
 * state via `herdr pane report-agent`. No herdr fork, no upstream wait.
 *
 * No-op unless wisp is running inside a herdr-managed pane. Every herdr
 * call is best-effort and failures are swallowed — a broken hook must never
 * break a wisp session.
 */

const SOURCE_ID = "navi:wisp-herdr"
const AGENT_LABEL = "wisp"

function report(state: "working" | "idle" | "blocked" | "unknown" | "release") {
  if (process.env.HERDR_ENV !== "1") return
  const paneId = process.env.HERDR_PANE_ID
  if (!paneId) return

  const herdrBin = process.env.HERDR_BIN_PATH || "herdr"

  try {
    if (state === "release") {
      execFileSync(
        herdrBin,
        ["pane", "release-agent", paneId, "--source", SOURCE_ID, "--agent", AGENT_LABEL],
        { stdio: "ignore", timeout: 5000 }
      )
    } else {
      execFileSync(
        herdrBin,
        ["pane", "report-agent", paneId, "--source", SOURCE_ID, "--agent", AGENT_LABEL, "--state", state],
        { stdio: "ignore", timeout: 5000 }
      )
    }
  } catch {
    // best-effort: never break a wisp session over herdr reporting
  }
}

export async function WispHerdrPlugin(_input: PluginInput): Promise<Hooks> {
  return {
    event: async ({ event }) => {
      // Map wisp session events to herdr states
      switch (event.type) {
        case "session.created":
        case "session.idle":
          report("idle")
          break
        case "session.status": {
          // status events carry the session status — check if actually working
          const status = (event as unknown as { properties?: { status?: string } }).properties?.status
          if (status === "busy" || status === "working") {
            report("working")
          } else {
            report("idle")
          }
          break
        }
        case "message.part.updated": {
          // Only report working for assistant messages, not user input
          const role = (event as unknown as { properties?: { part?: { role?: string } } }).properties?.part?.role
          if (role === "assistant") {
            report("working")
          }
          break
        }
        case "session.error":
          report("blocked")
          break
        case "session.deleted":
          report("release")
          break
      }
    },
  }
}
