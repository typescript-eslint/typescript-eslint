import { createContext, useContext } from 'react';

import type { CodeDiagnostic } from '../../../plugins/generated-rule-docs/codeDiagnostics';

const CodeBlockDiagnosticsContext = createContext<readonly CodeDiagnostic[]>(
  [],
);

export const CodeBlockDiagnosticsProvider =
  CodeBlockDiagnosticsContext.Provider;

export function useCodeBlockDiagnostics(): readonly CodeDiagnostic[] {
  return useContext(CodeBlockDiagnosticsContext);
}

export function parseCodeBlockDiagnostics(
  metastring: string | undefined,
): readonly CodeDiagnostic[] {
  const encoded = metastring?.match(/eslintDiagnostics="(?<diagnostics>.*?)"/)
    ?.groups?.diagnostics;
  if (!encoded) {
    return [];
  }

  const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/');
  const bytes = Uint8Array.from(atob(base64), character =>
    character.charCodeAt(0),
  );
  return JSON.parse(new TextDecoder().decode(bytes)) as CodeDiagnostic[];
}
