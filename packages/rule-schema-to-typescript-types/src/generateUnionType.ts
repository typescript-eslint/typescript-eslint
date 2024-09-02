import type {
  JSONSchema4,
  JSONSchema4Type,
} from '@typescript-eslint/utils/json-schema';

import type { AST, RefMap, UnionAST } from './types';

import { NotSupportedError } from './errors';
import { generateType } from './generateType';

export function generateUnionType(
  members: (JSONSchema4 | JSONSchema4Type)[],
  refMap: RefMap,
): UnionAST {
  const elements: AST[] = [];

  for (const memberSchema of members) {
    elements.push(
      ((): AST => {
        switch (typeof memberSchema) {
          case 'string':
            return {
              code: `'${memberSchema.replaceAll("'", "\\'")}'`,
              commentLines: [],
              type: 'literal',
            };

          case 'number':
          case 'boolean':
            return {
              code: `${memberSchema}`,
              commentLines: [],
              type: 'literal',
            };

          case 'object':
            if (memberSchema == null) {
              throw new NotSupportedError('null in an enum', memberSchema);
            }
            if (Array.isArray(memberSchema)) {
              throw new NotSupportedError('array in an enum', memberSchema);
            }
            return generateType(memberSchema, refMap);
        }
      })(),
    );
  }

  return {
    commentLines: [],
    elements,
    type: 'union',
  };
}
