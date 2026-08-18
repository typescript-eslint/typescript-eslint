# Skills

Agent skills for working in this repository: focused guides that capture preferences which are useful but impractical to enforce with a lint rule of our own (see [#12370](https://github.com/typescript-eslint/typescript-eslint/issues/12370)).

Each skill lives in its own directory with a `SKILL.md` file:

```text
skills/<name>/SKILL.md
```

`SKILL.md` uses YAML front matter with a `name` and a `description` (what the skill does and when to use it), followed by the guidance in Markdown. This is the portable format used by tools such as [Vercel's skills package](https://github.com/vercel-labs/skills) and Claude Code.

## What these skills are not

They describe structure, naming, testing, and documentation conventions. They are **not** correctness tools: measured against a held-out sample of real reviews, they found none of the reviewer's bug reports — missed syntax variants, escaped identifier names, unsound inference assumptions. Those need a human reading types, a playground repro, and the issue history.

Two further classes sit outside reach of anything reading a diff: defects visible only in rendered output, such as a docs code block importing the wrong file, and decisions about project policy, such as what a label should mean when two reviewers disagree.

Treat a skill's output as a first pass over style and structure, never as a substitute for review.

## Available skills

- [`code-clarity`](./code-clarity/SKILL.md) — remove unnecessary intermediate variables, restating comments, redundant type annotations, and imprecise names.
- [`docs-writing`](./docs-writing/SKILL.md) — write and review documentation with objective, verifiable claims, accessible link text, and self-contained code examples.
- [`fixers`](./fixers/SKILL.md) — write fixers and suggestions that never delete comments, using tokens rather than character arithmetic.
- [`rule-conventions`](./rule-conventions/SKILL.md) — follow this repository's conventions for messageIds, report messages, rule options, preset placement, and deprecations.
- [`rule-performance`](./rule-performance/SKILL.md) — defer expensive TypeScript type lookups behind cheap AST/syntactic guards when writing or reviewing typed lint rules.
- [`shared-logic`](./shared-logic/SKILL.md) — move logic copied between rules into a shared util, and reuse the utils that already exist.
- [`tests`](./tests/SKILL.md) — write rule test cases as small static units, probe the syntax that breaks rules, and make sure every new branch is covered or removed.
- [`types-not-workarounds`](./types-not-workarounds/SKILL.md) — fix imprecise types at their source instead of papering over them with runtime checks or assertions.
