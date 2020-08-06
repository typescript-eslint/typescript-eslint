import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Prefer = 'type-imports' | 'no-type-imports';

type Options = [
  | Prefer
  | {
      prefer?: Prefer;
      disallowTypeAnnotations?: boolean;
    },
];
type MessageIds = 'typeOverValue' | 'valueOverType' | 'noImportTypeAnnotations';
export default util.createRule<Options, MessageIds>({
  name: 'consistent-type-imports',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces consistent usage of type imports',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      typeOverValue: 'Use an `import type` instead of an `import`.',
      valueOverType: 'Use an `import` instead of an `import type`.',
      noImportTypeAnnotations: '`import()` type annotations are forbidden.',
    },
    schema: [
      {
        oneOf: [
          {
            enum: ['type-imports', 'no-type-imports'],
          },
          {
            type: 'object',
            properties: {
              prefer: {
                enum: ['type-imports', 'no-type-imports'],
              },
              disallowTypeAnnotations: {
                type: 'boolean',
              },
            },
            additionalProperties: false,
          },
        ],
      },
    ],
    fixable: 'code',
  },

  defaultOptions: [
    {
      prefer: 'type-imports',
      disallowTypeAnnotations: true,
    },
  ],

  create(context, [option]) {
    const prefer =
      (typeof option === 'string' ? option : option.prefer) ?? 'type-imports';
    const disallowTypeAnnotations =
      typeof option === 'string'
        ? true
        : option.disallowTypeAnnotations !== false;
    const sourceCode = context.getSourceCode();

    const allValueImports: TSESTree.ImportDeclaration[] = [];
    const referenceIdToDeclMap = new Map<
      TSESTree.Identifier,
      TSESTree.ImportDeclaration
    >();
    return {
      ...(prefer === 'type-imports'
        ? {
            // prefer type imports
            'ImportDeclaration[importKind=value]'(
              node: TSESTree.ImportDeclaration,
            ): void {
              let used = false;
              for (const specifier of node.specifiers) {
                const id = specifier.local;
                const variable = context
                  .getScope()
                  .variables.find(v => v.name === id.name)!;
                for (const ref of variable.references) {
                  if (ref.identifier !== id) {
                    referenceIdToDeclMap.set(ref.identifier, node);
                    used = true;
                  }
                }
              }
              if (used) {
                allValueImports.push(node);
              }
            },
            'TSTypeReference Identifier'(node: TSESTree.Identifier): void {
              // Remove type reference ids
              referenceIdToDeclMap.delete(node);
            },
            'Program:exit'(): void {
              const usedAsValueImports = new Set(referenceIdToDeclMap.values());
              for (const valueImport of allValueImports) {
                if (usedAsValueImports.has(valueImport)) {
                  continue;
                }
                context.report({
                  node: valueImport,
                  messageId: 'typeOverValue',
                  fix(fixer) {
                    // import type Foo from 'foo'
                    //       ^^^^^ insert
                    const importToken = sourceCode.getFirstToken(valueImport)!;
                    return fixer.insertTextAfter(importToken, ' type');
                  },
                });
              }
            },
          }
        : {
            // prefer no type imports
            'ImportDeclaration[importKind=type]'(
              node: TSESTree.ImportDeclaration,
            ): void {
              context.report({
                node: node,
                messageId: 'valueOverType',
                fix(fixer) {
                  // import type Foo from 'foo'
                  //       ^^^^^ remove
                  const importToken = sourceCode.getFirstToken(node)!;
                  return fixer.removeRange([
                    importToken.range[1],
                    sourceCode.getTokenAfter(importToken)!.range[1],
                  ]);
                },
              });
            },
          }),
      ...(disallowTypeAnnotations
        ? {
            // disallow `import()` type
            TSImportType(node: TSESTree.TSImportType): void {
              context.report({
                node: node,
                messageId: 'noImportTypeAnnotations',
              });
            },
          }
        : {}),
    };
  },
});
