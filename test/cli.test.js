import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

const CLI = join(import.meta.dirname, "..", "index.js");
let tempDir;

function run(args, opts = {}) {
  const cwd = opts.cwd ?? tempDir;
  return execFileSync("node", [CLI, ...args], {
    cwd,
    encoding: "utf8",
    timeout: 10_000,
    env: { ...process.env, NO_COLOR: "1" },
    ...opts,
  });
}

function runFail(args, opts = {}) {
  try {
    run(args, opts);
    assert.fail("Expected command to fail");
  } catch (err) {
    return err.stderr || err.stdout || "";
  }
}

describe("CLI", () => {
  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
  });

  it("shows help with --help", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const out = run(["--help"]);
    assert.ok(out.includes("create-claude-plugin"));
    assert.ok(out.includes("--yes"));
    assert.ok(out.includes("--version"));
    assert.ok(out.includes("--no-git"));
  });

  it("shows help with -h", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const out = run(["-h"]);
    assert.ok(out.includes("create-claude-plugin"));
  });

  it("shows version with --version", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const out = run(["--version"]);
    assert.match(out.trim(), /^\d+\.\d+\.\d+$/);
  });

  it("shows version with -v", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const out = run(["-v"]);
    assert.match(out.trim(), /^\d+\.\d+\.\d+$/);
  });

  it("fails without plugin name", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const err = runFail([]);
    assert.ok(err.includes("Plugin name is required"));
  });

  it("fails with invalid plugin name (uppercase)", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const err = runFail(["MyPlugin"]);
    assert.ok(err.includes("lowercase"));
  });

  it("fails with path traversal in name", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const err = runFail(["../evil"]);
    assert.ok(err.includes("path separators"));
  });

  it("fails with trailing hyphen in name", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const err = runFail(["my-plugin-"]);
    assert.ok(err.includes("lowercase"));
  });

  it("fails with name starting with number", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const err = runFail(["123plugin"]);
    assert.ok(err.includes("lowercase"));
  });

  it("fails with name exceeding 64 characters", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const longName = "a".repeat(65);
    const err = runFail([longName]);
    assert.ok(err.includes("64 characters"));
  });

  it("accepts single-letter name", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const out = run(["a", "--yes"]);
    assert.ok(out.includes("Created"));
  });

  it("fails with unknown flag", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const err = runFail(["--unknown"]);
    assert.ok(err.includes("Unknown flag"));
  });

  it("fails if directory already exists", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    run(["test-plugin", "--yes"]);
    const err = runFail(["test-plugin", "--yes"]);
    assert.ok(err.includes("already exists"));
  });

  it("scaffolds with --yes flag", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const out = run(["my-plugin", "--yes"]);
    assert.ok(out.includes("Created"));
    assert.ok(out.includes("my-plugin"));
    assert.ok(
      existsSync(join(tempDir, "my-plugin", ".claude-plugin", "plugin.json")),
    );
    assert.ok(
      existsSync(join(tempDir, "my-plugin", "skills", "hello", "SKILL.md")),
    );
    assert.ok(existsSync(join(tempDir, "my-plugin", ".gitignore")));
    assert.ok(existsSync(join(tempDir, "my-plugin", "LICENSE")));
    assert.ok(existsSync(join(tempDir, "my-plugin", "README.md")));
  });

  it("scaffolds with -y flag", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const out = run(["another-plugin", "-y"]);
    assert.ok(out.includes("Created"));
    assert.ok(
      existsSync(
        join(tempDir, "another-plugin", ".claude-plugin", "plugin.json"),
      ),
    );
  });

  it("initializes git repo with --yes", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const out = run(["git-test", "--yes"]);
    assert.ok(existsSync(join(tempDir, "git-test", ".git")));
    assert.ok(out.includes("Initialized git"));
  });

  it("skips git init with --no-git", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-cli-"));
    const out = run(["no-git-test", "--yes", "--no-git"]);
    assert.ok(!existsSync(join(tempDir, "no-git-test", ".git")));
    assert.ok(!out.includes("Initialized git"));
    assert.ok(out.includes("Created"));
  });
});
