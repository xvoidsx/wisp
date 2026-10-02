import { createSignal, onCleanup, onMount, For } from "solid-js"
import { useTheme } from "../context/theme"
import { useTerminalDimensions } from "@opentui/solid"

// Katakana characters for the rain effect
const KATAKANA = "アカサタナハマヤラワイキシチニヒミリヰウクスツヌフムルヲエケセテネヘメレヱオコソトノホモヨロヲ"

function randomKatakana() {
  return KATAKANA[Math.floor(Math.random() * KATAKANA.length)]
}

interface Drop {
  x: number
  y: number
  speed: number
  char: string
}

/**
 * Subtle katakana drift for the home screen background.
 * Very low density and dim colors — classy, not distracting.
 */
export function KatakanaRain() {
  const { theme } = useTheme()
  const dimensions = useTerminalDimensions()
  const [drops, setDrops] = createSignal<Drop[]>([])
  let interval: ReturnType<typeof setInterval>

  onMount(() => {
    const width = dimensions().width
    const height = dimensions().height

    // Low density: ~1 drop per 12 columns
    const count = Math.max(6, Math.floor(width / 12))
    const initial: Drop[] = []
    for (let i = 0; i < count; i++) {
      initial.push({
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
        speed: 0.3 + Math.random() * 0.7,
        char: randomKatakana(),
      })
    }
    setDrops(initial)

    // Slow animation — 200ms tick for a gentle drift
    interval = setInterval(() => {
      const h = dimensions().height
      const w = dimensions().width
      setDrops((prev) =>
        prev.map((drop) => {
          let newY = drop.y + drop.speed
          if (newY > h) {
            return {
              x: Math.floor(Math.random() * w),
              y: -1,
              speed: 0.3 + Math.random() * 0.7,
              char: randomKatakana(),
            }
          }
          // Occasionally change character for shimmer
          const newChar = Math.random() < 0.05 ? randomKatakana() : drop.char
          return { ...drop, y: newY, char: newChar }
        })
      )
    }, 200)
  })

  onCleanup(() => clearInterval(interval))

  return (
    <box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={0}>
      <For each={drops()}>
        {(drop) => (
          <box position="absolute" left={drop.x} top={Math.floor(drop.y)}>
            <text fg={theme.textMuted} dim>
              {drop.char}
            </text>
          </box>
        )}
      </For>
    </box>
  )
}

/**
 * Katakana shimmer for thinking/loading states.
 * Cycles through katakana characters.
 */
export function KatakanaShimmer() {
  const { theme } = useTheme()
  const [offset, setOffset] = createSignal(0)
  let interval: ReturnType<typeof setInterval>

  const chars = () => {
    const result = []
    for (let i = 0; i < 6; i++) {
      result.push(KATAKANA[(offset() + i * 5) % KATAKANA.length])
    }
    return result.join(" ")
  }

  onMount(() => {
    interval = setInterval(() => setOffset((o) => o + 1), 200)
  })

  onCleanup(() => clearInterval(interval))

  return <text fg={theme.primary}>{chars()}</text>
}
