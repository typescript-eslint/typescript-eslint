import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import { simpleTraverse } from '@typescript-eslint/typescript-estree';

function getSpecificNode<
  Selector extends AST_NODE_TYPES,
  Node extends Extract<TSESTree.Node, { type: Selector }>,
>(
  ast: TSESTree.Node,
  selector: Selector,
  cb?: (node: Node) => boolean | null | undefined,
): Node;
function getSpecificNode<
  Selector extends AST_NODE_TYPES,
  Node extends Extract<TSESTree.Node, { type: Selector }>,
  ReturnType extends TSESTree.Node,
>(
  ast: TSESTree.Node,
  selector: Selector,
  cb: (node: Node) => ReturnType | null | undefined,
): ReturnType;

function getSpecificNode(
  ast: TSESTree.Node,
  selector: AST_NODE_TYPES,
  cb?: (node: TSESTree.Node) => TSESTree.Node | boolean | null | undefined,
): TSESTree.Node {
  let node: TSESTree.Node | null | undefined = null;
  simpleTraverse(
    ast,
    {
      visitors: {
        [selector](n) {
          const res = cb ? cb(n) : n;
          if (res) {
            // the callback shouldn't match multiple nodes or else tests may behave weirdly
            expect(node).toBeFalsy();
            node = typeof res === 'boolean' ? n : res;
          }
        },
      },
    },
    true,
  );

  // should have found at least one node
  expect(node).not.toBeFalsy();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return node!;
}

export { getSpecificNode };
