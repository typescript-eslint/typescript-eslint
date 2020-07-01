import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import { simpleTraverse } from '@typescript-eslint/typescript-estree';

function getSpecificNode<
  TSelector extends AST_NODE_TYPES,
  TNode extends Extract<TSESTree.Node, { type: TSelector }>
>(ast: TSESTree.Node, selector: TSelector): TNode;
function getSpecificNode<
  TSelector extends AST_NODE_TYPES,
  TNode extends Extract<TSESTree.Node, { type: TSelector }>
>(
  ast: TSESTree.Node,
  selector: TSelector,
  cb: (node: TNode) => boolean | null | undefined,
): TNode;
function getSpecificNode<
  TSelector extends AST_NODE_TYPES,
  TNode extends Extract<TSESTree.Node, { type: TSelector }>,
  TReturnType extends TSESTree.Node
>(
  ast: TSESTree.Node,
  selector: TSelector,
  cb: (node: TNode) => TReturnType | null | undefined,
): TReturnType;

function getSpecificNode(
  ast: TSESTree.Node,
  selector: AST_NODE_TYPES,
  cb?: (node: TSESTree.Node) => TSESTree.Node | boolean | null | undefined,
): TSESTree.Node {
  let node: TSESTree.Node | null | undefined = null;
  simpleTraverse(
    ast,
    {
      [selector](n) {
        const res = cb ? cb(n) : n;
        if (res) {
          // the callback shouldn't match multiple nodes or else tests may behave weirdly
          expect(node).toBeFalsy();
          node = typeof res === 'boolean' ? n : res;
        }
      },
    },
    true,
  );

  // should have found at least one node
  expect(node).not.toBeFalsy();
  return node!;
}

export { getSpecificNode };
