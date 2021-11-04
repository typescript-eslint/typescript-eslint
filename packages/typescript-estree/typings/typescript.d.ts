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
}
