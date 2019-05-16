/*
We intentionally do not include @types/eslint-scope.

This is to ensure that nobody accidentally uses those incorrect types
instead of the ones declared within this package
*/

declare module 'eslint-scope/lib/variable' {
  const Variable: unknown;
  export = Variable;
}
declare module 'eslint-scope/lib/definition' {
  const Definition: unknown;
  const ParameterDefinition: unknown;
  export { Definition, ParameterDefinition };
}
declare module 'eslint-scope/lib/pattern-visitor' {
  const PatternVisitor: unknown;
  export = PatternVisitor;
}
declare module 'eslint-scope/lib/referencer' {
  const Referencer: unknown;
  export = Referencer;
}
declare module 'eslint-scope/lib/scope' {
  const Scope: unknown;
  const GlobalScope: unknown;
  const ModuleScope: unknown;
  const FunctionExpressionNameScope: unknown;
  const CatchScope: unknown;
  const WithScope: unknown;
  const BlockScope: unknown;
  const SwitchScope: unknown;
  const FunctionScope: unknown;
  const ForScope: unknown;
  const ClassScope: unknown;
  export {
    Scope,
    GlobalScope,
    ModuleScope,
    FunctionExpressionNameScope,
    CatchScope,
    WithScope,
    BlockScope,
    SwitchScope,
    FunctionScope,
    ForScope,
    ClassScope,
  };
}
declare module 'eslint-scope/lib/reference' {
  const Reference: unknown;
  export = Reference;
}
declare module 'eslint-scope/lib/scope-manager' {
  const ScopeManager: unknown;
  export = ScopeManager;
}
declare module 'eslint-scope' {
  const version: string;
  const analyze: unknown;
  export { analyze, version };
}
