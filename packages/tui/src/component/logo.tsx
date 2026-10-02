import { RGBA, TextAttributes } from "@opentui/core"
import { For, type JSX, createSignal, onCleanup, onMount } from "solid-js"
import { tint, useTheme } from "../context/theme"
import { logo } from "../logo"

export function Logo() {
  const { theme } = useTheme()

  // Cycle through nightshadeNeon colors like the waybar does
  const [colorIndex, setColorIndex] = createSignal(0)
  let interval: ReturnType<typeof setInterval>

  const cycleColors = () => [theme.primary, theme.secondary, theme.info, theme.warning]

  onMount(() => {
    interval = setInterval(() => {
      setColorIndex((i) => (i + 1) % cycleColors().length)
    }, 3000)
  })

  onCleanup(() => clearInterval(interval))

  const renderLine = (line: string, fg: RGBA, bold: boolean): JSX.Element[] => {
    const shadow = tint(theme.background, fg, 0.25)
    const attrs = bold ? TextAttributes.BOLD : undefined
    return Array.from(line).map((char) => {
      if (char === "_") {
        return (
          <text fg={fg} bg={shadow} attributes={attrs} selectable={false}>
            {" "}
          </text>
        )
      }
      if (char === "^") {
        return (
          <text fg={fg} bg={shadow} attributes={attrs} selectable={false}>
            ▀
          </text>
        )
      }
      if (char === "~") {
        return (
          <text fg={shadow} attributes={attrs} selectable={false}>
            ▀
          </text>
        )
      }
      if (char === ",") {
        return (
          <text fg={shadow} attributes={attrs} selectable={false}>
            ▄
          </text>
        )
      }
      return (
        <text fg={fg} attributes={attrs} selectable={false}>
          {char}
        </text>
      )
    })
  }

  return (
    <box flexDirection="column" alignItems="center">
      <For each={logo.left}>
        {(line, index) => (
          <box flexDirection="row" gap={1}>
            <box flexDirection="row">{renderLine(line, cycleColors()[colorIndex()], false)}</box>
            <box flexDirection="row">{renderLine(logo.right[index()], cycleColors()[colorIndex()], true)}</box>
          </box>
        )}
      </For>
      <box marginTop={1}>
        <text fg={theme.textMuted} selectable={false}>
          {"ウィスプ — your navi code agent"}
        </text>
      </box>
    </box>
  )
}
