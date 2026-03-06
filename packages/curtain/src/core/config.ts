import { gsapAdapter } from "../adapters/gsap"
import type { MotionConfig } from "./types"

export type ResolvedMotionConfig = Required<MotionConfig>

export function defineMotionConfig(config: MotionConfig): ResolvedMotionConfig {
  return {
    adapter: gsapAdapter(),
    selector: ".page-content",
    wrapperAttr: "[data-page-wrapper]",
    lockDuration: 800,
    pageAnimDelay: 0.4,
    namespaces: {},
    intercept: [],
    transitions: {},
    ...config,
  }
}
