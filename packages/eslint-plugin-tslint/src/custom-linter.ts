import { ILinterOptions, Linter, LintResult } from 'tslint';
import { Program } from 'typescript';

const TSLintLinter = Linter as any;

export class CustomLinter extends TSLintLinter {
  constructor(options: ILinterOptions, private program: Program) {
    super(options, program);
  }

  getResult(): LintResult {
    return super.getResult();
  }

  getSourceFile(fileName: string) {
    const result = this.program.getSourceFile(fileName);
    return result;
  }
}
