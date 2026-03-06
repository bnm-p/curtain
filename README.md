# @bnm-p/curtain

Page transition system for Next.js App Router. Intercept navigations, animate pages in and out, coordinate per-page entry/exit animations — all without layout shifts or flash of content.

```bash
npm install @bnm-p/curtain gsap
```

## Features

- Clip-path and fade transitions out of the box
- Per-route transition overrides via namespace pairs
- `usePageEntry` / `usePageLeave` hooks for coordinated page-level animations
- Custom preloader support via `usePreloader`
- Adapter-based — swap GSAP for any animation library
- Works with Next.js intercepting (parallel) routes

## Packages

| Package | Description |
|---------|-------------|
| [`packages/curtain`](./packages/curtain) | The library — published to npm as `@bnm-p/curtain` |
| [`apps/example`](./apps/example) | Next.js example app |
| [`apps/docs`](./apps/docs) | Documentation site (Fumadocs) |

## Quick start

```ts
// src/curtain.config.ts
import { defaultTransition, defineCurtainConfig } from "@bnm-p/curtain"

export const curtainConfig = defineCurtainConfig({
  default: defaultTransition,
})
```

```tsx
// app/layout.tsx
import { CurtainProvider } from "@bnm-p/curtain"
import { curtainConfig } from "@/curtain.config"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CurtainProvider config={curtainConfig}>
          <main className="page-content">{children}</main>
        </CurtainProvider>
      </body>
    </html>
  )
}
```

Full docs → [packages/curtain/README.md](./packages/curtain/README.md)

## Development

```bash
bun install
bun run dev        # watch build for packages/curtain
bun run build      # build all packages
bun run build:docs # build docs app
```

## License

MIT
