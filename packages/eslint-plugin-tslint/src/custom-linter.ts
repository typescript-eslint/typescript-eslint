import { ILinterOptions, Linter, LintResult } from 'tslint';
import { Program } from 'typescript';

// We need to access the program, but Linter has private program already
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TSLintLinter = Linter as any;

export class CustomLinter extends TSLintLinter {
  constructor(options: ILinterOptions, private readonly program: Program) {
    super(options, program);
  }

  getResult(): LintResult {
    return super.getResult();
  }

  getSourceFile(fileName: string) {
    return this.program.getSourceFile(fileName);
  }
}
