/**
 * @fileoverview Enforces member overloads to be consecutive.
 * @author Patricio Trevino
 */
'use strict';

const util = require('../util');

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

  create(context) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Gets the name of the member being processed.
     * @param {ASTNode} member the member being processed.
     * @returns {string|null} the name of the member or null if it's a member not relevant to the rule.
     * @private
     */
    function getMemberName(member) {
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
     * Determine whether two methods are the same or not
     * @param {{ name: string; static: boolean }} method1 a method to compare
     * @param {{ name: string; static: boolean }} method2 another method to compare with
     * @returns {boolean} true if two methods are the same
     * @private
     */
    function isSameMethod(method1, method2) {
      return method1.name === method2.name && method1.static === method2.static;
    }

    /**
     * Check the body for overload methods.
     * @param {ASTNode} node the body to be inspected.
     * @returns {void}
     * @private
     */
    function checkBodyForOverloadMethods(node) {
      const members = node.body || node.members;

      if (members) {
        let lastMethod;
        const seenMethods = [];

        members.forEach(member => {
          const name = getMemberName(member);
          const method = {
            name,
            static: member.static
          };

          const index = seenMethods.findIndex(seenMethod =>
            isSameMethod(method, seenMethod)
          );
          if (index > -1 && !isSameMethod(method, lastMethod)) {
            context.report({
              node: member,
              messageId: 'adjacentSignature',
              data: {
                name: (method.static ? 'static ' : '') + method.name
              }
            });
          } else if (name && index === -1) {
            seenMethods.push(method);
          }

          lastMethod = method;
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
