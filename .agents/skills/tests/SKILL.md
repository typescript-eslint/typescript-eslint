---
name: tests
description: Write rule test cases the way this repo expects — one logical unit per test case, static self-contained snippets, comments only when they add meaning, and precise error assertions. Use when adding or changing tests in packages/eslint-plugin/tests/rules or reviewing a PR that touches rule tests.
---

# Writing rule tests

Each `packages/eslint-plugin/tests/rules/<rule-name>.test.ts` calls `ruleTester.run('<rule-name>', rule, { valid, invalid })` with literal arrays of cases.

## Tester options

- Per-case `languageOptions.parserOptions` overrides the file's tester: `{ ecmaFeatures: { jsx: true } }` parses the snippet as `react.tsx`; pinning a compiler flag needs `project: './tsconfig.<flag>.json'` plus `projectService: false` and `tsconfigRootDir: getFixturesRootDir()`.
- For the full case and assertion option tables, see the [Rule Tester docs](../../../docs/packages/Rule_Tester.mdx).

## Do not over-test

Add the fewest cases that pin down the change. A case that cannot fail for a reason the change introduced is pure cost.

- Read the neighboring cases first; do not re-cover what they cover.
- Do not enumerate every operator, union member, or option permutation of a behavior another case already pins.
- Cover the branches the change touches — PRs aim for 100% coverage of touched code — and stop there.
- Pair a new `invalid` case with a `valid` neighbor showing where reporting stops.

## One logical unit per test case

One behavior per case and, when reasonable, one error per `invalid` case, so a failure names what broke.

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

After:

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

- `valid` and `invalid` are fully literal arrays: no `.map()`, spreads, shared snippet constants, or `${}` interpolation (enforced by `@typescript-eslint/internal/no-dynamic-tests`). Repeating a similar snippet is fine; a failure report should never require computing what code ran.
- Every snippet declares the symbols it introduces (`declare const`, minimal types or classes) and nothing more. Standard lib globals like `Promise` and `Array` are used directly; `declare global` is for an ambient symbol the lib does not provide.
- Use `noFormat` only when a case deliberately tests formatting Prettier would normalize away, and only on `code`.
- Valid cases are plain strings unless they need `options` or `languageOptions`.

## Comments only when they add meaning

Do not narrate what the snippet shows. What belongs:

- an issue URL above a case whose point is not obvious — a subtle repro, or one with long discussion behind it. Not every regression case needs one.
- a `// TODO:` linking the tracking issue next to a `skip: true` case
- a short group label when a long array switches topic

## Assert precisely

- Every error asserts `messageId`. Raw `message` strings are not part of the case types.
- Assert `line`, `column`, `endLine`, and `endColumn` where the file already does. `eslint-plugin/require-test-error-positions` covers only files calling `new RuleTester()` directly, not `createRuleTesterWithTypes()`; typed-rule tests routinely assert `messageId` alone. Follow the surrounding cases — a bare `messageId` is not a review finding.
- When the message has `{{placeholder}}`s, assert `data` too.
- `output: null` asserts no fix; a string `output` repeats the whole snippet with identical indentation; an array `output` asserts multi-pass fixes.
- Suggestions are asserted per error as `suggestions: [{ messageId, output }]`; each suggestion `output` stands alone rather than building on other fixes.
- An error carrying suggestions **must** assert `suggestions`; omitting it fails the case even when every position is right.

## Syntax worth probing

Scan for what the rule under change actually touches — most rules touch a handful of these:

- generics and constrained type parameters, `extends` constraints, `=` defaults, currying
- **function overloads** — a frequent source of real bugs; check the resolved signature and a reporting case
- parenthesized expressions and unusual whitespace, and separately parenthesized **types** (`(never | 'foo') | 123`)
- unions and intersections
- `any`, `unknown`, and `never`
- **type-flag-set versus being exactly that type** — `undefined | void` differs from `undefined`
- optional chaining and nullish coalescing
- **nested conditionals** — such logic often handles only one level
- computed keys that aren't literals: identifiers holding a key, `#private` names, string-literal keys
- `enum`, `namespace`, and `declare module`
- class members: `readonly`, `#private`, `abstract`
- **multiple and transitive heritage** — `A extends B, C`, `implements` alongside `extends`, `B extends D, E` where the match is on `E`
- conditional, mapped, `keyof`, and `typeof` types; `ReturnType` and `Omit`; optional properties; interfaces extending interfaces; symbols
- destructuring: object patterns, destructured tuples, `Partial<…>` sources
- tagged templates, whose children can be arbitrary nested expressions
- `as` and `satisfies`

