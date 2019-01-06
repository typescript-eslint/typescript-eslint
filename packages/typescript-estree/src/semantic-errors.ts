import ts from 'typescript';

interface SemanticOrSyntacticError extends ts.Diagnostic {
  message: string;
}

/**
 * By default, diagnostics from the TypeScript compiler contain all errors - regardless of whether
 * they are related to generic ECMAScript standards, or TypeScript-specific constructs.
 *
 * Therefore, we filter out all diagnostics, except for the ones we explicitly want to consider when
 * the user opts in to throwing errors on semantic issues.
 */
export function getFirstSemanticOrSyntacticError(
  program: ts.Program,
  ast: ts.SourceFile
): SemanticOrSyntacticError | undefined {
  try {
    const supportedSyntacticDiagnostics = whitelistSupportedDiagnostics(
      program.getSyntacticDiagnostics(ast)
    );
    if (supportedSyntacticDiagnostics.length) {
      return convertDiagnosticToSemanticOrSyntacticError(
        supportedSyntacticDiagnostics[0]
      );
    }
    const supportedSemanticDiagnostics = whitelistSupportedDiagnostics(
      program.getSemanticDiagnostics(ast)
    );
    if (supportedSemanticDiagnostics.length) {
      return convertDiagnosticToSemanticOrSyntacticError(
        supportedSemanticDiagnostics[0]
      );
    }
    return undefined;
  } catch (e) {
    /**
     * TypeScript compiler has certain Debug.fail() statements in, which will cause the diagnostics
     * retrieval above to throw.
     *
     * E.g. from ast-alignment-tests
     * "Debug Failure. Shouldn't ever directly check a JsxOpeningElement"
     *
     * For our current use-cases this is undesired behavior, so we just suppress it
     * and log a a warning.
     */
    console.warn(`Warning From TSC: "${e.message}`);
    return undefined;
  }
}

function whitelistSupportedDiagnostics(
  diagnostics: ReadonlyArray<ts.DiagnosticWithLocation | ts.Diagnostic>
): ReadonlyArray<ts.DiagnosticWithLocation | ts.Diagnostic> {
  return diagnostics.filter(diagnostic => {
    switch (diagnostic.code) {
      case 1123: // ts 3.2: "Variable declaration list cannot be empty."
        return true;
      case 1141: // ts 3.2 "String literal expected."
        return true;
    }
    return false;
  });
}

function convertDiagnosticToSemanticOrSyntacticError(
  diagnostic: ts.Diagnostic
): SemanticOrSyntacticError {
  return {
    ...diagnostic,
    message: ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      ts.sys.newLine
    )
  };
}
