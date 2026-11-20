import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export type Options = [
  {
    lib?: 'always' | 'never';
    path?: 'always' | 'never';
    types?: 'always' | 'never' | 'prefer-import';
  },
];
export type MessageIds = 'tripleSlashReference';

export default createRule<Options, MessageIds>({
  name: 'triple-slash-reference',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow certain triple slash directives in favor of ES6-style import declarations',
      recommended: 'recommended',
    },
    messages: {
      tripleSlashReference:
        'Do not use a triple slash reference for {{module}}, use `import` style instead.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          lib: {
            type: 'string',
            description:
              'What to enforce for `/// <reference lib="..." />` references.',
            enum: ['always', 'never'],
          },
          path: {
            type: 'string',
            description:
              'What to enforce for `/// <reference path="..." />` references.',
            enum: ['always', 'never'],
          },
          types: {
            type: 'string',
            description:
              'What to enforce for `/// <reference types="..." />` references.',
            enum: ['always', 'never', 'prefer-import'],
          },
        },
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [
    {
      lib: 'always',
      path: 'never',
      types: 'prefer-import',
    },
  ],
  create(context, [{ lib, path, types }]) {
    // Maps each `types` reference comment to the module it references
    const references = new Map<TSESTree.Comment, string>();

    function reportMatchingReferences(source: TSESTree.StringLiteral): void {
      for (const [comment, importName] of references) {
        if (importName === source.value) {
          references.delete(comment);
          context.report({
            node: comment,
            messageId: 'tripleSlashReference',
            data: {
              module: importName,
            },
          });
        }
      }
    }
    return {
      ImportDeclaration(node): void {
        reportMatchingReferences(node.source);
      },
      Program(node): void {
        const referenceRegExp =
          /^\/\s*<reference\s*(types|path|lib)\s*=\s*(["'])(.*?)\2/;

        const firstToken = context.sourceCode.getFirstToken(node);

        const commentsBefore = firstToken
          ? context.sourceCode.getCommentsBefore(firstToken)
          : context.sourceCode.getAllComments();

        commentsBefore.forEach(comment => {
          if (comment.type !== AST_TOKEN_TYPES.Line) {
            return;
          }
          const referenceResult = referenceRegExp.exec(comment.value);

          if (referenceResult) {
            const [, kind, , importName] = referenceResult;
            if (
              (kind === 'types' && types === 'never') ||
              (kind === 'path' && path === 'never') ||
              (kind === 'lib' && lib === 'never')
            ) {
              context.report({
                node: comment,
                messageId: 'tripleSlashReference',
                data: {
                  module: importName,
                },
              });
              return;
            }
            if (kind === 'types' && types === 'prefer-import') {
              references.set(comment, importName);
            }
          }
        });
      },
      TSImportEqualsDeclaration(node): void {
        const reference = node.moduleReference;

        if (reference.type === AST_NODE_TYPES.TSExternalModuleReference) {
          reportMatchingReferences(reference.expression);
        }
      },
    };
  },
});
