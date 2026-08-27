---
authors: [StyleShit, joshuakgoldberg]
description: An uncovered line in a lint rule is usually a bug report in disguise. Here are the three things to do about it.
slug: tips-for-increasing-lint-rule-test-coverage
tags: [code coverage, contributing, rule tester, testing]
title: Tips For Increasing Lint Rule Test Coverage
---

Someone probably linked you here from a pull request review that flagged uncovered lines in a lint rule.
It's one of the most common changes we request, and rather than retype the same explanation every time, we wrote it down.

[We aim for 100% code coverage when possible](/contributing/pull-requests#code-coverage) because lint rules are extremely tricky, nuanced pieces of code.
When a lint rule's source has an uncovered line, it's more than it "just" missing test coverage.
It can also mean that rule logic written for an AST shape is not exercised, which means nothing has checked whether that branch does the right thing.
Often it doesn't.

Every coverage gap we've reviewed has come down to one of three answers:

- [The code is reachable, so a unit test should exercise it](#the-code-is-reachable-so-a-unit-test-should-exercise-it)
- [The code can be refactored to not include that case](#the-code-can-be-refactored-to-not-include-that-case)
- [This is a difficult-to-represent edge case in types](#this-is-a-difficult-to-represent-edge-case-in-types)

<!--truncate-->

:::tip
New to writing lint rules?
See our [Custom Rules documentation](/developers/custom-rules) to get started.
:::

## A Rule To Work With

Say we're writing `no-underscore-members`, a rule that reports class methods whose name starts with an underscore.
Here's a first draft of just the rule visitors:

```ts
MethodDefinition(node) {
  if (node.key.type !== AST_NODE_TYPES.Identifier) {
    return;
  }

  if (node.key.name.startsWith('_')) {
    context.report({ messageId: 'noUnderscore', node: node.key });
  }
},
```

And a first set of tests:

```ts
ruleTester.run('no-underscore-members', rule, {
  invalid: [
    {
      code: 'class Example { _update() {} }',
      errors: [{ messageId: 'noUnderscore' }],
    },
  ],
  valid: ['class Example { update() {} }'],
});
```

Both outcomes of `startsWith('_')` are covered.
The `return` above them never runs once, and that's what the coverage report will point at:

<!-- prettier-ignore -->
```ts
MethodDefinition(node) {
  // Partially covered line
  if (node.key.type !== AST_NODE_TYPES.Identifier) {
    // Uncovered line
    return;
  }

  // Covered line
  if (node.key.name.startsWith('_')) {
    // Covered line
    context.report({ messageId: 'noUnderscore', node: node.key });
  }
},
```

:::info Legend
**Green** - Line is _fully_ covered by tests

**Yellow** - Line is _partially_ covered by tests (usually in conditional branches where only some outcomes are exercised)

**Red** - Line is _not_ covered by tests
:::

## The Code Is Reachable, So A Unit Test Should Exercise It

The first question worth asking about an uncovered branch is whether a user can get there.

For `node.key.type !== AST_NODE_TYPES.Identifier`, they can, each of the following pieces of code would hit the uncovered branch:

<!-- prettier-ignore -->
```ts
class Example {
  '_update'() {}   // Literal
  1() {}           // Literal
  #_update() {}    // PrivateIdentifier
  ['_update']() {} // Literal, computed
  [update]() {}    // Identifier, computed
}
```

The rule's early `return` causes its logic to ignore any AST node that's not an identifier.
`'_update'()`, `['_update']()`, and `#_update()` are all non-identifier forms that declare the same method.
The coverage report found a bug.

When the type checker reports that `.name` doesn't exist on `node.key`, it's tempting to make the complaint go away:

```ts
// Please don't.
const name = (node.key as TSESTree.Identifier).name;
```

That fixes the coverage number, but leads us into a worse bug.
`.name` is `undefined` for a string literal key, causing `name.startsWith` to throw - e.g., the rule now _crashes_ on code it used to quietly ignore!

Handle the shapes instead.
Switching on `node.key.type` gives the right field for each one, and `node.computed` says whether that name belongs to the method or to a variable somewhere else:

```ts
function getStaticName(node: TSESTree.MethodDefinition): string | null {
  switch (node.key.type) {
    case AST_NODE_TYPES.Identifier:
      // A computed `[_update]() {}` names a variable, not the method.
      return node.computed ? null : node.key.name;

    case AST_NODE_TYPES.Literal:
      return typeof node.key.value === 'string' ? node.key.value : null;

    case AST_NODE_TYPES.PrivateIdentifier:
      return node.key.name;

    default:
      return null;
  }
}
```

:::tip
In real world scenarios, helpers like `getStaticStringValue` and `ASTUtils.getStaticValue` are often used to handle these cases.
:::

Every one of those branches needs a test, and every one of those tests describes real code someone will eventually write:

```ts
ruleTester.run('no-underscore-members', rule, {
  invalid: [
    {
      code: 'class Example { _update() {} }',
      errors: [{ messageId: 'noUnderscore' }],
    },
    {
      code: "class Example { '_update'() {} }",
      errors: [{ messageId: 'noUnderscore' }],
    },
    {
      code: 'class Example { #_update() {} }',
      errors: [{ messageId: 'noUnderscore' }],
    },
    {
      code: "class Example { ['_update']() {} }",
      errors: [{ messageId: 'noUnderscore' }],
    },
  ],
  valid: [
    'class Example { update() {} }',
    'class Example { 1() {} }',
    `
      declare const update: string;
      class Example {
        [update]() {}
      }
    `,
    `
      declare function getName(): string;
      class Example {
        [getName()]() {}
      }
    `,
  ],
});
```

Those last two `valid` cases are worth examining more closely.
A computed key built from a variable or a function call has no name the rule can read, so the rule skips it.
That's a deliberate decision about rule behavior, and now there's a test holding us to it.
Without the coverage report, it would have stayed an accident.

:::tip
Not sure which shapes a node can take?
Paste code into [our playground](/play) and read the AST tab.
That tab shows what each of the the ESLint, TypeScript, and typescript-eslint parsers produce.
:::

## The Code Can Be Refactored To Not Include That Case

Sometimes the branch really is unreachable, and the fix is to delete it rather than test it.

Suppose the rule's message names the replacement, so `_update` reports as `Rename this to 'update'`:

```ts
MethodDefinition(node) {
  const name = getStaticName(node);

  if (name?.startsWith('_')) {
    context.report({
      data: { replacement: getReplacementName(node) },
      messageId: 'noUnderscore',
      node: node.key,
    });
  }
},
```

```ts
function getReplacementName(node: TSESTree.MethodDefinition) {
  // Covered line
  const name = getStaticName(node);

  // Partially covered line
  if (name == null) {
    // Uncovered line
    return 'a name without the underscore';
  }

  // Covered line
  return name.slice(1);
}
```

No test can reach the `null` branch of this `if`.
`getReplacementName` runs only after the visitor has already confirmed there's a name.
Writing one would mean calling the helper directly, which tests a situation the rule can't produce.

The `!` operator would make the coverage report happy:

```ts
// Also please don't.
const name = getStaticName(node)!;
```

This might be safe for now, but as the rule changes over time it's risky in code.
The next change that adds a call to `getReplacementName` from somewhere else might get a nullish `name` and cause a crash.

The actual problem is that `getStaticName` runs twice.
Each call forces the surrounding code to answer "and what if there's no static name?", so asking twice means answering twice.
Answer it once, then pass the answer along:

```ts
MethodDefinition(node) {
  const name = getStaticName(node);

  if (name?.startsWith('_')) {
    context.report({
      // Remove this line
      data: { replacement: getReplacementName(node) },
      // Add this line
      data: { replacement: getReplacementName(name) },
      messageId: 'noUnderscore',
      node: node.key,
    });
  }
},
```

```ts
// Remove this line
function getReplacementName(node: TSESTree.MethodDefinition) {
// Add this line
function getReplacementName(name: string) {
  /* Removed lines start */
  const name = getStaticName(node);

  if (name == null) {
    return 'a name without the underscore';
  }

  /* Removed lines end */
  return name.slice(1);
}
```

The branch is gone, the helper has been simplified, and the rule got shorter.
Duplicated work is behind most genuinely unreachable branches we see in rules, and deduplicating it usually improves the code.

## This Is A Difficult-To-Represent Edge Case In Types

An edge case in types is when a specific case can't be represented in types,
or when it's guaranteed that a specific case will never occur at runtime.
This one is the least common.
Most gaps are one of the first two, so reach for this only after ruling those out.

Token lookups, are a case that often comes up.
`getFirstToken`, for example, returns `TSESTree.Token | null` for every node, including nodes that cannot exist without the token being looked for.

Token lookups are the case that comes up most.
`getFirstToken` returns `TSESTree.Token | null` for every node, including nodes that cannot exist without a first token.

Take a different rule, one that rewrites a `let` that's never reassigned into a `const`:

```ts
fix(fixer) {
  const letToken = context.sourceCode.getFirstToken(declaration);
  //    ~~~~~~~~ TSESTree.Token | null

  return fixer.replaceText(letToken, 'const');
  //                       ~~~~~~~~
  // Argument of type 'Token | null' is not assignable to parameter of type 'Token'.
},
```

A `VariableDeclaration` always starts with `var`, `let`, or `const`.
There is no source text that parses into one without that token, so an `if (letToken == null)` guard would sit there uncovered forever, and no test could rescue it.

Either a `!` or [`nullThrows`](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/utils/src/eslint-utils/nullThrows.ts) will do:

```ts
const letToken = context.sourceCode.getFirstToken(declaration)!;
```

```ts
const letToken = nullThrows(
  context.sourceCode.getFirstToken(declaration),
  NullThrowsReasons.MissingToken('let', 'variable declaration'),
);
```

Both are single expressions, so neither adds a branch to the rule or anything for the coverage report to warn about.

### Optional Chaining vs Non-Null Assertion

If we're already talking about type assertions, it's worth noting that the same gap in coverage sometimes arrives as an optional chain instead of an `if`.

For example, the type of `node.parent.parent` is `Node | undefined` only because the first `.parent` might be a `Program`, so a rule that never reaches a `Program` still gets written defensively:

```ts
const grandparent = node.parent?.parent;
```

The `undefined` now spreads to every line that touches `grandparent`, causing us to write defensive code that clutters the coverage report.
In such cases, reach for `!` rather than `?.`:

```ts
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const grandparent = node.parent.parent!;
```

_`!` states the type is wrong; `?.` pretends it is right._

:::danger
An assertion is the answer only when it's confirmed the shape being ruled out is impossible.
Check in [the playground](/play) before deciding.
A rule that asserts its way past a shape users can write is worse than one that never handled the shape at all, because now it crashes instead of staying quiet.
:::

## Finding The Gaps Before Review

There is no need to wait for the review to see any of this.
To generate a report for one package:

```shell
npx nx test eslint-plugin --coverage
```

That writes `packages/eslint-plugin/coverage/lcov-report/index.html`.
Open it in a browser, find the rule, and uncovered branches are highlighted in the source.
Pass a test file path to narrow the run down to the specific rule:

```shell
npx nx test eslint-plugin --coverage tests/rules/no-underscore-members.test.ts
```

`pnpm test-coverage` from the repo root does the same for every package, though it takes considerably longer.
On the pull request itself, the `codecov` bot comments with links to line-by-line coverage for each touched file.

## Ask Us For Help

Working out how to reach a branch can be genuinely hard, especially in rules that use type information.
If you're stuck, say so on the pull request.
Tell us what you tried and what the rule did instead, and we'll dig in with you.

Nobody has ever annoyed us by asking.
Thanks for sending the pull request in, and for sticking with it this far. 💙
