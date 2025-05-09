import type { NewPlugin } from '@vitest/pretty-format';

import type * as TSESTree from '../../../src/index.js';

import { AST_NODE_TYPES } from '../../../src/index.js';

function sortKeys<Node extends TSESTree.Node>(
  node: Node,
): (keyof typeof node)[] {
  const keySet = new Set(Object.keys(node));

  // type place as first key
  keySet.delete('type');
  // range and loc we place after all properties
  keySet.delete('range');
  keySet.delete('loc');

  // babel keys
  keySet.delete('start');
  keySet.delete('end');
  if (node.type === AST_NODE_TYPES.Program) {
    keySet.delete('interpreter');
  }

  return [...keySet].sort((a, b) =>
    a.localeCompare(b),
  ) as (keyof typeof node)[];
}

function stringifyLineAndColumn(loc: TSESTree.Position): string {
  return `{ column: ${loc.column.toString()}, line: ${loc.line.toString()} }`;
}

function isObject(val: unknown): val is Record<string, unknown> {
  return val != null && typeof val === 'object';
}
function hasValidType(type: unknown): type is string {
  return typeof type === 'string';
}

export const serializer: NewPlugin = {
  serialize(
    node: Record<string, unknown> & TSESTree.Node,
    config,
    indentation,
    depth,
    refs,
    printer,
  ) {
    const keys = sortKeys(node);
    const { loc, range, type } = node;

    const outputLines = [];
    const childIndentation = indentation + config.indent;

    const printValue = (value: unknown): string =>
      printer(value, config, childIndentation, depth, refs);

    outputLines.push(`${type} {`);
    outputLines.push(`${childIndentation}type: ${printValue(type)},`);

    for (const key of keys) {
      const value = node[key];
      // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish -- intentional strict equality
      if (value === undefined) {
        continue;
      }

      outputLines.push(`${childIndentation}${key}: ${printValue(value)},`);
    }

    outputLines.push('');
    outputLines.push(`${childIndentation}range: [${range.join(', ')}],`);
    outputLines.push(
      `${childIndentation}loc: {`,
      `${childIndentation}${config.indent}start: ${stringifyLineAndColumn(
        loc.start,
      )},`,
      `${childIndentation}${config.indent}end: ${stringifyLineAndColumn(
        loc.end,
      )},`,
      `${childIndentation}},`,
    );
    outputLines.push(`${indentation}}`);

    return outputLines.join('\n');
  },
  test(val: unknown) {
    return isObject(val) && hasValidType(val.type);
  },
};
