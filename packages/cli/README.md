# view-motion CLI

Zero-config page transition system for Next.js App Router, powered by GSAP.

## Installation

```sh
npx view-motion init
# or
bunx view-motion init
```

No global install required — use `npx`/`bunx` to run directly.

## Requirements

- Node.js >= 18
- Next.js App Router project
- GSAP >= 3.0.0 (installed as a peer dependency)

---

## Commands

### `init`

Scaffolds the core motion files into your project.

```sh
view-motion init [options]
```

**What it copies:**

| File | Destination |
|------|-------------|
| `types.ts` | `src/motion/types.ts` |
| `context.tsx` | `src/motion/context.tsx` |
| `page-transition.tsx` | `src/motion/page-transition.tsx` |
| `provider.tsx` | `src/motion/provider.tsx` |
| `config.ts` | `src/motion/config.ts` |
| `index.ts` | `src/motion/index.ts` |
| `hooks/use-page-entry.ts` | `src/motion/hooks/use-page-entry.ts` |
| `transitions/default.ts` | `src/motion/transitions/default.ts` |

Output defaults to `src/motion/` if a `src/` directory exists, otherwise `motion/`.

**Options:**

| Flag | Description |
|------|-------------|
| `-d, --dir <dir>` | Override the output directory |
| `--force` | Overwrite existing files |

**After running `init`**, wire up the provider in your layout:

```tsx
// app/layout.tsx
import { ViewMotionProvider } from '@/motion/provider'
import { motionConfig } from '@/motion/config'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ViewMotionProvider config={motionConfig}>
          {children}
        </ViewMotionProvider>
      </body>
    </html>
  )
}
```

Then wrap your page content:

```tsx
// app/page.tsx
export default function Page() {
  return (
    <main className="page-content">
      {/* your content */}
    </main>
  )
}
```

> **Tip:** Add `data-page-wrapper` to an inner div if you use a Preloader, to control when content is revealed.

---

### `add`

Add optional components to an existing `init`-ed project.

```sh
view-motion add <target> [options]
```

**Options:**

| Flag | Description |
|------|-------------|
| `-d, --dir <dir>` | Override the output directory (default: auto-detected) |
| `--force` | Overwrite existing files |

#### Targets

##### `preloader`

Adds a bar-wipe preloader overlay component.

```sh
view-motion add preloader
```

Copies `preloader.tsx` into your motion directory. Then use it in your layout:

```tsx
// app/layout.tsx
import { Preloader } from '@/motion/preloader'

<ViewMotionProvider config={motionConfig} extras={<Preloader title="YOUR NAME" caption="Your caption" />}>
  {children}
</ViewMotionProvider>
```

Edit `src/motion/preloader.tsx` to fully customise the animation.

##### `transition <name>`

Adds a named transition preset.

```sh
view-motion add transition fade
view-motion add transition default

# Shorthand (transition name directly):
view-motion add fade
```

**Available transitions:**

| Name | Description |
|------|-------------|
| `default` | Default slide transition |
| `fade` | Fade in/out |

After adding, register it in `src/motion/config.ts`:

```ts
import { fadeTransition } from './transitions/fade'

export const motionConfig = defineMotionConfig({
  default: fadeTransition,

  // Or as a per-pair override:
  transitions: {
    'home -> about': fadeTransition,
  },
})
```

---

## Configuration

Edit `src/motion/config.ts` to customise behaviour:

```ts
import { gsap } from 'gsap'
import { defaultTransition } from './transitions/default'
import { defineMotionConfig } from './types'

export const motionConfig = defineMotionConfig({
  // Default transition for all route pairs
  default: defaultTransition,

  // Map route paths to namespace strings
  // Unregistered paths fall back to 'default'
  namespaces: {
    '/': 'home',
    '/about': 'about',
  },

  // Routes using Next.js intercepting (parallel) routes
  // Transitions are skipped when navigating to/from these
  intercept: [
    '/modal',
  ],

  // Per-pair transition overrides
  // Key format: 'fromNamespace -> toNamespace' or '* -> toNamespace'
  transitions: {
    'home -> about': fadeTransition,
    '* -> contact': fadeTransition,
  },
})
```

---

## How it works

1. `init` copies source files directly into your project — you own them, edit freely.
2. `ViewMotionProvider` wraps your app and listens for route changes.
3. On navigation, the configured transition runs between the old and new page.
4. `namespaces` maps paths to logical names used in transition pair keys.
5. `transitions` lets you specify different animations for specific route pairs.
