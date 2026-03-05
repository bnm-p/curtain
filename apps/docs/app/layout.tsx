import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: {
    template: '%s – view-motion',
    default: 'view-motion',
  },
  description: 'Zero-config page transition system for Next.js App Router, powered by GSAP.',
}

const navbar = (
  <Navbar
    logo={
      <span style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
        view-motion
      </span>
    }
  />
)

const footer = (
  <Footer>
    MIT {new Date().getFullYear()} © view-motion
  </Footer>
)

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/your-org/view-motion/tree/main/apps/docs/content"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
