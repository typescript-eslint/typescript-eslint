import type { ASTViewerModel, Serializer, SelectedRange } from './types';
import type { TSESTree } from '@typescript-eslint/website-eslint';
import { isRecord } from '../utils';

function isESTreeNode(
  value: unknown,
): value is Record<string, unknown> & TSESTree.Node {
  return Boolean(value) && isRecord(value) && 'type' in value && 'loc' in value;
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

  let constructorName = getClassName(data);

  if (constructorName === 'ImplicitLibVariable' && data.name === 'const') {
    constructorName = 'ImplicitGlobalConstTypeVariable';
  }

  return `${constructorName}${id}${name}`;
}

export function getRange(
  value: Record<string, unknown>,
): SelectedRange | undefined {
  if (isESTreeNode(value.block)) {
    return {
      start: value.block.loc.start,
      end: value.block.loc.end,
    };
  } else if (isESTreeNode(value.identifier)) {
    return {
      start: value.identifier.loc.start,
      end: value.identifier.loc.end,
    };
  }
  return undefined;
}

export function getProps(nodeName: string | undefined): string[] | undefined {
  if (nodeName) {
    if (nodeName.endsWith('Scope')) {
      return [
        'block',
        'isStrict',
        'references',
        'set',
        'type',
        'upper',
        'variables',
      ];
    } else if (nodeName.endsWith('Definition')) {
      return ['name', 'node'];
    } else if (nodeName === 'Reference') {
      return [
        'identifier',
        'init',
        'isRead',
        'isTypeReference',
        'isValueReference',
        'isWrite',
        'resolved',
        'writeExpr',
      ];
    } else if (nodeName === 'Variable' || nodeName === 'ImplicitLibVariable') {
      return [
        'defs',
        'name',
        'references',
        'isValueVariable',
        'isTypeVariable',
      ];
    } else if (nodeName === 'ScopeManager') {
      return ['variables', 'scopes'];
    }
  }
  return undefined;
}

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
          range: getRange(data),
          type: 'ref',
          name: nodeName,
          value: data.name != null ? `<"${String(data.name)}">` : '',
        };
      }
      SEEN_THINGS.add(nodeName);

      let values: [string, unknown][];

      const props = getProps(className);
      if (props) {
        values = props.map(key => [key, data[key]]);
      } else {
        values = Object.entries(data);
      }

      return {
        range: getRange(data),
        type: 'object',
        name: nodeName,
        value: processValue(values),
      };
    }

    if (isESTreeNode(data)) {
      if (data.type === 'Identifier') {
        return {
          type: 'ref',
          name: data.type,
          value: `<"${data.name}">`,
        };
      }

      return {
        type: 'ref',
        name: data.type,
        value: '',
      };
    }

    return undefined;
  };
}
