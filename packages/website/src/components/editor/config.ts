import type Monaco from 'monaco-editor';
import type { JSONSchema4 } from '@typescript-eslint/utils/dist/json-schema';
import { getTypescriptOptions } from '../config/utils';

type StringMap = Map<string, string>;
declare module 'typescript' {
  /**
   * Map of available libraries
   *
   * The key is the key used in compilerOptions.lib
   * The value is the file name
   */
  const libMap: StringMap;
}

export function createCompilerOptions(
  jsx = false,
  tsConfig: Record<string, unknown> = {},
): Monaco.languages.typescript.CompilerOptions {
  const config: Monaco.languages.typescript.CompilerOptions = {
    // ts and monaco has different type as monaco types are not changing base on ts version
    target: window.ts.ScriptTarget.ESNext as number,
    module: window.ts.ModuleKind.ESNext as number,
    ...tsConfig,
    jsx: jsx ? window.ts.JsxEmit.Preserve : window.ts.JsxEmit.None,
  };

  const libs = Array.isArray(tsConfig.lib)
    ? tsConfig.lib
    : ['/' + window.ts.getDefaultLibFileName(config)];

  config.lib = libs.map(
    item => window.ts.libMap.get(String(item)) ?? String(item),
  );

  return config;
}

export function getEslintSchema(
  rules: { name: string; description?: string }[],
): JSONSchema4 {
  const properties = rules.reduce<Record<string, JSONSchema4>>(
    (rules, item) => {
      rules[item.name] = {
        description: item.description,
        oneOf: [
          {
            type: ['string', 'number'],
            enum: ['off', 'warn', 'error', 0, 1, 2],
          },
          {
            type: 'array',
            items: [
              {
                type: ['string', 'number'],
                enum: ['off', 'warn', 'error', 0, 1, 2],
              },
            ],
          },
        ],
      };
      return rules;
    },
    {},
  );

  return {
    type: 'object',
    properties: {
      rules: {
        type: 'object',
        properties: properties,
        additionalProperties: false,
      },
    },
  };
}

export function getTsConfigSchema(): JSONSchema4 {
  const properties = getTypescriptOptions().reduce((options, item) => {
    options[item.name] = {
      type: item.type,
      description: item.description!.message,
    };
    return options;
  }, {});

  return {
    type: 'object',
    properties: {
      compilerOptions: {
        type: 'object',
        properties: properties,
      },
    },
  };
}
