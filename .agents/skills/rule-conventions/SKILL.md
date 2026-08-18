---
name: rule-conventions
description: Follow this repository's conventions for messageIds, report messages, rule options, preset placement, and deprecations. Use when adding a rule, adding or renaming a rule option, changing a report message, or deprecating public API.
---

# Rule authoring conventions

These are the conventions a new rule or option is measured against in review. Most are cheap to get right up front and expensive to change after release, because rule names, option names, and message IDs are public API.

## messageIds are written out in full

Constructing a message ID from parts is a hard blocker. Every ID must be statically written so that both humans and tooling can find it.

```ts
// Never — nothing can grep for this, and the set of IDs is unknowable
messageId: `nonVoidFuncIn${context}`,

// Always
messageId: 'nonVoidFuncInArgument',
```

Wanting distinct messages for distinct situations is good — that is worth the extra entries. What is not acceptable is generating the key. If the result would be dozens of IDs, collapse the dimensions that don't change what the reader should do, and keep the ones that do.

## Messages say exactly what they mean

- **Be as specific as the report.** A suggestion that removes an unused _import_ is `removeUnusedImport`, not `removeUnusedVariable`.
- **Never print a full type.** There is no plumbing for rich type printing, large types read as noise in an error, and it is maintenance we cannot afford. Where a type genuinely must appear, use `checker.typeToString` — never `node.getText()`, which drags in comments and JSDoc, and which mishandles composed types like an interface extending another.
- **Read the rendered message out loud.** "Unsafe call of a(n) unresolved due to error typed value." parses only if you already know the rule. Check the wording in the deploy-preview playground before merging.
- **Watch for ambiguity as logic grows.** When a rule starts reporting nested cases, a message that named one type may no longer tell the user where the problem is.
- **Don't reuse an identifier that could shadow.** A message mentioning `map` reads confusingly when the user has their own `map` in scope.

## Options are objects, plural, and justified

New options take an object, not positional array entries:

```js
const good = ['error', { style: 'constructor' }];
const bad = ['error', 'constructor'];
```

A rule that already ships array-style options migrates with an `anyOf` accepting both shapes, so existing configs keep working.

Option names are plural where they name a set — `checkLiteralConstAssertions`, not `checkLiteralConstAssertion`. Every option needs a `description` in its schema, and the name and default have to match whatever the originating issue actually settled on; if the issue's resolution was "on by default", the schema says so.

Then the harder question: **does the option need to exist?** Options are permanent complexity, and a brand-new rule has no real-world usage to justify them. Ship the smallest surface that solves the issue and add options when users ask. An option nobody has asked for, on a rule nobody has run yet, will be argued down in review.

Two more traps: don't add an option covering something another rule already does — that is the other rule's job — and don't add the deprecated `allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing`-style escape hatches to new rules, since they are [being removed](https://github.com/typescript-eslint/typescript-eslint/issues/9891).

## Scope: one PR, one purpose

Changes not needed for the PR's stated goal get reverted and sent separately, including refactors of neighboring rules that were convenient at the time. This keeps the diff reviewable, and reviewable diffs get merged.

What actually draws this request is narrow: **unrelated refactors** of code the PR did not need to touch, and **build or tooling configuration** — Nx targets, `package.json` wiring, CI files — changed incidentally, because those are fragile and hard to verify from a diff. Extra test cases are not scope creep; neither are docs improvements alongside a fix. A `docs:` PR that also tightens some test options is fine. Do not raise scope on additive changes that only improve coverage.

Don't force-push or rebase to tidy this up. Keeping git history pristine is explicitly not a task we ask of authors or of ourselves — see [Pull Requests](https://typescript-eslint.io/contributing/pull-requests).

Where an option or a default is contested, check the linked issue for consensus and link the votes before implementing. Implementing a contested design costs more review than asking does.

## New rules, presets, and semver

A new rule ships unregistered in any preset unless the issue says otherwise. Adding it to `strict` is a feature; adding it to `recommended` is a breaking change and waits for a major. Say which you are proposing, and why, in the PR description.

An internal rule in `packages/eslint-plugin-internal` also has to be turned on in the root [`eslint.config.mjs`](../../../eslint.config.mjs) — adding it to the plugin's `index.ts` does not enable it.

## Deprecations come in sets

Marking one export `@deprecated` means auditing its siblings. When `parserOptions` is deprecated, `parserPath` almost certainly is too, and leaving one unmarked tells users the wrong thing. Point the deprecation at its replacement and at the issue that decided it:

```ts
/** @deprecated use `RuleWithMetaAndName` */
```

Prefer extending an existing exported type over introducing a near-duplicate name: a new type is another thing to keep in sync, and the existing one may already be used externally.

## Exceptions

- **Existing rules keep their array options** until there is a reason to touch them. This governs new options, not a migration campaign.
- **Message wording is worth debating but not blocking.** If the phrasing is unclear, say so and propose an alternative rather than holding the PR.
- **An extension rule follows its base rule.** We extend ESLint's rules to cover TypeScript syntax, and we don't diverge to add features unrelated to TypeScript — those requests go to ESLint.
