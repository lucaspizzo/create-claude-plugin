import { mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

function write(filePath, content, files) {
  writeFileSync(filePath, content.trimStart());
  files.push(filePath);
}

function mkdir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function pluginJson({ name, description, author }) {
  const manifest = {
    name,
    description,
    version: "1.0.0",
  };
  if (author) {
    manifest.author = { name: author };
  }
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

function exampleSkill(pluginName) {
  return `
---
description: Greet the user with a friendly message
---

Greet the user warmly and introduce yourself as the ${pluginName} plugin.
Use $ARGUMENTS if the user provides any input.
`;
}

function exampleAgent(pluginName) {
  return `
---
name: example
description: An example agent for ${pluginName}
model: sonnet
maxTurns: 10
---

You are a helpful assistant provided by the ${pluginName} plugin.
`;
}

function exampleHooks(pluginName) {
  const obj = {
    hooks: {
      PostToolUse: [
        {
          matcher: "Write|Edit",
          hooks: [
            {
              type: "command",
              command: `echo "[${pluginName}] File modified"`,
            },
          ],
        },
      ],
    },
  };
  return `${JSON.stringify(obj, null, 2)}\n`;
}

function exampleMcp() {
  return `${JSON.stringify(
    {
      mcpServers: {
        "example-server": {
          command: "node",
          args: ["${CLAUDE_PLUGIN_ROOT}/scripts/server.js"],
          env: {},
        },
      },
    },
    null,
    2,
  )}\n`;
}

function exampleMcpServer() {
  return `
// Example MCP server stub
// Replace this with your actual MCP server implementation.
// See: https://modelcontextprotocol.io/quickstart/server

console.error("[example-server] MCP server started");
`;
}

function exampleLsp() {
  return `${JSON.stringify(
    {
      example: {
        command: "example-lsp",
        args: ["--stdio"],
        extensionToLanguage: {
          ".example": "example",
        },
      },
    },
    null,
    2,
  )}\n`;
}

function gitignore() {
  return `
node_modules/
.DS_Store
*.log
`;
}

function license(author) {
  const year = new Date().getFullYear();
  const holder = author || "the contributors";
  return `
MIT License

Copyright (c) ${year} ${holder}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

function readme({ name, description, components }) {
  const sections = [
    `# ${name}`,
    "",
    description,
    "",
    "## Getting Started",
    "",
    "Test locally:",
    "",
    "```bash",
    "claude --plugin-dir .",
    "```",
    "",
    "## Structure",
    "",
    "- `.claude-plugin/plugin.json` — Plugin manifest",
  ];

  if (components.includes("Skills"))
    sections.push("- `skills/` — Agent skills");
  if (components.includes("Agents"))
    sections.push("- `agents/` — Custom agents");
  if (components.includes("Hooks")) sections.push("- `hooks/` — Event hooks");
  if (components.includes("MCP Servers"))
    sections.push("- `.mcp.json` — MCP server config");
  if (components.includes("LSP Servers"))
    sections.push("- `.lsp.json` — LSP server config");

  sections.push(
    "",
    "## Documentation",
    "",
    "- [Create plugins](https://code.claude.com/docs/en/plugins.md)",
    "- [Plugin reference](https://code.claude.com/docs/en/plugins-reference.md)",
    "",
  );

  return sections.join("\n");
}

export function scaffold(targetDir, config) {
  const { name, components } = config;
  const files = [];

  // Core
  mkdir(join(targetDir, ".claude-plugin"));
  write(
    join(targetDir, ".claude-plugin", "plugin.json"),
    pluginJson(config),
    files,
  );
  write(join(targetDir, ".gitignore"), gitignore(), files);
  write(join(targetDir, "LICENSE"), license(config.author), files);
  write(join(targetDir, "README.md"), readme(config), files);

  // Skills
  if (components.includes("Skills")) {
    const skillDir = join(targetDir, "skills", "hello");
    mkdir(skillDir);
    write(join(skillDir, "SKILL.md"), exampleSkill(name), files);
  }

  // Agents
  if (components.includes("Agents")) {
    mkdir(join(targetDir, "agents"));
    write(join(targetDir, "agents", "example.md"), exampleAgent(name), files);
  }

  // Hooks
  if (components.includes("Hooks")) {
    mkdir(join(targetDir, "hooks"));
    write(join(targetDir, "hooks", "hooks.json"), exampleHooks(name), files);
  }

  // MCP Servers
  if (components.includes("MCP Servers")) {
    mkdir(join(targetDir, "scripts"));
    write(join(targetDir, ".mcp.json"), exampleMcp(), files);
    write(join(targetDir, "scripts", "server.js"), exampleMcpServer(), files);
  }

  // LSP Servers
  if (components.includes("LSP Servers")) {
    write(join(targetDir, ".lsp.json"), exampleLsp(), files);
  }

  return files.map((f) => relative(targetDir, f));
}
