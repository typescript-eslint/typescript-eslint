import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-loop-func';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-loop-func',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow function declarations that contain unsafe references inside loop statements',
      category: 'Best Practices',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: [],
    messages: baseRule?.meta.messages ?? {
      unsafeRefs:
        'Function declared in a loop contains unsafe references to variable(s) {{ varNames }}.',
    },
  },
  defaultOptions: [],
  create(context) {
    /**
     * Reports functions which match the following condition:
     * - has a loop node in ancestors.
     * - has any references which refers to an unsafe variable.
     *
     * @param node The AST node to check.
     * @returns Whether or not the node is within a loop.
     */
    function checkForLoops(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionExpression
        | TSESTree.FunctionDeclaration,
    ): void {
      const loopNode = getContainingLoopNode(node);

      if (!loopNode) {
        return;
      }

      const references = context.getScope().through;
      const unsafeRefs = references
        .filter(r => !isSafe(loopNode, r))
        .map(r => r.identifier.name);

      if (unsafeRefs.length > 0) {
        context.report({
          node,
          messageId: 'unsafeRefs',
          data: { varNames: `'${unsafeRefs.join("', '")}'` },
        });
      }
    }

    return {
      ArrowFunctionExpression: checkForLoops,
      FunctionExpression: checkForLoops,
      FunctionDeclaration: checkForLoops,
    };
  },
});

/**
 * Gets the containing loop node of a specified node.
 *
 * We don't need to check nested functions, so this ignores those.
 * `Scope.through` contains references of nested functions.
 *
 * @param node An AST node to get.
 * @returns The containing loop node of the specified node, or `null`.
 */
function getContainingLoopNode(node: TSESTree.Node): TSESTree.Node | null {
  for (
    let currentNode = node;
    currentNode.parent;
    currentNode = currentNode.parent
  ) {
    const parent = currentNode.parent;

    switch (parent.type) {
      case AST_NODE_TYPES.WhileStatement:
      case AST_NODE_TYPES.DoWhileStatement:
        return parent;

      case AST_NODE_TYPES.ForStatement:
        // `init` is outside of the loop.
        if (parent.init !== currentNode) {
          return parent;
        }
        break;

      case AST_NODE_TYPES.ForInStatement:
      case AST_NODE_TYPES.ForOfStatement:
        // `right` is outside of the loop.
        if (parent.right !== currentNode) {
          return parent;
        }
        break;

      case AST_NODE_TYPES.ArrowFunctionExpression:
      case AST_NODE_TYPES.FunctionExpression:
      case AST_NODE_TYPES.FunctionDeclaration:
        // We don't need to check nested functions.
        return null;

      default:
        break;
    }
  }

  return null;
}

/**
 * Gets the containing loop node of a given node.
 * If the loop was nested, this returns the most outer loop.
 * @param node A node to get. This is a loop node.
 * @param excludedNode A node that the result node should not include.
 * @returns The most outer loop node.
 */
function getTopLoopNode(
  node: TSESTree.Node,
  excludedNode: TSESTree.Node | null | undefined,
): TSESTree.Node {
  const border = excludedNode ? excludedNode.range[1] : 0;
  let retv = node;
  let containingLoopNode: TSESTree.Node | null = node;

  while (containingLoopNode && containingLoopNode.range[0] >= border) {
    retv = containingLoopNode;
    containingLoopNode = getContainingLoopNode(containingLoopNode);
  }

  return retv;
}

/**
 * Checks whether a given reference which refers to an upper scope's variable is
 * safe or not.
 * @param loopNode A containing loop node.
 * @param reference A reference to check.
 * @returns `true` if the reference is safe or not.
 */
function isSafe(
  loopNode: TSESTree.Node,
  reference: TSESLint.Scope.Reference,
): boolean {
  const variable = reference.resolved;
  const definition = variable?.defs[0];
  const declaration = definition?.parent;
  const kind =
    declaration?.type === AST_NODE_TYPES.VariableDeclaration
      ? declaration.kind
      : '';

  // type references are all safe
  // this only really matters for global types that haven't been configured
  if (reference.isTypeReference) {
    return true;
  }

  // Variables which are declared by `const` is safe.
  if (kind === 'const') {
    return true;
  }

  /*
   * Variables which are declared by `let` in the loop is safe.
   * It's a different instance from the next loop step's.
   */
  if (
    kind === 'let' &&
    declaration &&
    declaration.range[0] > loopNode.range[0] &&
    declaration.range[1] < loopNode.range[1]
  ) {
    return true;
  }

  /*
   * WriteReferences which exist after this border are unsafe because those
   * can modify the variable.
   */
  const border = getTopLoopNode(loopNode, kind === 'let' ? declaration : null)
    .range[0];

  /**
   * Checks whether a given reference is safe or not.
   * The reference is every reference of the upper scope's variable we are
   * looking now.
   *
   * It's safe if the reference matches one of the following condition.
   * - is readonly.
   * - doesn't exist inside a local function and after the border.
   *
   * @param upperRef A reference to check.
   * @returns `true` if the reference is safe.
   */
  function isSafeReference(upperRef: TSESLint.Scope.Reference): boolean {
    const id = upperRef.identifier;

    return (
      !upperRef.isWrite() ||
      (variable?.scope?.variableScope === upperRef.from.variableScope &&
        id.range[0] < border)
    );
  }

  return variable?.references.every(isSafeReference) ?? false;
}
