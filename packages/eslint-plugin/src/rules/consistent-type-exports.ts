import {
  TSESTree,
  ParserServices,
  AST_NODE_TYPES,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import { SymbolFlags } from 'typescript';
import * as util from '../util';

type Options = [];

interface SourceExports {
  source: string;
  reportValueExports: ReportValueExport[];
  typeOnlyNamedExport: TSESTree.ExportNamedDeclaration | null;
  valueOnlyNamedExport: TSESTree.ExportNamedDeclaration | null;
}

interface ReportValueExport {
  node: TSESTree.ExportNamedDeclaration;
  typeSpecifiers: TSESTree.ExportSpecifier[];
  valueSpecifiers: TSESTree.ExportSpecifier[];
}

type MessageIds =
  | 'typeOverValue'
  | 'singleExportIsType'
  | 'multipleExportsAreTypes';

export default util.createRule<Options, MessageIds>({
  name: 'consistent-type-exports',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces consistent usage of type exports',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      typeOverValue:
        'All exports in the declaration are only used as types. Use `export type`.',

      singleExportIsType:
        'Type export {{exportNames}} is not a value and should be exported using `export type`.',
      multipleExportsAreTypes:
        'Type exports {{exportNames}} are not values and should be exported using `export type`.',
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const sourceExportsMap: { [key: string]: SourceExports } = {};
    const parserServices = util.getParserServices(context);

    return {
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void {
        // Coerce the source into a string for use as a lookup entry.
        const source = getSourceFromExport(node) ?? 'undefined';
        const sourceExports = (sourceExportsMap[source] ||= {
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

        // Next for the current export, we will separate type/value specifiers.
        const typeSpecifiers: TSESTree.ExportSpecifier[] = [];
        const valueSpecifiers: TSESTree.ExportSpecifier[] = [];

        // Note: it is valid to export values as types. We will avoid reporting errors
        // when this is encountered.
        if (node.exportKind !== 'type') {
          for (const specifier of node.specifiers) {
            const isTypeBased = isSpecifierTypeBased(parserServices, specifier);

            if (isTypeBased === true) {
              typeSpecifiers.push(specifier);
            } else if (isTypeBased === false) {
              // When isTypeBased is undefined, we should avoid reporting them.
              valueSpecifiers.push(specifier);
            }
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
              // Export is all type-only; convert the entire export to `export type`.
              context.report({
                node: report.node,
                messageId: 'typeOverValue',
                *fix(fixer) {
                  yield* fixExportInsertType(fixer, sourceCode, report.node);
                },
              });
            } else {
              // We have both type and value violations.
              const allExportNames = report.typeSpecifiers.map(
                specifier => `${specifier.local.name}`,
              );

              if (allExportNames.length === 1) {
                const exportNames = allExportNames[0];

                context.report({
                  node: report.node,
                  messageId: 'singleExportIsType',
                  data: { exportNames },
                  *fix(fixer) {
                    yield* fixSeparateNamedExports(fixer, sourceCode, report);
                  },
                });
              } else {
                const exportNames = util.formatWordList(allExportNames);

                context.report({
                  node: report.node,
                  messageId: 'multipleExportsAreTypes',
                  data: { exportNames },
                  *fix(fixer) {
                    yield* fixSeparateNamedExports(fixer, sourceCode, report);
                  },
                });
              }
            }
          }
        }
      },
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
function* fixExportInsertType(
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
  report: ReportValueExport,
): IterableIterator<TSESLint.RuleFix> {
  const { node, typeSpecifiers, valueSpecifiers } = report;
  const source = getSourceFromExport(node);
  const separateTypes = node.exportKind !== 'type';
  const specifiersToSeparate = separateTypes ? typeSpecifiers : valueSpecifiers;
  const specifierNames = specifiersToSeparate.map(getSpecifierText).join(', ');

  const exportToken = util.nullThrows(
    sourceCode.getFirstToken(node),
    util.NullThrowsReasons.MissingToken('export', node.type),
  );

  // Filter the bad exports from the current line.
  const filteredSpecifierNames = (
    separateTypes ? valueSpecifiers : typeSpecifiers
  )
    .map(getSpecifierText)
    .join(', ');
  const openToken = util.nullThrows(
    sourceCode.getFirstToken(node, util.isOpeningBraceToken),
    util.NullThrowsReasons.MissingToken('{', node.type),
  );
  const closeToken = util.nullThrows(
    sourceCode.getLastToken(node, util.isClosingBraceToken),
    util.NullThrowsReasons.MissingToken('}', node.type),
  );

  // Remove exports from the current line which we're going to re-insert.
  yield fixer.replaceTextRange(
    [openToken.range[1], closeToken.range[0]],
    ` ${filteredSpecifierNames} `,
  );

  // Insert the bad exports into a new export line above.
  yield fixer.insertTextBefore(
    exportToken,
    `export ${separateTypes ? 'type ' : ''}{ ${specifierNames} }${
      source ? ` from '${source}'` : ''
    };\n`,
  );
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
