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
  WebLinterModule,
} from './types';

export class WebLinter {
  readonly onLint = createEventHelper<LinterOnLint>();
  readonly onParse = createEventHelper<LinterOnParse>();
  readonly rules = new Map<
    string,
    { name: string; description?: string; url?: string }
  >();
  readonly configs: string[] = [];

  readonly #configMap = new Map<string, TSESLint.Linter.Config>();
  #compilerOptions: ts.CompilerOptions = {};
  #eslintConfig: TSESLint.Linter.Config = { ...defaultEslintConfig };
  readonly #linter: TSESLint.Linter;
  readonly #parser: ReturnType<typeof createParser>;
  readonly #system: PlaygroundSystem;

  constructor(
    system: PlaygroundSystem,
    webLinterModule: WebLinterModule,
    vfs: typeof tsvfs,
  ) {
    this.#configMap = new Map(Object.entries(webLinterModule.configs));
    this.#linter = webLinterModule.createLinter();
    this.#system = system;
    this.configs = Array.from(this.#configMap.keys());

    this.#parser = createParser(
      system,
      this.#compilerOptions,
      (filename, model): void => {
        this.onParse.trigger(filename, model);
      },
      webLinterModule,
      vfs,
    );

    this.#linter.defineParser(PARSER_NAME, this.#parser);

    this.#linter.getRules().forEach((item, name) => {
      this.rules.set(name, {
        name: name,
        description: item.meta?.docs?.description,
        url: item.meta?.docs?.url,
      });
    });

    system.watchFile('/input.*', this.triggerLint);
    system.watchFile('/.eslintrc', this.#applyEslintConfig);
    system.watchFile('/tsconfig.json', this.#applyTSConfig);

    this.#applyEslintConfig('/.eslintrc');
    this.#applyTSConfig('/tsconfig.json');
  }

  triggerLint(filename: string): void {
    console.info('[Editor] linting triggered for file', filename);
    const code = this.#system.readFile(filename) ?? '\n';
    if (code != null) {
      const messages = this.#linter.verify(code, this.#eslintConfig, filename);
      this.onLint.trigger(filename, messages);
    }
  }

  triggerFix(filename: string): TSESLint.Linter.FixReport | undefined {
    const code = this.#system.readFile(filename);
    if (code) {
      return this.#linter.verifyAndFix(code, this.#eslintConfig, {
        filename: filename,
        fix: true,
      });
    }
    return undefined;
  }

  updateParserOptions(sourceType?: TSESLint.SourceType): void {
    this.#eslintConfig.parserOptions ??= {};
    this.#eslintConfig.parserOptions.sourceType = sourceType ?? 'module';
  }

  #resolveEslintConfig(
    cfg: Partial<TSESLint.Linter.Config>,
  ): TSESLint.Linter.Config {
    const config = { rules: {} };
    if (cfg.extends) {
      const cfgExtends = Array.isArray(cfg.extends)
        ? cfg.extends
        : [cfg.extends];
      for (const extendsName of cfgExtends) {
        const maybeConfig = this.#configMap.get(extendsName);
        if (maybeConfig) {
          const resolved = this.#resolveEslintConfig(maybeConfig);
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
  }

  #applyEslintConfig(fileName: string): void {
    try {
      const file = this.#system.readFile(fileName) ?? '{}';
      const parsed = this.#resolveEslintConfig(parseESLintRC(file));
      this.#eslintConfig.rules = parsed.rules;
      console.log('[Editor] Updating', fileName, this.#eslintConfig);
    } catch (e) {
      console.error(e);
    }
  }

  #applyTSConfig(fileName: string): void {
    try {
      const file = this.#system.readFile(fileName) ?? '{}';
      const parsed = parseTSConfig(file).compilerOptions;
      this.#compilerOptions = createCompilerOptions(parsed);
      console.log('[Editor] Updating', fileName, this.#compilerOptions);
      this.#parser.updateConfig(this.#compilerOptions);
    } catch (e) {
      console.error(e);
    }
  }
}
