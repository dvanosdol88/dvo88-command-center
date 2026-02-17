# @dvanosdol88/ai-core

Shared AI core runtime used across multiple apps (LLC dashboard, RIA builder, AI learning game).

## Publish

This package is published to GitHub Packages (npm registry) from GitHub Actions on version tags.

1. Update `package.json` version (e.g. `0.1.1`)
2. Create a tag `v0.1.1` and push it
3. GitHub Actions will build and publish

## Consume (in an app repo)

1. Add an `.npmrc` like:

```ini
@dvanosdol88:registry=https://npm.pkg.github.com
```

2. In Vercel, set env var `NPM_TOKEN` to a GitHub token with `read:packages`.
3. Install:

```bash
npm i @dvanosdol88/ai-core
```

