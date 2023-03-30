import type { analyze } from '@typescript-eslint/scope-manager';
import type { ParserOptions } from '@typescript-eslint/types';
import type {
  astConverter,
  getScriptKind,
} from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type esquery from 'esquery';
import type * as ts from 'typescript';

import type { EslintRC } from '../types';
import { createVirtualCompilerHost } from './CompilerHost';
import { eslintConfig, PARSER_NAME, parseSettings } from './config';

export interface RuleDetails {
  name: string;
  description?: string;
  url?: string;
}

export type RulesMap = Map<string, RuleDetails>;

export interface LintUtils {
  createLinter: () => TSESLint.Linter;
  analyze: typeof analyze;
  visitorKeys: TSESLint.SourceCode.VisitorKeys;
  astConverter: typeof astConverter;
  getScriptKind: typeof getScriptKind;
  esquery: typeof esquery;
  configs: Record<string, TSESLint.Linter.Config>;
}

export class WebLinter {
  private readonly host: ts.CompilerHost;

  public storedAST?: TSESTree.Program;
  public storedTsAST?: ts.SourceFile;
  public storedScope?: Record<string, unknown>;

  private compilerOptions: ts.CompilerOptions;
  private eslintConfig = eslintConfig;

  private linter: TSESLint.Linter;
  private lintUtils: LintUtils;

  public readonly rulesMap: RulesMap = new Map();
  public readonly configs: Record<string, TSESLint.Linter.Config> = {};

  constructor(
    system: ts.System,
    compilerOptions: ts.CompilerOptions,
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

    this.configs = lintUtils.configs;

    this.linter.getRules().forEach((item, name) => {
      this.rulesMap.set(name, {
        name: name,
        description: item.meta?.docs?.description,
        url: item.meta?.docs?.url,
      });
    });
  }

  lint(code: string, filename: string): TSESLint.Linter.LintMessage[] {
    return this.linter.verify(code, this.eslintConfig, {
      filename,
    });
  }

  fix(code: string, filename: string): TSESLint.Linter.FixReport {
    return this.linter.verifyAndFix(code, this.eslintConfig, {
      fix: true,
      filename,
    });
  }

  updateEslintConfig(config: EslintRC): void {
    const resolvedConfig = this.resolveEslintConfig(config);
    this.eslintConfig.rules = resolvedConfig.rules;
    // TODO: overrides are not fully supported yet
    this.eslintConfig.overrides = resolvedConfig.overrides;
  }

  updateParserOptions(jsx?: boolean, sourceType?: TSESLint.SourceType): void {
    this.eslintConfig.parserOptions ??= {};
    this.eslintConfig.parserOptions.ecmaFeatures ??= {};
    this.eslintConfig.parserOptions.ecmaFeatures.jsx = jsx ?? false;
    this.eslintConfig.parserOptions.sourceType = sourceType ?? 'module';
  }

  updateCompilerOptions(options: ts.CompilerOptions = {}): void {
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
    const checker = program.getTypeChecker();

    const { estree: ast, astMaps } = this.lintUtils.astConverter(
      tsAst,
      { ...parseSettings, code, codeFullText: code, jsx: isJsx },
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

  private resolveEslintConfig(
    cfg: Partial<TSESLint.Linter.Config>,
  ): TSESLint.Linter.Config {
    const config = {
      rules: {},
      overrides: [],
    };
    if (cfg.extends) {
      const cfgExtends = Array.isArray(cfg.extends)
        ? cfg.extends
        : [cfg.extends];
      for (const extendsName of cfgExtends) {
        if (typeof extendsName === 'string' && extendsName in this.configs) {
          const resolved = this.resolveEslintConfig(this.configs[extendsName]);
          if (resolved.rules) {
            Object.assign(config.rules, resolved.rules);
          }
          if (resolved.overrides) {
            Object.assign(config.overrides, resolved.overrides);
          }
        }
      }
    }
    if (cfg.rules) {
      Object.assign(config.rules, cfg.rules);
    }
    if (cfg.overrides) {
      Object.assign(config.overrides, cfg.overrides);
    }
    return config;
  }
}
