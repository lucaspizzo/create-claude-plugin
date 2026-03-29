# Contributing

Thanks for your interest in contributing!

## Development

```bash
git clone https://github.com/lucaspizzo/create-claude-plugin.git
cd create-claude-plugin
npm install
```

### Run tests

```bash
npm test
```

### Run linter

```bash
npm run lint
npm run lint:fix  # auto-fix
```

### Test locally

```bash
node index.js my-test-plugin --yes
```

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated releases.

```
feat: add new feature        → minor release
fix: fix a bug               → patch release
feat!: breaking change       → major release
chore: maintenance task      → no release
docs: update documentation   → no release
test: add or fix tests       → no release
```

## Pull requests

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Add or update tests as needed
4. Ensure `npm test` and `npm run lint` pass
5. Submit a PR

All PRs require CI to pass before merging.

## Reporting bugs

Use [GitHub Issues](https://github.com/lucaspizzo/create-claude-plugin/issues) with the bug report template.
