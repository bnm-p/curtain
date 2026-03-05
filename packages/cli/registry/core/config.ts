import { gsap } from "gsap"
// If you use GSAP premium plugins (e.g. SplitText), import from your custom
// gsap setup file instead: import { gsap } from '@/lib/gsap'

import { defaultTransition } from "./transitions/default"
import { defineMotionConfig } from "./types"

/**
 * Your motion config. Edit this file to customise transitions, namespaces,
 * intercepting routes, and timing.
 *
 * The `default` transition is used for all route pairs unless overridden.
 * Add `transitions` to map specific namespace pairs to custom transitions.
 *
 * Minimal setup — works out of the box:
 */
export const motionConfig = defineMotionConfig({
  default: defaultTransition,

  // Map route paths to namespace strings.
  // Unregistered paths fall back to 'default'.
  namespaces: {
    // '/': 'home',
    // '/about': 'about',
    // '/projects/*': 'project',  // glob-style not yet supported — use exact paths
  },

  // Routes that use Next.js intercepting (parallel) routes.
  // Transitions are skipped when navigating to/from these paths.
  intercept: [
    // '/modal',
    // '/info',
  ],

  // Per-pair transition overrides.
  // Key: 'fromNamespace -> toNamespace'  or  '* -> toNamespace'
  transitions: {
    // 'home -> project': slideUpTransition,
    // '* -> contact': fadeTransition,
  },
})
