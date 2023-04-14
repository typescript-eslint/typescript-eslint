import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import type * as ts from 'typescript';

import type { CreateLinter } from '../linter/createLinter';

const defaultRuleSchema: JSONSchema4 = {
  type: ['string', 'number'],
  enum: ['off', 'warn', 'error', 0, 1, 2],
};

/**
 * Get the JSON schema for the eslint config
 * Currently we only support the rules and extends
 */
export function getEslintJsonSchema(
  linter: CreateLinter,
  createRef: (name: string) => string,
): JSONSchema4 {
  const properties: Record<string, JSONSchema4> = {};

  for (const [, item] of linter.rules) {
    const ruleRefName = createRef(item.name);
    const schemaItemOptions: JSONSchema4[] = [defaultRuleSchema];
    let additionalItems: JSONSchema4 | false = false;

    // if the rule has options, add them to the schema
    // if you encounter issues with rule schema validation you can check the schema by using the following code in the console:
    // monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas.find(item => item.uri === 'file:///rules/typescript-eslint/consistent-type-imports.json')
    // monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas.filter(item => item.schema.type === 'array')
    if (Array.isArray(item.schema)) {
      // example @typescript-eslint/consistent-type-imports
      for (let index = 0; index < item.schema?.length; ++index) {
        schemaItemOptions.push({
          $ref: `${ruleRefName}#/${index}`,
        });
      }
    } else {
      const name = item.schema.items ? 'items' : 'prefixItems';
      const items = item.schema[name] as
        | JSONSchema4[]
        | JSONSchema4
        | undefined;
      if (items) {
        if (Array.isArray(items)) {
          // example array-element-newline
          for (let index = 0; index < items.length; ++index) {
            schemaItemOptions.push({
              $ref: `${ruleRefName}#/${name}/${index}`,
            });
          }
        } else {
          // example @typescript-eslint/naming-convention
          additionalItems = {
            $ref: `${ruleRefName}#/${name}`,
          };
        }
      }
    }

    properties[item.name] = {
      description: `${item.description}\n ${item.url}`,
      title: item.name.startsWith('@typescript') ? 'Rules' : 'Core rules',
      default: 'off',
      oneOf: [
        defaultRuleSchema,
        {
          type: 'array',
          items: schemaItemOptions,
          additionalItems: additionalItems,
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
