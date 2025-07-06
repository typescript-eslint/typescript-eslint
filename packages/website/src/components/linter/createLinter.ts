import type * as tsvfs from '@site/src/vendor/typescript-vfs';
import type { JSONSchema, TSESTree } from '@typescript-eslint/utils';
import type {
  ClassicConfig,
  Linter,
  SourceType,
} from '@typescript-eslint/utils/ts-eslint';
import type * as ts from 'typescript';

import type {
  ErrorGroup,
  TabType,
} from '../../../../website/src/components/types';
import type {
  LinterOnLint,
  LinterOnParse,
  PlaygroundSystem,
  RegisterFile,
  WebLinterModule,
} from './types';

import { createCompilerOptions } from '../lib/createCompilerOptions';
import { createEventsBinder } from '../lib/createEventsBinder';
import { parseESLintRC, parseTSConfig } from '../lib/parseConfig';
import { defaultEslintConfig, PARSER_NAME } from './config';
import { createParser } from './createParser';

export interface CreateLinter {
  configs: string[];
  onLint(cb: LinterOnLint): () => void;
  onParse(cb: LinterOnParse): () => void;
  rules: Map<
    string,
    {
      description?: string;
      name: string;
      schema: JSONSchema.JSONSchema4 | readonly JSONSchema.JSONSchema4[];
      url?: string;
    }
  >;
  triggerFix(filename: string): Linter.FixReport | undefined;
  triggerLint(filename: string): void;
  updateParserOptions(sourceType?: SourceType): void;
  registerFile: RegisterFile;
}

export function createLinter(
  system: PlaygroundSystem,
  webLinterModule: WebLinterModule,
  vfs: typeof tsvfs,
  onMarkersChange: React.Dispatch<
    React.SetStateAction<Record<TabType, ErrorGroup[]>>
  >,
): CreateLinter {
  const rules: CreateLinter['rules'] = new Map();
  const configs = new Map(Object.entries(webLinterModule.configs));
  let compilerOptions: ts.CompilerOptions = {};
  const eslintConfig: ClassicConfig.Config = { ...defaultEslintConfig };

  const onLint = createEventsBinder<LinterOnLint>();
  const onParse = createEventsBinder<LinterOnParse>();

  const linter = webLinterModule.createLinter();

  const parser = createParser(
    system,
    compilerOptions,
    (filename, model): void => {
      onParse.trigger(filename, model);
    },
    webLinterModule,
    vfs,
  );

  linter.defineParser(PARSER_NAME, parser);

  linter.getRules().forEach((item, name) => {
    rules.set(name, {
      description: item.meta?.docs?.description,
      name,
      schema: item.meta?.schema ?? [],
      url: item.meta?.docs?.url,
    });
  });

  const triggerLint = (filename: string): void => {
    console.info('[Editor] linting triggered for file', filename);
    const code = system.readFile(filename) ?? '\n';
    try {
      const messages = linter.verify(code, eslintConfig, filename);
      onLint.trigger(filename, messages);
    } catch (e) {
      const lintMessage: Linter.LintMessage = {
        column: 1,
        line: 1,
        message: String(e instanceof Error ? e.stack : e),
        nodeType: '',
        ruleId: '',
        severity: 2,
        source: 'eslint',
      };
      if (typeof e === 'object' && e && 'currentNode' in e) {
        const node = e.currentNode as TSESTree.Node;
        lintMessage.column = node.loc.start.column + 1;
        lintMessage.line = node.loc.start.line;
        lintMessage.endColumn = node.loc.end.column + 1;
        lintMessage.endLine = node.loc.end.line;
      }
      onLint.trigger(filename, [lintMessage]);
    }
  };

  const triggerFix = (filename: string): Linter.FixReport | undefined => {
    const code = system.readFile(filename);
    if (code) {
      return linter.verifyAndFix(code, eslintConfig, {
        filename,
        fix: true,
      });
    }
    return undefined;
  };

  const updateParserOptions = (sourceType?: SourceType): void => {
    eslintConfig.parserOptions ??= {};
    eslintConfig.parserOptions.sourceType = sourceType ?? 'module';
  };

  const resolveEslintConfig = (
    cfg: Partial<ClassicConfig.Config>,
  ): ClassicConfig.Config => {
    const config = { rules: {} };
    if (cfg.extends) {
      const cfgExtends = Array.isArray(cfg.extends)
        ? cfg.extends
        : [cfg.extends];
      for (const extendsName of cfgExtends) {
        const maybeConfig = configs.get(extendsName);
        if (maybeConfig) {
          const resolved = resolveEslintConfig(maybeConfig);
          if (resolved.rules) {
            Object.assign(config.rules, resolved.rules);
          }
        }
      }
    }
    if (cfg.rules) {
      Object.assign(config.rules, cfg.rules);
    }
    return config;
  };

  const applyEslintConfig = (fileName: string): void => {
    try {
      const file = system.readFile(fileName) ?? '{}';
      const parsed = resolveEslintConfig(parseESLintRC(file));
      eslintConfig.rules = parsed.rules;
      console.log('[Editor] Updating', fileName, eslintConfig);
    } catch (e) {
      console.error(e);
    }
  };

  const applyTSConfig = (fileName: string): void => {
    let error: ErrorGroup | null = null;

    try {
      const file = system.readFile(fileName) ?? '{}';
      const parsed = parseTSConfig(file).compilerOptions;
      compilerOptions = createCompilerOptions(parsed);
      console.log('[Editor] Updating', fileName, compilerOptions);
      parser.updateConfig(compilerOptions);
    } catch (e) {
      if (e instanceof Error) {
        error = {
          group: 'TypeScript',
          items: e.message
            .trim()
            .split('\n')
            .map((message: string) => {
              return {
                message,
                severity: 8, // MarkerSeverity.Error
              };
            }),
          uri: undefined,
        };
      }
    } finally {
      onMarkersChange(prev => {
        const activeTabErrors = Object.fromEntries(
          prev.tsconfig.map(error => [error.group, error]),
        );

        if (error) {
          activeTabErrors.TypeScript = error;
        } else {
          delete activeTabErrors.TypeScript;
        }

        return {
          ...prev,
          tsconfig: Object.values(activeTabErrors),
        };
      });
    }
  };

  const registerFile = (fileName: string, code: string) => {
    parser.registerFile(fileName, code);
    triggerLintAll();
  };

  const triggerLintAll = (): void => {
    system.searchFiles('/input.*').forEach(triggerLint);
  };

  system.watchFile('/input.*', triggerLint);
  system.watchFile('/.eslintrc', filename => {
    applyEslintConfig(filename);
    triggerLintAll();
  });
  system.watchFile('/tsconfig.json', filename => {
    applyTSConfig(filename);
    triggerLintAll();
  });

  applyEslintConfig('/.eslintrc');
  applyTSConfig('/tsconfig.json');

  return {
    configs: [...configs.keys()],
    onLint: onLint.register,
    onParse: onParse.register,
    registerFile,
    rules,
    triggerFix,
    triggerLint,
    updateParserOptions,
  };
}
