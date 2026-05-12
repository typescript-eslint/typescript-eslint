import type { RuleModule } from '@typescript-eslint/utils/ts-eslint';
import type { JSONSchema4 } from 'json-schema';

import { TSUtils } from '@typescript-eslint/utils';
import Ajv from 'ajv';

const ajv = new Ajv({ async: false });

export function areOptionsValid(
  rule: RuleModule<string, readonly unknown[]>,
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
  if (!TSUtils.isArray(schema)) {
    return schema;
  }

  if (schema.length === 0) {
    return {
      maxItems: 0,
      minItems: 0,
      type: 'array',
    };
  }

  return {
    items: schema,
    maxItems: schema.length,
    minItems: 0,
    type: 'array',
  };
}
