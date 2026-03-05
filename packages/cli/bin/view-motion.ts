#!/usr/bin/env node

import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { Command } from "commander"
import { runAdd } from "../src/commands/add"
import { runInit } from "../src/commands/init"

// Compute registry root from the bin file's location.
// Works in both dev (bin/) and bundled output (dist/) — registry/ is always ../
const __binDir = path.dirname(fileURLToPath(import.meta.url))
export const REGISTRY_ROOT = path.resolve(__binDir, "../registry")

const program = new Command()

program
  .name("view-motion")
  .description("Zero-config page transitions for Next.js App Router")
  .version("0.1.0")

program
  .command("init")
  .description("Scaffold motion files into your project")
  .option("-d, --dir <dir>", "Output directory (default: src/motion or motion)")
  .option("--force", "Overwrite existing files")
  .action((opts) => {
    runInit({ dir: opts.dir, force: opts.force, registryRoot: REGISTRY_ROOT }).catch((err) => {
      console.error(err)
      process.exit(1)
    })
  })

program
  .command("add [targets...]")
  .description(
    [
      "Add optional components to your project.",
      "",
      "Targets:",
      "  preloader              Bar-wipe preloader overlay",
      "  transition <name>      Add a transition (default, fade)",
      "",
      "Examples:",
      "  view-motion add preloader",
      "  view-motion add transition fade",
    ].join("\n"),
  )
  .option("-d, --dir <dir>", "Output directory (default: auto-detected)")
  .option("--force", "Overwrite existing files")
  .action((targets: string[], opts) => {
    if (targets.length === 0) {
      console.log()
      console.log("Usage: view-motion add <target>")
      console.log()
      console.log("Targets: preloader, transition <name>")
      console.log()
      process.exit(1)
    }

    runAdd(targets, { dir: opts.dir, force: opts.force, registryRoot: REGISTRY_ROOT }).catch((err) => {
      console.error(err)
      process.exit(1)
    })
  })

program.parse()
