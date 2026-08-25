---
authors: [StyleShit, joshuakgoldberg]
description: An uncovered line in a lint rule is usually a bug report in disguise. Here are the three things to do about it.
slug: tips-for-increasing-lint-rule-test-coverage
tags: [code coverage, contributing, rule tester, testing]
title: Tips For Increasing Lint Rule Test Coverage
---

Someone probably linked you here from a pull request review that flagged uncovered lines in a lint rule.
Sorry about that.
It's one of the most common changes we request, and rather than retype the same explanation every time, we wrote it down.

[We aim for 100% code coverage](/contributing/pull-requests#code-coverage), but chasing a number isn't the point.
In a lint rule, an uncovered line is rarely just a missing test.
It's usually a branch you wrote for an AST shape you never actually fed to the rule, which means nobody has checked whether that branch does the right thing.
Often it doesn't.

Every coverage gap we've reviewed has come down to one of three answers:

- [The code is reachable, so a unit test should exercise it](#the-code-is-reachable-so-a-unit-test-should-exercise-it)
- [The code can be refactored to not include that case](#the-code-can-be-refactored-to-not-include-that-case)
- [This is a difficult-to-represent edge case in types](#this-is-a-difficult-to-represent-edge-case-in-types)

<!--truncate-->

## A Rule To Work With

Say we're writing `no-underscore-members`, a rule that reports class methods whose name starts with an underscore.
A first draft:

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
The `return` above them never runs once, and that's what the coverage report will point at.

## The Code Is Reachable, So A Unit Test Should Exercise It

The first question worth asking about an uncovered branch is whether a user can get there.

For `node.key.type !== AST_NODE_TYPES.Identifier`, they can, without trying hard:

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

That early `return` isn't defensive coding.
It's the rule quietly ignoring `'_update'()`, `['_update']()`, and `#_update()`, which are the same method with different punctuation around the name.
The coverage report found a bug.

When the type checker complains that `.name` doesn't exist on `node.key`, it's tempting to make the complaint go away:

```ts
// Please don't.
const name = (node.key as TSESTree.Identifier).name;
```

That fixes the coverage number, but leads us into a worse bug.
`.name` is `undefined` for a string literal key, causing `name.startsWith` to throw - e.g., the rule now _crashes_ on code it used to quietly ignore!

Handle the shapes instead.
Switching on `node.key.type` gives you the right field for each one, and `node.computed` says whether that name belongs to the method or to a variable somewhere else:

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
It's faster than following type definitions around, and it shows exactly what the parser produces.
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
  const name = getStaticName(node);

  if (name == null) {
    //  ~~~~~~~~~~~
    // Uncovered: the visitor only reports when getStaticName returned a name
    return 'a name without the underscore';
  }

  return name.slice(1);
}
```

No test can reach that `if`.
`getReplacementName` runs only after the visitor has already confirmed there's a name.
Writing one would mean calling the helper directly, which tests a situation the rule can't produce.

The `!` operator would make the coverage report happy:

```ts
// Also please don't.
const name = getStaticName(node)!;
```

It's true today and unenforced tomorrow.
The next person to call `getReplacementName` from somewhere else gets `undefined.slice`, with nothing in the code explaining what they broke.

The actual problem is that `getStaticName` runs twice.
Each call forces the surrounding code to answer "and what if there's no static name?", so asking twice means answering twice.
Answer it once, then pass the answer along:

```ts
MethodDefinition(node) {
  const name = getStaticName(node);

  if (name?.startsWith('_')) {
    context.report({
      data: { replacement: name.slice(1) },
      messageId: 'noUnderscore',
      node: node.key,
    });
  }
},
```

The helper is gone, the branch is gone, and the rule got shorter.
Duplicated work is behind most genuinely unreachable branches we see in rules, and deduplicating it usually improves the code on its own merits.

## This Is A Difficult-To-Represent Edge Case In Types

This is the rare one.
Most gaps are one of the first two, so reach for this only after ruling those out.

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

Both are single expressions, so neither adds a branch to your rule or anything for the coverage report to complain about.

### Optional Chaining vs Non-Null Assertion

If we're already talking about type assertions, it's worth noting that the same gap in coverage sometimes arrives as an optional chain instead of an `if`.

For example, the type of `node.parent.parent` is `Node | undefined` only because the first `.parent` might be a `Program`, so a rule that never reaches a `Program` still gets written defensively:

```ts
const grandparent = node.parent?.parent;
```

The `undefined` now spreads to every line that touches `grandparent`, causing us to write defensive code that clutters our coverage report.
In such cases, reach for `!` rather than `?.`:

```ts
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const grandparent = node.parent.parent!;
```

`!` states the type _is wrong_; `?.` _pretends it is right_.

:::danger
An assertion is the answer only when you've confirmed the shape you're ruling out is impossible.
Check in [the playground](/play) before deciding.
A rule that asserts its way past a shape users can write is worse than one that never handled the shape at all, because now it crashes instead of staying quiet.
:::

## Finding The Gaps Yourself

You don't have to wait for review to see any of this.
To generate a report for one package:

```shell
npx nx test eslint-plugin --coverage
```

That writes `packages/eslint-plugin/coverage/lcov-report/index.html`.
Open it in a browser, find your rule, and uncovered branches are highlighted in the source.
Pass a test file path to narrow the run down to the rule you're working on:

```shell
npx nx test eslint-plugin --coverage tests/rules/no-underscore-members.test.ts
```

`pnpm test-coverage` from the repo root does the same for every package, though it takes considerably longer.
On the pull request itself, the `codecov` bot comments with links to line-by-line coverage for each file you touched.

## Ask Us For Help

Working out how to reach a branch can be genuinely hard, especially in rules that use type information.
If you're stuck, say so on the pull request.
Tell us what you tried and what the rule did instead, and we'll dig in with you.

Nobody has ever annoyed us by asking.
Thanks for sending the pull request in, and for sticking with it this far. 💙
