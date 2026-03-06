"use client"

import { type FC, type PropsWithChildren } from "react"
import { CurtainContextProvider } from "./context"
import { PageTransition } from "./page-transition"
import type { CurtainConfig } from "./types"
import { defineCurtainConfig } from "./config"

interface CurtainProviderProps extends PropsWithChildren {
  config: CurtainConfig
  /**
   * Optional extra children rendered outside <PageTransition> but still inside
   * the curtain context. Use this for parallel/intercepting routes (modals) and
   * the optional preloader.
   *
   * @example
   * <CurtainProvider config={curtainConfig} extras={<>{modal}<Preloader /></>}>
   *   {children}
   * </CurtainProvider>
   */
  extras?: React.ReactNode
}

/**
 * Wraps your layout with the curtain context + page transition orchestrator.
 *
 * Basic setup (app/layout.tsx):
 * ```tsx
 * import { CurtainProvider } from '@bnm/curtain'
 * import { curtainConfig } from '@/curtain.config'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <CurtainProvider config={curtainConfig}>
 *           {children}
 *         </CurtainProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * With intercepting routes + preloader:
 * ```tsx
 * <CurtainProvider config={curtainConfig} extras={<><Preloader />{modal}</>}>
 *   {children}
 * </CurtainProvider>
 * ```
 */
export const CurtainProvider: FC<CurtainProviderProps> = ({
  config,
  children,
  extras,
}) => {
  const resolvedConfig = defineCurtainConfig(config)

  return (
    <CurtainContextProvider config={resolvedConfig}>
      <PageTransition>{children}</PageTransition>
      {extras}
    </CurtainContextProvider>
  )
}
