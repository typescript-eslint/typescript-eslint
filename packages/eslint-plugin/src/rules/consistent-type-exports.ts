import {
  //  TSESLint,
  TSESTree,
  // AST_TOKEN_TYPES,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Prefer = 'type-exports' | 'no-type-exports';

type Options = [
  {
    prefer?: Prefer;
  },
];

interface SourceExports {
  source: string;
  reportValueExports: ReportValueExport[];
  typeOnlyNamedExport: TSESTree.ExportNamedDeclaration | null;
  valueOnlyNamedExport: TSESTree.ExportNamedDeclaration | null;
}

interface ReportValueExport {
  node: TSESTree.ExportNamedDeclaration;
  typeSpecifiers: TSESTree.ExportSpecifier[]; // It has at least one element.
  valueSpecifiers: TSESTree.ExportSpecifier[];
}

// function isExportToken(
//   token: TSESTree.Token,
// ): token is TSESTree.KeywordToken & { value: 'export' } {
//   return token.type === AST_TOKEN_TYPES.Keyword && token.value === 'export';
// }

// function isTypeToken(
//   token: TSESTree.Token,
// ): token is TSESTree.IdentifierToken & { value: 'type' } {
//   return token.type === AST_TOKEN_TYPES.Identifier && token.value === 'type';
// }

type MessageIds =
  | 'typeOverValue'
  | 'someExportsAreOnlyTypes'
  | 'aExportIsOnlyTypes'
  | 'valueOverType'
  | 'someExportsInDecoMeta'
  | 'aExportInDecoMeta';

export default util.createRule<Options, MessageIds>({
  name: 'consistent-type-exports',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces consistent usage of type exports',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      typeOverValue:
        'All exports in the declaration are only used as types. Use `export type`.',
      someExportsAreOnlyTypes:
        'Exports {{typeExports}} are only used as types.',
      aExportIsOnlyTypes: 'Export {{typeExports}} is only used as types.',
      someExportsInDecoMeta:
        'Type exports {{typeExports}} are used by decorator metadata.',
      aExportInDecoMeta:
        'Type export {{typeExports}} is used by decorator metadata.',
      valueOverType: 'Use an `export` instead of an `export type`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          prefer: {
            enum: ['type-exports', 'no-type-exports'],
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
  },

  defaultOptions: [
    {
      prefer: 'type-exports',
    },
  ],

  create(context, [option]) {
    const prefer = option.prefer ?? 'type-exports';
    // const sourceCode = context.getSourceCode();
    const sourceExportsMap: { [key: string]: SourceExports } = {};

    return {
      ...(prefer === 'type-exports'
        ? {
            ExportNamedDeclaration(node): void {
              // Coerce the node.source.value to a string via asserting.
              if (
                node.source?.type !== AST_NODE_TYPES.Literal ||
                typeof node.source?.value !== 'string'
              ) {
                return;
              }

              const source = node.source.value;
              const sourceExports = (sourceExportsMap[source] =
                sourceExportsMap[source] || {
                  source,
                  reportValueExports: [],
                  typeOnlyNamedExport: null,
                  valueOnlyNamedExport: null,
                });

              // Cache the first encountered exports for the package. We will need to come
              // back to these later when fixing the problems.
              if (node.exportKind === 'type') {
                if (!sourceExports.typeOnlyNamedExport) {
                  // The export is a type export
                  sourceExports.typeOnlyNamedExport = node;
                }
              } else if (!sourceExports.valueOnlyNamedExport) {
                // The export is a value export
                sourceExports.valueOnlyNamedExport = node;
              }

              // Next for the current import, we will separate type/value specifiers.
              const typeSpecifiers: TSESTree.ExportSpecifier[] = [];
              const valueSpecifiers: TSESTree.ExportSpecifier[] = [];
              const parserServices = util.getParserServices(context);
              const checker = parserServices.program.getTypeChecker();

              // Helper for identifying specifiers.
              function isSpecifierTypeBased(
                specifier: TSESTree.ExportSpecifier,
              ): boolean | undefined {
                const exportName = specifier.local.name;
                const originalNode =
                  parserServices.esTreeNodeToTSNodeMap.get(specifier);
                const specifierType = checker.getTypeAtLocation(originalNode);

                console.log('declaration', exportName, specifierType);
                const children =
                  specifierType.getSymbol()?.declarations?.[0]?.getChildren() ??
                  [];
                let exportType: string | undefined;

                // Iterate through children of the declaration until we find the type before the symbolic name
                for (const child of children) {
                  console.log('child', exportName, child.getText());
                  if (child.getText() === exportName) {
                    break;
                  }
                  exportType = child.getText();
                }

                console.log(`Found specifier ${exportName} ${exportType}`);

                return exportType === 'interface' || exportType === 'type';
              }

              for (const specifier of node.specifiers) {
                console.log('specifier', specifier.local.name);
                const isTypeBased = isSpecifierTypeBased(specifier);

                if (isTypeBased === true) {
                  typeSpecifiers.push(specifier);
                } else if (isTypeBased === false) {
                  // undefined means we don't know.
                  valueSpecifiers.push(specifier);
                }
              }

              if (
                (node.exportKind === 'value' && typeSpecifiers.length) ||
                (node.exportKind === 'type' && valueSpecifiers.length)
              ) {
                sourceExports.reportValueExports.push({
                  node,
                  typeSpecifiers,
                  valueSpecifiers,
                });
              }
            },

            'Program:exit'(): void {
              for (const sourceExports of Object.values(sourceExportsMap)) {
                console.log(
                  'sourceExports',
                  sourceExports.source,
                  sourceExports,
                );

                // If this export has no issues, move on.
                if (sourceExports.reportValueExports.length === 0) {
                  continue;
                }

                for (const report of sourceExports.reportValueExports) {
                  console.log('REPORT', report);

                  if (!report.valueSpecifiers.length) {
                    // export is all type-only; convert the entire export to `export type`
                    context.report({
                      node: report.node,
                      messageId: 'typeOverValue',
                      // *fix(fixer) {
                      //   yield* fixToTypeExport(fixer, report, sourceExports);
                      // },
                    });
                  } else if (!report.typeSpecifiers.length) {
                    // we only have value violations.
                  } else {
                    // We have both type and value violations.
                    const isTypeExport = (report.node.exportKind = 'type');
                    const exportNames = (
                      isTypeExport
                        ? report.valueSpecifiers
                        : report.typeSpecifiers
                    ).map(specifier => `${specifier.local.name}`);

                    const message = ((): {
                      messageId: MessageIds;
                      data: Record<string, unknown>;
                    } => {
                      if (exportNames.length === 1) {
                        const typeExports = exportNames[0];
                        if (isTypeExport) {
                          return {
                            messageId: 'aExportInDecoMeta',
                            data: { typeExports },
                          };
                        } else {
                          return {
                            messageId: 'aExportIsOnlyTypes',
                            data: { typeExports },
                          };
                        }
                      } else {
                        const typeExports = [
                          exportNames.slice(0, -1).join(', '),
                          exportNames.slice(-1)[0],
                        ].join(' and ');

                        if (isTypeExport) {
                          return {
                            messageId: 'someExportsInDecoMeta',
                            data: { typeExports },
                          };
                        } else {
                          return {
                            messageId: 'someExportsAreOnlyTypes',
                            data: { typeExports },
                          };
                        }
                      }
                    })();

                    context.report({
                      node: report.node,
                      ...message,
                      // *fix(fixer) {
                      //   if (isTypeExport) {
                      //     yield* fixToValueImportInDecoMeta(
                      //       fixer,
                      //       report,
                      //       sourceImports,
                      //     );
                      //   } else {
                      //     yield* fixToTypeImport(fixer, report, sourceImports);
                      //   }
                      // },
                    });
                  }
                }
              }
            },

            // 'Program:exit'(): void {
            //   for (const sourceImports of Object.values(sourceExportsMap)) {
            //     if (sourceImports.reportValueImports.length === 0) {
            //       continue;
            //     }
            //     for (const report of sourceImports.reportValueImports) {
            //       if (
            //         report.valueSpecifiers.length === 0 &&
            //         report.unusedSpecifiers.length === 0
            //       ) {
            //         // import is all type-only, convert the entire import to `import type`
            //         context.report({
            //           node: report.node,
            //           messageId: 'typeOverValue',
            //           *fix(fixer) {
            //             yield* fixToTypeImport(fixer, report, sourceImports);
            //           },
            //         });
            //       } else {
            //         const isTypeImport = report.node.importKind === 'type';

            //         // we have a mixed type/value import, so we need to split them out into multiple imports
            //         const importNames = (
            //           isTypeImport
            //             ? report.valueSpecifiers
            //             : report.typeSpecifiers
            //         ).map(specifier => `"${specifier.local.name}"`);

            //         const message = ((): {
            //           messageId: MessageIds;
            //           data: Record<string, unknown>;
            //         } => {
            //           if (importNames.length === 1) {
            //             const typeImports = importNames[0];
            //             if (isTypeImport) {
            //               return {
            //                 messageId: 'aImportInDecoMeta',
            //                 data: { typeImports },
            //               };
            //             } else {
            //               return {
            //                 messageId: 'aImportIsOnlyTypes',
            //                 data: { typeImports },
            //               };
            //             }
            //           } else {
            //             const typeImports = [
            //               importNames.slice(0, -1).join(', '),
            //               importNames.slice(-1)[0],
            //             ].join(' and ');
            //             if (isTypeImport) {
            //               return {
            //                 messageId: 'someImportsInDecoMeta',
            //                 data: { typeImports },
            //               };
            //             } else {
            //               return {
            //                 messageId: 'someImportsAreOnlyTypes',
            //                 data: { typeImports },
            //               };
            //             }
            //           }
            //         })();

            //         context.report({
            //           node: report.node,
            //           ...message,
            //           *fix(fixer) {
            //             if (isTypeImport) {
            //               yield* fixToValueImportInDecoMeta(
            //                 fixer,
            //                 report,
            //                 sourceImports,
            //               );
            //             } else {
            //               yield* fixToTypeImport(fixer, report, sourceImports);
            //             }
            //           },
            //         });
            //       }
            //     }
            //   }
            // },
          }
        : {
            // prefer no type exports
            // 'ExportDeclaration[importKind = "type"]'(
            //   node: TSESTree.ExportDeclaration,
            // ): void {
            //   context.report({
            //     node,
            //     messageId: 'valueOverType',
            //     fix(fixer) {
            //       return fixToValueExport(fixer, node);
            //     },
            //   });
            // },
          }),
    };

    // function classifySpecifier(node: TSESTree.ImportDeclaration): {
    //   defaultSpecifier: TSESTree.ImportDefaultSpecifier | null;
    //   namespaceSpecifier: TSESTree.ImportNamespaceSpecifier | null;
    //   namedSpecifiers: TSESTree.ImportSpecifier[];
    // } {
    //   const defaultSpecifier: TSESTree.ImportDefaultSpecifier | null =
    //     node.specifiers[0].type === AST_NODE_TYPES.ImportDefaultSpecifier
    //       ? node.specifiers[0]
    //       : null;
    //   const namespaceSpecifier: TSESTree.ImportNamespaceSpecifier | null =
    //     node.specifiers.find(
    //       (specifier): specifier is TSESTree.ImportNamespaceSpecifier =>
    //         specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier,
    //     ) ?? null;
    //   const namedSpecifiers: TSESTree.ImportSpecifier[] =
    //     node.specifiers.filter(
    //       (specifier): specifier is TSESTree.ImportSpecifier =>
    //         specifier.type === AST_NODE_TYPES.ImportSpecifier,
    //     );
    //   return {
    //     defaultSpecifier,
    //     namespaceSpecifier,
    //     namedSpecifiers,
    //   };
    // }

    /**
     * Returns information for fixing named specifiers.
     */
    // function getFixesNamedSpecifiers(
    //   fixer: TSESLint.RuleFixer,
    //   node: TSESTree.ImportDeclaration,
    //   typeNamedSpecifiers: TSESTree.ImportSpecifier[],
    //   allNamedSpecifiers: TSESTree.ImportSpecifier[],
    // ): {
    //   typeNamedSpecifiersText: string;
    //   removeTypeNamedSpecifiers: TSESLint.RuleFix[];
    // } {
    //   if (allNamedSpecifiers.length === 0) {
    //     return {
    //       typeNamedSpecifiersText: '',
    //       removeTypeNamedSpecifiers: [],
    //     };
    //   }
    //   const typeNamedSpecifiersTexts: string[] = [];
    //   const removeTypeNamedSpecifiers: TSESLint.RuleFix[] = [];
    //   if (typeNamedSpecifiers.length === allNamedSpecifiers.length) {
    //     // e.g.
    //     // import Foo, {Type1, Type2} from 'foo'
    //     // import DefType, {Type1, Type2} from 'foo'
    //     const openingBraceToken = util.nullThrows(
    //       sourceCode.getTokenBefore(
    //         typeNamedSpecifiers[0],
    //         util.isOpeningBraceToken,
    //       ),
    //       util.NullThrowsReasons.MissingToken('{', node.type),
    //     );
    //     const commaToken = util.nullThrows(
    //       sourceCode.getTokenBefore(openingBraceToken, util.isCommaToken),
    //       util.NullThrowsReasons.MissingToken(',', node.type),
    //     );
    //     const closingBraceToken = util.nullThrows(
    //       sourceCode.getFirstTokenBetween(
    //         openingBraceToken,
    //         node.source,
    //         util.isClosingBraceToken,
    //       ),
    //       util.NullThrowsReasons.MissingToken('}', node.type),
    //     );

    //     // import DefType, {...} from 'foo'
    //     //               ^^^^^^^ remove
    //     removeTypeNamedSpecifiers.push(
    //       fixer.removeRange([commaToken.range[0], closingBraceToken.range[1]]),
    //     );

    //     typeNamedSpecifiersTexts.push(
    //       sourceCode.text.slice(
    //         openingBraceToken.range[1],
    //         closingBraceToken.range[0],
    //       ),
    //     );
    //   } else {
    //     const typeNamedSpecifierGroups: TSESTree.ImportSpecifier[][] = [];
    //     let group: TSESTree.ImportSpecifier[] = [];
    //     for (const namedSpecifier of allNamedSpecifiers) {
    //       if (typeNamedSpecifiers.includes(namedSpecifier)) {
    //         group.push(namedSpecifier);
    //       } else if (group.length) {
    //         typeNamedSpecifierGroups.push(group);
    //         group = [];
    //       }
    //     }
    //     if (group.length) {
    //       typeNamedSpecifierGroups.push(group);
    //     }
    //     for (const namedSpecifiers of typeNamedSpecifierGroups) {
    //       const { removeRange, textRange } = getNamedSpecifierRanges(
    //         namedSpecifiers,
    //         allNamedSpecifiers,
    //       );
    //       removeTypeNamedSpecifiers.push(fixer.removeRange(removeRange));

    //       typeNamedSpecifiersTexts.push(sourceCode.text.slice(...textRange));
    //     }
    //   }
    //   return {
    //     typeNamedSpecifiersText: typeNamedSpecifiersTexts.join(','),
    //     removeTypeNamedSpecifiers,
    //   };
    // }

    /**
     * Returns ranges for fixing named specifier.
     */
    // function getNamedSpecifierRanges(
    //   namedSpecifierGroup: TSESTree.ImportSpecifier[],
    //   allNamedSpecifiers: TSESTree.ImportSpecifier[],
    // ): {
    //   textRange: TSESTree.Range;
    //   removeRange: TSESTree.Range;
    // } {
    //   const first = namedSpecifierGroup[0];
    //   const last = namedSpecifierGroup[namedSpecifierGroup.length - 1];
    //   const removeRange: TSESTree.Range = [first.range[0], last.range[1]];
    //   const textRange: TSESTree.Range = [...removeRange];
    //   const before = sourceCode.getTokenBefore(first)!;
    //   textRange[0] = before.range[1];
    //   if (util.isCommaToken(before)) {
    //     removeRange[0] = before.range[0];
    //   } else {
    //     removeRange[0] = before.range[1];
    //   }

    //   const isFirst = allNamedSpecifiers[0] === first;
    //   const isLast = allNamedSpecifiers[allNamedSpecifiers.length - 1] === last;
    //   const after = sourceCode.getTokenAfter(last)!;
    //   textRange[1] = after.range[0];
    //   if (isFirst || isLast) {
    //     if (util.isCommaToken(after)) {
    //       removeRange[1] = after.range[1];
    //     }
    //   }

    //   return {
    //     textRange,
    //     removeRange,
    //   };
    // }

    /**
     * insert specifiers to named export node.
     * e.g.
     * import type { Already, Type1, Type2 } from 'foo'
     *                        ^^^^^^^^^^^^^ insert
     */
    // function insertToNamedExport(
    //   fixer: TSESLint.RuleFixer,
    //   target: TSESTree.ImportDeclaration,
    //   insertText: string,
    // ): TSESLint.RuleFix {
    //   const closingBraceToken = util.nullThrows(
    //     sourceCode.getFirstTokenBetween(
    //       sourceCode.getFirstToken(target)!,
    //       target.source,
    //       util.isClosingBraceToken,
    //     ),
    //     util.NullThrowsReasons.MissingToken('}', target.type),
    //   );
    //   const before = sourceCode.getTokenBefore(closingBraceToken)!;
    //   if (!util.isCommaToken(before) && !util.isOpeningBraceToken(before)) {
    //     insertText = ',' + insertText;
    //   }
    //   return fixer.insertTextBefore(closingBraceToken, insertText);
    // }

    // function* fixToTypeExport(): IterableIterator<TSESLint.RuleFix> {
    // fixer: TSESLint.RuleFixer,
    // report: ReportValueExport,
    // sourceExports: SourceExports,
    // const { node } = report;
    // const { defaultSpecifier, namespaceSpecifier, namedSpecifiers } =
    //   classifySpecifier(node);
    // if (namespaceSpecifier && !defaultSpecifier) {
    //   // e.g.
    //   // import * as types from 'foo'
    //   yield* fixToTypeExportByInsertType(fixer, node, false);
    //   return;
    // } else if (defaultSpecifier) {
    //   if (
    //     report.typeSpecifiers.includes(defaultSpecifier) &&
    //     namedSpecifiers.length === 0 &&
    //     !namespaceSpecifier
    //   ) {
    //     // e.g.
    //     // import Type from 'foo'
    //     yield* fixToTypeExportByInsertType(fixer, node, true);
    //     return;
    //   }
    // } else {
    //   if (
    //     namedSpecifiers.every(specifier =>
    //       report.typeSpecifiers.includes(specifier),
    //     ) &&
    //     !namespaceSpecifier
    //   ) {
    //     // e.g.
    //     // import {Type1, Type2} from 'foo'
    //     yield* fixToTypeExportByInsertType(fixer, node, false);
    //     return;
    //   }
    // }
    // const typeNamedSpecifiers = namedSpecifiers.filter(specifier =>
    //   report.typeSpecifiers.includes(specifier),
    // );
    // const fixesNamedSpecifiers = getFixesNamedSpecifiers(
    //   fixer,
    //   node,
    //   typeNamedSpecifiers,
    //   namedSpecifiers,
    // );
    // const afterFixes: TSESLint.RuleFix[] = [];
    // if (typeNamedSpecifiers.length) {
    //   if (sourceExports.typeOnlyNamedImport) {
    //     const insertTypeNamedSpecifiers = insertToNamedImport(
    //       fixer,
    //       sourceExports.typeOnlyNamedImport,
    //       fixesNamedSpecifiers.typeNamedSpecifiersText,
    //     );
    //     if (sourceExports.typeOnlyNamedImport.range[1] <= node.range[0]) {
    //       yield insertTypeNamedSpecifiers;
    //     } else {
    //       afterFixes.push(insertTypeNamedSpecifiers);
    //     }
    //   } else {
    //     yield fixer.insertTextBefore(
    //       node,
    //       `import type {${
    //         fixesNamedSpecifiers.typeNamedSpecifiersText
    //       }} from ${sourceCode.getText(node.source)};\n`,
    //     );
    //   }
    // }
    // const fixesRemoveTypeNamespaceSpecifier: TSESLint.RuleFix[] = [];
    // if (
    //   namespaceSpecifier &&
    //   report.typeSpecifiers.includes(namespaceSpecifier)
    // ) {
    //   // e.g.
    //   // import Foo, * as Type from 'foo'
    //   // import DefType, * as Type from 'foo'
    //   // import DefType, * as Type from 'foo'
    //   const commaToken = util.nullThrows(
    //     sourceCode.getTokenBefore(namespaceSpecifier, util.isCommaToken),
    //     util.NullThrowsReasons.MissingToken(',', node.type),
    //   );
    //   // import Def, * as Ns from 'foo'
    //   //           ^^^^^^^^^ remove
    //   fixesRemoveTypeNamespaceSpecifier.push(
    //     fixer.removeRange([commaToken.range[0], namespaceSpecifier.range[1]]),
    //   );
    //   // import type * as Ns from 'foo'
    //   // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ insert
    //   yield fixer.insertTextBefore(
    //     node,
    //     `import type ${sourceCode.getText(
    //       namespaceSpecifier,
    //     )} from ${sourceCode.getText(node.source)};\n`,
    //   );
    // }
    // if (
    //   defaultSpecifier &&
    //   report.typeSpecifiers.includes(defaultSpecifier)
    // ) {
    //   if (report.typeSpecifiers.length === node.specifiers.length) {
    //     const importToken = util.nullThrows(
    //       sourceCode.getFirstToken(node, isExportToken),
    //       util.NullThrowsReasons.MissingToken('import', node.type),
    //     );
    //     // import type Type from 'foo'
    //     //        ^^^^ insert
    //     yield fixer.insertTextAfter(importToken, ' type');
    //   } else {
    //     const commaToken = util.nullThrows(
    //       sourceCode.getTokenAfter(defaultSpecifier, util.isCommaToken),
    //       util.NullThrowsReasons.MissingToken(',', defaultSpecifier.type),
    //     );
    //     // import Type , {...} from 'foo'
    //     //        ^^^^^ pick
    //     const defaultText = sourceCode.text
    //       .slice(defaultSpecifier.range[0], commaToken.range[0])
    //       .trim();
    //     yield fixer.insertTextBefore(
    //       node,
    //       `import type ${defaultText} from ${sourceCode.getText(
    //         node.source,
    //       )};\n`,
    //     );
    //     const afterToken = util.nullThrows(
    //       sourceCode.getTokenAfter(commaToken, { includeComments: true }),
    //       util.NullThrowsReasons.MissingToken('any token', node.type),
    //     );
    //     // import Type , {...} from 'foo'
    //     //        ^^^^^^^ remove
    //     yield fixer.removeRange([
    //       defaultSpecifier.range[0],
    //       afterToken.range[0],
    //     ]);
    //   }
    // }
    // yield* fixesNamedSpecifiers.removeTypeNamedSpecifiers;
    // yield* fixesRemoveTypeNamespaceSpecifier;
    // yield* afterFixes;
  },

  /**
   * Fixer which inserts "type" into typed exports.
   */
  // function* fixToTypeExportByInsertType(
  //   fixer: TSESLint.RuleFixer,
  //   node: TSESTree.ExportNamedDeclaration,
  //   isDefaultImport: boolean,
  // ): IterableIterator<TSESLint.RuleFix> {
  //   // export type Foo from 'foo'
  //   //       ^^^^^ insert
  //   const importToken = util.nullThrows(
  //     sourceCode.getFirstToken(node, isExportToken),
  //     util.NullThrowsReasons.MissingToken('import', node.type),
  //   );
  //   yield fixer.insertTextAfter(importToken, ' type');

  //   if (isDefaultImport) {
  //     // Has default import
  //     const openingBraceToken = sourceCode.getFirstTokenBetween(
  //       importToken,
  //       node.source,
  //       util.isOpeningBraceToken,
  //     );
  //     if (openingBraceToken) {
  //       // Only braces. e.g. import Foo, {} from 'foo'
  //       const commaToken = util.nullThrows(
  //         sourceCode.getTokenBefore(openingBraceToken, util.isCommaToken),
  //         util.NullThrowsReasons.MissingToken(',', node.type),
  //       );
  //       const closingBraceToken = util.nullThrows(
  //         sourceCode.getFirstTokenBetween(
  //           openingBraceToken,
  //           node.source,
  //           util.isClosingBraceToken,
  //         ),
  //         util.NullThrowsReasons.MissingToken('}', node.type),
  //       );

  //       // import type Foo, {} from 'foo'
  //       //                  ^^ remove
  //       yield fixer.removeRange([
  //         commaToken.range[0],
  //         closingBraceToken.range[1],
  //       ]);
  //       const specifiersText = sourceCode.text.slice(
  //         commaToken.range[1],
  //         closingBraceToken.range[1],
  //       );
  //       if (node.specifiers.length > 1) {
  //         // import type Foo from 'foo'
  //         // import type {...} from 'foo' // <- insert
  //         yield fixer.insertTextAfter(
  //           node,
  //           `\nimport type${specifiersText} from ${sourceCode.getText(
  //             node.source,
  //           )};`,
  //         );
  //       }
  //     }
  //   }
  // }

  // function* fixToValueExportInDecoMeta(
  //   fixer: TSESLint.RuleFixer,
  //   report: ReportValueExport,
  //   sourceImports: SourceImports,
  // ): IterableIterator<TSESLint.RuleFix> {
  //   const { node } = report;

  //   const { defaultSpecifier, namespaceSpecifier, namedSpecifiers } =
  //     classifySpecifier(node);

  //   if (namespaceSpecifier) {
  //     // e.g.
  //     // import type * as types from 'foo'
  //     yield* fixToValueExport(fixer, node);
  //     return;
  //   } else if (defaultSpecifier) {
  //     if (
  //       report.valueSpecifiers.includes(defaultSpecifier) &&
  //       namedSpecifiers.length === 0
  //     ) {
  //       // e.g.
  //       // import type Type from 'foo'
  //       yield* fixToValueExport(fixer, node);
  //       return;
  //     }
  //   } else {
  //     if (
  //       namedSpecifiers.every(specifier =>
  //         report.valueSpecifiers.includes(specifier),
  //       )
  //     ) {
  //       // e.g.
  //       // import type {Type1, Type2} from 'foo'
  //       yield* fixToValueExport(fixer, node);
  //       return;
  //     }
  //   }

  //   const valueNamedSpecifiers = namedSpecifiers.filter(specifier =>
  //     report.valueSpecifiers.includes(specifier),
  //   );

  //   const fixesNamedSpecifiers = getFixesNamedSpecifiers(
  //     fixer,
  //     node,
  //     valueNamedSpecifiers,
  //     namedSpecifiers,
  //   );
  //   const afterFixes: TSESLint.RuleFix[] = [];
  //   if (valueNamedSpecifiers.length) {
  //     if (sourceImports.valueOnlyNamedImport) {
  //       const insertTypeNamedSpecifiers = insertToNamedImport(
  //         fixer,
  //         sourceImports.valueOnlyNamedImport,
  //         fixesNamedSpecifiers.typeNamedSpecifiersText,
  //       );
  //       if (sourceImports.valueOnlyNamedImport.range[1] <= node.range[0]) {
  //         yield insertTypeNamedSpecifiers;
  //       } else {
  //         afterFixes.push(insertTypeNamedSpecifiers);
  //       }
  //     } else {
  //       yield fixer.insertTextBefore(
  //         node,
  //         `import {${
  //           fixesNamedSpecifiers.typeNamedSpecifiersText
  //         }} from ${sourceCode.getText(node.source)};\n`,
  //       );
  //     }
  //   }

  //   yield* fixesNamedSpecifiers.removeTypeNamedSpecifiers;

  //   yield* afterFixes;
  // }

  /**
   * Remove "type" from an export.
   */
  //   function* fixToValueExport(
  //     fixer: TSESLint.RuleFixer,
  //     node: TSESTree.ExportNamedDeclaration,
  //   ): IterableIterator<TSESLint.RuleFix> {
  //     // export type { Foo } from 'foo'
  //     //        ^^^^ remove
  //     const exportToken = util.nullThrows(
  //       sourceCode.getFirstToken(node, isExportToken),
  //       util.NullThrowsReasons.MissingToken('export', node.type),
  //     );

  //     const typeToken = util.nullThrows(
  //       sourceCode.getFirstTokenBetween(
  //         exportToken,
  //         node.specifiers[0]?.local ?? node.source,
  //         isTypeToken,
  //       ),
  //       util.NullThrowsReasons.MissingToken('type', node.type),
  //     );

  //     const afterToken = util.nullThrows(
  //       sourceCode.getTokenAfter(typeToken, { includeComments: true }),
  //       util.NullThrowsReasons.MissingToken('any token', node.type),
  //     );
  //     yield fixer.removeRange([typeToken.range[0], afterToken.range[0]]);
  //   }
  // },
});
