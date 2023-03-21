import type { JSONSchema4 } from 'json-schema';

import { deepMerge } from './deepMerge';

/**
 * Extends schema with additional properties using `deepMerge`
 * If original schema is wrapped in array, it also returns a wrapped object
 */
export function extendSchema(
  schema: JSONSchema4 | readonly JSONSchema4[],
  additionalProperties: Record<string, unknown>,
): JSONSchema4 | [JSONSchema4] {
  const isWrappedInArray = Array.isArray(schema);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const unwrappedSchema = isWrappedInArray ? schema[0] : schema;

  const mergedSchema: JSONSchema4 = deepMerge(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- https://github.com/microsoft/TypeScript/issues/17002
    unwrappedSchema,
    additionalProperties,
  );

  return isWrappedInArray ? [mergedSchema] : mergedSchema;
}
