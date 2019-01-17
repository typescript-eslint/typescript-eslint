import { ILinterOptions, Linter, LintResult } from 'tslint';
import ts from 'typescript';
import { typescriptService } from './typescript-service';

const TSLintLinter = Linter as any;

export class CustomLinter extends TSLintLinter {
  constructor(options: ILinterOptions, program?: ts.Program | undefined) {
    super(options, program);
  }

  getResult(): LintResult {
    return super.getResult();
  }

  getSourceFile(fileName: string, source: string) {
    if (this.program === undefined) {
      return super.getSourceFile(fileName, source);
    }
    const service = typescriptService();
    const result = service.getSourceFile(fileName, source);
    this.program = service.getProgram();
    return result;
  }
}
