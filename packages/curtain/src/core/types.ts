// ─── Adapter abstractions ─────────────────────────────────────────────────────

/** Valid animation targets — element(s) or a CSS selector string */
export type AnimTarget = Element | Element[] | string

/**
 * Abstract sequencing timeline. Returned by AnimationAdapter.timeline() and
 * passed into TransitionDef.entry() and TimelineAnimationFn.
 * Each adapter (GSAP, anime.js, …) wraps its own timeline behind this interface.
 */
export interface AnimationTimeline {
  to(targets: AnimTarget, vars: Record<string, unknown>, position?: number | string): this
  from(targets: AnimTarget, vars: Record<string, unknown>, position?: number | string): this
  /** Add a function callback at the given position */
  add(fn: () => void, position?: number | string): this
  /** Nest a child timeline at the given position (for coordinated sequencing) */
  nest(child: AnimationTimeline, position?: number | string): this
  call(fn: () => void, params?: unknown[], position?: number | string): this
  kill(): void
}

/**
 * Abstract tween handle. Returned by TransitionDef.exit().
 * Provides the minimal surface needed by the orchestrator — completion callback
 * and cancellation.
 */
export interface AnimationTween {
  onComplete(fn: () => void): this
  kill(): void
}

/**
 * Animation library adapter. Implement this to swap out GSAP for any other
 * animation library.
 *
 * @example
 * // curtain.config.ts
 * import { defineCurtainConfig } from "@bnm/curtain"
 * import { myAdapter } from "./my-adapter"
 *
 * export const curtainConfig = defineCurtainConfig({
 *   adapter: myAdapter(),
 *   default: myTransition,
 * })
 */
export interface AnimationAdapter {
  /** Instantly set properties on target(s) */
  set(targets: AnimTarget, vars: Record<string, unknown>): void
  /** Create a new sequencing timeline */
  timeline(): AnimationTimeline
  /** Kill all running animations on target(s) */
  killTweensOf(targets: AnimTarget): void
  /**
   * Run fn with CSS selectors scoped to the context element.
   * For adapters that don't support scoping, simply call fn() directly and
   * use element refs instead of class selectors in your animation functions.
   */
  scope(fn: () => void, context: Element): void
}

// ─── Animation function types ─────────────────────────────────────────────────

/** Animation function that receives the entry timeline for coordinated sequencing */
export type TimelineAnimationFn = (tl: AnimationTimeline) => void
/** Animation function with full manual control — runs outside the entry timeline */
export type FreeAnimationFn = () => void
export type AnimationFn = TimelineAnimationFn | FreeAnimationFn

// ─── Transition / config ──────────────────────────────────────────────────────

export interface TransitionDef {
  /** Called synchronously before paint to hide the incoming page */
  setInitialState(content: HTMLElement): void
  /** Run on the ghost clone of the leaving page. Must return an AnimationTween. */
  exit(content: HTMLElement): AnimationTween
  /** Populate the entry timeline for the incoming page */
  entry(tl: AnimationTimeline, content: HTMLElement): void
}

export interface CurtainConfig {
  /** Default transition used for all route pairs */
  default: TransitionDef
  /**
   * Animation library adapter. Defaults to the built-in GSAP adapter.
   * Swap this to use a different animation library.
   */
  adapter?: AnimationAdapter
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

