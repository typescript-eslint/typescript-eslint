import type {
  JSONSchema4,
  JSONSchema4ArraySchema,
} from '@typescript-eslint/utils/json-schema';

import { NotSupportedError, UnexpectedError } from './errors';
import { generateType } from './generateType';
import { getCommentLines } from './getCommentLines';
import { isArray } from './isArray';
import type { ArrayAST, AST, RefMap, TupleAST, UnionAST } from './types';

/**
 * If there are more than 20 tuple items then we will not make it a tuple type
 * and instead will just make it an array type for brevity
 */
const MAX_ITEMS_TO_TUPLIZE = 20;

export function generateArrayType(
  schema: JSONSchema4ArraySchema,
  refMap: RefMap,
): ArrayAST | TupleAST | UnionAST {
  if (!schema.items) {
    // it's technically valid to declare things like {type: 'array'} -> any[]
    // but that's obviously dumb and loose so let's not even bother with it
    throw new UnexpectedError('Unexpected missing items', schema);
  }
  if (schema.items && !isArray(schema.items) && schema.additionalItems) {
    throw new NotSupportedError(
      'singlely-typed array with additionalItems',
      schema,
    );
  }

  const commentLines = getCommentLines(schema);

  const minItems = schema.minItems ?? 0;
  const maxItems =
    schema.maxItems != null && schema.maxItems < MAX_ITEMS_TO_TUPLIZE
      ? schema.maxItems
      : -1;
  const hasMinItems = minItems > 0;
  const hasMaxItems = maxItems >= 0;

  let items: JSONSchema4[];
  let spreadItemSchema: JSONSchema4 | null = null;

  if (!isArray(schema.items)) {
    if (hasMinItems || hasMaxItems) {
      // treat as a tuple
      items = Array<JSONSchema4>(
        (hasMaxItems && maxItems) || minItems || 0,
      ).fill(schema.items);
      if (!hasMaxItems) {
        spreadItemSchema =
          typeof schema.additionalItems === 'object'
            ? schema.additionalItems
            : schema.items;
      }
    } else {
      // treat as an array type
      return {
        type: 'array',
        elementType: generateType(schema.items, refMap),
        commentLines,
      };
    }
  } else {
    // treat as a tuple
    items = schema.items;
    if (hasMaxItems && items.length < maxItems) {
      spreadItemSchema =
        typeof schema.additionalItems === 'object'
          ? schema.additionalItems
          : { type: 'any' };
    }
  }

  // quick validation so we generate sensible types
  if (hasMaxItems && maxItems < items.length) {
    throw new UnexpectedError(
      `maxItems (${maxItems}) is smaller than the number of items schemas provided (${items.length})`,
      schema,
    );
  }
  if (maxItems > items.length && spreadItemSchema == null) {
    throw new UnexpectedError(
      'maxItems is larger than the number of items schemas, but there was not an additionalItems schema provided',
      schema,
    );
  }

  const itemTypes = items.map(i => generateType(i, refMap));
  const spreadItem =
    spreadItemSchema == null ? null : generateType(spreadItemSchema, refMap);

  if (itemTypes.length > minItems) {
    /*
    if there are more items than the min, we return a union of tuples instead of
    using the optional element operator. This is done because it is more type-safe.

    // optional element operator
    type A = [string, string?, string?]
    const a: A = ['a', undefined, 'c'] // no error

    // union of tuples
    type B = [string] | [string, string] | [string, string, string]
    const b: B = ['a', undefined, 'c'] // TS error
    */
    const cumulativeTypesList = itemTypes.slice(0, minItems);
    const typesToUnion: AST[] = [];
    if (cumulativeTypesList.length > 0) {
      // actually has minItems, so add the initial state
      typesToUnion.push(createTupleType(cumulativeTypesList));
    } else {
      // no minItems means it's acceptable to have an empty tuple type
      typesToUnion.push(createTupleType([]));
    }

    for (let i = minItems; i < itemTypes.length; i += 1) {
      cumulativeTypesList.push(itemTypes[i]);

      if (i === itemTypes.length - 1) {
        // only the last item in the union should have the spread parameter
        typesToUnion.push(createTupleType(cumulativeTypesList, spreadItem));
      } else {
        typesToUnion.push(createTupleType(cumulativeTypesList));
      }
    }

    return {
      type: 'union',
      elements: typesToUnion,
      commentLines,
    };
  }

  return {
    type: 'tuple',
    elements: itemTypes,
    spreadType: spreadItem,
    commentLines,
  };
}

function createTupleType(
  elements: AST[],
  spreadType: AST | null = null,
): TupleAST {
  return {
    type: 'tuple',
    // clone the array because we know we'll keep mutating it
    elements: [...elements],
    spreadType,
    commentLines: [],
  };
}
