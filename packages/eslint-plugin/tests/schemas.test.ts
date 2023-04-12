import type { RuleModule } from '@typescript-eslint/utils/src/ts-eslint';
import Ajv from 'ajv';
import type { JSONSchema4 } from 'json-schema';

import eslintPlugin from '../src';

describe("Validating rule's schemas", () => {
  // These two have defaults which cover multiple arguments that are incompatible
  const overrideOptions: Record<string, unknown> = {
    semi: ['never'],
    'func-call-spacing': ['never'],
  };

  for (const [ruleName, rule] of Object.entries(eslintPlugin.rules)) {
    test(`${ruleName} must accept valid arguments`, () => {
      if (!isValid(rule, overrideOptions[ruleName] ?? rule.defaultOptions)) {
        throw new Error(
          `Options failed validation against rule's schema, with errors: ${JSON.stringify(
            ajv.errors,
          )}`,
        );
      }
    });

    test(`${ruleName} rejects arbitrary arguments`, () => {
      if (isValid(rule, [{ 'arbitrary-schemas.test.ts': true }])) {
        throw new Error(`Options succeeded validation for arbitrary options`);
      }
    });
  }
});

describe('Individual rule schema validation', () => {
  // https://github.com/typescript-eslint/typescript-eslint/issues/6852
  test("array-type does not accept 'simple-array' option", () => {
    const rule = eslintPlugin.rules['array-type'];

    if (isValid(rule, [{ default: 'simple-array' }])) {
      throw new Error(`Options succeeded validation for bad options`);
    }
  });

  // https://github.com/typescript-eslint/typescript-eslint/issues/6892
  test('array-type does not accept non object option', () => {
    const rule = eslintPlugin.rules['array-type'];

    if (isValid(rule, ['array'])) {
      throw new Error(`Options succeeded validation for bad options`);
    }
  });
});

const ajv = new Ajv({ async: false });

function isValid(
  rule: RuleModule<string, unknown[]>,
  options: unknown,
): boolean {
  const normalizedSchema = normalizeSchema(rule.meta.schema);

  const valid = ajv.validate(normalizedSchema, options);
  if (typeof valid !== 'boolean') {
    // Schema could not validate options synchronously. This is not allowed for ESLint rules.
    return false;
  }

  return valid;
}

function normalizeSchema(
  schema: JSONSchema4 | readonly JSONSchema4[],
): JSONSchema4 {
  if (!Array.isArray(schema)) {
    return schema;
  }

  if (schema.length === 0) {
    return {
      type: 'array',
      minItems: 0,
      maxItems: 0,
    };
  }

  return {
    type: 'array',
    items: schema,
    minItems: 0,
    maxItems: schema.length,
  };
}
