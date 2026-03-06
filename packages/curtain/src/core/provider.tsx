"use client"

import { type FC, type PropsWithChildren } from "react"
import { MotionContextProvider } from "./context"
import { PageTransition } from "./page-transition"
import type { MotionConfig } from "./types"
import { defineMotionConfig } from "./config"

interface ViewMotionProviderProps extends PropsWithChildren {
  config: MotionConfig
  /**
   * Optional extra children rendered outside <PageTransition> but still inside
   * the motion context. Use this for parallel/intercepting routes (modals) and
   * the optional <Preloader />.
   *
   * @example
   * <ViewMotionProvider config={motionConfig} extras={<>{modal}<Preloader /></>}>
   *   {children}
   * </ViewMotionProvider>
   */
  extras?: React.ReactNode
}

/**
 * Wraps your layout with the motion context + page transition orchestrator.
 *
 * Basic setup (app/layout.tsx):
 * ```tsx
 * import { ViewMotionProvider } from '@bnm/curtain'
 * import { motionConfig } from '@/motion/config'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ViewMotionProvider config={motionConfig}>
 *           {children}
 *         </ViewMotionProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * With intercepting routes + preloader:
 * ```tsx
 * <ViewMotionProvider config={motionConfig} extras={<><Preloader />{modal}</>}>
 *   {children}
 * </ViewMotionProvider>
 * ```
 */
export const ViewMotionProvider: FC<ViewMotionProviderProps> = ({
  config,
  children,
  extras,
}) => {
  const resolvedConfig = defineMotionConfig(config)

  return (
    <MotionContextProvider config={resolvedConfig}>
      <PageTransition>{children}</PageTransition>
      {extras}
    </MotionContextProvider>
  )
}
