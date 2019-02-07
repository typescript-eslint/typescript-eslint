/**
 * @fileoverview Use function types instead of interfaces with call signatures
 * @author Benjamin Lichtman
 */
'use strict';
const util = require('../util');

/**
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 * @typedef {import("estree").Node} ESTreeNode
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * @type {RuleModule}
 */
module.exports = {
  meta: {
    docs: {
      description:
        'Use function types instead of interfaces with call signatures',
      category: 'TypeScript',
      recommended: false,
      extraDescription: [util.tslintRule('prefer-function-type')],
      url: util.metaDocsUrl('prefer-function-type')
    },
    fixable: 'code',
    messages: {
      callableTypeViolation:
        "{{ type }} has only a call signature - use '{{ sigSuggestion }}' instead."
    },
    schema: [],
    type: 'suggestion'
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Checks if there is no supertype or if the supertype is 'Function'
     * @param {ESTreeNode} node The node being checked
     * @returns {boolean} Returns true iff there is no supertype or if the supertype is 'Function'
     */
    function noSupertype(node) {
      if (!node.extends || node.extends.length === 0) {
        return true;
      }
      if (node.extends.length !== 1) {
        return false;
      }
      const expr = node.extends[0].expression;

      return expr.type === 'Identifier' && expr.name === 'Function';
    }

    /**
     * @param {ESTreeNode} parent The parent of the call signature causing the diagnostic
     * @returns {boolean} true iff the parent node needs to be wrapped for readability
     */
    function shouldWrapSuggestion(parent) {
      switch (parent.type) {
        case 'TSUnionType':
        case 'TSIntersectionType':
        case 'TSArrayType':
          return true;
        default:
          return false;
      }
    }

    /**
     * @param {ESTreeNode} call The call signature causing the diagnostic
     * @param {ESTreeNode} parent The parent of the call
     * @returns {string} The suggestion to report
     */
    function renderSuggestion(call, parent) {
      const start = call.range[0];
      const colonPos = call.returnType.range[0] - start;
      const text = sourceCode.getText().slice(start, call.range[1]);

      let suggestion = `${text.slice(0, colonPos)} =>${text.slice(
        colonPos + 1
      )}`;

      if (shouldWrapSuggestion(parent.parent)) {
        suggestion = `(${suggestion})`;
      }
      if (parent.type === 'TSInterfaceDeclaration') {
        if (typeof parent.typeParameters !== 'undefined') {
          return `type ${sourceCode
            .getText()
            .slice(
              parent.id.range[0],
              parent.typeParameters.range[1]
            )} = ${suggestion}`;
        }
        return `type ${parent.id.name} = ${suggestion}`;
      }
      return suggestion.endsWith(';') ? suggestion.slice(0, -1) : suggestion;
    }

    /**
     * @param {ESTreeNode} member The TypeElement being checked
     * @param {ESTreeNode} node The parent of member being checked
     * @returns {void}
     */
    function checkMember(member, node) {
      if (
        (member.type === 'TSCallSignatureDeclaration' ||
          member.type === 'TSConstructSignatureDeclaration') &&
        typeof member.returnType !== 'undefined'
      ) {
        const suggestion = renderSuggestion(member, node);
        const fixStart =
          node.type === 'TSTypeLiteral'
            ? node.range[0]
            : sourceCode
                .getTokens(node)
                .filter(
                  token =>
                    token.type === 'Keyword' && token.value === 'interface'
                )[0].range[0];

        context.report({
          node: member,
          messageId: 'callableTypeViolation',
          data: {
            type: node.type === 'TSTypeLiteral' ? 'Type literal' : 'Interface',
            sigSuggestion: suggestion
          },
          fix(fixer) {
            return fixer.replaceTextRange(
              [fixStart, node.range[1]],
              suggestion
            );
          }
        });
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      /**
       * @param {TSInterfaceDeclaration} node The node being checked
       * @returns {void}
       */
      TSInterfaceDeclaration(node) {
        if (noSupertype(node) && node.body.body.length === 1) {
          checkMember(node.body.body[0], node);
        }
      },
      /**
       * @param {TSTypeLiteral} node The node being checked
       * @returns {void}
       */
      'TSTypeLiteral[members.length = 1]'(node) {
        checkMember(node.members[0], node);
      }
    };
  }
};
