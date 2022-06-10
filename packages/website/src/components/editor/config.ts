import type Monaco from 'monaco-editor';
import type { JSONSchema4 } from '@typescript-eslint/utils/dist/json-schema';
import { getTypescriptOptions } from '../config/utils';

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
    moduleResolution: undefined,
    plugins: undefined,
    typeRoots: undefined,
    paths: undefined,
    moduleDetection: undefined,
    baseUrl: undefined,
  };

  const libs = Array.isArray(tsConfig.lib) ? tsConfig.lib : ['es6', 'dom'];

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
    if (item.type === 'boolean') {
      options[item.name] = {
        type: 'boolean',
        description: item.description!.message,
      };
    } else if (item.type === 'list' && item.element?.type instanceof Map) {
      options[item.name] = {
        type: 'array',
        items: {
          type: 'string',
          enum: Array.from(item.element.type.keys()),
        },
        description: item.description!.message,
      };
    } else if (item.type instanceof Map) {
      options[item.name] = {
        type: 'string',
        description: item.description!.message,
        enum: Array.from(item.type.keys()),
      };
    }
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
