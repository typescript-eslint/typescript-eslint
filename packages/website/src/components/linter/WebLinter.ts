import { createVirtualCompilerHost } from '@site/src/components/linter/CompilerHost';
import { parseSettings } from '@site/src/components/linter/config';
import type { analyze } from '@typescript-eslint/scope-manager';
import type { ParserOptions } from '@typescript-eslint/types';
import type { astConverter } from '@typescript-eslint/typescript-estree/use-at-your-own-risk/ast-converter';
import type { getScriptKind } from '@typescript-eslint/typescript-estree/use-at-your-own-risk/getScriptKind';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type esquery from 'esquery';
import type {
  CompilerHost,
  CompilerOptions,
  SourceFile,
  System,
} from 'typescript';

const PARSER_NAME = '@typescript-eslint/parser';

export interface LintUtils {
  createLinter: () => TSESLint.Linter;
  analyze: typeof analyze;
  visitorKeys: TSESLint.SourceCode.VisitorKeys;
  astConverter: typeof astConverter;
  getScriptKind: typeof getScriptKind;
  esquery: typeof esquery;
}

export class WebLinter {
  private readonly host: CompilerHost;

  public storedAST?: TSESTree.Program;
  public storedTsAST?: SourceFile;
  public storedScope?: Record<string, unknown>;

  private compilerOptions: CompilerOptions;
  private readonly parserOptions: ParserOptions = {
    ecmaFeatures: {
      jsx: true,
      globalReturn: false,
    },
    comment: true,
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

  get eslintConfig(): TSESLint.Linter.Config {
    return {
      parser: PARSER_NAME,
      parserOptions: this.parserOptions,
      rules: this.rules,
    };
  }

  lint(code: string, filename: string): TSESLint.Linter.LintMessage[] {
    return this.linter.verify(code, this.eslintConfig, {
      filename: filename,
    });
  }

  fix(code: string, filename: string): TSESLint.Linter.FixReport {
    return this.linter.verifyAndFix(code, this.eslintConfig, {
      filename: filename,
      fix: true,
    });
  }

  updateRules(rules: TSESLint.Linter.RulesRecord): void {
    this.rules = rules;
  }

  updateParserOptions(sourceType?: TSESLint.SourceType): void {
    this.parserOptions.sourceType = sourceType ?? 'module';
  }

  updateCompilerOptions(options: CompilerOptions = {}): void {
    this.compilerOptions = options;
  }

  eslintParse(
    code: string,
    eslintOptions: ParserOptions = {},
  ): TSESLint.Linter.ESLintParseResult {
    const fileName = eslintOptions.filePath ?? '/input.ts';

    this.storedAST = undefined;
    this.storedTsAST = undefined;
    this.storedScope = undefined;

    this.host.writeFile(fileName, code || '\n', false);

    const program = window.ts.createProgram({
      rootNames: [fileName],
      options: this.compilerOptions,
      host: this.host,
    });
    const tsAst = program.getSourceFile(fileName)!;
    const checker = program.getTypeChecker();

    const { estree: ast, astMaps } = this.lintUtils.astConverter(
      tsAst,
      { ...parseSettings, code, codeFullText: code },
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
        program,
        esTreeNodeToTSNodeMap: astMaps.esTreeNodeToTSNodeMap,
        tsNodeToESTreeNodeMap: astMaps.tsNodeToESTreeNodeMap,
        getSymbolAtLocation: node =>
          checker.getSymbolAtLocation(astMaps.esTreeNodeToTSNodeMap.get(node)),
        getTypeAtLocation: node =>
          checker.getTypeAtLocation(astMaps.esTreeNodeToTSNodeMap.get(node)),
      },
      scopeManager,
      visitorKeys: this.lintUtils.visitorKeys,
    };
  }
}
