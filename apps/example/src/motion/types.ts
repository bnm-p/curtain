export interface TransitionDef {
  /** Called synchronously before paint to hide the incoming page */
  setInitialState(content: HTMLElement): void
  /** Run on the ghost clone of the leaving page */
  exit(content: HTMLElement): gsap.core.Tween
  /** Run on the incoming page after setInitialState */
  entry(tl: gsap.core.Timeline, content: HTMLElement): void
}

export interface MotionConfig {
  /** Default transition used for all route pairs */
  default: TransitionDef
  /** Content element selector. Must match className on your page root. Default: '.page-content' */
  selector?: string
  /** Inner wrapper attribute selector. Used for preloader sync + opacity reveal. Default: '[data-page-wrapper]' */
  wrapperAttr?: string
  /** How long to lock navigations after one starts, in ms. Default: 800 */
  lockDuration?: number
  /** Delay in seconds before page-level entry animations fire after the clip reveal. Default: 0.4 */
  pageAnimDelay?: number
  /** Map route paths to namespace strings for transition lookups */
  namespaces?: Record<string, string>
  /** Route paths that use intercepting (parallel) routes — transitions are skipped for these */
  intercept?: string[]
  /**
   * Per-pair transition overrides.
   * Key format: 'fromNamespace -> toNamespace'  or  '* -> toNamespace'
   *
   * @example
   * { 'home -> project': slideUpTransition, '* -> contact': fadeTransition }
   */
  transitions?: Record<string, TransitionDef>
}

export function defineMotionConfig(config: MotionConfig): Required<MotionConfig> {
  return {
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
