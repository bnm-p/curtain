import { gsap } from "gsap"
import type { AnimationAdapter, AnimationTimeline } from "../core/types"

// Internal symbol used to access the raw gsap timeline for nesting.
// Not part of the public AnimationTimeline interface.
const RAW = Symbol("gsap.raw")

interface GsapTimelineInternal extends AnimationTimeline {
  [RAW]: gsap.core.Timeline
}

const wrapTimeline = (raw: gsap.core.Timeline): GsapTimelineInternal => {
  const tl: GsapTimelineInternal = {
    [RAW]: raw,

    to(targets, vars, position) {
      raw.to(targets as gsap.TweenTarget, vars as gsap.TweenVars, position)
      return this
    },
    from(targets, vars, position) {
      raw.from(targets as gsap.TweenTarget, vars as gsap.TweenVars, position)
      return this
    },
    add(fn, position) {
      raw.add(fn, position)
      return this
    },
    nest(child, position) {
      // Access the raw gsap timeline from another wrapped timeline.
      // Falls back to calling the nest target as-is for non-gsap children.
      const childRaw = (child as Partial<GsapTimelineInternal>)[RAW]
      if (childRaw) raw.add(childRaw, position)
      return this
    },
    call(fn, params, position) {
      raw.call(fn, params as unknown[], position)
      return this
    },
    kill() {
      raw.kill()
    },
  }
  return tl
}

/**
 * Built-in GSAP adapter. This is the default adapter used by defineCurtainConfig.
 *
 * Pass a custom gsap instance if you register premium plugins in a central
 * setup file:
 * ```ts
 * import { gsap } from "@/lib/gsap" // your plugin-registering file
 * import { gsapAdapter } from "@bnm-p/curtain"
 *
 * defineCurtainConfig({ adapter: gsapAdapter(gsap), ... })
 * ```
 */
export const gsapAdapter = (instance: typeof gsap = gsap): AnimationAdapter => ({
  set(targets, vars) {
    instance.set(targets as gsap.TweenTarget, vars as gsap.TweenVars)
  },
  timeline() {
    return wrapTimeline(instance.timeline())
  },
  killTweensOf(targets) {
    instance.killTweensOf(targets as gsap.TweenTarget)
  },
  scope(fn, context) {
    instance.context(fn, context)
  },
})
