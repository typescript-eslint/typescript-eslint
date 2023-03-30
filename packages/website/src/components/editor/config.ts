import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import type Monaco from 'monaco-editor';

import { getTypescriptOptions } from '../config/utils';
import type { WebLinter } from '../linter/WebLinter';

export function createCompilerOptions(
  jsx = false,
  tsConfig: Record<string, unknown> = {},
): Monaco.languages.typescript.CompilerOptions {
  const config = window.ts.convertCompilerOptionsFromJson(
    {
      // ts and monaco has different type as monaco types are not changing base on ts version
      target: 'esnext',
      module: 'esnext',
      ...tsConfig,
      jsx: jsx ? 'preserve' : undefined,
      lib: Array.isArray(tsConfig.lib) ? tsConfig.lib : undefined,
      moduleResolution: undefined,
      plugins: undefined,
      typeRoots: undefined,
      paths: undefined,
      moduleDetection: undefined,
      baseUrl: undefined,
    },
    '/tsconfig.json',
  );

  const options = config.options as Monaco.languages.typescript.CompilerOptions;

  if (!options.lib) {
    options.lib = [window.ts.getDefaultLibFileName(options)];
  }

  return options;
}

export function getEslintSchema(linter: WebLinter): JSONSchema4 {
  const properties: Record<string, JSONSchema4> = {};

  for (const [, item] of linter.rulesMap) {
    properties[item.name] = {
      description: `${item.description}\n ${item.url}`,
      title: item.name.startsWith('@typescript') ? 'Rules' : 'Core rules',
      default: 'off',
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
  }

  return {
    type: 'object',
    properties: {
      extends: {
        oneOf: [
          { type: 'string' },
          {
            type: 'array',
            items: { type: 'string', enum: Object.keys(linter.configs) },
            uniqueItems: true,
          },
        ],
      },
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
