<p align="center">
  <img src="assets/wisp-logo-512.png" alt="wisp logo" width="128">
</p>
<p align="center"><strong>wisp</strong> — your navi code agent.</p>
<p align="center">
  A fork of <a href="https://github.com/sst/opencode">opencode</a>, tuned for the <a href="https://github.com/xvoidsx/navi">navi</a> way of working.
</p>

---

wisp is opencode with opinions. Where opencode is generic by design, wisp assumes you're on navi:

- **nightshadeNeon** theme out of the box — deep blacks, neon pink, phosphor green
- **Ollama local** as the default provider — your prompts stay on your machine
- **Ollama Cloud** as the one-command upgrade when you need frontier models
- **Reads `~/.config/navi/agents.env`** — no separate key setup, it just knows your providers
- Ships with navi skills: building mods, packaging, theming conventions

### Installation

```bash
curl -fsSL https://raw.githubusercontent.com/xvoidsx/wisp/dev/install.sh | bash
```

Or if you're on navi, it's in naviApps — search "wisp."

### What's different from opencode?

wisp tracks upstream opencode and rebases regularly. The differences are all in the defaults and integrations, not the core engine:

| | opencode | wisp |
|---|---|---|
| Theme | opencode default | nightshadeNeon |
| Default provider | (you choose) | Ollama local |
| Cloud upgrade | (you configure) | Ollama Cloud, one command |
| Config | `~/.config/opencode/` | `~/.config/wisp/` (+ reads navi's `agents.env`) |
| Skills | — | navi-specific skills built in |

### Agents

Like opencode, wisp includes agents you switch between with `Tab`:

- **build** — full-access agent for development work
- **plan** — read-only for analysis and exploration

### Attribution

wisp is a fork of [opencode](https://github.com/sst/opencode) by SST. All credit for the core engine goes to them and their contributors. wisp's changes are the navi integration layer: theme, defaults, skills, and packaging.

See [LICENSE](./LICENSE) for the full license text.

---

Built by [xvoidsx](https://github.com/xvoidsx) — the collective behind [navi](https://github.com/xvoidsx/navi).
