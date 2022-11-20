import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('no-useless-constructor');

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

/**
 * Check if method with accessibility is not useless
 */
function checkAccessibilityStandalone(
  node: TSESTree.MethodDefinition,
): boolean {
  switch (node.accessibility) {
    case 'protected':
    case 'private':
      return false;
    case 'public':
      if (
        node.parent?.type === AST_NODE_TYPES.ClassBody &&
        node.parent.parent &&
        'superClass' in node.parent.parent &&
        node.parent.parent.superClass
      ) {
        return false;
      }
      break;
  }
  return true;
}

/**
 * Check if method is not useless due to typescript parameter properties and decorators
 */
function checkParams(node: TSESTree.MethodDefinition): boolean {
  return !node.value.params.some(
    param =>
      param.type === AST_NODE_TYPES.TSParameterProperty ||
      param.decorators?.length,
  );
}

function getTypeScriptAccessibility(
  node:
    | ts.ConstructorDeclaration
    | ts.ConstructSignatureDeclaration
    | undefined,
): TSESTree.Accessibility {
  switch (util.getModifiers(node)?.[0].kind) {
    case ts.SyntaxKind.ProtectedKeyword:
      return 'protected';
    case ts.SyntaxKind.PrivateKeyword:
      return 'private';
    default:
      return 'public';
  }
}

export default util.createRule<Options, MessageIds>({
  name: 'no-useless-constructor',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary constructors',
      recommended: 'strict',
      requiresTypeChecking: true,
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    // TODO: this rule has only had messages since v7.0 - remove this when we remove support for v6
    messages: baseRule.meta.messages ?? {
      noUselessConstructor: 'Useless constructor.',
    },
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);
    return {
      MethodDefinition(node): void {
        if (
          node.value?.type === AST_NODE_TYPES.FunctionExpression &&
          node.value.body &&
          checkParams(node) &&
          checkAccessibility(node)
        ) {
          rules.MethodDefinition(node);
        }
      },
    };

    function checkAccessibility(node: TSESTree.MethodDefinition): boolean {
      const parent = (node.parent as TSESTree.ClassBody).parent as
        | TSESTree.ClassDeclaration
        | TSESTree.ClassExpression;
      if (!parent.superClass) {
        return checkAccessibilityStandalone(node);
      }

      const parserServices = util.getParserServices(context);
      const checker = parserServices.program.getTypeChecker();

      const superClassNode = parserServices.esTreeNodeToTSNodeMap.get(
        parent.superClass,
      );
      const parentType = checker.getTypeAtLocation(superClassNode);
      const parentSymbol = parentType.getSymbol();
      const parentConstructor = parentSymbol?.members?.get(
        '__constructor' as ts.__String,
      );
      const parentConstructorDeclaration =
        parentConstructor?.getDeclarations()?.[0] as
          | ts.ConstructorDeclaration
          | ts.ConstructSignatureDeclaration
          | undefined;
      if (!parentConstructorDeclaration) {
        return checkAccessibilityStandalone(node);
      }

      return (
        getTypeScriptAccessibility(parentConstructorDeclaration) ===
        (node.accessibility ?? 'public')
      );
    }
  },
});
