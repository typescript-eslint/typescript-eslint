import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import type * as ts from 'typescript';

import type { CreateLinter } from '../linter/createLinter';

/**
 * Get the JSON schema for the eslint config
 * Currently we only support the rules and extends
 */
export function getEslintJsonSchema(linter: CreateLinter): JSONSchema4 {
  const properties: Record<string, JSONSchema4> = {};

  for (const [, item] of linter.rules) {
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

/**
 * Get all typescript options, except for the ones that are not supported by the playground
 * this function uses private API from typescript, and this might break in the future
 */
export function getTypescriptOptions(): ts.OptionDeclarations[] {
  const allowedCategories = [
    'Command-line Options',
    'Projects',
    'Compiler Diagnostics',
    'Editor Support',
    'Output Formatting',
    'Watch and Build Modes',
    'Source Map Options',
  ];

  const filteredNames = [
    'moduleResolution',
    'moduleDetection',
    'plugins',
    'typeRoots',
    'jsx',
  ];

  return window.ts.optionDeclarations.filter(
    item =>
      (item.type === 'boolean' ||
        item.type === 'list' ||
        item.type instanceof Map) &&
      item.description &&
      item.category &&
      !allowedCategories.includes(item.category.message) &&
      !filteredNames.includes(item.name),
  );
}

/**
 * Get the JSON schema for the typescript config
 */
export function getTypescriptJsonSchema(): JSONSchema4 {
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
