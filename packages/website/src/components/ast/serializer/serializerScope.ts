import type { ASTViewerModel, Serializer, SelectedRange } from './types';
import type { TSESTree } from '@typescript-eslint/website-eslint';
import { isRecord } from '../utils';

function isESTreeNode(
  value: unknown,
): value is Record<string, unknown> & TSESTree.BaseNode {
  return isRecord(value) && 'type' in value && 'loc' in value;
}

export function getClassName(value: Record<string, unknown>): string {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (Object.getPrototypeOf(value) as Object).constructor.name.replace(
    /\$[0-9]+$/,
    '',
  );
}

export function getNodeName(data: Record<string, unknown>): string | undefined {
  const id = data.$id != null ? `$${String(data.$id)}` : '';

  const constructorName = getClassName(data);

  if (constructorName === 'ImplicitLibVariable' && data.name === 'const') {
    return 'ImplicitGlobalConstTypeVariable';
  }

  return `${constructorName}${id}`;
}

export function getRange(
  value: Record<string, unknown>,
): SelectedRange | undefined {
  if (isESTreeNode(value.block)) {
    return {
      start: value.block.loc.start,
      end: value.block.loc.end,
    };
  }
  return undefined;
}

export const propsToFilter = [
  'parent',
  'comments',
  'tokens',
  'block',
  'upper',
  '$id',
];

export function createScopeSerializer(): Serializer {
  const SEEN_THINGS = new Set<unknown>();

  return function serializer(
    data,
    _key,
    processValue,
  ): ASTViewerModel | undefined {
    const className = getClassName(data);
    if (className !== 'Object') {
      const nodeName = getNodeName(data);

      if (SEEN_THINGS.has(nodeName)) {
        return {
          type: 'ref',
          value: `${nodeName}`,
        };
      }
      SEEN_THINGS.add(nodeName);

      const value = Object.entries(data);

      switch (nodeName) {
        case '':
          break;
      }

      return {
        range: getRange(data),
        type: 'object',
        name: nodeName,
        value: processValue(value),
      };
    } else {
      return {
        type: 'object',
        value: [],
      };
    }
    // return undefined;
  };
}
