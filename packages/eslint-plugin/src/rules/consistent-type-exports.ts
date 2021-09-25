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
      singleExportIsType: 'Export {{typeExports}} is only used as types.',
      multipleExportsAreTypes:
        'Exports {{typeExports}} should be exported using `export type`.',
      singleExportisValue:
        'Type export {{typeExports}} is not a type and should be exported using `export`.',
      multipleExportsAreValues:
        'Exports {{typeExports}} are not types and should be exported using `export`.',
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
                        return {
                          messageId: isTypeExport
                            ? 'singleExportisValue'
                            : 'singleExportIsType',
                          data: { typeExports },
                        };
                      } else {
                        const typeExports = [
                          exportNames.slice(0, -1).join(', '),
                          exportNames.slice(-1)[0],
                        ].join(' and ');

                        return {
                          messageId: isTypeExport
                            ? 'multipleExportsAreValues'
                            : 'multipleExportsAreTypes',
                          data: { typeExports },
                        };
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
