import * as ts from 'typescript';
import { ILinterOptions, LintResult } from 'tslint';
import { typescriptService } from './typescript-service';
const { Linter: TSLintLinter } = require('tslint');

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
        const result =  service.getSourceFile(fileName, source);
        this.program = service.getProgram();
        return result;
    }
}
