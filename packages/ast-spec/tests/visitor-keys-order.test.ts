import type { TSESTree } from '@typescript-eslint/typescript-estree';

import {
  AST_NODE_TYPES,
  parse,
  simpleTraverse,
} from '@typescript-eslint/typescript-estree';
import { glob } from 'glob';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const SRC_DIR = path.join(__dirname, '..', 'src');

// The quasis and expressions/types of these nodes alternate in the source,
// so no single ordering of their visitor keys can match source order.
const INTERLEAVED_NODE_TYPES = new Set([
  AST_NODE_TYPES.TemplateLiteral,
  AST_NODE_TYPES.TSTemplateLiteralType,
]);

describe('visitor keys', async () => {
  const fixtures = await glob('**/fixtures/*/fixture.ts?(x)', {
    absolute: true,
    cwd: SRC_DIR,
  });

  it('visit children in source order', async () => {
    const outOfOrder = new Set<string>();

    for (const fixture of fixtures) {
      let ast: TSESTree.Program;
      try {
        ast = parse(await fs.readFile(fixture, 'utf-8'), {
          jsx: fixture.endsWith('x'),
          range: true,
        });
      } catch {
        // fixtures that intentionally fail to parse have no AST to check
        continue;
      }

      const childrenByParent = new Map<TSESTree.Node, TSESTree.Node[]>();
      simpleTraverse(ast, {
        enter(node, parent) {
          if (parent && !INTERLEAVED_NODE_TYPES.has(parent.type)) {
            childrenByParent.set(parent, [
              ...(childrenByParent.get(parent) ?? []),
              node,
            ]);
          }
        },
      });

      for (const [parent, children] of childrenByParent) {
        children.slice(1).forEach((child, i) => {
          if (child.range[0] < children[i].range[0]) {
            outOfOrder.add(
              `${parent.type}: ${children[i].type} -> ${child.type}`,
            );
          }
        });
      }
    }

    expect([...outOfOrder].sort()).toStrictEqual([]);
  });
});
