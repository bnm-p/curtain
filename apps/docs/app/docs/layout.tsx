import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { source } from "@/lib/source"

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{ title: "@bnm/curtain" }}
    >
      {children}
    </DocsLayout>
  )
}
