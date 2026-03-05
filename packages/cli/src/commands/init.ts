import * as fs from "node:fs"
import * as path from "node:path"
import chalk from "chalk"
import { copyFile } from "../utils/copy"
import { detectOutputDir, detectPackageManager, installCmd } from "../utils/detect"

/**
 * Files + directories copied by `view-motion init`.
 * Each entry maps a registry source path to the destination path within the
 * user's output directory.
 */
const CORE_FILES: Array<{ src: string; dest: string }> = [
  { src: "core/types.ts", dest: "types.ts" },
  { src: "core/context.tsx", dest: "context.tsx" },
  { src: "core/page-transition.tsx", dest: "page-transition.tsx" },
  { src: "core/provider.tsx", dest: "provider.tsx" },
  { src: "core/config.ts", dest: "config.ts" },
  { src: "core/index.ts", dest: "index.ts" },
  { src: "core/hooks/use-page-entry.ts", dest: "hooks/use-page-entry.ts" },
  { src: "transitions/default.ts", dest: "transitions/default.ts" },
]

export async function runInit(options: {
  dir?: string
  cwd?: string
  force?: boolean
  registryRoot: string
}) {
  const REGISTRY_ROOT = options.registryRoot
  const cwd = options.cwd ?? process.cwd()
  const outRelative = options.dir ?? detectOutputDir(cwd)
  const outDir = path.resolve(cwd, outRelative)

  console.log()
  console.log(chalk.bold("view-motion init"))
  console.log(chalk.dim(`Output: ${outRelative}/`))
  console.log()

  // Check for existing files
  if (fs.existsSync(outDir) && !options.force) {
    const existing = fs.readdirSync(outDir)
    if (existing.length > 0) {
      console.log(
        chalk.yellow(`  ! ${outRelative}/ already exists and is not empty.`),
      )
      console.log(
        chalk.dim(`    Run with --force to overwrite, or use --dir to choose a different path.`),
      )
      console.log()
      process.exit(1)
    }
  }

  // Copy core files
  for (const { src, dest } of CORE_FILES) {
    const srcPath = path.join(REGISTRY_ROOT, src)
    const destPath = path.join(outDir, dest)

    if (!fs.existsSync(srcPath)) {
      console.log(chalk.red(`  ✗ Missing registry file: ${src}`))
      process.exit(1)
    }

    copyFile(srcPath, destPath)
    console.log(chalk.green(`  ✓ ${path.join(outRelative, dest)}`))
  }

  console.log()

  // Detect package manager and print install instructions
  const pm = detectPackageManager(cwd)
  const hasPkg = (pkg: string) => {
    try {
      const pkgJson = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8"))
      return (
        pkg in (pkgJson.dependencies ?? {}) || pkg in (pkgJson.devDependencies ?? {})
      )
    } catch {
      return false
    }
  }

  const missing = ["gsap"].filter((pkg) => !hasPkg(pkg))

  if (missing.length > 0) {
    console.log(chalk.bold("Install peer dependencies:"))
    console.log()
    console.log(`  ${chalk.cyan(installCmd(pm, missing.join(" ")))}`)
    console.log()
  }

  // Print usage instructions
  console.log(chalk.bold("Add to your layout:"))
  console.log()
  console.log(chalk.dim("  // app/layout.tsx"))
  console.log(`  ${chalk.cyan(`import { ViewMotionProvider } from '@/${outRelative.replace("src/", "")}/provider'`)}`)
  console.log(`  ${chalk.cyan(`import { motionConfig } from '@/${outRelative.replace("src/", "")}/config'`)}`)
  console.log()
  console.log(`  ${chalk.dim("<body>")}`)
  console.log(`    ${chalk.cyan(`<ViewMotionProvider config={motionConfig}>`)}`)
  console.log(`      ${chalk.dim("{children}")}`)
  console.log(`    ${chalk.cyan(`</ViewMotionProvider>`)}`)
  console.log(`  ${chalk.dim("</body>")}`)
  console.log()
  console.log(chalk.bold("Add to your pages:"))
  console.log()
  console.log(`  ${chalk.dim("// app/page.tsx")}`)
  console.log(`  ${chalk.cyan(`<main className="page-content">`)}`)
  console.log(`    ${chalk.dim("{/* your content */}")}`)
  console.log(`  ${chalk.cyan(`</main>`)}`)
  console.log()
  console.log(
    chalk.dim(
      "  Tip: add data-page-wrapper to an inner div if you use a Preloader,\n" +
        "  to control when the content is revealed.",
    ),
  )
  console.log()
  console.log(chalk.green("Done! Edit src/motion/config.ts to customise transitions."))
  console.log()
}
