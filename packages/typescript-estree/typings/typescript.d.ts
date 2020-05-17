import 'typescript';

declare module 'typescript' {
  interface SourceFile {
    // this is marked as internal to typescript
    externalModuleIndicator?: Node;
  }
}
