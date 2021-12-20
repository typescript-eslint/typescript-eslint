import type { ASTViewerModel, Serializer, SelectedRange } from './types';
import type { TSESTree } from '@typescript-eslint/website-eslint';
import { isRecord } from '../utils';

function isESTreeNode(
  value: unknown,
): value is Record<string, unknown> & TSESTree.Node {
  return Boolean(value) && isRecord(value) && 'type' in value && 'loc' in value;
}

function getClassName(value: Record<string, unknown>): string {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (Object.getPrototypeOf(value) as Object).constructor.name.replace(
    /\$[0-9]+$/,
    '',
  );
}

function getNodeName(
  className: string,
  data: Record<string, unknown>,
): string | undefined {
  const id = data.$id != null ? `$${String(data.$id)}` : '';

  if (className === 'ImplicitLibVariable' && data.name === 'const') {
    className = 'ImplicitGlobalConstTypeVariable';
  }

  return `${className}${id}`;
}

function getRange(value: Record<string, unknown>): SelectedRange | undefined {
  if (isESTreeNode(value.block)) {
    return {
      start: value.block.loc.start,
      end: value.block.loc.end,
    };
  } else if (isESTreeNode(value.identifier)) {
    return {
      start: { ...value.identifier.loc.start },
      end: { ...value.identifier.loc.end },
    };
  } else if (isESTreeNode(value.node)) {
    return {
      start: { ...value.node.loc.start },
      end: { ...value.node.loc.end },
    };
  } else if (
    Array.isArray(value.identifiers) &&
    value.identifiers.length > 0 &&
    isESTreeNode(value.identifiers[0])
  ) {
    return {
      start: { ...value.identifiers[0].loc.start },
      end: { ...value.identifiers[0].loc.end },
    };
  }

  return undefined;
}

type NodeType =
  | 'Scope'
  | 'Definition'
  | 'Variable'
  | 'ScopeManager'
  | 'Reference';

function getNodeType(nodeName: string | undefined): NodeType | undefined {
  if (nodeName) {
    if (nodeName === 'ScopeManager') {
      return 'ScopeManager';
    } else if (nodeName.endsWith('Scope')) {
      return 'Scope';
    } else if (nodeName.endsWith('Definition')) {
      return 'Definition';
    } else if (nodeName === 'Variable' || nodeName === 'ImplicitLibVariable') {
      return 'Variable';
    } else if (nodeName === 'Reference') {
      return 'Reference';
    }
  }
  return undefined;
}

function getProps(nodeType: NodeType | undefined): string[] | undefined {
  switch (nodeType) {
    case 'ScopeManager':
      return ['variables', 'scopes', 'references'];
    case 'Scope':
      return [
        'block',
        'isStrict',
        'references',
        'set',
        'type',
        'upper',
        'variables',
        'variableScope',
        'functionExpressionScope',
      ];
    case 'Definition':
      return ['name', 'type', 'node'];
    case 'Reference':
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
    case 'Variable':
      return [
        'defs',
        'name',
        'references',
        'isValueVariable',
        'isTypeVariable',
        'eslintUsed',
        'identifiers',
      ];
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
      const nodeName = getNodeName(className, data);
      const nodeType = getNodeType(className);
      const value = data.name != null ? `<"${String(data.name)}">` : '';

      const uniqName = `${nodeName}${value}`;

      if (SEEN_THINGS.has(uniqName)) {
        return {
          range: getRange(data),
          type: 'ref',
          name: nodeName,
          value: value,
        };
      }
      SEEN_THINGS.add(uniqName);

      let values: [string, unknown][];

      const props = getProps(nodeType);
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
      return {
        type: 'ref',
        name: data.type,
        range: {
          start: { ...data.loc.start },
          end: { ...data.loc.end },
        },
        value: data.type === 'Identifier' ? `<"${data.name}">` : '',
      };
    }

    return undefined;
  };
}
