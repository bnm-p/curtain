import { gsap } from "gsap"
import type { AnimationTimeline, AnimationTween, TransitionDef } from "../core/types"

const DURATION = 0.5

/**
 * Simple fade transition.
 *
 * Exit: leaving page fades out.
 * Entry: incoming page fades in.
 */
export const fadeTransition: TransitionDef = {
  setInitialState(content: HTMLElement) {
    gsap.set(content, { opacity: 0 })
  },

  exit(content: HTMLElement): AnimationTween {
    const tween = gsap.to(content, {
      opacity: 0,
      duration: DURATION,
      ease: "power2.inOut",
    })
    return {
      onComplete(fn) { tween.eventCallback("onComplete", fn); return this },
      kill() { tween.kill() },
    }
  },

  entry(tl: AnimationTimeline, content: HTMLElement) {
    gsap.set(content, { opacity: 0 })
    tl.to(content, {
      opacity: 1,
      duration: DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(content, { clearProps: "opacity" })
      },
    })
  },
}
