import type * as tsvfs from '@site/src/vendor/typescript-vfs';
import type { JSONSchema, TSESLint } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { createCompilerOptions } from '../lib/createCompilerOptions';
import { createEventsBinder } from '../lib/createEventsBinder';
import { parseESLintRC, parseTSConfig } from '../lib/parseConfig';
import { defaultEslintConfig, PARSER_NAME } from './config';
import { createParser } from './createParser';
import type {
  LinterOnLint,
  LinterOnParse,
  PlaygroundSystem,
  WebLinterModule,
} from './types';

export interface CreateLinter {
  rules: Map<
    string,
    {
      name: string;
      description?: string;
      url?: string;
      schema: JSONSchema.JSONSchema4 | readonly JSONSchema.JSONSchema4[];
    }
  >;
  configs: string[];
  triggerFix(filename: string): TSESLint.Linter.FixReport | undefined;
  triggerLint(filename: string): void;
  onLint(cb: LinterOnLint): () => void;
  onParse(cb: LinterOnParse): () => void;
  updateParserOptions(sourceType?: TSESLint.SourceType): void;
}

export function createLinter(
  system: PlaygroundSystem,
  webLinterModule: WebLinterModule,
  vfs: typeof tsvfs,
): CreateLinter {
  const rules: CreateLinter['rules'] = new Map();
  const configs = new Map(Object.entries(webLinterModule.configs));
  let compilerOptions: ts.CompilerOptions = {};
  const eslintConfig: TSESLint.Linter.Config = { ...defaultEslintConfig };

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
      name: name,
      description: item.meta?.docs?.description,
      url: item.meta?.docs?.url,
      schema: item.meta?.schema ?? [],
    });
  });

  const triggerLint = (filename: string): void => {
    console.info('[Editor] linting triggered for file', filename);
    const code = system.readFile(filename) ?? '\n';
    if (code != null) {
      const messages = linter.verify(code, eslintConfig, filename);
      onLint.trigger(filename, messages);
    }
  };

  const triggerFix = (
    filename: string,
  ): TSESLint.Linter.FixReport | undefined => {
    const code = system.readFile(filename);
    if (code) {
      return linter.verifyAndFix(code, eslintConfig, {
        filename: filename,
        fix: true,
      });
    }
    return undefined;
  };

  const updateParserOptions = (sourceType?: TSESLint.SourceType): void => {
    eslintConfig.parserOptions ??= {};
    eslintConfig.parserOptions.sourceType = sourceType ?? 'module';
  };

  const resolveEslintConfig = (
    cfg: Partial<TSESLint.Linter.Config>,
  ): TSESLint.Linter.Config => {
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
    try {
      const file = system.readFile(fileName) ?? '{}';
      const parsed = parseTSConfig(file).compilerOptions;
      compilerOptions = createCompilerOptions(parsed);
      console.log('[Editor] Updating', fileName, compilerOptions);
      parser.updateConfig(compilerOptions);
    } catch (e) {
      console.error(e);
    }
  };

  system.watchFile('/input.*', triggerLint);
  system.watchFile('/.eslintrc', applyEslintConfig);
  system.watchFile('/tsconfig.json', applyTSConfig);

  applyEslintConfig('/.eslintrc');
  applyTSConfig('/tsconfig.json');

  return {
    rules,
    configs: Array.from(configs.keys()),
    triggerFix,
    triggerLint,
    updateParserOptions,
    onParse: onParse.register,
    onLint: onLint.register,
  };
}
