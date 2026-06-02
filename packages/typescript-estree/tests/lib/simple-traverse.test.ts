import type { TSESTree } from '../../src/ts-estree';

import { simpleTraverse } from '../../src/simple-traverse';

function createNode(
  type: string,
  data: Record<string, unknown> = {},
): TSESTree.Node {
  return {
    type,
    ...data,
  } as unknown as TSESTree.Node;
}

describe(simpleTraverse, () => {
  it('visits nodes in order and sets parent pointers', () => {
    const grandchild = createNode('Grandchild');
    const child = createNode('Child', { child: grandchild });
    const sibling = createNode('Sibling');
    const root = createNode('Root', {
      children: [child, null],
      sibling,
    });
    const visited: string[] = [];

    simpleTraverse(
      root,
      {
        enter: (node, parent) => {
          visited.push(`${node.type}:${parent?.type ?? 'none'}`);
        },
        visitorKeys: {
          Child: ['child'],
          Grandchild: [],
          Root: ['children', 'sibling'],
          Sibling: [],
        },
      },
      true,
    );

    expect(visited).toStrictEqual([
      'Root:none',
      'Child:Root',
      'Grandchild:Child',
      'Sibling:Root',
    ]);
    expect(root.parent).toBeUndefined();
    expect(child.parent).toBe(root);
    expect(grandchild.parent).toBe(child);
    expect(sibling.parent).toBe(root);
  });

  it('supports node-specific visitors', () => {
    const child = createNode('Child');
    const root = createNode('Root', { child });
    const visited: string[] = [];

    simpleTraverse(root, {
      visitorKeys: {
        Child: [],
        Root: ['child'],
      },
      visitors: {
        Child: (node, parent) => {
          visited.push(`${node.type}:${parent?.type ?? 'none'}`);
        },
      },
    });

    expect(visited).toStrictEqual(['Child:Root']);
  });

  it('traverses deeply nested nodes without overflowing the call stack', () => {
    const depth = 6_000;
    let node = createNode('Leaf');

    for (let index = 0; index < depth; index += 1) {
      node = createNode('Nested', { child: node });
    }

    let visited = 0;

    simpleTraverse(node, {
      enter: () => {
        visited += 1;
      },
      visitorKeys: {
        Leaf: [],
        Nested: ['child'],
      },
    });

    expect(visited).toBe(depth + 1);
  });
});
