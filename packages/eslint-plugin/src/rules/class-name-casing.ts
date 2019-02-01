/**
 * @fileoverview Enforces PascalCased class and interface names.
 * @author Jed Fox
 * @author Armano <https://github.com/armano2>
 */

import RuleModule from 'ts-eslint';
import * as util from '../util';
import { TSESTree } from '@typescript-eslint/typescript-estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: RuleModule<'notPascalCased', []> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require PascalCased class and interface names',
      extraDescription: [util.tslintRule('class-name')],
      category: 'Best Practices',
      url: util.metaDocsUrl('class-name-casing'),
      recommended: 'error'
    },
    messages: {
      notPascalCased: "{{friendlyName}} '{{name}}' must be PascalCased."
    },
    schema: []
  },

  create(context) {
    // variables should be defined here

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Determine if the identifier name is PascalCased
     * @param name The identifier name
     */
    function isPascalCase(name: string): boolean {
      return /^[A-Z][0-9A-Za-z]*$/.test(name);
    }

    /**
     * Report a class declaration as invalid
     * @param decl The declaration
     * @param id The name of the declaration
     */
    function report(decl: TSESTree.Node, id: TSESTree.Identifier): void {
      let friendlyName;

      switch (decl.type) {
        case 'ClassDeclaration':
        case 'ClassExpression':
          friendlyName = decl.abstract ? 'Abstract class' : 'Class';
          break;
        case 'TSInterfaceDeclaration':
          friendlyName = 'Interface';
          break;
        default:
          friendlyName = decl.type;
      }

      context.report({
        node: id,
        messageId: 'notPascalCased',
        data: {
          friendlyName,
          name: id.name
        }
      });
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      'ClassDeclaration, TSInterfaceDeclaration, ClassExpression'(
        node:
          | TSESTree.ClassDeclaration
          | TSESTree.TSInterfaceDeclaration
          | TSESTree.ClassExpression
      ) {
        // class expressions (i.e. export default class {}) are OK
        if (node.id && !isPascalCase(node.id.name)) {
          report(node, node.id);
        }
      },
      "VariableDeclarator[init.type='ClassExpression']"(
        node: TSESTree.VariableDeclarator
      ) {
        const id = node.id as TSESTree.Identifier;
        const nodeInit = node.init as TSESTree.ClassExpression;

        if (id && !nodeInit.id && !isPascalCase(id.name)) {
          report(nodeInit, id);
        }
      }
    };
  }
};
export = rule;
