import {
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Options = [
  {
    lib?: 'always' | 'never';
    path?: 'always' | 'never';
    types?: 'always' | 'never' | 'prefer-import';
  },
];
type MessageIds = 'tripleSlashReference';

export default util.createRule<Options, MessageIds>({
  name: 'triple-slash-reference',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Sets preference level for triple slash directives versus ES6-style import declarations',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      tripleSlashReference:
        'Do not use a triple slash reference for {{module}}, use `import` style instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          lib: {
            enum: ['always', 'never'],
          },
          path: {
            enum: ['always', 'never'],
          },
          types: {
            enum: ['always', 'never', 'prefer-import'],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      lib: 'always',
      path: 'never',
      types: 'prefer-import',
    },
  ],
  create(context, [{ lib, path, types }]) {
    let programNode: TSESTree.Node;
    const sourceCode = context.getSourceCode();
    const references: {
      comment: TSESTree.Comment;
      importName: string;
    }[] = [];

    function hasMatchingReference(source: TSESTree.Literal): void {
      references.forEach(reference => {
        if (reference.importName === source.value) {
          context.report({
            node: reference.comment,
            messageId: 'tripleSlashReference',
            data: {
              module: reference.importName,
            },
          });
        }
      });
    }
    return {
      ImportDeclaration(node): void {
        if (programNode) {
          hasMatchingReference(node.source);
        }
      },
      TSImportEqualsDeclaration(node): void {
        if (programNode) {
          const source = (node.moduleReference as TSESTree.TSExternalModuleReference)
            .expression as TSESTree.Literal;
          hasMatchingReference(source);
        }
      },
      Program(node): void {
        if (lib === 'always' && path === 'always' && types == 'always') {
          return;
        }
        programNode = node;
        const referenceRegExp = /^\/\s*<reference\s*(types|path|lib)\s*=\s*["|'](.*)["|']/;
        const commentsBefore = sourceCode.getCommentsBefore(programNode);

        commentsBefore.forEach(comment => {
          if (comment.type !== AST_TOKEN_TYPES.Line) {
            return;
          }
          const referenceResult = referenceRegExp.exec(comment.value);

          if (referenceResult) {
            if (
              (referenceResult[1] === 'types' && types === 'never') ||
              (referenceResult[1] === 'path' && path === 'never') ||
              (referenceResult[1] === 'lib' && lib === 'never')
            ) {
              context.report({
                node: comment,
                messageId: 'tripleSlashReference',
                data: {
                  module: referenceResult[2],
                },
              });
              return;
            }
            if (referenceResult[1] === 'types' && types === 'prefer-import') {
              references.push({ comment, importName: referenceResult[2] });
            }
          }
        });
      },
    };
  },
});
