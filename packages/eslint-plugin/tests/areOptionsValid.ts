import type { RuleModule } from '@typescript-eslint/utils/src/ts-eslint';
import Ajv from 'ajv';
import type { JSONSchema4 } from 'json-schema';

const ajv = new Ajv({ async: false });

export function areOptionsValid(
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
