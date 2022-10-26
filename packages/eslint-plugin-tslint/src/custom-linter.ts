import type { ILinterOptions, LintResult } from 'tslint';
import { Linter } from 'tslint';
import type { Program, SourceFile } from 'typescript';

// @ts-expect-error - We need to access the program, but Linter has private program already
export class CustomLinter extends Linter {
  constructor(options: ILinterOptions, private readonly program: Program) {
    super(options, program);
  }

  getResult(): LintResult {
    return super.getResult();
  }

  getSourceFile(fileName: string): SourceFile | undefined {
    return this.program.getSourceFile(fileName);
  }
}
