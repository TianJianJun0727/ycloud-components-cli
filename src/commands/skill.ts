import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import chalk from "chalk";
import type { CommandModule } from "yargs";
import { BUILTIN_SKILLS_DIR } from "../constants";
import type { SkillInstallArgs } from "../types/commands";
import { CLIError, ErrorCode, printError } from "../utils/error";
import { output, type OutputFormat } from "../utils/output";

function normalizeExplicitTargetDir(targetDir: string) {
  const resolvedTargetDir = resolve(targetDir);
  const trimmedTargetDir = targetDir.replace(/[\\/]+$/, "") || targetDir;
  const rawBaseName = basename(trimmedTargetDir);
  const resolvedBaseName = basename(resolvedTargetDir);

  if (rawBaseName === "." || rawBaseName === "..") {
    return join(resolvedTargetDir, "skills");
  }

  if (resolvedBaseName === ".codex" || resolvedBaseName === ".claude") {
    return join(resolvedTargetDir, "skills");
  }

  return resolvedTargetDir;
}

function listBuiltinSkillDirs() {
  if (!existsSync(BUILTIN_SKILLS_DIR)) {
    throw new CLIError(
      ErrorCode.SKILL_SOURCE_NOT_FOUND,
      `Built-in skills directory not found: ${BUILTIN_SKILLS_DIR}`,
    );
  }

  return readdirSync(BUILTIN_SKILLS_DIR)
    .map((entry) => join(BUILTIN_SKILLS_DIR, entry))
    .filter((entryPath) => statSync(entryPath).isDirectory());
}

function resolveInstallTargets(targetDir?: string) {
  if (targetDir) {
    return [normalizeExplicitTargetDir(targetDir)];
  }

  const autoTargets = [".codex", ".claude"]
    .map((dirName) => resolve(process.cwd(), dirName))
    .filter((dirPath) => existsSync(dirPath) && statSync(dirPath).isDirectory())
    .map((dirPath) => join(dirPath, "skills"));

  if (autoTargets.length === 0) {
    throw new CLIError(
      ErrorCode.SKILL_TARGET_NOT_FOUND,
      "No .codex or .claude directory found in the current project.",
      "Create .codex or .claude in the project root, or run `ycc skill install <targetDir>`.",
    );
  }

  return autoTargets;
}

function installBuiltinSkills(targetDir: string, force = false) {
  const builtinSkillDirs = listBuiltinSkillDirs();
  const resolvedTargetDir = resolve(targetDir);

  mkdirSync(resolvedTargetDir, { recursive: true });

  const installed: string[] = [];
  const skipped: string[] = [];

  for (const sourceDir of builtinSkillDirs) {
    const skillName = basename(sourceDir);
    const targetSkillDir = join(resolvedTargetDir, skillName);

    if (existsSync(targetSkillDir)) {
      if (!force) {
        skipped.push(skillName);
        continue;
      }
      rmSync(targetSkillDir, { recursive: true, force: true });
    }

    cpSync(sourceDir, targetSkillDir, { recursive: true });
    installed.push(skillName);
  }

  return {
    targetDir: resolvedTargetDir,
    installed,
    skipped,
    force,
  };
}

function buildSuccessMessage(result: {
  targets: Array<{
    targetDir: string;
    installed: string[];
    skipped: string[];
  }>;
  force: boolean;
}) {
  const lines = [chalk.green("✅ Skill installation complete.")];

  for (const target of result.targets) {
    lines.push(`Location: ${chalk.cyan(target.targetDir)}`);

    if (target.installed.length > 0) {
      lines.push(`Added: ${target.installed.join(", ")}`);
    }
  }

  return lines.join("\n");
}

export const skillCmd: CommandModule<object, SkillInstallArgs> = {
  command: "skill install [targetDir]",
  describe: "Install built-in skills to a local directory",
  builder: (yargs) =>
    yargs
      .positional("targetDir", {
        type: "string",
        describe: "Target directory to install built-in skills into",
      })
      .option("force", {
        alias: "F",
        type: "boolean",
        default: false,
        describe: "Overwrite an existing skill directory with the same name",
      })
      .option("format", {
        alias: "f",
        type: "string",
        default: "text",
        describe: "Output format (json | text)",
      }),
  handler: async (argv) => {
    try {
      const targets = resolveInstallTargets(argv.targetDir).map((targetDir) =>
        installBuiltinSkills(targetDir, argv.force),
      );

      const payload = {
        targets,
        force: argv.force ?? false,
        message:
          targets.length === 1
            ? `Installed built-in skills into ${targets[0].targetDir}`
            : `Installed built-in skills into ${targets.length} target directories`,
      };

      if (argv.format === "json") {
        output(payload, argv.format as OutputFormat);
        return;
      }

      console.log(buildSuccessMessage(payload));
    } catch (err) {
      printError(err, argv.format);
    }
  },
};
