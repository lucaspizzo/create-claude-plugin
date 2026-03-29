#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bold, cyan, dim, green, red } from "./lib/colors.js";
import { defaults, gather } from "./lib/prompts.js";
import { scaffold } from "./lib/scaffold.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));

const HELP = `
  ${bold("create-claude-plugin")} ${dim("—")} ${dim("Scaffold a Claude Code plugin")}

  ${bold("Usage")}
    ${dim("$")} ${cyan("create-claude-plugin")} ${green("<plugin-name>")} ${dim("[options]")}
    ${dim("$")} ${cyan("npx create-claude-plugin")} ${green("<plugin-name>")} ${dim("[options]")}

  ${bold("Options")}
    ${cyan("-y")}, ${cyan("--yes")}       Skip prompts and use defaults
        ${cyan("--no-git")}    Skip git init
    ${cyan("-v")}, ${cyan("--version")}   Show version number
    ${cyan("-h")}, ${cyan("--help")}      Show this help message

  ${bold("Examples")}
    ${dim("$")} ${cyan("npx create-claude-plugin")} ${green("my-plugin")}
    ${dim("$")} ${cyan("npx create-claude-plugin")} ${green("my-plugin")} ${cyan("--yes")}
    ${dim("$")} ${cyan("npx create-claude-plugin")} ${green("my-plugin")} ${cyan("--yes --no-git")}
`;

const NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function parseArgs(argv) {
  const args = { flags: new Set(), positional: [] };
  for (const arg of argv.slice(2)) {
    if (arg === "-h" || arg === "--help") args.flags.add("help");
    else if (arg === "-v" || arg === "--version") args.flags.add("version");
    else if (arg === "-y" || arg === "--yes") args.flags.add("yes");
    else if (arg === "--no-git") args.flags.add("no-git");
    else if (arg.startsWith("-")) {
      console.error(
        `${red("Error:")} Unknown flag "${arg}". Use --help to see options.`,
      );
      process.exit(1);
    } else args.positional.push(arg);
  }
  return args;
}

function validateName(name) {
  if (name.includes("/") || name.includes("..")) {
    console.error(
      `${red("Error:")} Plugin name cannot contain path separators or "..".`,
    );
    process.exit(1);
  }
  if (!NAME_PATTERN.test(name)) {
    console.error(
      `${red("Error:")} Plugin name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens (no trailing hyphen).`,
    );
    console.error(dim(`  Example: my-plugin, code-formatter, eslint-helper`));
    process.exit(1);
  }
  if (name.length > 64) {
    console.error(
      `${red("Error:")} Plugin name must be 64 characters or fewer.`,
    );
    process.exit(1);
  }
}

function checkNodeVersion() {
  const major = parseInt(process.versions.node.split(".")[0], 10);
  if (major < 18) {
    console.error(
      `${red("Error:")} Node.js >= 18 is required (current: ${process.versions.node}).`,
    );
    process.exit(1);
  }
}

function gitInit(dir) {
  try {
    execSync("git init", { cwd: dir, stdio: "ignore" });
    execSync("git add -A", { cwd: dir, stdio: "ignore" });
    execSync('git commit -m "Initial commit from create-claude-plugin"', {
      cwd: dir,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function printSummary(pluginName, files, didGitInit) {
  console.log();
  console.log(
    `  ${green("+")} Created ${bold(pluginName)} with ${files.length} files:`,
  );
  console.log();
  for (const file of files) {
    console.log(`    ${dim(file)}`);
  }
  if (didGitInit) {
    console.log();
    console.log(`  ${dim("Initialized git repository with initial commit.")}`);
  }
  console.log();
  console.log(`  ${bold("Next steps:")}`);
  console.log();
  console.log(`    ${cyan("cd")} ${pluginName}`);
  console.log(`    ${cyan("claude")} --plugin-dir .`);
  console.log();
  console.log(dim("  Docs: https://code.claude.com/docs/en/plugins.md"));
  console.log();
}

async function main() {
  checkNodeVersion();

  const { flags, positional } = parseArgs(process.argv);

  if (flags.has("help")) {
    console.log(HELP);
    process.exit(0);
  }

  if (flags.has("version")) {
    console.log(pkg.version);
    process.exit(0);
  }

  const pluginName = positional[0];

  if (!pluginName) {
    console.error(`${red("Error:")} Plugin name is required.`);
    console.error(dim("  Usage: create-claude-plugin <plugin-name>"));
    process.exit(1);
  }

  validateName(pluginName);

  const targetDir = resolve(process.cwd(), pluginName);

  if (existsSync(targetDir)) {
    console.error(`${red("Error:")} Directory "${pluginName}" already exists.`);
    process.exit(1);
  }

  const config = flags.has("yes")
    ? defaults(pluginName)
    : await gather(pluginName);

  let files;
  try {
    files = scaffold(targetDir, config);
  } catch (err) {
    try {
      rmSync(targetDir, { recursive: true, force: true });
    } catch {}

    if (err.code === "EACCES") {
      console.error(
        `${red("Error:")} Permission denied — cannot write to ${targetDir}`,
      );
    } else if (err.code === "ENOSPC") {
      console.error(`${red("Error:")} No disk space available.`);
    } else {
      console.error(`${red("Error:")} Failed to create plugin: ${err.message}`);
    }
    process.exit(1);
  }

  const didGitInit = flags.has("no-git") ? false : gitInit(targetDir);

  printSummary(pluginName, files, didGitInit);
}

process.on("SIGINT", () => {
  console.log(dim("\n  Cancelled."));
  process.exit(0);
});

main().catch((err) => {
  console.error(`${red("Error:")} ${err.message}`);
  process.exit(1);
});
