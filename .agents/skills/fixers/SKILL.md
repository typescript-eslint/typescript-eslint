---
name: fixers
description: Write rule fixers and suggestions that never delete comments, using tokens rather than character arithmetic, and leaving formatting to the formatter. Use when adding or reviewing a `fix` or `suggestions` implementation in packages/eslint-plugin.
---

# Writing fixers that don't lose code

The failure mode that matters is silent: a fix applies cleanly, tests pass, and a comment the user wrote is gone.

- **Deleting a comment is a bug.**
- **Moving a comment is not** — unless it lands next to a completely unrelated node. Which node a comment attaches to is not an exact science, and improving on a reasonable baseline costs a lot of code for dubious gain.

## Don't do arithmetic on source text

`'?'.length`, `+ 2`, and `sourceCode.text.substring(...)` all assume the text between two points is what you expect, and comments and whitespace can appear anywhere.

```ts
// Fragile: any comment between the callee and the `(` breaks this
const end = node.callee.range[1] + '?.'.length;
```

Ask for the token instead — `sourceCode.getTokenAfter`, `getTokenBefore`, `getFirstToken` find the punctuator wherever it sits. This bites hardest when balancing parentheses: counting characters trips over `foo && /* gotcha :( */ (foo.bar && baz)`; finding the actual `(` and `)` tokens does not.

## Prefer editing nodes and tokens to replacing ranges

A fixer replacing a wide range has to reproduce everything inside it, comments included. One that adds and removes specific tokens never touches the comments between them.

To turn `if (foo) { foo.bar(); }` into `foo?.bar();`, use small edits — remove the `if`, the `(`, the `)`, the `{` and `}` if present, insert the `?.` — rather than one `replaceTextRange` over the whole statement that then has to relocate every comment it swallowed.

Reaching for `getCommentsBefore` or `getCommentsAfter` signals the harder path: very few rules here need the comment APIs at all. If a fixer is accumulating comment-relocation logic, try token edits first.

## Formatting is the formatter's job

A fixer does not need well-indented output, and code that tries makes the rule harder to read for no user-visible gain. Syntactically correct, with comments in roughly sensible places, is good enough. Trivial cleanup is fine; substantial formatting logic is not.

## Conflicting fixes are fine

ESLint applies up to ten passes, so if two fixes overlap and only one lands, the other applies next pass. A range conflict is not a defect and needs no detection or workaround.

## Suggestions versus fixes

Use a `fix` when the rewrite preserves behavior in every reported case. Anything that could change behavior, or where more than one reasonable rewrite exists, or when the ability to fix safely is not guaranteed, is a `suggestions` entry. A rule with suggestions must declare `hasSuggestions: true`, and each suggestion's `output` stands alone rather than building on another's.

## Testing a fixer

Every fixer needs a case with a comment inside the range it rewrites. When the rule rewrites a construct with several syntactic slots, put a comment in every one — the absurd-looking cases find the bug:

```ts
declare const foo: undefined | { bar: () => void };
/* a */ /* b */ if (
  /* c */ /* d */ /* e */ /* f */ foo /* g */ /* h */
) /* i */ /* j */ {
  /* k */ /* l */ foo /* m */ /* n */
    ./* o */ /* p */ bar /* q */ /* r */
    (); /* s */ /* t */
}
```

Assert the exact output, so a vanished comment shows up in the `output` diff.

Assert `output: null` on any reported case the rule deliberately does not fix, and an array `output` where a fix needs multiple passes. See [`tests`](../tests/SKILL.md) for assertion mechanics.

## Exceptions

- **A misplaced comment is not a blocker.** Only deletion is.
- **Pre-existing comment loss is a separate issue.** If it reproduces on `main`, file an issue rather than expanding the PR.
- **`noFormat`** is for a test case deliberately exercising spacing Prettier would normalize away — not a workaround for fixer output formatting.
