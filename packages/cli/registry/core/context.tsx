"use client"

import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useRef,
} from "react"
import type { MotionConfig } from "./types"

export type TimelineAnimationFn = (tl: gsap.core.Timeline) => void
export type FreeAnimationFn = () => void
export type AnimationFn = TimelineAnimationFn | FreeAnimationFn

interface MotionContextType {
  config: Required<MotionConfig>
  setEntryAnimations: (fn: AnimationFn) => void
  getEntryAnimations: () => AnimationFn | null
  setLeaveAnimations: (fn: AnimationFn | null) => void
  getLeaveAnimations: () => AnimationFn | null
  registerPreloader: () => void
  notifyPreloaderDone: () => void
  onPreloaderReady: (cb: () => void) => void
}

const MotionContext = createContext<MotionContextType | undefined>(undefined)

interface MotionContextProviderProps extends PropsWithChildren {
  config: Required<MotionConfig>
}

export const MotionContextProvider: FC<MotionContextProviderProps> = ({
  config,
  children,
}) => {
  const entryAnimations = useRef<AnimationFn | null>(null)
  const leaveAnimations = useRef<AnimationFn | null>(null)
  // Defaults to true so pages reveal immediately when no Preloader is used.
  // The Preloader calls registerPreloader() on mount to flip this to false,
  // then notifyPreloaderDone() when its animation completes.
  const preloaderDone = useRef(true)
  const preloaderQueue = useRef<Array<() => void>>([])

  return (
    <MotionContext.Provider
      value={{
        config,
        setEntryAnimations: (fn) => {
          entryAnimations.current = fn
        },
        getEntryAnimations: () => entryAnimations.current,
        setLeaveAnimations: (fn) => {
          leaveAnimations.current = fn
        },
        getLeaveAnimations: () => leaveAnimations.current,
        registerPreloader: () => {
          preloaderDone.current = false
        },
        notifyPreloaderDone: () => {
          preloaderDone.current = true
          for (const cb of preloaderQueue.current) cb()
          preloaderQueue.current = []
        },
        onPreloaderReady: (cb) => {
          if (preloaderDone.current) {
            cb()
          } else {
            preloaderQueue.current.push(cb)
          }
        },
      }}
    >
      {children}
    </MotionContext.Provider>
  )
}

export const useMotionContext = (): MotionContextType => {
  const ctx = useContext(MotionContext)
  if (!ctx) {
    throw new Error("useMotionContext must be used within <ViewMotionProvider>")
  }
  return ctx
}
