import { gsapAdapter } from "../adapters/gsap"
import type { CurtainConfig } from "./types"

export type ResolvedCurtainConfig = Required<CurtainConfig>

export function defineCurtainConfig(config: CurtainConfig): ResolvedCurtainConfig {
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
