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

  type GetMatchedIncludeSpec = (
    program: Program,
    fileName: string,
  ) => string | undefined;

  const getMatchedIncludeSpec: GetMatchedIncludeSpec | undefined;
}
