import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import type * as ts from 'typescript';

import type { CreateLinter } from '../linter/createLinter';

const defaultRuleSchema: JSONSchema4 = {
  type: ['string', 'number'],
  enum: ['off', 'warn', 'error', 0, 1, 2],
};

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
  ruleSchema: JSONSchema4 | JSONSchema4[],
): JSONSchema4 {
  if (Array.isArray(ruleSchema)) {
    return {
      type: 'array',
      items: [defaultRuleSchema, ...ruleSchema],
      minItems: 1,
      additionalItems: false,
    };
  }
  // TODO: delete this once we update schemas
  // example: ban-ts-comment
  if (Array.isArray(ruleSchema.prefixItems)) {
    const { prefixItems, ...rest } = ruleSchema;
    return {
      ...rest,
      items: [defaultRuleSchema, ...(prefixItems as JSONSchema4[])],
      maxItems: ruleSchema.maxItems ? ruleSchema.maxItems + 1 : undefined,
      minItems: ruleSchema.minItems ? ruleSchema.minItems + 1 : 1,
      additionalItems: false,
    };
  }
  // example: explicit-member-accessibility
  if (Array.isArray(ruleSchema.items)) {
    return {
      ...ruleSchema,
      items: [defaultRuleSchema, ...ruleSchema.items],
      maxItems: ruleSchema.maxItems ? ruleSchema.maxItems + 1 : undefined,
      minItems: ruleSchema.minItems ? ruleSchema.minItems + 1 : 1,
      additionalItems: false,
    };
  }
  if (typeof ruleSchema.items === 'object' && ruleSchema.items) {
    // this is a workaround for naming-convention rule
    if (ruleSchema.items.oneOf) {
      return {
        ...ruleSchema,
        items: [defaultRuleSchema],
        additionalItems: ruleSchema.items,
      };
    }
    // example: padding-line-between-statements
    return {
      ...ruleSchema,
      items: [defaultRuleSchema, ruleSchema.items],
      additionalItems: false,
    };
  }
  // example eqeqeq
  if (Array.isArray(ruleSchema.anyOf)) {
    return {
      ...ruleSchema,
      anyOf: ruleSchema.anyOf.map(item =>
        getRuleJsonSchemaWithErrorLevel(name, item),
      ),
    };
  }
  // example logical-assignment-operators
  if (Array.isArray(ruleSchema.oneOf)) {
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
    type: 'array',
    items: [defaultRuleSchema],
    minItems: 1,
    additionalItems: false,
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
      description: `${item.description}\n ${item.url}`,
      title: item.name.startsWith('@typescript') ? 'Rules' : 'Core rules',
      default: 'off',
      oneOf: [defaultRuleSchema, { $ref: createRef(item.name) }],
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
