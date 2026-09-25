import type { CodeDiagnostic } from '../../../plugins/generated-rule-docs/codeDiagnostics';

export interface LineDiagnosticRange {
  diagnostic: CodeDiagnostic;
  diagnosticIndex: number;
  end: number;
  start: number;
}

export function getLineDiagnosticRanges(
  diagnostics: readonly CodeDiagnostic[],
  lineIndex: number,
  lineLength: number,
): LineDiagnosticRange[] {
  return diagnostics.flatMap((diagnostic, diagnosticIndex) => {
    if (lineIndex < diagnostic.startLine || lineIndex > diagnostic.endLine) {
      return [];
    }

    const start =
      lineIndex === diagnostic.startLine ? diagnostic.startColumn : 0;
    const end =
      lineIndex === diagnostic.endLine ? diagnostic.endColumn : lineLength;

    return end > start ? [{ diagnostic, diagnosticIndex, end, start }] : [];
  });
}
