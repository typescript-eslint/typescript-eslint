import type Monaco from 'monaco-editor';
import type { TSESLint } from '@typescript-eslint/utils';
import type { JSONSchema4 } from '@typescript-eslint/utils/dist/json-schema';

export function createCompilerOptions(
  jsx = false,
  tsConfig: Record<string, unknown> = {},
): Monaco.languages.typescript.CompilerOptions {
  return {
    noResolve: true,
    // ts and monaco has different type as monaco types are not changing base on ts version
    target: window.ts.ScriptTarget.ESNext as number,
    module: window.ts.ModuleKind.ESNext as number,
    ...tsConfig,
    jsx: jsx ? window.ts.JsxEmit.Preserve : window.ts.JsxEmit.None,
  };
}

export interface OptionDeclarations {
  name: string;
  type?: unknown;
  category?: { message: string };
  description?: { message: string };
}

export function getEslintSchema(
  rules: [string, TSESLint.RuleModule<string, unknown[]>][],
): JSONSchema4 {
  let definitions = {};
  const properties = rules.reduce<Record<string, JSONSchema4>>(
    (rules, [name, config]) => {
      if ('definitions' in config.meta.schema) {
        definitions = {
          ...definitions,
          ...config.meta.schema.definitions,
        };
      }

      rules[name] = {
        description: config.meta.docs?.description,
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
    additionalProperties: false,
    definitions,
  };
}

export function getTsConfigSchema(): JSONSchema4 {
  const allowedCategories = [
    'Command-line Options',
    'Modules',
    'Projects',
    'Compiler Diagnostics',
    'Editor Support',
    'Output Formatting',
    'Watch and Build Modes',
    'Source Map Options',
  ];

  // @ts-expect-error: definition is not fully correct
  const properties = (window.ts.optionDeclarations as OptionDeclarations[])
    .filter(
      item =>
        item.type === 'boolean' &&
        item.description &&
        item.category &&
        !allowedCategories.includes(item.category.message),
    )
    .reduce((options, item) => {
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
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  };
}
