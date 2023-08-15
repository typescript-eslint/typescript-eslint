import type {
  JSONSchema4,
  JSONSchema4Type,
} from '@typescript-eslint/utils/json-schema';

import { NotSupportedError } from './errors';
import { generateType } from './generateType';
import type { AST, RefMap, UnionAST } from './types';

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
              type: 'literal',
              code: `'${memberSchema.replace(/'/g, "\\'")}'`,
              commentLines: [],
            };

          case 'number':
          case 'boolean':
            return {
              type: 'literal',
              code: `${memberSchema}`,
              commentLines: [],
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
    type: 'union',
    elements,
    commentLines: [],
  };
}
