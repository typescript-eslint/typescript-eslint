import type {
  CompilerOptions,
  SourceFile,
  CompilerHost,
  System,
} from 'typescript';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { ParserServices } from '@typescript-eslint/utils/dist/ts-estree';
import type { ParserOptions } from '@typescript-eslint/types';
import type { LintUtils } from '@typescript-eslint/website-eslint';

import { createVirtualCompilerHost } from '@site/src/components/linter/CompilerHost';
import { extra } from '@site/src/components/linter/config';

const PARSER_NAME = '@typescript-eslint/parser';

export class WebLinter {
  private readonly host: CompilerHost;

  public storedAST?: TSESTree.Program;
  public storedTsAST?: SourceFile;
  public storedScope?: Record<string, unknown>;

  private compilerOptions: CompilerOptions;
  private linter: TSESLint.Linter;
  private lintUtils: LintUtils;

  public ruleNames: { name: string; description?: string }[];

  constructor(
    system: System,
    compilerOptions: CompilerOptions,
    lintUtils: LintUtils,
  ) {
    this.compilerOptions = compilerOptions;
    this.lintUtils = lintUtils;
    this.linter = lintUtils.createLinter();

    this.host = createVirtualCompilerHost(system, window.ts);

    this.linter.defineParser(PARSER_NAME, {
      parseForESLint: (text, options?: ParserOptions) => {
        return this.eslintParse(text, compilerOptions, options);
      },
    });

    this.ruleNames = Array.from(this.linter.getRules()).map(value => {
      return {
        name: value[0],
        description: value[1]?.meta?.docs?.description,
      };
    });
  }

  lint(
    code: string,
    parserOptions: ParserOptions,
    rules: TSESLint.Linter.RulesRecord,
  ): TSESLint.Linter.LintMessage[] {
    return this.linter.verify(code, {
      parser: PARSER_NAME,
      parserOptions,
      rules,
    });
  }

  updateOptions(options: CompilerOptions = {}): void {
    this.compilerOptions = options;
  }

  eslintParse(
    code: string,
    compilerOptions: CompilerOptions,
    eslintOptions: ParserOptions = {},
  ): TSESLint.Linter.ESLintParseResult {
    const isJsx = eslintOptions?.ecmaFeatures?.jsx ?? false;
    const fileName = isJsx ? '/demo.tsx' : '/demo.ts';

    this.host.writeFile(fileName, code, false);

    const program = window.ts.createProgram(
      [fileName],
      compilerOptions,
      this.host,
    );
    const tsAst = program.getSourceFile(fileName)!;

    const { estree: ast, astMaps } = this.lintUtils.astConverter(
      tsAst,
      { ...extra, code, jsx: isJsx },
      true,
    );

    const scopeManager = this.lintUtils.analyze(ast, {
      ecmaVersion:
        eslintOptions.ecmaVersion === 'latest'
          ? 1e8
          : eslintOptions.ecmaVersion,
      globalReturn: eslintOptions.ecmaFeatures?.globalReturn ?? false,
      sourceType: eslintOptions.sourceType ?? 'script',
    });

    this.storedAST = ast;
    this.storedTsAST = tsAst;
    this.storedScope = scopeManager as unknown as Record<string, unknown>;

    const services: ParserServices = {
      hasFullTypeInformation: true,
      program,
      esTreeNodeToTSNodeMap: astMaps.esTreeNodeToTSNodeMap,
      tsNodeToESTreeNodeMap: astMaps.tsNodeToESTreeNodeMap,
    };

    return {
      ast,
      services,
      scopeManager,
      visitorKeys: this.lintUtils.visitorKeys,
    };
  }
}
