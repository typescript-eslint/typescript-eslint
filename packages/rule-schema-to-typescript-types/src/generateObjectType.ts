import { requiresQuoting } from '@typescript-eslint/type-utils';
import type { JSONSchema4 } from 'json-schema';

import { generateType } from './generateType';
import { getCommentLines } from './getCommentLines';
import { isArray } from './isArray';
import type { AST, ObjectAST, RefMap } from './types';

export function generateObjectType(
  schema: JSONSchema4,
  refMap: RefMap,
): ObjectAST {
  const commentLines = getCommentLines(schema);

  let indexSignature: AST | null = null;
  if (schema.additionalProperties === true) {
    indexSignature = {
      type: 'type-reference',
      typeName: 'unknown',
      commentLines: [],
    };
  } else if (schema.additionalProperties) {
    const indexSigType = generateType(schema.additionalProperties, refMap);
    indexSignature = indexSigType;
  }

  const properties: ObjectAST['properties'] = [];
  const required = new Set(isArray(schema.required) ? schema.required : []);
  if (schema.properties) {
    const propertyDefs = Object.entries(schema.properties);
    for (const [propName, propSchema] of propertyDefs) {
      const propType = generateType(propSchema, refMap);
      const sanitisedPropName = requiresQuoting(propName)
        ? `'${propName}'`
        : propName;
      properties.push({
        name: sanitisedPropName,
        optional: !required.has(propName),
        type: propType,
      });
    }
  }

  return {
    type: 'object',
    properties,
    indexSignature,
    commentLines,
  };
}
