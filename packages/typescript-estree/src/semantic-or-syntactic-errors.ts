import type { Diagnostic } from 'typescript';

export interface SemanticOrSyntacticError extends Diagnostic {
  message: string;
}
