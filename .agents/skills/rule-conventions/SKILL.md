---
name: rule-conventions
description: Follow this repository's conventions for messageIds, report messages, rule options, preset placement, and deprecations. Use when adding a rule, adding or renaming a rule option, changing a report message, or deprecating public API.
---

# Rule authoring conventions

Rule names, option names, and message IDs are public API, so these are cheap to get right up front and expensive to change after release.

## messageIds are written out in full

Constructing a message ID from parts is a hard blocker: every ID must be statically written so humans and tooling can find it.

```ts
// Never — nothing can grep for this, and the set of IDs is unknowable
messageId: `nonVoidFuncIn${context}`,

// Always
messageId: 'nonVoidFuncInArgument',
```

Distinct messages for distinct situations are worth the extra entries; generating the key is not. If that would mean dozens of IDs, collapse the dimensions that don't change what the reader should do.

## Messages say exactly what they mean

- **Be as specific as the report.** A suggestion removing an unused _import_ is `removeUnusedImport`, not `removeUnusedVariable`.
- **Never print a full type.** Large types read as noise, and there is no plumbing for rich type printing. Where a type must appear use `checker.typeToString`, never `node.getText()` — which drags in comments and JSDoc and mishandles composed types like an interface extending another.
- **Read the rendered message out loud.** Reports should read like straightforward understandable English. They shouldn't sound like complex technical jargon or only make sense if the reader deeply knows the rule. "Unsafe call of a(n) unresolved due to error typed value." parses only if you already know the rule.
- **Watch for ambiguity as logic grows.** Once a rule reports nested cases, a message naming one type may no longer locate the problem.
- **Don't reuse an identifier that could shadow.** A message mentioning `map` confuses a user with their own `map` in scope.

## Options are objects, plural, and justified

```js
const good = ['error', { style: 'constructor' }];
const bad = ['error', 'constructor'];
```

A rule already shipping array-style options migrates with an `anyOf` accepting both shapes, so existing configs keep working.

Option names are plural where they name a set — `checkLiteralConstAssertions`, not `checkLiteralConstAssertion`. Every option needs a `description` in its schema, and its name and default must match what the originating issue settled on.

Then: **does the option need to exist?** Options are permanent complexity and a new rule has no real-world usage to justify them. Ship the smallest surface that solves the issue and add options when users ask.

If we don't want to start with a complex version of an option, we can always make it an optional boolean to start. Then later we can expand to a union of literals and/or an options object.

Don't add an option covering something another rule already does, and don't add `allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing`-style escape hatches to new rules — they are [being removed](https://github.com/typescript-eslint/typescript-eslint/issues/9891).

## Scope: one PR, one purpose

What draws this request is narrow: **unrelated refactors** of code the PR did not need to touch, and **build or tooling configuration** — Nx targets, `package.json` wiring, CI files — changed incidentally, since those are hard to verify from a diff.

Extra test cases are not scope creep, nor are docs improvements alongside a fix. A `docs:` PR that also tightens some test options is fine. Do not raise scope on additive changes that only improve coverage.

Don't ask for a force-push or rebase to tidy this up; keeping git history pristine is explicitly not a task we ask of authors — see [Pull Requests](https://typescript-eslint.io/contributing/pull-requests).

## New rules, presets, and semver

A new rule ships in no preset unless the issue says otherwise. Adding it to `strict` is a feature; adding it to `recommended` is a breaking change and waits for a major. Say which you are proposing in the PR description.

An internal rule in `packages/eslint-plugin-internal` must also be enabled in the root [`eslint.config.mjs`](../../../eslint.config.mjs); adding it to the plugin's `index.ts` does not enable it.

## Deprecations come in sets

Marking one export `@deprecated` means auditing its siblings — when `parserOptions` is deprecated, `parserPath` almost certainly is too. Point the deprecation at its replacement:

```ts
/** @deprecated use `RuleWithMetaAndName` */
```

Prefer extending an existing exported type over introducing a near-duplicate name.

## Exceptions

- **Existing rules keep their array options** until there is a reason to touch them. This governs new options, not a migration campaign.
- **Message wording is worth debating but not blocking.** Propose an alternative rather than holding the PR.
- **An extension rule follows its base rule.** We extend ESLint's rules to cover TypeScript syntax and don't diverge to add unrelated features; those requests go to ESLint.
