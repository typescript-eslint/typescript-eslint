// if we don't declare this, then TS in VSCode will use its "helpfully fetched"
// types and report errors in the IDE
declare module 'eslint' {
  export class Linter {
    defineRule(name: string, rule: unknown): void;
  }
}
