# create-claude-plugin

[![CI](https://github.com/lucaspizzo/create-claude-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/lucaspizzo/create-claude-plugin/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/create-claude-plugin)](https://www.npmjs.com/package/create-claude-plugin)
[![license](https://img.shields.io/npm/l/create-claude-plugin)](LICENSE)

Scaffold a [Claude Code](https://code.claude.com/) plugin in seconds.

```bash
npx create-claude-plugin my-plugin
```

## Features

- **Interactive prompts** — plugin name, description, author, and component selection
- **Zero dependencies** — only Node.js built-ins
- **Full plugin structure** — generates valid `plugin.json`, example skills, agents, hooks, MCP/LSP configs
- **Git ready** — auto-initializes a git repo with an initial commit
- **Non-interactive mode** — use `--yes` to skip prompts and scaffold with defaults

## Usage

```bash
# Interactive
npx create-claude-plugin my-plugin

# Non-interactive (uses defaults)
npx create-claude-plugin my-plugin --yes
```

### Options

| Flag             | Description                    |
| ---------------- | ------------------------------ |
| `-y`, `--yes`    | Skip prompts, use defaults     |
| `--no-git`       | Skip git init                  |
| `-v`, `--version`| Show version                   |
| `-h`, `--help`   | Show help                      |

### Components

When prompted, you can include any combination of:

| Component     | What it generates                          |
| ------------- | ------------------------------------------ |
| Skills        | `skills/hello/SKILL.md` — example skill    |
| Agents        | `agents/example.md` — custom agent         |
| Hooks         | `hooks/hooks.json` — event hook config     |
| MCP Servers   | `.mcp.json` + `scripts/server.js` stub     |
| LSP Servers   | `.lsp.json` — language server config       |

## Generated structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # Plugin manifest
├── skills/
│   └── hello/
│       └── SKILL.md       # Example skill
├── .gitignore
├── LICENSE
└── README.md
```

(Additional files are created based on your component selection.)

## Testing your plugin

```bash
cd my-plugin
claude --plugin-dir .
```

## Documentation

- [Create plugins](https://code.claude.com/docs/en/plugins.md)
- [Plugin reference](https://code.claude.com/docs/en/plugins-reference.md)
- [Discover plugins](https://code.claude.com/docs/en/discover-plugins.md)

## Contributing

This project uses [Conventional Commits](https://www.conventionalcommits.org/) and [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning.

Commit message format:

```
feat: add template flag        → minor release (1.x.0)
fix: handle empty description  → patch release (1.0.x)
feat!: redesign CLI interface  → major release (x.0.0)
chore: update dependencies     → no release
```

## License

MIT
