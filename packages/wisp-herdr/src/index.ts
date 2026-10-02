import { execSync } from "child_process"

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
      execSync(
        `${herdrBin} pane release-agent "${paneId}" --source "${SOURCE_ID}" --agent "${AGENT_LABEL}"`,
        { stdio: "ignore", timeout: 5000 }
      )
    } else {
      execSync(
        `${herdrBin} pane report-agent "${paneId}" --source "${SOURCE_ID}" --agent "${AGENT_LABEL}" --state "${state}"`,
        { stdio: "ignore", timeout: 5000 }
      )
    }
  } catch {
    // best-effort: never break a wisp session over herdr reporting
  }
}

export const WispHerdrPlugin = {
  event: async ({ event }: { event: { type: string } }) => {
    // Map wisp session events to herdr states
    switch (event.type) {
      case "session.created":
      case "session.idle":
      case "session.updated":
        report("idle")
        break
      case "session.status":
        // status events indicate active work
        report("working")
        break
      case "message.updated":
      case "message.part.updated":
        report("working")
        break
      case "session.error":
        report("blocked")
        break
      case "session.deleted":
        report("release")
        break
    }
  },
}

export default WispHerdrPlugin
