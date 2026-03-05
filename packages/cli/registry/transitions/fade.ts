import { gsap } from "gsap"
import type { TransitionDef } from "../core/types"

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

  exit(content: HTMLElement): gsap.core.Tween {
    return gsap.to(content, {
      opacity: 0,
      duration: DURATION,
      ease: "power2.inOut",
    })
  },

  entry(tl: gsap.core.Timeline, content: HTMLElement) {
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
