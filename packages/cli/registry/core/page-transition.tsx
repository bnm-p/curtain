"use client"

import { gsap } from "gsap"
import { usePathname, useRouter } from "next/navigation"
import { type FC, type PropsWithChildren, useEffect, useLayoutEffect, useRef } from "react"
import { type AnimationFn, type TimelineAnimationFn, useMotionContext } from "./context"
import type { TransitionDef } from "./types"

export const PageTransition: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const { config, getEntryAnimations, getLeaveAnimations, onPreloaderReady } = useMotionContext()

  const {
    selector,
    wrapperAttr,
    lockDuration,
    pageAnimDelay,
    intercept,
    namespaces,
    transitions,
    default: defaultTransition,
  } = config

  // activeTransitionRef is set in the click handler before router.push.
  // Both useLayoutEffect and useEffect use it to detect a real navigation
  // (vs initial mount or Strict Mode re-invocation).
  const activeTransitionRef = useRef<TransitionDef | null>(null)
  const ghostRef = useRef<HTMLElement | null>(null)
  const exitTweenRef = useRef<gsap.core.Tween | null>(null)
  const prevPathnameRef = useRef(pathname)
  const isTransitioning = useRef(false)

  const isIntercepting = (path: string) => intercept.includes(path)

  const getNamespace = (path: string): string => namespaces[path] ?? "default"

  const getTransition = (from: string, to: string): TransitionDef => {
    const exact = `${from} -> ${to}`
    const wildcard = `* -> ${to}`
    return transitions[exact] ?? transitions[wildcard] ?? defaultTransition
  }

  const getWrapper = (content: HTMLElement): HTMLElement =>
    content.querySelector<HTMLElement>(wrapperAttr) ?? content

  // ─── Pre-paint: hide new content before first frame ──────────────────────
  // Fires synchronously after React commits DOM but before the browser paints.
  // Sets the incoming page's clip-path so it's hidden behind the ghost from
  // the very first frame — no flash possible.
  useLayoutEffect(() => {
    if (isIntercepting(pathname)) return

    // Coming back from an intercepting route — page was already visible underneath,
    // no transition needed so don't hide the wrapper.
    const prevPathname = prevPathnameRef.current
    if (isIntercepting(prevPathname) && !activeTransitionRef.current) return

    const content = document.querySelector<HTMLElement>(selector)
    if (!content) return

    // Reset wrapper opacity — GSAP inline opacity:1 from the previous navigation
    // overrides any opacity-0 class, so new content would flash visible before
    // the entry animation fires.
    const wrapper = getWrapper(content)
    gsap.set(wrapper, { opacity: 0 })

    if (!activeTransitionRef.current) return

    // Clear residual transform/clip props from any interrupted previous animation
    // (covers popstate and rapid navigation).
    gsap.set(content, { clearProps: "clipPath,x,y,scale,opacity" })
    activeTransitionRef.current.setInitialState(content)
  }, [pathname])

  // ─── Entry animation ──────────────────────────────────────────────────────
  useEffect(() => {
    const prevPathname = prevPathnameRef.current
    prevPathnameRef.current = pathname

    // Capture and immediately clear the active transition so a stale value
    // from a previous link-click never bleeds into router.back() from an
    // intercepting route.
    const activeTransition = activeTransitionRef.current
    activeTransitionRef.current = null

    const content = document.querySelector<HTMLElement>(selector)
    if (!content) return

    // Intercepting route: renders its own fixed overlay. Kill any running entry
    // animation and clear position/zIndex from the content element — if left
    // set, it creates a stacking context that traps the overlay below the nav.
    if (isIntercepting(pathname)) {
      gsap.killTweensOf(content)
      gsap.set(content, { clearProps: "clipPath,position,zIndex" })
      const wrapper = getWrapper(content)
      gsap.set(wrapper, { opacity: 1 })
      return
    }

    // Coming back from an intercepting route — page was already visible, skip
    // transition. Forward navigation FROM an intercepting route has
    // activeTransition set, so it falls through and runs the normal animation.
    if (isIntercepting(prevPathname) && !activeTransition) {
      const wrapper = getWrapper(content)
      gsap.set(wrapper, { opacity: 1 })
      return
    }

    const entryTl = gsap.timeline()

    // Transition clip/slide only runs on real navigations, not initial load.
    if (activeTransition) {
      activeTransition.entry(entryTl, content)
    }

    let cancelled = false

    const runPageAnimation = () => {
      if (cancelled) return

      const fn = getEntryAnimations()
      const wrapper = getWrapper(content)

      // Reveal the wrapper immediately so the clip entry animation is visible.
      gsap.set(wrapper, { opacity: 1 })

      if (fn) {
        if (fn.length > 0) {
          // TimelineAnimationFn: scope selectors to content so they don't
          // accidentally target elements in the ghost clone.
          const pageTl = gsap.timeline()
          gsap.context(() => (fn as TimelineAnimationFn)(pageTl), content)
          entryTl.add(pageTl, `<${pageAnimDelay}`)
        } else {
          // FreeAnimationFn: runs freely after the transition.
          entryTl.call(
            () => (fn as FreeAnimationFn)(),
            [],
            `<${pageAnimDelay}`,
          )
        }
      }
    }

    // On initial hard load (no active transition): wait for the preloader to
    // signal before revealing the page. On internal navigation the preloader
    // is already done, so onPreloaderReady fires synchronously.
    if (!activeTransition) {
      onPreloaderReady(runPageAnimation)
    } else {
      runPageAnimation()
    }

    return () => {
      cancelled = true
      entryTl.kill()
    }
  }, [pathname])

  // ─── Exit animation (ghost clone) ────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: Event) => {
      const anchor = e.currentTarget as HTMLAnchorElement
      const href = anchor.getAttribute("href")
      if (!href) return

      const url = new URL(href, window.location.origin).pathname
      if (url === pathname || isTransitioning.current) return

      e.preventDefault()
      isTransitioning.current = true

      // Clean up any ghost from an aborted transition.
      if (ghostRef.current) {
        exitTweenRef.current?.kill()
        exitTweenRef.current = null
        ghostRef.current.remove()
        ghostRef.current = null
      }

      const fromNs = getNamespace(pathname)
      const toNs = getNamespace(url)
      const transition = getTransition(fromNs, toNs)
      activeTransitionRef.current = transition

      const content = document.querySelector<HTMLElement>(selector)
      if (content) {
        // Kill any ongoing entry animation and reset only transition-level
        // inline styles. Using clearProps:"all" would wipe child element GSAP
        // styles, making the ghost look wrong.
        gsap.killTweensOf(content)
        gsap.set(content, {
          clearProps: "clipPath,x,y,scale,opacity,position,zIndex",
        })

        // Snapshot the current page. The ghost sits at z-index:1 so the
        // incoming page (z-index:2, set by useLayoutEffect) renders on top.
        const ghost = content.cloneNode(true) as HTMLElement
        Object.assign(ghost.style, {
          position: "fixed",
          top: `-${window.scrollY}px`,
          left: "0",
          width: `${content.offsetWidth}px`,
          height: `${content.offsetHeight}px`,
          zIndex: "1",
          pointerEvents: "none",
          margin: "0",
          overflow: "hidden",
        })
        document.body.appendChild(ghost)
        ghostRef.current = ghost

        // Hide original immediately via direct style — not just GSAP — so
        // it's invisible even if React 18 concurrent mode paints before
        // useLayoutEffect fires.
        content.style.opacity = "0"
        content.style.clipPath = "inset(0% 0% 100% 0%)"

        const exitTween = transition.exit(ghost)
        exitTween.eventCallback("onComplete", () => {
          if (ghostRef.current === ghost) {
            ghost.remove()
            ghostRef.current = null
          }
        })
        exitTweenRef.current = exitTween

        // Run leave animations scoped to the ghost so selectors only target
        // elements within the cloned page, not the incoming page.
        const leaveFn = getLeaveAnimations()
        if (leaveFn) {
          const leaveTl = gsap.timeline()
          gsap.context(() => {
            if (leaveFn.length > 0) {
              ;(leaveFn as TimelineAnimationFn)(leaveTl)
            } else {
              ;(leaveFn as FreeAnimationFn)()
            }
          }, ghost)
        }
      }

      // Navigate immediately — exit and entry run in parallel.
      router.push(url)

      setTimeout(() => {
        isTransitioning.current = false
      }, lockDuration)
    }

    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')
    for (const link of links) link.addEventListener("click", handleClick)
    return () => {
      for (const link of links) link.removeEventListener("click", handleClick)
    }
  })

  return <>{children}</>
}
