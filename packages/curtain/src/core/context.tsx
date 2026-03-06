"use client"

import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useRef,
} from "react"
import type { AnimationFn, CurtainConfig } from "./types"
import type { ResolvedCurtainConfig } from "./config"

interface CurtainContextType {
  config: ResolvedCurtainConfig
  setEntryAnimations: (fn: AnimationFn) => void
  getEntryAnimations: () => AnimationFn | null
  setLeaveAnimations: (fn: AnimationFn | null) => void
  getLeaveAnimations: () => AnimationFn | null
  registerPreloader: () => void
  notifyPreloaderDone: () => void
  onPreloaderReady: (cb: () => void) => void
}

const CurtainContext = createContext<CurtainContextType | undefined>(undefined)

interface CurtainContextProviderProps extends PropsWithChildren {
  config: ResolvedCurtainConfig
}

export const CurtainContextProvider: FC<CurtainContextProviderProps> = ({
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
    <CurtainContext.Provider
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
    </CurtainContext.Provider>
  )
}

export const useCurtainContext = (): CurtainContextType => {
  const ctx = useContext(CurtainContext)
  if (!ctx) {
    throw new Error("useCurtainContext must be used within <CurtainProvider>")
  }
  return ctx
}
