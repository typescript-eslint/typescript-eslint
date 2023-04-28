import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';

import { NotSupportedError, UnexpectedError } from './errors';
import { generateArrayType } from './generateArrayType';
import { generateObjectType } from './generateObjectType';
import { generateUnionType } from './generateUnionType';
import { getCommentLines } from './getCommentLines';
import { isArray } from './isArray';
import type { AST, RefMap } from './types';

// keywords we probably should support but currently do not support
const UNSUPPORTED_KEYWORDS = new Set([
  'allOf',
  'dependencies',
  'extends',
  'maxProperties',
  'minProperties',
  'multipleOf',
  'not',
  'patternProperties',
]);

export function generateType(schema: JSONSchema4, refMap: RefMap): AST {
  const unsupportedProps = Object.keys(schema).filter(key =>
    UNSUPPORTED_KEYWORDS.has(key),
  );
  if (unsupportedProps.length > 0) {
    throw new NotSupportedError(unsupportedProps.join(','), schema);
  }

  const commentLines = getCommentLines(schema);

  if (schema.$ref) {
    const refName = refMap.get(schema.$ref);
    if (refName == null) {
      throw new UnexpectedError(
        `Could not find definition for $ref ${
          schema.$ref
        }.\nAvailable refs:\n${Array.from(refMap.keys()).join('\n')})`,
        schema,
      );
    }
    return {
      type: 'type-reference',
      typeName: refName,
      commentLines,
    };
  }
  if ('enum' in schema && schema.enum) {
    return {
      ...generateUnionType(schema.enum, refMap),
      commentLines,
    };
  }
  if ('anyOf' in schema && schema.anyOf) {
    return {
      // a union isn't *TECHNICALLY* correct - technically anyOf is actually
      // anyOf: [T, U, V] -> T | U | V | T & U | T & V | U & V
      // in practice though it is most used to emulate a oneOf
      ...generateUnionType(schema.anyOf, refMap),
      commentLines,
    };
  }
  if ('oneOf' in schema && schema.oneOf) {
    return {
      ...generateUnionType(schema.oneOf, refMap),
      commentLines,
    };
  }

  if (!('type' in schema) || schema.type == null) {
    throw new NotSupportedError(
      'untyped schemas without one of [$ref, enum, oneOf]',
      schema,
    );
  }
  if (isArray(schema.type)) {
    throw new NotSupportedError('schemas with multiple types', schema);
  }

  switch (schema.type) {
    case 'any':
      return {
        type: 'type-reference',
        typeName: 'unknown',
        commentLines,
      };

    case 'null':
      return {
        type: 'type-reference',
        typeName: 'null',
        commentLines,
      };

    case 'number':
    case 'string':
      return {
        type: 'literal',
        code: schema.type,
        commentLines,
      };

    case 'array':
      return generateArrayType(schema, refMap);

    case 'boolean':
      return {
        type: 'type-reference',
        typeName: 'boolean',
        commentLines,
      };

    case 'integer':
      return {
        type: 'type-reference',
        typeName: 'number',
        commentLines,
      };

    case 'object':
      return generateObjectType(schema, refMap);
  }
}
