import { TypeScriptIssueDetection } from '@typescript-eslint/types';
import type {
  Diagnostic,
  DiagnosticWithLocation,
  Program,
  SourceFile,
} from 'typescript';
import { flattenDiagnosticMessageText, sys } from 'typescript';

export interface SemanticOrSyntacticError extends Diagnostic {
  message: string;
}

export function getFirstSemanticOrSyntacticError(
  program: Program,
  ast: SourceFile,
  issueDetection: TypeScriptIssueDetection,
): SemanticOrSyntacticError | undefined {
  if (!issueDetection) {
    return undefined;
  }

  try {
    const supportedSyntacticDiagnostics = program.getSyntacticDiagnostics(ast);
    if (supportedSyntacticDiagnostics.length) {
      return convertDiagnosticToSemanticOrSyntacticError(
        supportedSyntacticDiagnostics[0],
      );
    }

    if (issueDetection === TypeScriptIssueDetection.SyntacticOrSemantic) {
      const supportedSemanticDiagnostics = program.getSemanticDiagnostics(ast);
      if (supportedSemanticDiagnostics.length) {
        return convertDiagnosticToSemanticOrSyntacticError(
          supportedSemanticDiagnostics[0],
        );
      }
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
    /* istanbul ignore next */
    console.warn(`Warning From TSC: "${(e as Error).message}`); // eslint-disable-line no-console
    /* istanbul ignore next */
    return undefined;
  }
}

function convertDiagnosticToSemanticOrSyntacticError(
  diagnostic: Diagnostic,
): SemanticOrSyntacticError {
  return {
    ...diagnostic,
    message: flattenDiagnosticMessageText(diagnostic.messageText, sys.newLine),
  };
}
