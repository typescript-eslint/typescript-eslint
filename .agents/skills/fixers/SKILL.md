---
name: fixers
description: Write rule fixers and suggestions that never delete comments, using tokens rather than character arithmetic, and leaving formatting to the formatter. Use when adding or reviewing a `fix` or `suggestions` implementation in packages/eslint-plugin.
---

# Writing fixers that don't lose code

A fixer rewrites a user's source. The failure mode that matters is silent: a fix applies cleanly, tests pass, and a comment the user wrote has disappeared from their file.

Two rules separate a real bug from an acceptable imperfection:

- **Deleting a comment is a bug.** People put important things in comments, and a fixer that drops one destroys information.
- **Moving a comment is not a bug** — unless it lands next to a completely unrelated node. Knowing which node a comment is attached to is not an exact science, and getting it more correct than a reasonable baseline costs a lot of code for dubious gain.

## Don't do arithmetic on source text

Character counting is the most common source of comment loss. `'?'.length`, `+ 2`, and `sourceCode.text.substring(...)` all assume the text between two points is exactly what you expect, and comments and whitespace can appear anywhere.

```ts
// Fragile: any comment between the callee and the `(` breaks this
const end = node.callee.range[1] + '?.'.length;
```

Ask the source code for the token instead. `sourceCode.getTokenAfter`, `getTokenBefore`, and `getFirstToken` find the punctuator wherever it actually sits.

This bites hardest when scanning for parentheses. Counting characters to balance parens trips over `foo && /* gotcha :( */ (foo.bar && baz)`; looking for the actual `(` and `)` tokens does not.

## Prefer editing nodes and tokens to replacing ranges

A fixer that replaces a wide range has to reproduce everything inside it, comments included. A fixer that adds and removes specific tokens never touches the comments between them, so there is nothing to preserve.

To turn `if (foo) { foo.bar(); }` into `foo?.bar();`, the reliable shape is a set of small edits — remove the `if`, remove the `(`, remove the `)`, remove the `{` and `}` if present, insert the `?.` — rather than one `replaceTextRange` over the whole statement that then has to relocate every comment it swallowed.

Reaching for `getCommentsBefore` or `getCommentsAfter` to relocate comments is a signal you are on the harder path: very few rules in this repository need the comment APIs at all. If a fixer is accumulating comment-relocation logic, try the token-edit approach before adding more.

## Formatting is the formatter's job

Users run a formatter. A fixer does not need to produce well-indented output, and code that tries makes the rule harder to read for no user-visible gain. As long as the result is syntactically correct and comments sit in roughly sensible places, it is good enough.

Trivial cleanup is fine. Substantial formatting logic is not.

## Conflicting fixes are fine

ESLint applies up to ten passes. If two fixes overlap and only one lands in a given pass, the other applies on the next one. Fixes only ever improve the code and never backtrack, so a range conflict is not a defect and does not need detecting or working around.

## Suggestions versus fixes

Use a `fix` when the rewrite preserves behavior in every case the rule reports. Anything that could change behavior, or where more than one reasonable rewrite exists, is a `suggestions` entry. A rule with suggestions must declare `hasSuggestions: true`, and each suggestion's `output` stands alone rather than building on another suggestion's result.

## Testing a fixer

Every fixer needs a case with a comment inside the range it rewrites. When the rule rewrites a construct with several syntactic slots, put a comment in every one of them — the cases that look absurd are the ones that find the bug:

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

Assert the exact output. If comments `m` through `t` vanish, the test says so precisely, and `output` diffs show which ones.

Also assert `output: null` on any reported case the rule deliberately does not fix, and use an array `output` where a fix requires multiple passes. See [`tests`](../tests/SKILL.md) for the assertion mechanics.

## Exceptions

- **A misplaced comment is not a blocker.** Only deletion is. If a fix moves a comment somewhere merely inelegant, that is acceptable; if it moves one next to an unrelated node, that is worth fixing.
- **Pre-existing comment loss is a separate issue.** If dropping the comment reproduces on `main`, file an issue rather than expanding the current PR. If the PR introduced it, it needs to be fixed there.
- **`noFormat`** is the right tool for a test case that deliberately exercises spacing Prettier would normalize away — not a general workaround for fixer output formatting.
