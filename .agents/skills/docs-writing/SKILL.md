---
name: docs-writing
description: Write and review typescript-eslint documentation with objective, verifiable claims and self-contained code examples. Use when changing Markdown or MDX in docs or packages/eslint-plugin/docs.
---

# Writing verifiable documentation

Documentation should describe behavior a reader can verify from the repository or an authoritative external source. Keep each claim precise, and give code examples enough context to demonstrate that claim on their own.

## Make claims objective

Describe observable conditions and results instead of judging quality or intent.

- Name the rule, option, configuration, syntax, or version involved, and state what happens under which conditions.
- Separate repository behavior from recommendations for users.
- Avoid promotional or subjective wording such as "powerful", "easy", or "best" unless the text defines a verifiable comparison.

Prefer a bounded statement such as “The rule reports this expression when typed linting determines its condition is always truthy” over an unqualified statement such as “The rule catches unnecessary conditions.”

Soften consequences the reader's architecture may not share. Readers bristle at _“if you do X, then Y will happen”_ when their design does X without Y — even when X is a bad idea. “Values returned from functions are **likely** ignored” and “some projects are architected so that this is generally safe” state the same guidance without telling a reader something false about their own codebase.

## Verify claims before writing them

Find the source that establishes each behavioral claim. Depending on the documentation, that may be:

- the corresponding implementation and tests;
- rule metadata, option schemas, and generated configuration data;
- the repository's contributor documentation;
- linked TypeScript or ESLint documentation for external behavior.

Do not infer general behavior from a file name, a single issue report, or one test fixture. Preserve qualifiers for version-specific, configuration-dependent, or type-dependent behavior. If the available sources do not establish a claim, narrow or omit it instead of presenting it as fact.

## Keep code blocks self-contained

A reader should be able to understand why each block demonstrates the surrounding claim without reconstructing missing context.

- Include declarations, types, options, and configuration that affect the demonstrated behavior, and do not rely on identifiers defined only in another block.
- Avoid ellipses or omitted setup when the missing code could change the result.
- Use meaningful identifiers instead of placeholders such as `foo` or `bar`.
- Demonstrate one logical point per block and remove unrelated code.

An intentionally incorrect rule example may violate the documented rule, but it should not also fail because an unrelated import, declaration, or option is missing.

## Cut every word the reader already has

This is the most common documentation request in review, and it applies to prose anywhere — rule docs, guides, JSDoc, skill files.

- **Split long sentences.** A sentence carrying a parenthetical and an em-dash clause is two sentences. Shorter sentences are easier to understand.
- **Delete words the surrounding text already implies.** "This rule has been deprecated because, as of ESLint v9.37.0, the base rule added native support…" says "deprecated" twice over — once in the `:::danger Deprecated` header. Start at "As of ESLint v9.37.0, the base rule supports…".
- **Don't restate a point in a second paragraph.** Two paragraphs that both open "TypeScript assumes that…" are one paragraph.
- **Don't add a "for example" that repeats the claim.** "This option recursively checks each array element. For example, an error is reported if an array element has an unacceptable type." The second sentence is the first one again; either show real code or cut it.
- **Keep admonitions short and place them after the prose.** A `:::note` or `:::caution` is visually loud, so a long one crowds out the material it annotates. Trim it to a couple of sentences and move it below the regular paragraphs and examples.
- **Don't explain why the document exists.** Meta-commentary about the value of the thing you are writing adds no information to a reader who is already reading it.
- **Don't hard-wrap prose.** `.prettierrc.json` sets `proseWrap: "preserve"`, and the repo's Markdown is written as one line per paragraph. Manually wrapping at a column turns every later edit into a multi-line diff.

## Write links that work out of context

Readers navigate by scanning link text, and assistive technology can present a page's links as a bare list. Link text therefore has to identify its destination on its own.

- **Describe the destination in the link.** Not `[here]` or `[the setting]`, but `[read more about setting space size in Node.js]`. Two links whose text is identical cannot be told apart from a list of links alone, so make each one specific: `[the source code for the recommended config]`. ([W3C Technique G91](https://www.w3.org/WAI/WCAG21/Techniques/general/G91), [Link Purpose in Context](https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html))
- **Don't orient the reader with direction.** "below", "above", and "right-hand side" describe a visual layout that not every reader has. Name the target instead: `[the defineConfig migration guide]`. ([Google developer documentation style guide](https://developers.google.com/style/accessibility))
- Capitalize product names as their owners do: ESLint, TypeScript, Node.js.

## Comment on the why, or don't comment

This applies to prose in code as much as to Markdown.

- **A TODO names a decision and links its issue**, in the form `// TODO(typescript-eslint@v9)` or with the issue URL. A TODO for something already decided isn't a TODO — either the thing is possible with current APIs and should be done, or it isn't and the comment should say so. A TODO for something undecided gets removed until there is a decision to record.
- **Never leave a guess in a comment.** "seems like a bug in the rule" is not actionable and cannot be verified. Investigate it, then link the issue: `// eslint-disable-next-line @typescript-eslint/no-deprecated -- see #10215`.
- **Don't explain a specific issue's history inline.** Long-term readers don't need it and the comment goes stale; a link is enough.
- Comments restating the code get deleted — see [`code-clarity`](../code-clarity/SKILL.md).

## Write rule documentation for comparison

Start from [`packages/eslint-plugin/docs/rules/TEMPLATE.md`](../../../packages/eslint-plugin/docs/rules/TEMPLATE.md) and check examples against the corresponding rule tests.

- Keep the Incorrect and Correct tabs focused on the same behavior. Use the same code snippet where possible, changing only what is needed to demonstrate the fix. If the two tabs would hold identical code, use a single code block instead — identical tabs read as a mistake.
- Add a section for each rule option when the rule has options to document. Each option's section needs the configuration syntax _and_ invalid or valid examples under it; a prose description alone doesn't let a reader understand what the option does. Where an option's type is more than a `boolean` — say `boolean | object` — state that explicitly, because most readers won't infer it from the type block.
- Link the issue or comment that motivated an option, so a reader can find out why it exists rather than only what it does.
- Add a "When Not To Use It" section only for genuine cases where the rule is irrelevant or inappropriate. Adapt the shared phrasing about loosely typed codebases rather than pasting it verbatim: if the boilerplate doesn't describe this rule, write the case that does.
- Prefer plural headings and keep phrasing parallel with the surrounding sections.
- Name the feature precisely, including whose feature it is — auto-accessor properties are JavaScript, not TypeScript.
- Link relevant resources when useful, such as similar or complementary rules and TypeScript or ESLint documentation.
- If a section grows into a deep dive, it probably belongs in a blog post; propose one and link it rather than expanding the rule page.

Before submitting, run the repository's [formatting, spelling, and Markdown validation commands](../../../docs/contributing/Local_Development.mdx#validating-changes).
