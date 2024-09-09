import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { SymbolFlags } from 'typescript';

import {
  createRule,
  formatWordList,
  getParserServices,
  isClosingBraceToken,
  isOpeningBraceToken,
  nullThrows,
  NullThrowsReasons,
} from '../util';

type Options = [
  {
    fixMixedExportsWithInlineTypeSpecifier: boolean;
  },
];

interface SourceExports {
  reportValueExports: ReportValueExport[];
  source: string;
  typeOnlyNamedExport: TSESTree.ExportNamedDeclaration | null;
  valueOnlyNamedExport: TSESTree.ExportNamedDeclaration | null;
}

interface ReportValueExport {
  inlineTypeSpecifiers: TSESTree.ExportSpecifier[];
  node: TSESTree.ExportNamedDeclaration;
  typeBasedSpecifiers: TSESTree.ExportSpecifier[];
  valueSpecifiers: TSESTree.ExportSpecifier[];
}

type MessageIds =
  | 'multipleExportsAreTypes'
  | 'singleExportIsType'
  | 'typeOverValue';

export default createRule<Options, MessageIds>({
  create(context, [{ fixMixedExportsWithInlineTypeSpecifier }]) {
    const sourceExportsMap: Record<string, SourceExports> = {};
    const services = getParserServices(context);

    /**
     * Helper for identifying if an export specifier resolves to a
     * JavaScript value or a TypeScript type.
     *
     * @returns True/false if is a type or not, or undefined if the specifier
     * can't be resolved.
     */
    function isSpecifierTypeBased(
      specifier: TSESTree.ExportSpecifier,
    ): boolean | undefined {
      const checker = services.program.getTypeChecker();
      const symbol = services.getSymbolAtLocation(specifier.exported);
      if (!symbol) {
        return undefined;
      }

      const aliasedSymbol = checker.getAliasedSymbol(symbol);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      if (aliasedSymbol.escapedName === 'unknown') {
        return undefined;
      }

      return !(aliasedSymbol.flags & SymbolFlags.Value);
    }

    return {
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void {
        // Coerce the source into a string for use as a lookup entry.
        const source = getSourceFromExport(node) ?? 'undefined';
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const sourceExports = (sourceExportsMap[source] ||= {
          reportValueExports: [],
          source,
          typeOnlyNamedExport: null,
          valueOnlyNamedExport: null,
        });

        // Cache the first encountered exports for the package. We will need to come
        // back to these later when fixing the problems.
        if (node.exportKind === 'type') {
          if (sourceExports.typeOnlyNamedExport == null) {
            // The export is a type export
            sourceExports.typeOnlyNamedExport = node;
          }
        } else if (sourceExports.valueOnlyNamedExport == null) {
          // The export is a value export
          sourceExports.valueOnlyNamedExport = node;
        }

        // Next for the current export, we will separate type/value specifiers.
        const typeBasedSpecifiers: TSESTree.ExportSpecifier[] = [];
        const inlineTypeSpecifiers: TSESTree.ExportSpecifier[] = [];
        const valueSpecifiers: TSESTree.ExportSpecifier[] = [];

        // Note: it is valid to export values as types. We will avoid reporting errors
        // when this is encountered.
        if (node.exportKind !== 'type') {
          for (const specifier of node.specifiers) {
            if (specifier.exportKind === 'type') {
              inlineTypeSpecifiers.push(specifier);
              continue;
            }

            const isTypeBased = isSpecifierTypeBased(specifier);

            if (isTypeBased === true) {
              typeBasedSpecifiers.push(specifier);
            } else if (isTypeBased === false) {
              // When isTypeBased is undefined, we should avoid reporting them.
              valueSpecifiers.push(specifier);
            }
          }
        }

        if (
          (node.exportKind === 'value' && typeBasedSpecifiers.length) ||
          (node.exportKind === 'type' && valueSpecifiers.length)
        ) {
          sourceExports.reportValueExports.push({
            inlineTypeSpecifiers,
            node,
            typeBasedSpecifiers,
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
            if (report.valueSpecifiers.length === 0) {
              // Export is all type-only with no type specifiers; convert the entire export to `export type`.
              context.report({
                *fix(fixer) {
                  yield* fixExportInsertType(
                    fixer,
                    context.sourceCode,
                    report.node,
                  );
                },
                messageId: 'typeOverValue',
                node: report.node,
              });
              continue;
            }

            // We have both type and value violations.
            const allExportNames = report.typeBasedSpecifiers.map(
              specifier => specifier.local.name,
            );

            if (allExportNames.length === 1) {
              const exportNames = allExportNames[0];

              context.report({
                data: { exportNames },
                *fix(fixer) {
                  if (fixMixedExportsWithInlineTypeSpecifier) {
                    yield* fixAddTypeSpecifierToNamedExports(fixer, report);
                  } else {
                    yield* fixSeparateNamedExports(
                      fixer,
                      context.sourceCode,
                      report,
                    );
                  }
                },
                messageId: 'singleExportIsType',
                node: report.node,
              });
            } else {
              const exportNames = formatWordList(allExportNames);

              context.report({
                data: { exportNames },
                *fix(fixer) {
                  if (fixMixedExportsWithInlineTypeSpecifier) {
                    yield* fixAddTypeSpecifierToNamedExports(fixer, report);
                  } else {
                    yield* fixSeparateNamedExports(
                      fixer,
                      context.sourceCode,
                      report,
                    );
                  }
                },
                messageId: 'multipleExportsAreTypes',
                node: report.node,
              });
            }
          }
        }
      },
    };
  },
  defaultOptions: [
    {
      fixMixedExportsWithInlineTypeSpecifier: false,
    },
  ],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent usage of type exports',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      multipleExportsAreTypes:
        'Type exports {{exportNames}} are not values and should be exported using `export type`.',

      singleExportIsType:
        'Type export {{exportNames}} is not a value and should be exported using `export type`.',
      typeOverValue:
        'All exports in the declaration are only used as types. Use `export type`.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          fixMixedExportsWithInlineTypeSpecifier: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  name: 'consistent-type-exports',
});

/**
 * Inserts "type" into an export.
 *
 * Example:
 *
 * export type { Foo } from 'foo';
 *        ^^^^
 */
function* fixExportInsertType(
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  node: TSESTree.ExportNamedDeclaration,
): IterableIterator<TSESLint.RuleFix> {
  const exportToken = nullThrows(
    sourceCode.getFirstToken(node),
    NullThrowsReasons.MissingToken('export', node.type),
  );

  yield fixer.insertTextAfter(exportToken, ' type');

  for (const specifier of node.specifiers) {
    if (specifier.exportKind === 'type') {
      const kindToken = nullThrows(
        sourceCode.getFirstToken(specifier),
        NullThrowsReasons.MissingToken('export', specifier.type),
      );
      const firstTokenAfter = nullThrows(
        sourceCode.getTokenAfter(kindToken, {
          includeComments: true,
        }),
        'Missing token following the export kind.',
      );

      yield fixer.removeRange([kindToken.range[0], firstTokenAfter.range[0]]);
    }
  }
}

/**
 * Separates the exports which mismatch the kind of export the given
 * node represents. For example, a type export's named specifiers which
 * represent values will be inserted in a separate `export` statement.
 */
function* fixSeparateNamedExports(
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  report: ReportValueExport,
): IterableIterator<TSESLint.RuleFix> {
  const { inlineTypeSpecifiers, node, typeBasedSpecifiers, valueSpecifiers } =
    report;
  const typeSpecifiers = typeBasedSpecifiers.concat(inlineTypeSpecifiers);
  const source = getSourceFromExport(node);
  const specifierNames = typeSpecifiers.map(getSpecifierText).join(', ');

  const exportToken = nullThrows(
    sourceCode.getFirstToken(node),
    NullThrowsReasons.MissingToken('export', node.type),
  );

  // Filter the bad exports from the current line.
  const filteredSpecifierNames = valueSpecifiers
    .map(getSpecifierText)
    .join(', ');
  const openToken = nullThrows(
    sourceCode.getFirstToken(node, isOpeningBraceToken),
    NullThrowsReasons.MissingToken('{', node.type),
  );
  const closeToken = nullThrows(
    sourceCode.getLastToken(node, isClosingBraceToken),
    NullThrowsReasons.MissingToken('}', node.type),
  );

  // Remove exports from the current line which we're going to re-insert.
  yield fixer.replaceTextRange(
    [openToken.range[1], closeToken.range[0]],
    ` ${filteredSpecifierNames} `,
  );

  // Insert the bad exports into a new export line above.
  yield fixer.insertTextBefore(
    exportToken,
    `export type { ${specifierNames} }${source ? ` from '${source}'` : ''};\n`,
  );
}

function* fixAddTypeSpecifierToNamedExports(
  fixer: TSESLint.RuleFixer,
  report: ReportValueExport,
): IterableIterator<TSESLint.RuleFix> {
  if (report.node.exportKind === 'type') {
    return;
  }

  for (const specifier of report.typeBasedSpecifiers) {
    yield fixer.insertTextBefore(specifier, 'type ');
  }
}

/**
 * Returns the source of the export, or undefined if the named export has no source.
 */
function getSourceFromExport(
  node: TSESTree.ExportNamedDeclaration,
): string | undefined {
  if (
    node.source?.type === AST_NODE_TYPES.Literal &&
    typeof node.source.value === 'string'
  ) {
    return node.source.value;
  }

  return undefined;
}

/**
 * Returns the specifier text for the export. If it is aliased, we take care to return
 * the proper formatting.
 */
function getSpecifierText(specifier: TSESTree.ExportSpecifier): string {
  return `${specifier.local.name}${
    specifier.exported.name !== specifier.local.name
      ? ` as ${specifier.exported.name}`
      : ''
  }`;
}
