import { createInterface } from "node:readline";
import { bold, cyan, dim } from "./colors.js";

const COMPONENTS = ["Skills", "Agents", "Hooks", "MCP Servers", "LSP Servers"];

function createPrompter() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: process.stdin.isTTY ?? false,
  });

  function ask(question, defaultValue = "") {
    const suffix = defaultValue ? dim(` (${defaultValue})`) : "";
    return new Promise((resolve) => {
      rl.question(`  ${cyan("?")} ${question}${suffix}: `, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  function askMultiSelect(question, options) {
    return new Promise((resolve) => {
      console.log(`\n  ${cyan("?")} ${question}`);
      options.forEach((opt, i) => {
        console.log(`    ${bold(String(i + 1))}. ${opt}`);
      });
      console.log(dim(`\n    Enter numbers separated by commas (e.g. 1,3,4)`));
      rl.question(`  ${cyan(">")} `, (answer) => {
        if (!answer.trim()) {
          resolve([]);
          return;
        }
        const indices = answer
          .split(",")
          .map((s) => parseInt(s.trim(), 10) - 1)
          .filter((i) => i >= 0 && i < options.length);
        const unique = [...new Set(indices)];
        resolve(unique.map((i) => options[i]));
      });
    });
  }

  return { ask, askMultiSelect, close: () => rl.close() };
}

export function defaults(pluginName) {
  return {
    name: pluginName,
    description: "A Claude Code plugin",
    author: "",
    components: ["Skills"],
  };
}

export async function gather(pluginName) {
  const { ask, askMultiSelect, close } = createPrompter();

  console.log();
  console.log(`  ${bold("Create Claude Plugin")}`);
  console.log();

  const description = await ask("Plugin description", "A Claude Code plugin");
  const author = await ask("Author name");
  const components = await askMultiSelect(
    "Which components do you want to include?",
    COMPONENTS,
  );

  if (components.length === 0) {
    console.log(
      dim(`\n    No components selected — will include Skills by default.`),
    );
    components.push("Skills");
  }

  close();

  return {
    name: pluginName,
    description,
    author,
    components,
  };
}
