import { createVirtualCompilerHost } from '@site/src/components/linter/CompilerHost';
import { extra } from '@site/src/components/linter/config';
import type { ParserOptions } from '@typescript-eslint/types';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { LintUtils } from '@typescript-eslint/website-eslint';
import type {
  CompilerHost,
  CompilerOptions,
  SourceFile,
  System,
} from 'typescript';

const PARSER_NAME = '@typescript-eslint/parser';

export class WebLinter {
  private readonly host: CompilerHost;

  public storedAST?: TSESTree.Program;
  public storedTsAST?: SourceFile;
  public storedScope?: Record<string, unknown>;

  private compilerOptions: CompilerOptions;
  private readonly parserOptions: ParserOptions = {
    ecmaFeatures: {
      jsx: false,
      globalReturn: false,
    },
    ecmaVersion: 'latest',
    project: ['./tsconfig.json'],
    sourceType: 'module',
  };

  private linter: TSESLint.Linter;
  private lintUtils: LintUtils;
  private rules: TSESLint.Linter.RulesRecord = {};

  public readonly ruleNames: { name: string; description?: string }[] = [];
  public readonly rulesUrl = new Map<string, string | undefined>();

  constructor(
    system: System,
    compilerOptions: CompilerOptions,
    lintUtils: LintUtils,
  ) {
    this.compilerOptions = compilerOptions;
    this.lintUtils = lintUtils;
    this.linter = lintUtils.createLinter();

    this.host = createVirtualCompilerHost(system, lintUtils);

    this.linter.defineParser(PARSER_NAME, {
      parseForESLint: (text, options?: ParserOptions) => {
        return this.eslintParse(text, options);
      },
    });

    this.linter.getRules().forEach((item, name) => {
      this.ruleNames.push({
        name: name,
        description: item.meta?.docs?.description,
      });
      this.rulesUrl.set(name, item.meta?.docs?.url);
    });
  }

  lint(code: string): TSESLint.Linter.LintMessage[] {
    return this.linter.verify(code, {
      parser: PARSER_NAME,
      parserOptions: this.parserOptions,
      rules: this.rules,
    });
  }

  updateRules(rules: TSESLint.Linter.RulesRecord): void {
    this.rules = rules;
  }

  updateParserOptions(jsx?: boolean, sourceType?: TSESLint.SourceType): void {
    this.parserOptions.ecmaFeatures!.jsx = jsx ?? false;
    this.parserOptions.sourceType = sourceType ?? 'module';
  }

  updateCompilerOptions(options: CompilerOptions = {}): void {
    this.compilerOptions = options;
  }

  eslintParse(
    code: string,
    eslintOptions: ParserOptions = {},
  ): TSESLint.Linter.ESLintParseResult {
    const isJsx = eslintOptions?.ecmaFeatures?.jsx ?? false;
    const fileName = isJsx ? '/demo.tsx' : '/demo.ts';

    this.storedAST = undefined;
    this.storedTsAST = undefined;
    this.storedScope = undefined;

    this.host.writeFile(fileName, code, false);

    const program = window.ts.createProgram({
      rootNames: [fileName],
      options: this.compilerOptions,
      host: this.host,
    });
    const tsAst = program.getSourceFile(fileName)!;

    const { estree: ast, astMaps } = this.lintUtils.astConverter(
      tsAst,
      { ...extra, code, jsx: isJsx },
      true,
    );

    const scopeManager = this.lintUtils.analyze(ast, {
      globalReturn: eslintOptions.ecmaFeatures?.globalReturn ?? false,
      sourceType: eslintOptions.sourceType ?? 'script',
    });

    this.storedAST = ast;
    this.storedTsAST = tsAst;
    this.storedScope = scopeManager as unknown as Record<string, unknown>;

    return {
      ast,
      services: {
        hasFullTypeInformation: true,
        program,
        esTreeNodeToTSNodeMap: astMaps.esTreeNodeToTSNodeMap,
        tsNodeToESTreeNodeMap: astMaps.tsNodeToESTreeNodeMap,
      },
      scopeManager,
      visitorKeys: this.lintUtils.visitorKeys,
    };
  }
}
