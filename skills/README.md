# Skills

Agent skills for working in this repository: focused guides that capture
preferences which are useful but impractical to enforce with a lint rule of our
own (see [#12370](https://github.com/typescript-eslint/typescript-eslint/issues/12370)).

Each skill lives in its own directory with a `SKILL.md` file:

```text
skills/<name>/SKILL.md
```

`SKILL.md` uses YAML front matter with a `name` and a `description` (what the
skill does and when to use it), followed by the guidance in Markdown. This is
the portable format used by tools such as
[Vercel's skills package](https://github.com/vercel-labs/skills) and Claude Code.

## Available skills

- [`rule-performance`](./rule-performance/SKILL.md) — defer expensive TypeScript
  type lookups behind cheap AST/syntactic guards when writing or reviewing typed
  lint rules.
