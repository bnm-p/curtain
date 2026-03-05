import * as fs from "node:fs"
import * as path from "node:path"
import chalk from "chalk"
import { copyFile } from "../utils/copy"
import { detectOutputDir } from "../utils/detect"

type AddTarget =
  | { type: "preloader" }
  | { type: "transition"; name: string }

const TRANSITIONS: Record<string, string> = {
  default: "transitions/default.ts",
  fade: "transitions/fade.ts",
}

function resolveTarget(args: string[]): AddTarget {
  const [first, second] = args

  if (first === "preloader") return { type: "preloader" }
  if (first === "transition" && second) return { type: "transition", name: second }

  // Shorthand: `add fade` → transition
  if (first && TRANSITIONS[first]) return { type: "transition", name: first }

  console.log(chalk.red(`Unknown target: ${args.join(" ")}`))
  console.log()
  console.log(chalk.bold("Available targets:"))
  console.log("  preloader")
  console.log("  transition default")
  console.log("  transition fade")
  console.log()
  process.exit(1)
}

export async function runAdd(
  args: string[],
  options: { dir?: string; cwd?: string; force?: boolean; registryRoot: string },
) {
  const REGISTRY_ROOT = options.registryRoot
  const cwd = options.cwd ?? process.cwd()
  const outRelative = options.dir ?? detectOutputDir(cwd)
  const outDir = path.resolve(cwd, outRelative)

  const target = resolveTarget(args)

  console.log()

  if (target.type === "preloader") {
    const src = path.join(REGISTRY_ROOT, "preloader/index.tsx")
    const dest = path.join(outDir, "preloader.tsx")
    const destRelative = path.join(outRelative, "preloader.tsx")

    if (fs.existsSync(dest) && !options.force) {
      console.log(chalk.yellow(`  ! ${destRelative} already exists. Use --force to overwrite.`))
      console.log()
      process.exit(1)
    }

    copyFile(src, dest)
    console.log(chalk.green(`  ✓ ${destRelative}`))
    console.log()
    console.log(chalk.bold("Usage:"))
    console.log()
    console.log(`  ${chalk.dim("// app/layout.tsx")}`)
    console.log(`  ${chalk.cyan(`import { Preloader } from '@/${outRelative.replace("src/", "")}/preloader'`)}`)
    console.log()
    console.log(`  ${chalk.cyan(`<ViewMotionProvider config={motionConfig} extras={<Preloader title="YOUR NAME" caption="Your caption" />}>`)}`)
    console.log(`    ${chalk.dim("{children}")}`)
    console.log(`  ${chalk.cyan("</ViewMotionProvider>")}`)
    console.log()
    console.log(chalk.dim("  Edit src/motion/preloader.tsx to fully customise the animation."))
    console.log()
    return
  }

  if (target.type === "transition") {
    const registryPath = TRANSITIONS[target.name]
    if (!registryPath) {
      console.log(chalk.red(`Unknown transition: ${target.name}`))
      console.log()
      console.log(chalk.bold("Available transitions:"))
      for (const name of Object.keys(TRANSITIONS)) {
        console.log(`  ${name}`)
      }
      console.log()
      process.exit(1)
    }

    const src = path.join(REGISTRY_ROOT, registryPath)
    const dest = path.join(outDir, `transitions/${target.name}.ts`)
    const destRelative = path.join(outRelative, `transitions/${target.name}.ts`)

    if (fs.existsSync(dest) && !options.force) {
      console.log(chalk.yellow(`  ! ${destRelative} already exists. Use --force to overwrite.`))
      console.log()
      process.exit(1)
    }

    copyFile(src, dest)
    console.log(chalk.green(`  ✓ ${destRelative}`))
    console.log()
    console.log(chalk.bold("Register in your config:"))
    console.log()
    console.log(
      `  ${chalk.cyan(`import { ${target.name}Transition } from './${outRelative.replace("src/", "")}/transitions/${target.name}'`)}`,
    )
    console.log()
    console.log(`  ${chalk.dim("// in motionConfig:")}`)
    console.log(`  ${chalk.cyan(`default: ${target.name}Transition,`)}`)
    console.log(`  ${chalk.dim("// or as a pair override:")}`)
    console.log(`  ${chalk.cyan(`transitions: { 'home -> about': ${target.name}Transition },`)}`)
    console.log()
  }
}
