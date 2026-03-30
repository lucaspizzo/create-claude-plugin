# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the maintainer or use [GitHub's private vulnerability reporting](https://github.com/lucaspizzo/create-claude-plugin/security/advisories/new)

You should receive a response within 48 hours.

## Scope

This package runs locally and has zero runtime dependencies. It does not make network requests or execute user input as shell commands. The attack surface is limited to:

- File system operations (directory creation, file writing)
- Git operations (init, add, commit)

## Supported Versions

Only the latest version receives security updates.
