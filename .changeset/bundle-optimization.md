---
'@nextnode/validation': patch
---

Migrate to tsup bundler for 60% bundle size reduction

- Replace tsc + tsc-alias with tsup (esbuild-based bundler)
- Add `sideEffects: false` for optimal tree-shaking by consumers
- Minify production output (47KB -> 19KB JavaScript)
- Exclude source maps from npm publish to reduce package size
- Add `pnpm size` command for bundle size tracking
