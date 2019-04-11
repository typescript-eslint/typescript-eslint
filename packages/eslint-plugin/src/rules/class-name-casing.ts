import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/util';
import * as util from '../util';

export default util.createRule({
  name: 'class-name-casing',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require PascalCased class and interface names',
      tslintRuleName: 'class-name',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      notPascalCased: "{{friendlyName}} '{{name}}' must be PascalCased.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
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
        case AST_NODE_TYPES.ClassDeclaration:
        case AST_NODE_TYPES.ClassExpression:
          friendlyName = decl.abstract ? 'Abstract class' : 'Class';
          break;
        case AST_NODE_TYPES.TSInterfaceDeclaration:
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
          name: id.name,
        },
      });
    }

    return {
      'ClassDeclaration, TSInterfaceDeclaration, ClassExpression'(
        node:
          | TSESTree.ClassDeclaration
          | TSESTree.TSInterfaceDeclaration
          | TSESTree.ClassExpression,
      ) {
        // class expressions (i.e. export default class {}) are OK
        if (node.id && !isPascalCase(node.id.name)) {
          report(node, node.id);
        }
      },
      "VariableDeclarator[init.type='ClassExpression']"(
        node: TSESTree.VariableDeclarator,
      ) {
        if (
          node.id.type === AST_NODE_TYPES.ArrayPattern ||
          node.id.type === AST_NODE_TYPES.ObjectPattern
        ) {
          // TODO - handle the BindingPattern case maybe?
          /*
          // this example makes me barf, but it's valid code
          var { bar } = class {
            static bar() { return 2 }
          }
          */
        } else {
          const id = node.id;
          const nodeInit = node.init as TSESTree.ClassExpression;

          if (id && !nodeInit.id && !isPascalCase(id.name)) {
            report(nodeInit, id);
          }
        }
      },
    };
  },
});
