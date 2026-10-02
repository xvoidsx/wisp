import { createSignal, onCleanup, onMount, For } from "solid-js"
import { useTheme } from "../context/theme"

// Katakana characters for the rain effect
const KATAKANA = "アカサタナハマヤラワイキシチニヒミリヰウクスツヌフムルヲエケセテネヘメレヱオコソトノホモヨロヲ0123456789"

function randomKatakana() {
  return KATAKANA[Math.floor(Math.random() * KATAKANA.length)]
}

interface Drop {
  id: number
  x: number
  y: number
  speed: number
  char: string
  length: number
}

export function KatakanaRain(props: { width: number; height: number; density?: number }) {
  const { theme } = useTheme()
  const [drops, setDrops] = createSignal<Drop[]>([])
  let nextId = 0
  let interval: ReturnType<typeof setInterval>

  const density = () => props.density ?? 0.1

  onMount(() => {
    // Initialize drops
    const initial: Drop[] = []
    const count = Math.floor(props.width * density())
    for (let i = 0; i < count; i++) {
      initial.push({
        id: nextId++,
        x: Math.floor(Math.random() * props.width),
        y: Math.floor(Math.random() * props.height),
        speed: 0.5 + Math.random() * 1.5,
        char: randomKatakana(),
        length: 3 + Math.floor(Math.random() * 5),
      })
    }
    setDrops(initial)

    // Animate
    interval = setInterval(() => {
      setDrops((prev) =>
        prev.map((drop) => {
          let newY = drop.y + drop.speed
          if (newY > props.height) {
            // Reset to top with new random x
            return {
              ...drop,
              x: Math.floor(Math.random() * props.width),
              y: -drop.length,
              char: randomKatakana(),
            }
          }
          // Occasionally change the character (flicker effect)
          const newChar = Math.random() < 0.1 ? randomKatakana() : drop.char
          return { ...drop, y: newY, char: newChar }
        })
      )
    }, 100)
  })

  onCleanup(() => clearInterval(interval))

  return (
    <box
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: props.width,
        height: props.height,
      }}
    >
      <For each={drops()}>
        {(drop) => (
          <text
            style={{
              position: "absolute",
              left: drop.x,
              top: Math.floor(drop.y),
              fg: theme.textMuted,
              // Dim the further down it goes for a fade effect
            }}
          >
            {drop.char}
          </text>
        )}
      </For>
    </box>
  )
}

// Simpler shimmer for loading states — a row of katakana that cycles
export function KatakanaShimmer() {
  const { theme } = useTheme()
  const [offset, setOffset] = createSignal(0)
  let interval: ReturnType<typeof setInterval>

  const chars = () => {
    const result = []
    for (let i = 0; i < 8; i++) {
      result.push(KATAKANA[(offset() + i * 3) % KATAKANA.length])
    }
    return result.join(" ")
  }

  onMount(() => {
    interval = setInterval(() => setOffset((o) => o + 1), 150)
  })

  onCleanup(() => clearInterval(interval))

  return (
    <text fg={theme.primary}>
      {chars()}
    </text>
  )
}
