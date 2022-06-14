import type { ASTViewerModel, Serializer } from '../types';
import type { TSESTree } from '@typescript-eslint/utils';
import { isRecord } from '../utils';

export const propsToFilter = ['parent', 'comments', 'tokens'];

function isESTreeNode(
  value: unknown,
): value is Record<string, unknown> & TSESTree.BaseNode {
  return isRecord(value) && 'type' in value && 'loc' in value;
}

export function createESTreeSerializer(): Serializer {
  return function serializer(
    data,
    _key,
    processValue,
  ): ASTViewerModel | undefined {
    if (isESTreeNode(data)) {
      return {
        range: {
          start: data.loc.start,
          end: data.loc.end,
        },
        type: 'object',
        name: String(data.type),
        value: processValue(
          Object.entries(data).filter(item => !propsToFilter.includes(item[0])),
        ),
      };
    }
    return undefined;
  };
}
