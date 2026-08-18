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

- Every error asserts `messageId`. Raw `message` strings are not part of the test case types.
- Assert `line`, `column`, `endLine`, and `endColumn` where the file already does. `eslint-plugin/require-test-error-positions` enforces this only in files that call `new RuleTester()` directly, not in files using the `createRuleTesterWithTypes()` helper — and typed-rule tests routinely and acceptably assert `messageId` alone. Follow the surrounding cases rather than adding positions to a file that does not use them; a bare `messageId` is not a review finding.
- When the message has `{{placeholder}}`s, also assert `data` so the rendered message is checked.
- `output: null` asserts the rule applies no fix; a string `output` repeats the whole snippet with identical indentation; an array `output` asserts multi-pass fixes.
- Suggestions are asserted per error as `suggestions: [{ messageId, output }]` (plus `data` when the suggestion message has placeholders); each suggestion `output` stands alone rather than building on other fixes.
- An error that carries suggestions **must** assert `suggestions`; omitting it fails the case even when every position is right.

## Syntax worth probing

These are the most common review findings. Scan for what the rule under change actually touches — most rules touch a handful of these, not all of them:

- generics and constrained type parameters, `extends` constraints, `=` defaults, currying
- **function overloads** — a frequent source of real bugs, and they break over time; check both the resolved signature and a reporting case
- parenthesized expressions and unusual whitespace, and separately parenthesized **types** (`(never | 'foo') | 123`)
- unions and intersections
- `any`, `unknown`, and `never`
- **type-flag-set versus being exactly that type** — `undefined | void` behaves differently from `undefined`
- optional chaining and nullish coalescing
- **nested conditionals** — logic written for conditionals often only handles one level
- computed keys that aren't literals: identifiers holding a key, `#private` names, string-literal keys
- `enum`, `namespace`, and `declare module`
- class members: `readonly`, `#private`, `abstract`
- **multiple and transitive heritage** — `A extends B, C`, `implements` alongside `extends`, and `B extends D, E` where the match is on `E`
- conditional, mapped, `keyof`, and `typeof` types; utility types like `ReturnType` and `Omit`; optional properties; interfaces extending interfaces; symbols
- destructuring: object patterns, destructured tuples, `Partial<…>` sources
- tagged templates, whose children can be arbitrary nested expressions
- `as` and `satisfies`

## Invariants to protect

- Syntax that parses but is a type error in TypeScript must not crash the rule.
- Test snippets themselves must typecheck: type errors in tests will eventually fail ([#8298](https://github.com/typescript-eslint/typescript-eslint/issues/8298)). Reach for `if (Math.random())` over an undeclared identifier.
- A fix or suggestion must not delete `//` or `/* */` comments — if the rule has a fixer, include a case with a comment inside the fixed range. See [`fixers`](../fixers/SKILL.md) for the exhaustive comment-position case.
- When a change moves a case from reporting to not reporting, move it between `invalid` and `valid` rather than deleting it. The case still documents behavior, and deleting it loses the regression guard.

## Every new branch needs a test, or it needs deleting

The most common finding on a new rule is a guard nothing exercises. Before finishing, delete each guard the change added, re-run the rule's tests, and see what fails. If nothing fails, exactly one of two things is true:

- the branch truly cannot be hit, so remove it; or
- it can be hit, so add the case that hits it.

Leaving it as-is is not a third option. Codecov's patch coverage on the PR flags most of these, and `istanbul` ignore comments are something we try very hard not to add.

When the type checker is what's demanding the unreachable-looking code, that is a types problem rather than a test problem — see [`types-not-workarounds`](../types-not-workarounds/SKILL.md). Narrowing a parameter type often deletes the branch outright.

**Don't chase a coverage report that is itself wrong.** Coverage reporting here has known gaps ([#6701](https://github.com/typescript-eslint/typescript-eslint/issues/6701), [#6116](https://github.com/typescript-eslint/typescript-eslint/issues/6116)) where covered lines are reported uncovered. If the tests demonstrably exercise the line, the report is at fault; say so and move on.

## Unit tests, as opposed to rule tests

Tests outside `tests/rules` use `it()` and `expect()` directly, and a different set of habits applies.

**One group of assertions per `it()`.** Several arrange-act-assert groups in series means that when the first fails, the rest never run — so the failure tells you much less than it could.

```ts
// Before: three behaviors, one test, one useful failure
it('unescapes identifiers', () => {
  expect(unescapeUnicodeIdentifier('\\u0061')).toBe('a');
  expect(unescapeUnicodeIdentifier('foo')).toBe('foo');
  expect(unescapeUnicodeIdentifier('\\u00ZZ')).toBe('\\u00ZZ');
});
```

Split those into three `it()`s named for what each asserts. Where cases are numerous and near-identical, `it.each` makes a readable table of them.

**Prefer one unified assertion to many small ones.** A long run of individual `expect`s on one object fails one at a time; a single `toStrictEqual` with `expect.objectContaining` fails once and shows the whole diff.

```ts
expect(globalScope.references).toStrictEqual([
  expect.objectContaining({
    from: globalScope,
    identifier: expect.objectContaining({ name: 'foo' }),
    resolved: null,
  }),
]);
```

**Stub the environment rather than configuring CI.** Environment-dependent behavior is tested with `vi.stubEnv`, following `createParseSettings.test.ts`. Note that a `const` initialized at module scope needs the stub in place too, not just the `beforeEach`.

## Where a test belongs

| What is under test              | Where it goes                                              |
| ------------------------------- | ---------------------------------------------------------- |
| AST shape for a node type       | `packages/ast-spec/src/<category>/<Node>/fixtures`         |
| Whether invalid syntax throws   | a `fixtures/_error_/` directory, **not** `convert.test.ts` |
| High-level `Converter` behavior | `convert.test.ts`                                          |
| Rule behavior                   | `packages/eslint-plugin/tests/rules/<rule-name>.test.ts`   |

Keep `ast-spec` fixtures small and single-purpose: one fixture per syntax being described, rather than one fixture exercising several. To see how error fixtures are structured, search for an existing error message and read its `snapshots/` neighbours.

Two rule-test infrastructure notes: typed rule tests use `createRuleTesterWithTypes()` from `../RuleTester` rather than constructing a `RuleTester` by hand, and a case needing DOM types needs `project: './tsconfig.lib-dom.json'` with `projectService: false` — several confusing type-identity failures turn out to be `@types/react`'s empty `Element` and `HTMLElement` stand-ins rather than a rule bug.

## Things to verify before finishing

- Run the rule's tests from `packages/eslint-plugin` with `pnpm vitest <rule-name>`.
- Remove any `only: true` used while developing, and any stray `console.log` — both fail CI.
- Lint enforces the formatting mechanics (Prettier-formatted snippets, alphabetized case keys, static cases), and `plugin-test-formatting` has an autofix — run lint rather than hand-formatting.
