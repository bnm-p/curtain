# @bnm-p/curtain

Page transition system for Next.js App Router.

## Install

```bash
npm install @bnm-p/curtain gsap
```

## Setup

**1. Create `src/curtain.config.ts`**

```ts
"use client"

import { defaultTransition, defineCurtainConfig } from "@bnm-p/curtain"

export const curtainConfig = defineCurtainConfig({
  default: defaultTransition,
})
```

**2. Add `CurtainProvider` to your root layout**

```tsx
import { CurtainProvider } from "@bnm-p/curtain"
import { curtainConfig } from "@/curtain.config"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CurtainProvider config={curtainConfig}>
          <main className="page-content">{children}</main>
        </CurtainProvider>
      </body>
    </html>
  )
}
```

The `.page-content` class tells curtain which element to animate. That's all you need.

## Page animations

Animate elements in when a page enters:

```tsx
"use client"

import { usePageEntry } from "@bnm-p/curtain"

export default function Page() {
  usePageEntry((tl) => {
    tl.from(".hero", { y: 40, opacity: 0, duration: 0.6, ease: "expo.out" })
  })

  return <h1 className="hero">Hello.</h1>
}
```

Animate elements out when the user navigates away:

```tsx
usePageLeave((tl) => {
  tl.to(".hero", { y: -40, opacity: 0, duration: 0.5 })
})
```

## Preloader

Build your own preloader — curtain handles the timing:

```tsx
"use client"

import { usePreloader } from "@bnm-p/curtain"
import { useEffect } from "react"

export const Preloader = () => {
  const { notifyDone } = usePreloader()

  useEffect(() => {
    // run your intro, then:
    notifyDone()
  }, [])

  return <div className="fixed inset-0 z-50 bg-black" />
}
```

Pass it to `CurtainProvider` via `extras`:

```tsx
<CurtainProvider config={curtainConfig} extras={<Preloader />}>
  {children}
</CurtainProvider>
```

## Per-route transitions

```ts
export const curtainConfig = defineCurtainConfig({
  default: defaultTransition,

  namespaces: {
    "/": "home",
    "/about": "about",
  },

  transitions: {
    "* -> about": fadeTransition,
  },
})
```

## Docs

Full documentation at [bnm-p.github.io/curtain](https://bnm-p.github.io/curtain) *(coming soon)*

## License

MIT
