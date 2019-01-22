/**
 * @fileoverview Enforces member overloads to be consecutive.
 * @author Patricio Trevino
 */

import { Rule } from 'eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require that member overloads be consecutive',
      category: 'TypeScript',
      extraDescription: [util.tslintRule('adjacent-overload-signatures')],
      url: util.metaDocsUrl('adjacent-overload-signatures'),
      recommended: 'error'
    },
    schema: [],
    messages: {
      adjacentSignature: "All '{{name}}' signatures should be adjacent."
    }
  },

  create(context: Rule.RuleContext) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Gets the name of the member being processed.
     * @param {ASTNode} member the member being processed.
     * @returns the name of the member or null if it's a member not relevant to the rule.
     */
    function getMemberName(member): string | null {
      if (!member) return null;

      switch (member.type) {
        case 'ExportDefaultDeclaration':
        case 'ExportNamedDeclaration': {
          // export statements (e.g. export { a };)
          // have no declarations, so ignore them
          return member.declaration ? getMemberName(member.declaration) : null;
        }
        case 'TSDeclareFunction':
        case 'FunctionDeclaration':
        case 'TSNamespaceFunctionDeclaration': {
          return member.id && member.id.name;
        }
        case 'TSMethodSignature': {
          return (
            (member.key && (member.key.name || member.key.value)) ||
            (member.name && (member.name.name || member.name.value))
          );
        }
        case 'TSCallSignatureDeclaration': {
          return 'call';
        }
        case 'TSConstructSignatureDeclaration': {
          return 'new';
        }
        case 'MethodDefinition': {
          return member.key.name || member.key.value;
        }
        default: {
          return null;
        }
      }
    }

    /**
     * Check the body for overload methods.
     * @param {ASTNode} node the body to be inspected.
     */
    function checkBodyForOverloadMethods(node): void {
      const members = node.body || node.members;

      if (members) {
        let lastName: string;
        const seen: string[] = [];

        members.forEach(member => {
          const name = getMemberName(member);
          if (name === null) {
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
      TSModuleBlock: checkBodyForOverloadMethods,
      TSTypeLiteral: checkBodyForOverloadMethods,
      TSInterfaceBody: checkBodyForOverloadMethods,
      ClassBody: checkBodyForOverloadMethods,
      Program: checkBodyForOverloadMethods
    };
  }
};
