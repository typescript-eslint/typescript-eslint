import 'typescript';

// these additions are marked as internal to typescript
declare module 'typescript' {
  interface SourceFile {
    externalModuleIndicator?: Node;
    parseDiagnostics: DiagnosticWithLocation[];
  }

  interface JSDocContainer {
    jsDoc?: JSDoc[];
  }

  // add back the deprecated properties that were removed in newer TS versions
  // make sure these properties are marked as @ deprecated so they're flagged
  // by the `deprecation/deprecation` lint rule

  interface PropertySignature {
    /** @deprecated removed in 5.0 but we want to keep it for backwards compatibility checks! */
    readonly initializer?: Expression | undefined;
  }
  interface PropertyAssignment {
    /** @deprecated removed in 5.0 but we want to keep it for backwards compatibility checks! */
    readonly questionToken?: QuestionToken | undefined;
    /** @deprecated removed in 5.0 but we want to keep it for backwards compatibility checks! */
    readonly exclamationToken?: ExclamationToken | undefined;
  }
  interface ShorthandPropertyAssignment {
    /** @deprecated removed in 5.0 but we want to keep it for backwards compatibility checks! */
    readonly modifiers?: NodeArray<Modifier> | undefined;
    /** @deprecated removed in 5.0 but we want to keep it for backwards compatibility checks! */
    readonly questionToken?: QuestionToken | undefined;
    /** @deprecated removed in 5.0 but we want to keep it for backwards compatibility checks! */
    readonly exclamationToken?: ExclamationToken | undefined;
  }
  interface FunctionTypeNode {
    /** @deprecated removed in 5.0 but we want to keep it for backwards compatibility checks! */
    readonly modifiers?: NodeArray<Modifier> | undefined;
  }

  /**
   * @deprecated don't use this directly as it does not exist pre-4.8; instead use getDecorators from `src/getModifiers.ts`.
   */
  function getDecorators(node: HasDecorators): readonly Decorator[] | undefined;
  /**
   * @deprecated don't use this directly as it does not exist pre-4.8; instead use getModifiers from `src/getModifiers.ts`.
   */
  function getModifiers(node: HasModifiers): readonly Modifier[] | undefined;
  /**
   * @deprecated don't use this directly as it does not exist pre-4.8; instead use getModifiers from `src/getModifiers.ts`.
   */
  function canHaveModifiers(node: Node): node is HasModifiers;
  /**
   * @deprecated don't use this directly as it does not exist pre-4.8; instead use getDecorators from `src/getModifiers.ts`.
   */
  function canHaveDecorators(node: Node): node is HasDecorators;
}
