---
name: docs-writing
description: Write and review typescript-eslint documentation with objective, verifiable claims and self-contained code examples. Use when changing Markdown or MDX in docs or packages/eslint-plugin/docs.
---

# Writing verifiable documentation

## Cut every word the reader already has

The most common documentation request in review. Applies to prose anywhere — rule docs, guides, JSDoc, skill files.

- **Split long sentences.** A sentence carrying both a parenthetical and an em-dash clause is two sentences.
- **Delete words the surrounding text implies.** "This rule has been deprecated because, as of ESLint v9.37.0, the base rule added native support…" says "deprecated" twice, once in the `:::danger Deprecated` header already. Start at "As of ESLint v9.37.0, the base rule supports…".
- **Don't restate a point in a second paragraph.** Two paragraphs both opening "TypeScript assumes that…" are one paragraph.
- **Don't add a "for example" that repeats the claim.** "This option recursively checks each array element. For example, an error is reported if an array element has an unacceptable type." Show real code or cut it.
- **Keep admonitions short and put them after the prose.** A `:::note` is visually loud, so a long one crowds out what it annotates. Trim to a couple of sentences and move it below the paragraphs and examples.
- **Don't explain why the document exists.** Meta-commentary about the value of what you are writing tells a reader nothing.
- **Don't hard-wrap prose.** `.prettierrc.json` sets `proseWrap: "preserve"` and the repo writes one line per paragraph; wrapping at a column turns every later edit into a multi-line diff.

## Make claims objective

Describe observable conditions and results instead of judging quality or intent.

- Name the rule, option, configuration, syntax, or version involved, and state what happens under which conditions.
- Separate repository behavior from recommendations for users.
- Avoid promotional wording — "powerful", "easy", "best" — unless the text defines a verifiable comparison.

Prefer “The rule reports this expression when typed linting determines its condition is always truthy” over “The rule catches unnecessary conditions.”

Soften consequences the reader's architecture may not share. Readers bristle at _“if you do X, then Y will happen”_ when their design does X without Y. “Values returned from functions are **likely** ignored” and “some projects are architected so that this is generally safe” give the same guidance without asserting something false about their codebase.

## Verify claims before writing them

Find the source establishing each behavioral claim: the implementation and tests, rule metadata and option schemas, contributor documentation, or linked TypeScript and ESLint documentation.

Do not infer general behavior from a file name, a single issue report, or one test fixture. Preserve qualifiers for version-specific, configuration-dependent, or type-dependent behavior. If the sources do not establish a claim, narrow or omit it.

## Keep code blocks self-contained

- Include declarations, types, options, and configuration that affect the demonstrated behavior; don't rely on identifiers defined in another block.
- Avoid ellipses or omitted setup when the missing code could change the result.
- Use meaningful identifiers instead of `foo` or `bar`.
- One logical point per block.

An intentionally incorrect example may violate the documented rule, but must not also fail because an unrelated import, declaration, or option is missing.

## Write links that work out of context

Assistive technology can present a page's links as a bare list, so link text has to identify its destination alone.

- **Describe the destination.** Not `[here]` or `[the setting]`, but `[read more about setting space size in Node.js]`. Identical link text cannot be told apart in a list, so make each specific: `[the source code for the recommended config]`. ([W3C Technique G91](https://www.w3.org/WAI/WCAG21/Techniques/general/G91), [Link Purpose in Context](https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html))
- **Don't orient the reader with direction.** "below", "above", and "right-hand side" describe a visual layout not every reader has. Name the target: `[the defineConfig migration guide]`. ([Google style guide](https://developers.google.com/style/accessibility))
- Capitalize product names as their owners do: ESLint, TypeScript, Node.js.

## Comment on the why, or don't comment

- **A TODO names a decision and links its issue**, as `// TODO(typescript-eslint@v9)` or with the issue URL. A TODO for something already decided isn't a TODO — either it is possible with current APIs and should be done, or it isn't and the comment should say so. A TODO for something undecided gets removed until there is a decision to record.
- **Never leave a guess in a comment.** "seems like a bug in the rule" cannot be verified. Investigate, then link: `// eslint-disable-next-line @typescript-eslint/no-deprecated -- see #10215`.
- **Don't recount an issue's history inline.** A link is enough; the prose goes stale.
- Comments restating the code get deleted — see [`code-clarity`](../code-clarity/SKILL.md).

## Write rule documentation for comparison

Start from [`packages/eslint-plugin/docs/rules/TEMPLATE.md`](../../../packages/eslint-plugin/docs/rules/TEMPLATE.md) and check examples against the rule's tests.

- Keep Incorrect and Correct tabs on the same behavior, changing only what demonstrates the fix. If both tabs would hold identical code, use a single block — identical tabs read as a mistake.
- Every option gets a section with the configuration syntax _and_ invalid or valid examples; prose alone doesn't convey what an option does. Where an option's type is more than a `boolean` — say `boolean | object` — state that, because readers won't infer it from the type block.
- Link the issue or comment that motivated an option, so a reader learns why it exists.
- Add "When Not To Use It" only for genuine cases. Adapt the shared phrasing about loosely typed codebases rather than pasting it; if the boilerplate doesn't describe this rule, write the case that does.
- Prefer plural headings and keep phrasing parallel with neighboring sections.
- Name the feature precisely, including whose it is — auto-accessor properties are JavaScript, not TypeScript.
- If a section grows into a deep dive, propose a blog post and link it rather than expanding the rule page.

Before submitting, run the repository's [formatting, spelling, and Markdown validation commands](../../../docs/contributing/Local_Development.mdx#validating-changes).
