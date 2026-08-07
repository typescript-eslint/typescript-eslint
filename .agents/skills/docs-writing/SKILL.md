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

## Write rule documentation for comparison

Start from [`packages/eslint-plugin/docs/rules/TEMPLATE.md`](../../../packages/eslint-plugin/docs/rules/TEMPLATE.md) and check examples against the corresponding rule tests.

- Keep the Incorrect and Correct tabs focused on the same behavior. Use the same code snippet where possible, changing only what is needed to demonstrate the fix.
- Add a section for each rule option when the rule has options to document.
- Add a "When Not To Use It" section only for genuine cases where the rule is irrelevant or inappropriate.
- Link relevant resources when useful, such as similar or complementary rules and TypeScript or ESLint documentation.

Before submitting, run the repository's [formatting, spelling, and Markdown validation commands](../../../docs/contributing/Local_Development.mdx#validating-changes).
