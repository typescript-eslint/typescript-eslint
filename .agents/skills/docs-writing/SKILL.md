---
name: docs-writing
description: Write and review typescript-eslint documentation with objective, verifiable claims and self-contained code examples. Use when changing Markdown or MDX in docs or packages/eslint-plugin/docs.
---

# Writing verifiable documentation

Documentation should describe behavior a reader can verify from the repository or an authoritative external source. Keep each claim precise, and give code examples enough context to demonstrate that claim on their own.

## When to use

Use this skill when writing or reviewing:

- rule documentation in `packages/eslint-plugin/docs/rules`;
- contributor, developer, package, troubleshooting, or user documentation in `docs`;
- descriptions of rule behavior, options, configurations, or TypeScript and ESLint interactions.

## Make claims objective

Describe observable conditions and results instead of judging quality or intent.

- Name the relevant rule, option, configuration, syntax, or version.
- State what happens and under which conditions.
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

- Include declarations, types, options, and configuration that affect the demonstrated behavior.
- Do not rely on identifiers defined only in another block.
- Keep incorrect and correct examples independently understandable.
- Avoid ellipses or omitted setup when the missing code could change the result.
- Use a language identifier on every fenced block.
- Demonstrate one logical point per block and remove unrelated code.

An intentionally incorrect rule example may violate the documented rule, but it should not also fail because an unrelated import, declaration, or option is missing.

For rule documentation, start from `packages/eslint-plugin/docs/rules/TEMPLATE.md` and check examples against the corresponding rule tests. Keep the Incorrect and Correct examples focused on the same behavior so readers can compare them directly.

## Review before submitting

1. Trace each behavioral claim to its implementation, tests, configuration, or linked authoritative source.
2. Read every code block independently and check that all behavior-relevant context is present.
3. Remove filler, unsupported absolutes, repeated explanations, and unrelated examples.
4. Check links and repository paths.
5. Run the repository's formatting, spelling, and Markdown validation commands.

## References

- Issue [#12370](https://github.com/typescript-eslint/typescript-eslint/issues/12370), which tracks repository-focused agent skills.
- [Rule documentation template](../../../packages/eslint-plugin/docs/rules/TEMPLATE.md).
- [Local development validation](../../../docs/contributing/Local_Development.mdx#validating-changes).
- [Pull request guidance](../../../docs/contributing/Pull_Requests.mdx).
