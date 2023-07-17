/*
VSCode has a helpful feature where it'll automatically fetch types for you for your JS node module imports.
So it means that in the IDE you'll open the file and VSCode will tell TS it can look in its cache for module
types for the `@types/eslint` package. It finds it, uses it, then will show errors because our `RuleModule`
doesn't match the `@types/eslint` `RuleModule`.

But this behavior only happens in the IDE, not the CLI - because the CLI can't use VSCode's cache, ofc, so
it just uses `any` for the import - marking it as an untyped export. So adding this type tells TS that it
cannot use VSCode's cache ever - stubbing it out permanently.
*/
declare module 'eslint' {
  export class Linter {
    defineRule(name: string, rule: unknown): void;
  }
}
