export { CurtainProvider } from "./core/provider"
export { PageTransition } from "./core/page-transition"
export { useMotionContext } from "./core/context"
export { usePageEntry } from "./core/hooks/use-page-entry"
export { usePageLeave } from "./core/hooks/use-page-leave"
export { defineMotionConfig } from "./core/config"
export type { MotionConfig, TransitionDef } from "./core/types"
export type {
  AnimationFn,
  TimelineAnimationFn,
  FreeAnimationFn,
  AnimationAdapter,
  AnimationTimeline,
  AnimationTween,
  AnimTarget,
} from "./core/types"
export { usePreloader } from "./preloader/use-preloader"
export { gsapAdapter } from "./adapters/gsap"
export { defaultTransition } from "./transitions/default"
export { fadeTransition } from "./transitions/fade"
