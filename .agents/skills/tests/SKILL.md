---
name: tests
description: Write rule test cases the way this repo expects — one logical unit and one error per case, static self-contained snippets, comments only when they add meaning, and precise error assertions. Use when adding or changing tests in packages/eslint-plugin/tests/rules or reviewing a PR that touches rule tests.
---

# Writing rule tests

Rule tests use `@typescript-eslint/rule-tester`: each `packages/eslint-plugin/tests/rules/<rule-name>.test.ts` calls `ruleTester.run('<rule-name>', rule, { valid, invalid })` with literal arrays of cases. Small, precise, self-contained cases keep failure reports readable and reviews fast.

## When to use

Use this when adding or changing test cases for a lint rule — a new rule, a bug fix, or an option change — or when reviewing rule tests.

## Setting up the tester

- Typed rules use `createRuleTesterWithTypes()` from `../RuleTester`, which defaults to `projectService: true` with `tsconfigRootDir` pointing at the shared `tests/fixtures` directory. Untyped rules use `new RuleTester()` directly.
- A case that depends on a specific compiler flag passes per-case `languageOptions.parserOptions` with `project: './tsconfig.<flag>.json'`, `projectService: false`, and `tsconfigRootDir: getFixturesRootDir()`.
- Enable JSX per case via `parserOptions: { ecmaFeatures: { jsx: true } }`; the tester then parses the code as `react.tsx`. Set `filename` explicitly only when the rule's behavior depends on it.

## One logical unit per test case

Each case exercises exactly one behavior, and each invalid case asserts exactly one error. When several inputs exercise the same behavior, write several small cases — then a failing case names exactly what broke.

Before — one case bundling two assertions:

```ts
{
  code: `
declare const a: string | undefined;
declare const b: string | undefined;
a!;
b!.length;
  `,
  errors: [
    { column: 1, endColumn: 3, endLine: 4, line: 4, messageId: 'noNonNull' },
    { column: 1, endColumn: 3, endLine: 5, line: 5, messageId: 'noNonNull' },
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
declare const b: string | undefined;
b!.length;
  `,
  errors: [
    { column: 1, endColumn: 3, endLine: 3, line: 3, messageId: 'noNonNull' },
  ],
},
```

A behavior change includes both `valid` and `invalid` cases: a false-positive fix adds valid cases reproducing the false positive, and a fix that reports new violations adds invalid cases, usually with a valid neighbor showing where reporting correctly stops.

## Static, self-contained code only

- `valid` and `invalid` are fully literal arrays: no cases generated with `.map()`, spreads, shared snippet constants, or `${}` interpolation. Repeating a similar snippet across cases is fine — a reviewer or a failure report should never have to compute what code a case ran.
- Every snippet declares what it uses (`declare const`, minimal types or classes) rather than relying on ambient globals, and contains nothing beyond what the behavior under test needs.
- Use the `noFormat` template tag only when a case deliberately tests formatting that Prettier would normalize away, and only on `code`.

## Comments only when they add meaning

Test code should not narrate what the snippet already shows. The comments that do belong:

- an issue URL directly above regression cases, e.g. `// https://github.com/typescript-eslint/typescript-eslint/issues/11683`
- a `// TODO:` linking the tracking issue next to a `skip: true` case
- a short group label when a long array of cases switches topic

## Assert precisely

- Every error asserts `messageId` plus all of `line`, `column`, `endLine`, and `endColumn`. Never assert raw message strings.
- When the message has `{{placeholder}}`s, also assert `data` so the rendered message is checked.
- `output: null` asserts the rule applies no fix; a string `output` repeats the whole snippet with identical indentation; an array `output` asserts multi-pass fixes.
- Suggestions are asserted per error as `suggestions: [{ messageId, output }]` (plus `data` when the suggestion message has placeholders); each suggestion `output` stands alone rather than building on other fixes.
- Valid cases are plain strings unless they need `options` or `languageOptions`.

## Edge cases worth covering

For any rule change, check whether these need cases — they are the most common review findings:

- generics and constrained type parameters
- parenthesized expressions and unusual whitespace
- unions and intersections
- syntax that parses but is a type error in TypeScript must not crash the rule
- fixes and suggestions must not delete `//` or `/* */` comments — include a case with a comment inside the fixed range

## Things to verify before finishing

- Run the rule's tests from `packages/eslint-plugin` with `pnpm run test <rule-name>`; extra arguments pass through to vitest.
- Remove any `only: true` used while developing, and any stray `console.log` — both fail CI.
- Every new or changed branch in the rule has a covering case; PRs aim for 100% coverage of touched code.
- Lint enforces the formatting mechanics (Prettier-formatted snippets, alphabetized case keys, static cases, error positions), and `plugin-test-formatting` has an autofix — run lint rather than hand-formatting.

## Reference

- Origin: issue #12570, split from #12370.
- [Contributing: Pull Requests](../../../docs/contributing/Pull_Requests.mdx) — granular unit tests, coverage expectations.
- [Contributing: Local Development](../../../docs/contributing/Local_Development.mdx) — running and filtering tests.
- [Rule Tester docs](../../../docs/packages/Rule_Tester.mdx) — full API for cases, `output`, suggestions, and dependency constraints.
- [Maintenance: Pull Requests](../../../docs/maintenance/Pull_Requests.mdx) — the review checklist these conventions come from.
