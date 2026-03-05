import * as fs from "node:fs"
import * as path from "node:path"

/**
 * Detect the user's preferred output directory.
 * Returns 'src/motion' if a src/ dir exists, else 'motion'.
 */
export function detectOutputDir(cwd: string): string {
  const hasSrc = fs.existsSync(path.join(cwd, "src"))
  return hasSrc ? path.join("src", "motion") : "motion"
}

/**
 * Detect the package manager used in the project.
 */
export function detectPackageManager(cwd: string): "bun" | "pnpm" | "yarn" | "npm" {
  if (fs.existsSync(path.join(cwd, "bun.lockb"))) return "bun"
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm"
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn"
  return "npm"
}

/**
 * Return the install command for a given package manager.
 */
export function installCmd(pm: ReturnType<typeof detectPackageManager>, pkg: string): string {
  switch (pm) {
    case "bun":
      return `bun add ${pkg}`
    case "pnpm":
      return `pnpm add ${pkg}`
    case "yarn":
      return `yarn add ${pkg}`
    default:
      return `npm install ${pkg}`
  }
}