## Invariants to protect

- Syntax that parses but is a type error in TypeScript must not crash the rule.
- Snippets must themselves typecheck ([#8298](https://github.com/typescript-eslint/typescript-eslint/issues/8298)). Reach for `if (Math.random())` over an undeclared identifier.
- A fix or suggestion must not delete `//` or `/* */` comments. If the rule has a fixer, include a case with a comment inside the fixed range — see [`fixers`](../fixers/SKILL.md).
- When a change stops a case reporting, move it between `invalid` and `valid` rather than deleting it.

## Every new branch needs a test, or needs deleting

The most common finding on a new rule is a guard nothing exercises. Delete each guard the change added, re-run the rule's tests, and see what fails. If nothing fails, either the branch cannot be hit — remove it — or it can, so add the case that hits it. Leaving it is not a third option.

Codecov patch coverage flags most of these, and `istanbul` ignore comments are something we try very hard not to add.

When the type checker is what demands the unreachable-looking code, that is a types problem — see [`types-not-workarounds`](../types-not-workarounds/SKILL.md). Narrowing a parameter type often deletes the branch outright.

**Don't chase a coverage report that is itself wrong.** Coverage here has known gaps ([#6701](https://github.com/typescript-eslint/typescript-eslint/issues/6701), [#6116](https://github.com/typescript-eslint/typescript-eslint/issues/6116)) reporting covered lines as uncovered. If the tests demonstrably exercise the line, say so and move on.

## Unit tests, as opposed to rule tests

**One group of assertions per `it()`.** Several arrange-act-assert groups in series means that when the first fails, the rest never run.

```ts
// Before: three behaviors, one test, one useful failure
it('unescapes identifiers', () => {
  expect(unescapeUnicodeIdentifier('\\u0061')).toBe('a');
  expect(unescapeUnicodeIdentifier('foo')).toBe('foo');
  expect(unescapeUnicodeIdentifier('\\u00ZZ')).toBe('\\u00ZZ');
});
```

Split into three `it()`s named for what each asserts. Where cases are numerous and near-identical, `it.each` makes a readable table.

**Prefer one unified assertion to many small ones.** A run of individual `expect`s fails one at a time; a single `toStrictEqual` with `expect.objectContaining` shows the whole diff.

```ts
expect(globalScope.references).toStrictEqual([
  expect.objectContaining({
    from: globalScope,
    identifier: expect.objectContaining({ name: 'foo' }),
    resolved: null,
  }),
]);
```

**Stub the environment rather than configuring CI.** Use `vi.stubEnv`, following `createParseSettings.test.ts`. A `const` initialized at module scope needs the stub in place too, not just the `beforeEach`.

## Where a test belongs

| What is under test              | Where it goes                                              |
| ------------------------------- | ---------------------------------------------------------- |
| AST shape for a node type       | `packages/ast-spec/src/<category>/<Node>/fixtures`         |
| Whether invalid syntax throws   | a `fixtures/_error_/` directory, **not** `convert.test.ts` |
| High-level `Converter` behavior | `convert.test.ts`                                          |
| Rule behavior                   | `packages/eslint-plugin/tests/rules/<rule-name>.test.ts`   |

Keep `ast-spec` fixtures small and single-purpose: one fixture per syntax described. To see how error fixtures are structured, search for an existing error message and read its `snapshots/` neighbours.

Typed rule tests use `createRuleTesterWithTypes()` from `../RuleTester` rather than constructing a `RuleTester` by hand. A case needing DOM types needs `project: './tsconfig.lib-dom.json'` with `projectService: false` — confusing type-identity failures often turn out to be `@types/react`'s empty `Element` and `HTMLElement` stand-ins rather than a rule bug.

## Before finishing

- Run the rule's tests from `packages/eslint-plugin` with `pnpm vitest <rule-name>`.
- Remove any `only: true` and stray `console.log` — both fail CI.
- Lint enforces the formatting mechanics, and `plugin-test-formatting` has an autofix — run lint rather than hand-formatting.
