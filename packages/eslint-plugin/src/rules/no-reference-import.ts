import * as util from '../util';
import {
  Literal,
  Node,
  TSExternalModuleReference,
} from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree';
import { TSESTree } from '@typescript-eslint/typescript-estree';

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
    const sourceCode = context.getSourceCode();
    const references: ({
      comment: TSESTree.Comment;
      importName: string;
    })[] = [];

    function hasMatchingReference(source: Literal) {
      references.forEach(reference => {
        if (reference.importName === source.value) {
          context.report({
            node: reference.comment,
            messageId: 'noReferenceImport',
            data: {
              module: reference.importName,
            },
          });
        }
      });
    }
    return {
      ImportDeclaration(node) {
        if (programNode) {
          const source = node.source as Literal;
          hasMatchingReference(source);
        }
      },
      TSImportEqualsDeclaration(node) {
        if (programNode) {
          const source = (node.moduleReference as TSExternalModuleReference)
            .expression as Literal;
          hasMatchingReference(source);
        }
      },
      Program(node) {
        programNode = node;
        const referenceRegExp = /^\/\s*<reference\s*types="(.*)"/;
        const commentsBefore = sourceCode.getCommentsBefore(programNode);

        commentsBefore.forEach(comment => {
          if (comment.type !== 'Line') {
            return;
          }
          const referenceResult = referenceRegExp.exec(comment.value);

          if (referenceResult && referenceResult[1]) {
            references.push({ comment, importName: referenceResult[1] });
          }
        });
      },
    };
  },
});
