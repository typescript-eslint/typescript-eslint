/* eslint-disable no-console */
import {
  TSESTree,
  ParserServices,
  AST_NODE_TYPES,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import { SymbolFlags } from 'typescript';
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

type MessageIds =
  | 'typeOverValue'
  | 'valueOverType'
  | 'singleExportIsType'
  | 'multipleExportsAreTypes'
  | 'singleExportisValue'
  | 'multipleExportsAreValues';

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
      valueOverType: 'Use an `export` instead of an `export type`.',
      singleExportIsType:
        'Type export {{exportNames}} is not a value and should be exported using `export type`.',
      multipleExportsAreTypes:
        'Type exports {{exportNames}} are not values and should be exported using `export type`.',
      singleExportisValue:
        'Value export {{exportNames}} is exported as a type only and should be exported using `export`.',
      multipleExportsAreValues:
        'Value exports {{exportNames}} are exported as types only and should be exported using `export`.',
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
    const sourceCode = context.getSourceCode();
    const prefer = option.prefer ?? 'type-exports';
    // const sourceCode = context.getSourceCode();
    const sourceExportsMap: { [key: string]: SourceExports } = {};

    return {
      ...(prefer === 'type-exports'
        ? {
            ExportNamedDeclaration(
              node: TSESTree.ExportNamedDeclaration,
            ): void {
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
              const parserServices = util.getParserServices(context);

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

              for (const specifier of node.specifiers) {
                const isTypeBased = isSpecifierTypeBased(
                  parserServices,
                  specifier,
                );

                console.log('specifier', specifier.local.name, isTypeBased);

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
                console.log('sourceExports', sourceExports);

                // If this export has no issues, move on.
                if (sourceExports.reportValueExports.length === 0) {
                  continue;
                }

                for (const report of sourceExports.reportValueExports) {
                  if (!report.valueSpecifiers.length) {
                    // export is all type-only; convert the entire export to `export type`
                    context.report({
                      node: report.node,
                      messageId: 'typeOverValue',
                      *fix(fixer) {
                        yield* fixToTypeExportByInsertType(
                          fixer,
                          sourceCode,
                          report.node,
                        );
                      },
                    });
                  } else if (!report.typeSpecifiers.length) {
                    // we only have value violations; remove the `type` from the export
                    // TODO: remove the `type` from the export
                    context.report({
                      node: report.node,
                      messageId: 'valueOverType',
                      // *fix(fixer) {
                      //   yield* fixToValueExportByRemovingType(
                      //     fixer,
                      //     sourceCode,
                      //     report.node
                      //   )
                      // }
                    });
                  } else {
                    // We have both type and value violations.
                    const isTypeExport = report.node.exportKind === 'type';
                    const allExportNames = (
                      isTypeExport
                        ? report.valueSpecifiers
                        : report.typeSpecifiers
                    ).map(specifier => `${specifier.local.name}`);

                    if (allExportNames.length === 1) {
                      const exportNames = allExportNames[0];

                      context.report({
                        node: report.node,
                        messageId: isTypeExport
                          ? 'singleExportisValue'
                          : 'singleExportIsType',
                        data: { exportNames },
                        *fix(fixer) {
                          yield* fixSeparateNamedExports(
                            fixer,
                            sourceCode,
                            sourceExports,
                            report,
                          );
                        },
                      });
                    } else {
                      const exportNames = [
                        allExportNames.slice(0, -1).join(', '),
                        allExportNames.slice(-1)[0],
                      ].join(' and ');

                      context.report({
                        node: report.node,
                        messageId: isTypeExport
                          ? 'multipleExportsAreValues'
                          : 'multipleExportsAreTypes',
                        data: { exportNames },
                        *fix(fixer) {
                          yield* fixSeparateNamedExports(
                            fixer,
                            sourceCode,
                            sourceExports,
                            report,
                          );
                        },
                      });
                    }
                  }
                }
              }
            },
          }
        : {}),
    };
  },
});

/**
 * Helper for identifying if an export specifier resolves to a
 * JavaScript value or a TypeScript type.
 *
 * @returns True/false if is a type or not, or undefined if the specifier
 * can't be resolved.
 */
function isSpecifierTypeBased(
  parserServices: ParserServices,
  specifier: TSESTree.ExportSpecifier,
): boolean | undefined {
  const checker = parserServices.program.getTypeChecker();
  const node = parserServices.esTreeNodeToTSNodeMap.get(specifier.exported);
  const symbol = checker.getSymbolAtLocation(node);
  const aliasedSymbol = checker.getAliasedSymbol(symbol!);

  if (!aliasedSymbol || aliasedSymbol.escapedName === 'unknown') {
    return undefined;
  }

  return !(aliasedSymbol.flags & SymbolFlags.Value);
}

/**
 * Inserts "type" into an export.
 *
 * Example:
 *
 * export type { Foo } from 'foo';
 *        ^^^^
 */
function* fixToTypeExportByInsertType(
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  node: TSESTree.ExportNamedDeclaration,
): IterableIterator<TSESLint.RuleFix> {
  const exportToken = util.nullThrows(
    sourceCode.getFirstToken(node),
    util.NullThrowsReasons.MissingToken('export', node.type),
  );

  yield fixer.insertTextAfter(exportToken, ' type');
}

/**
 * Separates the exports which mismatch the kind of export the given
 * node represents. For example, a type export's named specifiers which
 * represent values will be inserted in a separate `export` statement.
 */
function* fixSeparateNamedExports(
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  sourceExports: SourceExports,
  report: ReportValueExport,
): IterableIterator<TSESLint.RuleFix> {
  const { node, typeSpecifiers, valueSpecifiers } = report;
  const separateTypes = node.exportKind !== 'type';
  const specifiersToSeparate = separateTypes ? typeSpecifiers : valueSpecifiers;
  const specifierNames = specifiersToSeparate.map(
    specifier => specifier.local.name,
  );

  console.log('separating types:', separateTypes, node, specifierNames);

  const exportToken = util.nullThrows(
    sourceCode.getFirstToken(node),
    util.NullThrowsReasons.MissingToken('export', node.type),
  );

  // Filter the bad exports from the current line.
  const filteredSpecifierNames = (
    separateTypes ? valueSpecifiers : typeSpecifiers
  )
    .map(specifier => specifier.local.name)
    .join(', ');
  const openToken = util.nullThrows(
    sourceCode.getFirstToken(node, util.isOpeningBraceToken),
    util.NullThrowsReasons.MissingToken('{', node.type),
  );
  const closeToken = util.nullThrows(
    sourceCode.getLastToken(node, util.isClosingBraceToken),
    util.NullThrowsReasons.MissingToken('}', node.type),
  );

  console.log('opentoken', openToken);
  console.log('closeToken', closeToken);

  yield fixer.replaceTextRange(
    [openToken.range[1], closeToken.range[0]],
    ` ${filteredSpecifierNames} `,
  );

  // Insert the bad exports into a new export line.
  yield fixer.insertTextBefore(
    exportToken,
    `export ${separateTypes ? 'type ' : ''}{ ${specifierNames.join(
      ', ',
    )} } from ${sourceCode.getText(node.source!)};\n`,
  );
}
