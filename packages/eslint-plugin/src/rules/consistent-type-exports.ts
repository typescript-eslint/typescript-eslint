import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  formatWordList,
  getParserServices,
  isClosingBraceToken,
  isOpeningBraceToken,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export type Options = [
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

export type MessageIds =
  | 'multipleExportsAreTypes'
  | 'singleExportIsType'
  | 'typeOverValue';

export default createRule<Options, MessageIds>({
  name: 'consistent-type-exports',
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
            description:
              'Whether the rule will autofix "mixed" export cases using TS inline type specifiers.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      fixMixedExportsWithInlineTypeSpecifier: false,
    },
  ],

  create(context, [{ fixMixedExportsWithInlineTypeSpecifier }]) {
    const sourceExportsMap: Record<string, SourceExports> = {};
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    /**
     * Helper for identifying if a symbol resolves to a
     * JavaScript value or a TypeScript type.
     *
     * @returns True/false if is a type or not, or undefined if the specifier
     * can't be resolved.
     */
    function isSymbolTypeBased(
      symbol: ts.Symbol | undefined,
    ): boolean | undefined {
      if (!symbol || checker.isUnknownSymbol(symbol)) {
        return undefined;
      }
      if (
        symbol.getDeclarations()?.some(ts.isTypeOnlyImportOrExportDeclaration)
      ) {
        return true;
      }
      if (symbol.flags & ts.SymbolFlags.Value) {
        return false;
      }
      return symbol.flags & ts.SymbolFlags.Alias
        ? isSymbolTypeBased(checker.getImmediateAliasedSymbol(symbol))
        : true;
    }

    return {
      ExportAllDeclaration(node): void {
        if (node.exportKind === 'type') {
          return;
        }

        const sourceModule = ts.resolveModuleName(
          node.source.value,
          context.filename,
          services.program.getCompilerOptions(),
          ts.sys,
        );
        if (sourceModule.resolvedModule == null) {
          return;
        }
        const sourceFile = services.program.getSourceFile(
          sourceModule.resolvedModule.resolvedFileName,
        );
        if (sourceFile == null) {
          return;
        }
        const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);
        if (sourceFileSymbol == null) {
          return;
        }

        const sourceFileType = checker.getTypeOfSymbol(sourceFileSymbol);
        // Module can explicitly export types or values, and it's not difficult
        // to distinguish one from the other, since we can get the flags of
        // the exported symbols or check if symbol export declaration has
        // the "type" keyword in it.
        //
        // Things get a lot more complicated when we're dealing with
        // export * from './module-with-type-only-exports'
        // export type * from './module-with-type-and-value-exports'
        //
        // TS checker has an internal function getExportsOfModuleWorker that
        // recursively visits all module exports, including "export *". It then
        // puts type-only-star-exported symbols into the typeOnlyExportStarMap
        // property of sourceFile's SymbolLinks. Since symbol links aren't
        // exposed outside the checker, we cannot access it directly.
        //
        // Therefore, to filter out value properties, we use the following hack:
        // checker.getPropertiesOfType returns all exports that were originally
        // values, but checker.getPropertyOfType returns undefined for
        // properties that are mentioned in the typeOnlyExportStarMap.
        const isThereAnyExportedValue = checker
          .getPropertiesOfType(sourceFileType)
          .some(
            propertyTypeSymbol =>
              checker.getPropertyOfType(
                sourceFileType,
                propertyTypeSymbol.escapedName.toString(),
              ) != null,
          );
        if (isThereAnyExportedValue) {
          return;
        }

        context.report({
          node,
          messageId: 'typeOverValue',
          fix(fixer) {
            const asteriskToken = nullThrows(
              context.sourceCode.getFirstToken(
                node,
                token =>
                  token.type === AST_TOKEN_TYPES.Punctuator &&
                  token.value === '*',
              ),
              NullThrowsReasons.MissingToken(
                'asterisk',
                'export all declaration',
              ),
            );

            return fixer.insertTextBefore(asteriskToken, 'type ');
          },
        });
      },
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
          // The export is a type export
          sourceExports.typeOnlyNamedExport ??= node;
        } else {
          // The export is a value export
          sourceExports.valueOnlyNamedExport ??= node;
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

            const isTypeBased = isSymbolTypeBased(
              services.getSymbolAtLocation(specifier.exported),
            );

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
            node,
            inlineTypeSpecifiers,
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
                node: report.node,
                messageId: 'typeOverValue',
                *fix(fixer) {
                  yield* fixExportInsertType(
                    fixer,
                    context.sourceCode,
                    report.node,
                  );
                },
              });
              continue;
            }

            // We have both type and value violations.
            const allExportNames = report.typeBasedSpecifiers.map(specifier =>
              specifier.local.type === AST_NODE_TYPES.Identifier
                ? specifier.local.name
                : specifier.local.value,
            );

            if (allExportNames.length === 1) {
              const exportNames = allExportNames[0];

              context.report({
                node: report.node,
                messageId: 'singleExportIsType',
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
              });
            } else {
              const exportNames = formatWordList(allExportNames);

              context.report({
                node: report.node,
                messageId: 'multipleExportsAreTypes',
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
              });
            }
          }
        }
      },
    };
  },
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
  const { node, inlineTypeSpecifiers, typeBasedSpecifiers, valueSpecifiers } =
    report;
  const typeSpecifiers = [...typeBasedSpecifiers, ...inlineTypeSpecifiers];
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
  const exportedName =
    specifier.exported.type === AST_NODE_TYPES.Literal
      ? specifier.exported.raw
      : specifier.exported.name;
  const localName =
    specifier.local.type === AST_NODE_TYPES.Literal
      ? specifier.local.raw
      : specifier.local.name;

  return `${localName}${
    exportedName !== localName ? ` as ${exportedName}` : ''
  }`;
}
