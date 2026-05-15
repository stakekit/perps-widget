# AGENTS.md

Instructions for AI coding agents working with this codebase.

## Commands

After each code change, run these commands to confirm that nothing is broken

- To lint and typecheck, run: `pnpm turbo lint --filter=@yieldxyz/perps-{package}`,
- For code formatting, run: `pnpm turbo format --filter=@yieldxyz/perps-{package}`,
- If a file is added, removed, or changed in `routes` folder, to generate route tree run: `pnpm turbo generate-routes --filter=@yieldxyz/perps-{package}`

## General rules

- Don't mix components/UI and logic - separate those two in hooks and components files
- All state handling should be done with `@effect-atom/atom-react`
- Use `effect` as much as possible. Don't use async/await
- Math/finance calculations and functions are placed in `packages/common/src/lib/math.ts`
- For manipulating array and records use `effect/Array` and `effect/Record`
- Don't use hooks `useMemo` or `useCallback` as we're using react-compiler
- During refactoring, avoid re-exporting functionality. Update imports in file thats importing this functionality

## Source code references

- Check `.external/effect-smol` for all references related to effect. Do not look up web for docs. They are not available yet as this is beta version