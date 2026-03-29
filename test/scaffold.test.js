import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { scaffold } from "../lib/scaffold.js";

describe("scaffold", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "ccp-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("creates plugin.json with correct manifest", () => {
    const targetDir = join(tempDir, "test-plugin");
    scaffold(targetDir, {
      name: "test-plugin",
      description: "A test",
      author: "Test Author",
      components: ["Skills"],
    });

    const manifest = JSON.parse(
      readFileSync(join(targetDir, ".claude-plugin", "plugin.json"), "utf8"),
    );
    assert.equal(manifest.name, "test-plugin");
    assert.equal(manifest.description, "A test");
    assert.equal(manifest.version, "1.0.0");
    assert.deepEqual(manifest.author, { name: "Test Author" });
  });

  it("omits author field when author is empty", () => {
    const targetDir = join(tempDir, "no-author");
    scaffold(targetDir, {
      name: "no-author",
      description: "desc",
      author: "",
      components: ["Skills"],
    });

    const manifest = JSON.parse(
      readFileSync(join(targetDir, ".claude-plugin", "plugin.json"), "utf8"),
    );
    assert.equal(manifest.author, undefined);
  });

  it("always creates core files", () => {
    const targetDir = join(tempDir, "core");
    scaffold(targetDir, {
      name: "core",
      description: "d",
      author: "",
      components: ["Skills"],
    });

    assert.ok(existsSync(join(targetDir, ".claude-plugin", "plugin.json")));
    assert.ok(existsSync(join(targetDir, ".gitignore")));
    assert.ok(existsSync(join(targetDir, "LICENSE")));
    assert.ok(existsSync(join(targetDir, "README.md")));
  });

  it("generates .gitignore with correct content", () => {
    const targetDir = join(tempDir, "gitignore-test");
    scaffold(targetDir, {
      name: "gitignore-test",
      description: "d",
      author: "",
      components: ["Skills"],
    });

    const content = readFileSync(join(targetDir, ".gitignore"), "utf8");
    assert.ok(content.includes("node_modules/"));
    assert.ok(content.includes(".DS_Store"));
  });

  it("generates LICENSE with author name", () => {
    const targetDir = join(tempDir, "license-test");
    scaffold(targetDir, {
      name: "license-test",
      description: "d",
      author: "Jane Doe",
      components: ["Skills"],
    });

    const content = readFileSync(join(targetDir, "LICENSE"), "utf8");
    assert.ok(content.includes("MIT License"));
    assert.ok(content.includes("Jane Doe"));
  });

  it("generates LICENSE with fallback when no author", () => {
    const targetDir = join(tempDir, "license-no-author");
    scaffold(targetDir, {
      name: "license-no-author",
      description: "d",
      author: "",
      components: ["Skills"],
    });

    const content = readFileSync(join(targetDir, "LICENSE"), "utf8");
    assert.ok(content.includes("the contributors"));
  });

  it("generates README with plugin name and description", () => {
    const targetDir = join(tempDir, "readme-test");
    scaffold(targetDir, {
      name: "readme-test",
      description: "My cool plugin",
      author: "",
      components: ["Skills", "Hooks"],
    });

    const content = readFileSync(join(targetDir, "README.md"), "utf8");
    assert.ok(content.includes("# readme-test"));
    assert.ok(content.includes("My cool plugin"));
    assert.ok(content.includes("claude --plugin-dir ."));
    assert.ok(content.includes("Agent skills"));
    assert.ok(content.includes("Event hooks"));
    assert.ok(!content.includes("Custom agents"));
  });

  it("creates skill files when Skills selected", () => {
    const targetDir = join(tempDir, "with-skills");
    scaffold(targetDir, {
      name: "with-skills",
      description: "d",
      author: "",
      components: ["Skills"],
    });

    const content = readFileSync(
      join(targetDir, "skills", "hello", "SKILL.md"),
      "utf8",
    );
    assert.ok(content.includes("description:"));
    assert.ok(content.includes("with-skills"));
  });

  it("does not create skill files when Skills not selected", () => {
    const targetDir = join(tempDir, "no-skills");
    scaffold(targetDir, {
      name: "no-skills",
      description: "d",
      author: "",
      components: ["Agents"],
    });

    assert.ok(!existsSync(join(targetDir, "skills")));
  });

  it("creates agent files when Agents selected", () => {
    const targetDir = join(tempDir, "with-agents");
    scaffold(targetDir, {
      name: "with-agents",
      description: "d",
      author: "",
      components: ["Agents"],
    });

    const content = readFileSync(
      join(targetDir, "agents", "example.md"),
      "utf8",
    );
    assert.ok(content.includes("name: example"));
    assert.ok(content.includes("with-agents"));
  });

  it("creates hooks files with plugin name interpolated", () => {
    const targetDir = join(tempDir, "with-hooks");
    scaffold(targetDir, {
      name: "with-hooks",
      description: "d",
      author: "",
      components: ["Hooks"],
    });

    const hooks = JSON.parse(
      readFileSync(join(targetDir, "hooks", "hooks.json"), "utf8"),
    );
    assert.ok(hooks.hooks.PostToolUse);
    const command = hooks.hooks.PostToolUse[0].hooks[0].command;
    assert.ok(command.includes("with-hooks"));
  });

  it("creates MCP files and scripts dir when MCP Servers selected", () => {
    const targetDir = join(tempDir, "with-mcp");
    scaffold(targetDir, {
      name: "with-mcp",
      description: "d",
      author: "",
      components: ["MCP Servers"],
    });

    assert.ok(existsSync(join(targetDir, ".mcp.json")));
    assert.ok(existsSync(join(targetDir, "scripts", "server.js")));

    const serverContent = readFileSync(
      join(targetDir, "scripts", "server.js"),
      "utf8",
    );
    assert.ok(serverContent.includes("MCP server"));
  });

  it("creates LSP config when LSP Servers selected", () => {
    const targetDir = join(tempDir, "with-lsp");
    scaffold(targetDir, {
      name: "with-lsp",
      description: "d",
      author: "",
      components: ["LSP Servers"],
    });

    assert.ok(existsSync(join(targetDir, ".lsp.json")));
  });

  it("creates all components when all selected", () => {
    const targetDir = join(tempDir, "all");
    const files = scaffold(targetDir, {
      name: "all",
      description: "d",
      author: "A",
      components: ["Skills", "Agents", "Hooks", "MCP Servers", "LSP Servers"],
    });

    assert.ok(files.length >= 9);
    assert.ok(existsSync(join(targetDir, "skills", "hello", "SKILL.md")));
    assert.ok(existsSync(join(targetDir, "agents", "example.md")));
    assert.ok(existsSync(join(targetDir, "hooks", "hooks.json")));
    assert.ok(existsSync(join(targetDir, ".mcp.json")));
    assert.ok(existsSync(join(targetDir, ".lsp.json")));
  });

  it("returns list of relative file paths", () => {
    const targetDir = join(tempDir, "paths");
    const files = scaffold(targetDir, {
      name: "paths",
      description: "d",
      author: "",
      components: ["Skills"],
    });

    assert.ok(Array.isArray(files));
    assert.ok(files.includes(".claude-plugin/plugin.json"));
    assert.ok(files.includes("skills/hello/SKILL.md"));
    assert.ok(!files.some((f) => f.startsWith("/")));
  });

  it("has no shared state between calls", () => {
    const dir1 = join(tempDir, "concurrent-1");
    const dir2 = join(tempDir, "concurrent-2");

    const files1 = scaffold(dir1, {
      name: "concurrent-1",
      description: "first",
      author: "",
      components: ["Skills"],
    });

    const files2 = scaffold(dir2, {
      name: "concurrent-2",
      description: "second",
      author: "",
      components: ["Skills", "Agents"],
    });

    assert.ok(files1.length < files2.length);
    assert.ok(!files1.includes("agents/example.md"));
    assert.ok(files2.includes("agents/example.md"));
  });
});
