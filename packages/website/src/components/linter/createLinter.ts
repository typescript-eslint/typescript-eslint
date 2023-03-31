import type * as tsvfs from '@site/src/vendor/typescript-vfs';
import type { TSESLint } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { parseESLintRC, parseTSConfig } from '../config/utils';
import { createCompilerOptions } from '../editor/config';
import { createEventHelper } from '../lib/createEventHelper';
import { defaultEslintConfig, PARSER_NAME } from './config';
import { createParser } from './createParser';
import type {
  LinterOnLint,
  LinterOnParse,
  PlaygroundSystem,
  WebLinter,
  WebLinterModule,
} from './types';

export function createLinter(
  system: PlaygroundSystem,
  webLinterModule: WebLinterModule,
  vfs: typeof tsvfs,
): WebLinter {
  const rules: WebLinter['rules'] = new Map();
  let compilerOptions: ts.CompilerOptions = {};
  const eslintConfig = { ...defaultEslintConfig };

  const onLint = createEventHelper<LinterOnLint>();
  const onParse = createEventHelper<LinterOnParse>();

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

  const updateParserOptions = (
    jsx?: boolean,
    sourceType?: TSESLint.SourceType,
  ): void => {
    eslintConfig.parserOptions ??= {};
    eslintConfig.parserOptions.sourceType = sourceType ?? 'module';
    eslintConfig.parserOptions.ecmaFeatures ??= {};
    eslintConfig.parserOptions.ecmaFeatures.jsx = jsx ?? false;
  };

  const applyEslintConfig = (fileName: string): void => {
    try {
      const file = system.readFile(fileName) ?? '{}';
      const parsed = parseESLintRC(file);
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
    triggerFix,
    triggerLint,
    updateParserOptions,
    onParse: onParse.register,
    onLint: onLint.register,
  };
}
