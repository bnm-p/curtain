"use client"

import { useCurtainContext } from "../core/context"

/**
 * Hook for building a custom preloader. Call this inside your preloader
 * component — it blocks page entry animations until you call `notifyDone()`.
 *
 * @example
 * const MyPreloader = () => {
 *   const { notifyDone } = usePreloader()
 *
 *   useEffect(() => {
 *     // run your intro animation, then:
 *     notifyDone()
 *   }, [])
 *
 *   return <div className="fixed inset-0 z-50 bg-black" />
 * }
 */
export const usePreloader = () => {
  const { registerPreloader, notifyPreloaderDone } = useCurtainContext()

  // Must run synchronously before any effects so that onPreloaderReady in
  // PageTransition doesn't fire before the preloader is ready.
  registerPreloader()

  return { notifyDone: notifyPreloaderDone }
}
