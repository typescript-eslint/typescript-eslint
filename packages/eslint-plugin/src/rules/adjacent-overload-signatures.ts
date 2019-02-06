/**
 * @fileoverview Enforces member overloads to be consecutive.
 * @author Patricio Trevino
 */

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [];
type MessageIds = 'adjacentSignature';

type RuleNode =
  | TSESTree.ClassBody
  | TSESTree.Program
  | TSESTree.TSModuleBlock
  | TSESTree.TSTypeLiteral
  | TSESTree.TSInterfaceBody;
type Member = TSESTree.ClassElement | TSESTree.Statement | TSESTree.TypeElement;

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require that member overloads be consecutive',
      category: 'Best Practices',
      extraDescription: [util.tslintRule('adjacent-overload-signatures')],
      url: util.metaDocsUrl('adjacent-overload-signatures'),
      recommended: 'error'
    },
    schema: [],
    messages: {
      adjacentSignature: "All '{{name}}' signatures should be adjacent."
    }
  },

  create(context) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Gets the name of the member being processed.
     * @param member the member being processed.
     * @returns the name of the member or null if it's a member not relevant to the rule.
     */
    function getMemberName(member: TSESTree.Node): string | null {
      if (!member) {
        return null;
      }

      switch (member.type) {
        case AST_NODE_TYPES.ExportDefaultDeclaration:
        case AST_NODE_TYPES.ExportNamedDeclaration: {
          // export statements (e.g. export { a };)
          // have no declarations, so ignore them
          if (!member.declaration) {
            return null;
          }

          return getMemberName(member.declaration);
        }
        case AST_NODE_TYPES.TSDeclareFunction:
        case AST_NODE_TYPES.FunctionDeclaration:
          return member.id && member.id.name;
        case AST_NODE_TYPES.TSMethodSignature:
          return util.getNameFromPropertyName(member.key);
        case AST_NODE_TYPES.TSCallSignatureDeclaration:
          return 'call';
        case AST_NODE_TYPES.TSConstructSignatureDeclaration:
          return 'new';
        case AST_NODE_TYPES.MethodDefinition:
          return util.getNameFromPropertyName(member.key);
      }

      return null;
    }

    function getMembers(node: RuleNode): Member[] {
      switch (node.type) {
        case AST_NODE_TYPES.ClassBody:
        case AST_NODE_TYPES.Program:
        case AST_NODE_TYPES.TSModuleBlock:
        case AST_NODE_TYPES.TSInterfaceBody:
          return node.body;

        case AST_NODE_TYPES.TSTypeLiteral:
          return node.members;
      }

      return [];
    }

    /**
     * Check the body for overload methods.
     * @param {ASTNode} node the body to be inspected.
     */
    function checkBodyForOverloadMethods(node: RuleNode): void {
      const members = getMembers(node);

      if (members) {
        let lastName: string | null;
        const seen: string[] = [];

        members.forEach(member => {
          const name = getMemberName(member);
          if (name === null) {
            lastName = null;
            return;
          }

          const index = seen.indexOf(name!);
          if (index > -1 && lastName !== name) {
            context.report({
              node: member,
              messageId: 'adjacentSignature',
              data: {
                name
              }
            });
          } else if (index === -1) {
            seen.push(name);
          }

          lastName = name;
        });
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      ClassBody: checkBodyForOverloadMethods,
      Program: checkBodyForOverloadMethods,
      TSModuleBlock: checkBodyForOverloadMethods,
      TSTypeLiteral: checkBodyForOverloadMethods,
      TSInterfaceBody: checkBodyForOverloadMethods
    };
  }
};
export default rule;
export { Options, MessageIds };
