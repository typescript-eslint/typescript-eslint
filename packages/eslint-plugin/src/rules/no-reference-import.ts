import * as util from '../util';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import {
  Literal,
  Node,
  TSExternalModuleReference,
} from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree';

export default util.createRule({
  name: 'no-reference-import',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow simultaneous use of `/// <reference type="" />` comments and ES6 style imports for the same module',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noReferenceImport: 'Do not reference {{module}} if importing it anyway.',
    },
  },
  defaultOptions: [],
  create(context) {
    let programNode: Node;

    function hasMatchingReference(source: Literal) {
      const referenceRegExp = /^\/\s*<reference\s*types="(.*)"/;
      const sourceCode = context.getSourceCode();
      const commentsBefore = sourceCode.getCommentsBefore(programNode);

      commentsBefore.forEach(comment => {
        if (comment.type !== 'Line') {
          return;
        }
        const referenceResult = referenceRegExp.exec(comment.value);

        if (referenceResult && source.value === referenceResult[1]) {
          context.report({
            node: comment,
            messageId: 'noReferenceImport',
            data: {
              module: referenceResult[1],
            },
          });
        }
      });
    }
    return {
      ImportDeclaration(node) {
        if (node.type === AST_NODE_TYPES.ImportDeclaration) {
          if (programNode) {
            let source = node.source as Literal;
            hasMatchingReference(source);
          }
        }
      },
      TSImportEqualsDeclaration(node) {
        if (node.type === AST_NODE_TYPES.TSImportEqualsDeclaration) {
          if (programNode) {
            let source = (node.moduleReference as TSExternalModuleReference)
              .expression as Literal;
            hasMatchingReference(source);
          }
        }
      },
      Program(node) {
        programNode = node;
      },
    };
  },
});
