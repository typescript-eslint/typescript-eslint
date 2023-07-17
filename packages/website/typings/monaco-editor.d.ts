import 'monaco-editor/esm/vs/editor/editor.api';

declare module 'monaco-editor/esm/vs/editor/editor.api' {
  namespace languages.typescript {
    interface TypeScriptWorker {
      /**
       * https://github.com/microsoft/TypeScript-Website/blob/246798df5013036bd9b4389932b642c20ab35deb/packages/playground-worker/types.d.ts#L48
       */
      getLibFiles?(): Promise<Record<string, string>>;
    }
  }
}
