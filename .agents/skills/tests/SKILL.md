---
name: tests
description: Write rule test cases the way this repo expects — one logical unit per test case, static self-contained snippets, comments only when they add meaning, and precise error assertions. Use when adding or changing tests in packages/eslint-plugin/tests/rules or reviewing a PR that touches rule tests.
---

# Writing rule tests

Rule tests use `@typescript-eslint/rule-tester`: each `packages/eslint-plugin/tests/rules/<rule-name>.test.ts` calls `ruleTester.run('<rule-name>', rule, { valid, invalid })` with literal arrays of cases. Small, precise, self-contained cases keep failure reports readable and reviews fast.

## Tester options

- Per-case `languageOptions.parserOptions` overrides the file's tester: `{ ecmaFeatures: { jsx: true } }` parses the snippet as `react.tsx`; pinning a compiler flag needs `project: './tsconfig.<flag>.json'` plus `projectService: false` and `tsconfigRootDir: getFixturesRootDir()`.
- For the full valid/invalid case and assertion option tables, see the [Rule Tester docs](../../../docs/packages/Rule_Tester.mdx).

## Do not over-test

Add the fewest cases that pin down the change. The suite is already large and CI time is a real constraint, so a case that cannot fail for a reason the change introduced is pure cost.

- Read the neighboring cases first; do not re-cover what they already cover.
- One case per behavior is enough — do not enumerate every operator, union member, or option permutation of a behavior already pinned by another case.
- Cover the branches the change touches — PRs aim for 100% coverage of touched code — and stop there, not at nearby untouched behavior.
- Pair a new `invalid` case with a `valid` neighbor showing where reporting stops; that boundary is what regressions cross.

## One logical unit per test case

Prefer one logical behavior per test case and, when reasonable, one error per `invalid` case. When several inputs exercise the same behavior, write several small cases — then a failing case names exactly what broke.

Before — one case bundling two assertions:

```ts
{
  code: `
declare const a: string | undefined;
a!;
const x = a!;
  `,
  errors: [
    { column: 1, endColumn: 3, endLine: 3, line: 3, messageId: 'noNonNull' },
    { column: 11, endColumn: 13, endLine: 4, line: 4, messageId: 'noNonNull' },
  ],
},
```

After — one behavior per case:

```ts
{
  code: `
declare const a: string | undefined;
a!;
  `,
  errors: [
    { column: 1, endColumn: 3, endLine: 3, line: 3, messageId: 'noNonNull' },
  ],
},
{
  code: `
declare const a: string | undefined;
const x = a!;
  `,
  errors: [
    { column: 11, endColumn: 13, endLine: 3, line: 3, messageId: 'noNonNull' },
  ],
},
```

## Static, self-contained code only

- `valid` and `invalid` are fully literal arrays: no cases generated with `.map()`, spreads, shared snippet constants, or `${}` interpolation (lint enforces this via `@typescript-eslint/internal/no-dynamic-tests`). Repeating a similar snippet across cases is fine — a reviewer or a failure report should never have to compute what code a case ran.
- Every snippet declares the symbols it introduces (`declare const`, minimal types or classes) and contains nothing beyond what the behavior under test needs. Standard lib globals like `Promise`, `Array`, and `console` are used directly; `declare global` is for the rare case needing an ambient symbol the lib does not provide.
- Use the `noFormat` template tag only when a case deliberately tests formatting that Prettier would normalize away, and only on `code`.
- Valid cases are plain strings unless they need `options` or `languageOptions`.

## Comments only when they add meaning

Test code should not narrate what the snippet already shows. The comments that do belong:

- an issue URL above a case whose point is not obvious from the code — a subtle repro, or one with a long discussion behind it. Not every regression case needs one. e.g. `// https://github.com/typescript-eslint/typescript-eslint/issues/11683`
- a `// TODO:` linking the tracking issue next to a `skip: true` case
- a short group label when a long array of cases switches topic

## Assert precisely

- Every error asserts `messageId` plus all of `line`, `column`, `endLine`, and `endColumn` — lint requires the full location in new tests via `eslint-plugin/require-test-error-positions`. Raw `message` strings are not part of the test case types; use `messageId`.
- When the message has `{{placeholder}}`s, also assert `data` so the rendered message is checked.
- `output: null` asserts the rule applies no fix; a string `output` repeats the whole snippet with identical indentation; an array `output` asserts multi-pass fixes.
- Suggestions are asserted per error as `suggestions: [{ messageId, output }]` (plus `data` when the suggestion message has placeholders); each suggestion `output` stands alone rather than building on other fixes.
- An error that carries suggestions **must** assert `suggestions`; omitting it fails the case even when every position is right.

## Syntax worth probing

These are the most common review findings. Scan for what the rule under change actually touches — most rules touch two or three of these, not all of them:

- generics and constrained type parameters
- parenthesized expressions and unusual whitespace
- unions and intersections
- `any`, `unknown`, and `never`
- optional chaining and nullish coalescing
- `enum`, `namespace`, and `declare module`
- class members: `readonly`, `#private`, `abstract`
- `as` and `satisfies`

## Invariants to protect

- Syntax that parses but is a type error in TypeScript must not crash the rule.
- A fix or suggestion must not delete `//` or `/* */` comments — if the rule has a fixer, include a case with a comment inside the fixed range.

## Things to verify before finishing

- Run the rule's tests from `packages/eslint-plugin` with `pnpm vitest <rule-name>`. Not `pnpm run test` — that resolves to the workspace-root `repo:test` task and ignores the filter.
- Remove any `only: true` used while developing, and any stray `console.log` — both fail CI.
- Lint enforces the formatting mechanics (Prettier-formatted snippets, alphabetized case keys, static cases, error positions), and `plugin-test-formatting` has an autofix — run lint rather than hand-formatting.
