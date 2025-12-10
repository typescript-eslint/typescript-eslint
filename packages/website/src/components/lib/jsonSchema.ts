import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import type * as ts from 'typescript';

import type { CreateLinter } from '../linter/createLinter';

const defaultRuleSchema: JSONSchema4 = {
  enum: ['off', 'warn', 'error', 0, 1, 2],
  type: ['string', 'number'],
};

// https://github.com/microsoft/TypeScript/issues/17002
function isArray(arg: unknown): arg is readonly unknown[] {
  return Array.isArray(arg);
}

/**
 * Add the error level to the rule schema items
 *
 * if you encounter issues with rule schema validation you can check the schema by using the following code in the console:
 * monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas.find(item => item.uri.includes('typescript-eslint/consistent-type-imports'))
 * monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas.find(item => item.uri.includes('no-unused-labels'))
 * monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas.filter(item => item.schema.type === 'array')
 */
export function getRuleJsonSchemaWithErrorLevel(
  name: string,
  ruleSchema: JSONSchema4 | readonly JSONSchema4[],
): JSONSchema4 {
  if (isArray(ruleSchema)) {
    const defaultRuleSchemaCopy = { ...defaultRuleSchema };
    if (ruleSchema[0]?.$defs) {
      defaultRuleSchemaCopy.$defs = ruleSchema[0].$defs;
    }
    return {
      additionalItems: false,
      items: [defaultRuleSchemaCopy, ...ruleSchema],
      minItems: 1,
      type: 'array',
    };
  }
  if ('items' in ruleSchema) {
    // example: explicit-member-accessibility
    if (isArray(ruleSchema.items)) {
      return {
        ...ruleSchema,
        additionalItems: false,
        items: [defaultRuleSchema, ...ruleSchema.items],
        maxItems: ruleSchema.maxItems ? ruleSchema.maxItems + 1 : undefined,
        minItems: ruleSchema.minItems ? ruleSchema.minItems + 1 : 1,
        type: 'array',
      };
    }
    // example: naming-convention rule
    if (typeof ruleSchema.items === 'object') {
      return {
        ...ruleSchema,
        additionalItems: ruleSchema.items,
        items: [defaultRuleSchema],
        maxItems: ruleSchema.maxItems ? ruleSchema.maxItems + 1 : undefined,
        minItems: ruleSchema.minItems ? ruleSchema.minItems + 1 : 1,
        type: 'array',
      };
    }
  }

  // example eqeqeq
  if (isArray(ruleSchema.anyOf)) {
    return {
      ...ruleSchema,
      anyOf: ruleSchema.anyOf.map(item =>
        getRuleJsonSchemaWithErrorLevel(name, item),
      ),
    };
  }
  // example logical-assignment-operators
  if (isArray(ruleSchema.oneOf)) {
    return {
      ...ruleSchema,
      oneOf: ruleSchema.oneOf.map(item =>
        getRuleJsonSchemaWithErrorLevel(name, item),
      ),
    };
  }
  if (typeof ruleSchema !== 'object' || Object.keys(ruleSchema).length) {
    console.error('unsupported rule schema', name, ruleSchema);
  }
  return {
    additionalItems: false,
    items: [defaultRuleSchema],
    minItems: 1,
    type: 'array',
  };
}

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
    properties[item.name] = {
      default: 'off',
      description: `${item.description}\n ${item.url}`,
      oneOf: [defaultRuleSchema, { $ref: createRef(item.name) }],
      title: item.name.startsWith('@typescript') ? 'Rules' : 'Core rules',
    };
  }

  return {
    properties: {
      extends: {
        oneOf: [
          { type: 'string' },
          {
            items: { enum: linter.configs, type: 'string' },
            type: 'array',
            uniqueItems: true,
          },
        ],
      },
      rules: {
        additionalProperties: false,
        properties,
        type: 'object',
      },
    },
    type: 'object',
  };
}

export interface DescribedOptionDeclaration extends ts.OptionDeclarations {
  category: NonNullable<ts.OptionDeclarations['category']>;
  description: NonNullable<ts.OptionDeclarations['description']>;
}

/**
 * Get all typescript options, except for the ones that are not supported by the playground
 * this function uses private API from typescript, and this might break in the future
 */
export function getTypescriptOptions(): DescribedOptionDeclaration[] {
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
    (item): item is DescribedOptionDeclaration =>
      (item.type === 'boolean' ||
        item.type === 'list' ||
        item.type instanceof Map) &&
      !!item.description &&
      !!item.category &&
      !allowedCategories.includes(item.category.message) &&
      !filteredNames.includes(item.name),
  );
}

/**
 * Get the JSON schema for the typescript config
 */
export function getTypescriptJsonSchema(): JSONSchema4 {
  const properties = Object.fromEntries(
    getTypescriptOptions().flatMap(item => {
      let value: JSONSchema4 | undefined;
      if (item.type === 'boolean') {
        value = {
          description: item.description.message,
          type: 'boolean',
        };
      } else if (item.type === 'list' && item.element?.type instanceof Map) {
        const enumValues = [...item.element.type.keys()].map(String);
        value = {
          description: item.description.message,
          items: {
            enum: enumValues,
            type: 'string',
          },
          type: 'array',
        };
      } else if (item.type instanceof Map) {
        const enumValues = [...item.type.keys()].map(String);
        value = {
          description: item.description.message,
          enum: enumValues,
          type: 'string',
        };
      }
      return value ? [[item.name, value] as const] : [];
    }),
  );

  return {
    properties: {
      compilerOptions: {
        properties,
        type: 'object',
      },
    },
    type: 'object',
  };
}
