import {
  TSESLint,
  TSESTree,
  AST_TOKEN_TYPES,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Prefer = 'type-imports' | 'no-type-imports';

type Options = [
  {
    prefer?: Prefer;
    disallowTypeAnnotations?: boolean;
  },
];

interface SourceImports {
  source: string;
  reportValueImports: ReportValueImport[];
  // ImportDeclaration for type-only import only with named imports.
  typeOnlyNamedImport: TSESTree.ImportDeclaration | null;
  // ImportDeclaration for value-only import only with named imports.
  valueOnlyNamedImport: TSESTree.ImportDeclaration | null;
}
interface ReportValueImport {
  node: TSESTree.ImportDeclaration;
  typeSpecifiers: TSESTree.ImportClause[]; // It has at least one element.
  valueSpecifiers: TSESTree.ImportClause[];
  unusedSpecifiers: TSESTree.ImportClause[];
}

function isImportToken(
  token: TSESTree.Token | TSESTree.Comment,
): token is TSESTree.KeywordToken & { value: 'import' } {
  return token.type === AST_TOKEN_TYPES.Keyword && token.value === 'import';
}

function isTypeToken(
  token: TSESTree.Token | TSESTree.Comment,
): token is TSESTree.IdentifierToken & { value: 'type' } {
  return token.type === AST_TOKEN_TYPES.Identifier && token.value === 'type';
}

/**
 * Only if key is one of [identifier, string, number], ts will combine metadata of accessors .
 * class A {
 *   get a() {}
 *   set ['a'](v: Type) {}
 *
 *   get [1]() {}
 *   set [1](v: Type) {}
 *
 *   // Following won't be combined
 *   get [key]() {}
 *   set [key](v: Type) {}
 *
 *   get [true]() {}
 *   set [true](v: Type) {}
 *
 *   get ['a'+'b']() {}
 *   set ['a'+'b']() {}
 * }
 */
function getLiteralMethodKeyName(
  node: TSESTree.MethodDefinition,
): string | number | null {
  if (node.computed && node.key.type === AST_NODE_TYPES.Literal) {
    if (
      typeof node.key.value === 'string' ||
      typeof node.key.value === 'number'
    ) {
      return node.key.value;
    }
  } else if (!node.computed && node.key.type === AST_NODE_TYPES.Identifier) {
    return node.key.name;
  }
  return null;
}

type MessageIds =
  | 'typeOverValue'
  | 'someImportsAreOnlyTypes'
  | 'aImportIsOnlyTypes'
  | 'valueOverType'
  | 'noImportTypeAnnotations'
  | 'someImportsInDecoMeta'
  | 'aImportInDecoMeta';
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
      typeOverValue:
        'All imports in the declaration are only used as types. Use `import type`',
      someImportsAreOnlyTypes: 'Imports {{typeImports}} are only used as types',
      aImportIsOnlyTypes: 'Import {{typeImports}} is only used as types',
      someImportsInDecoMeta:
        'Type imports {{typeImports}} are used by decorator metadata',
      aImportInDecoMeta:
        'Type import {{typeImports}} is used by decorator metadata',
      valueOverType: 'Use an `import` instead of an `import type`.',
      noImportTypeAnnotations: '`import()` type annotations are forbidden.',
    },
    schema: [
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
    fixable: 'code',
  },

  defaultOptions: [
    {
      prefer: 'type-imports',
      disallowTypeAnnotations: true,
    },
  ],

  create(context, [option]) {
    const prefer = option.prefer ?? 'type-imports';
    const disallowTypeAnnotations = option.disallowTypeAnnotations !== false;
    const sourceCode = context.getSourceCode();
    const emitDecoratorMetadata = util
      .getParserServices(context, true)
      .program.getCompilerOptions().emitDecoratorMetadata;

    const sourceImportsMap: { [key: string]: SourceImports } = {};

    return {
      ...(prefer === 'type-imports'
        ? {
            // prefer type imports
            ImportDeclaration(node: TSESTree.ImportDeclaration): void {
              const source = node.source.value as string;
              const sourceImports =
                sourceImportsMap[source] ??
                (sourceImportsMap[source] = {
                  source,
                  reportValueImports: [],
                  typeOnlyNamedImport: null,
                  valueOnlyNamedImport: null,
                });
              if (node.importKind === 'type') {
                if (
                  !sourceImports.typeOnlyNamedImport &&
                  node.specifiers.every(
                    specifier =>
                      specifier.type === AST_NODE_TYPES.ImportSpecifier,
                  )
                ) {
                  sourceImports.typeOnlyNamedImport = node;
                }
              } else {
                if (
                  !sourceImports.valueOnlyNamedImport &&
                  node.specifiers.every(
                    specifier =>
                      specifier.type === AST_NODE_TYPES.ImportSpecifier,
                  )
                ) {
                  sourceImports.valueOnlyNamedImport = node;
                }
              }

              const typeSpecifiers: TSESTree.ImportClause[] = [];
              const valueSpecifiers: TSESTree.ImportClause[] = [];
              const unusedSpecifiers: TSESTree.ImportClause[] = [];
              for (const specifier of node.specifiers) {
                const [variable] = context.getDeclaredVariables(specifier);
                if (variable.references.length === 0) {
                  unusedSpecifiers.push(specifier);
                } else {
                  const onlyHasTypeReferences = variable.references.every(
                    ref => {
                      if (ref.isValueReference && ref.isTypeReference) {
                        /**
                         * keep origin import kind when export
                         * export { Type }
                         * export default Type;
                         */
                        return node.importKind === 'type';
                      }
                      if (ref.isValueReference) {
                        // `type T = typeof foo` will create a value reference because "foo" must be a value type
                        // however this value reference is safe to use with type-only imports
                        let parent = ref.identifier.parent;
                        while (parent) {
                          if (parent.type === AST_NODE_TYPES.TSTypeQuery) {
                            return true;
                          }
                          // TSTypeQuery must have a TSESTree.EntityName as its child, so we can filter here and break early
                          if (parent.type !== AST_NODE_TYPES.TSQualifiedName) {
                            break;
                          }
                          parent = parent.parent;
                        }
                        return false;
                      }

                      // https://github.com/typescript-eslint/typescript-eslint/issues/2559#issuecomment-692882427
                      if (emitDecoratorMetadata && ref.isTypeReference) {
                        let parent = ref.identifier.parent;
                        /**
                         * import * as foo from 'foo';
                         * foo.Foo    // <--- check this
                         */
                        if (parent?.type === AST_NODE_TYPES.TSQualifiedName) {
                          parent = parent.parent;
                        }
                        if (parent) {
                          if (
                            parent.type === AST_NODE_TYPES.TSTypeReference &&
                            parent.parent?.type ===
                              AST_NODE_TYPES.TSTypeAnnotation
                          ) {
                            const annotationParent = parent.parent.parent;

                            /**
                             * class A {
                             *   @meta     // <--- check this
                             *   foo: Type;
                             * }
                             */
                            if (
                              annotationParent?.type ===
                                AST_NODE_TYPES.ClassProperty &&
                              annotationParent.decorators
                            ) {
                              return false;
                            }

                            let functionNode = annotationParent;
                            if (
                              annotationParent?.type ===
                              AST_NODE_TYPES.Identifier
                            ) {
                              /**
                               * TODO:
                               *
                               * I don't think this is valid, but there are no ts errors and no metadata emitted now.
                               * https://github.com/microsoft/TypeScript/issues/41354
                               *
                               * class A {
                               *   set foo(@meta a: Type) {}
                               * }
                               */

                              /**
                               * class A {
                               *   foo(
                               *     @meta    // <--- check this
                               *     a: Type
                               *   ) {}
                               * }
                               */
                              if (annotationParent.decorators) {
                                return false;
                              }

                              functionNode = annotationParent.parent;
                            }

                            if (
                              functionNode?.type ===
                                AST_NODE_TYPES.FunctionExpression &&
                              functionNode.parent?.type ===
                                AST_NODE_TYPES.MethodDefinition
                            ) {
                              const methodNode = functionNode.parent;
                              /**
                               * class A {
                               *   @meta    // <--- check this
                               *   foo(a: Type) {}
                               *
                               *   @meta    // <--- and this
                               *   foo(): Type {}
                               * }
                               */
                              if (methodNode.decorators) {
                                return false;
                              }

                              if (methodNode.kind === 'set') {
                                const keyName = getLiteralMethodKeyName(
                                  methodNode,
                                );

                                /**
                                 * class A {
                                 *   @meta      // <--- check this
                                 *   get a() {}
                                 *   set ['a'](v: Type) {}
                                 * }
                                 */
                                if (
                                  keyName &&
                                  methodNode.parent?.type ===
                                    AST_NODE_TYPES.ClassBody &&
                                  methodNode.parent.body.find(
                                    (node): node is TSESTree.MethodDefinition =>
                                      node.type ===
                                        AST_NODE_TYPES.MethodDefinition &&
                                      // Node must both be static or not
                                      node.static === methodNode.static &&
                                      getLiteralMethodKeyName(node) === keyName,
                                  )?.decorators
                                ) {
                                  return false;
                                }
                              }

                              /**
                               * @meta      // <--- check this
                               * class A {
                               *   constructor(a: Type) {}
                               * }
                               */
                              if (
                                methodNode.kind === 'constructor' &&
                                methodNode.parent?.type ===
                                  AST_NODE_TYPES.ClassBody &&
                                methodNode.parent.parent?.type ===
                                  AST_NODE_TYPES.ClassDeclaration &&
                                methodNode.parent.parent.decorators
                              ) {
                                return false;
                              }
                            }
                          }
                        }
                      }

                      return ref.isTypeReference;
                    },
                  );
                  if (onlyHasTypeReferences) {
                    typeSpecifiers.push(specifier);
                  } else {
                    valueSpecifiers.push(specifier);
                  }
                }
              }

              if (
                (node.importKind === 'value' && typeSpecifiers.length) ||
                (node.importKind === 'type' && valueSpecifiers.length)
              ) {
                sourceImports.reportValueImports.push({
                  node,
                  typeSpecifiers,
                  valueSpecifiers,
                  unusedSpecifiers,
                });
              }
            },
            'Program:exit'(): void {
              for (const sourceImports of Object.values(sourceImportsMap)) {
                if (sourceImports.reportValueImports.length === 0) {
                  continue;
                }
                for (const report of sourceImports.reportValueImports) {
                  if (
                    report.valueSpecifiers.length === 0 &&
                    report.unusedSpecifiers.length === 0
                  ) {
                    // import is all type-only, convert the entire import to `import type`
                    context.report({
                      node: report.node,
                      messageId: 'typeOverValue',
                      *fix(fixer) {
                        yield* fixToTypeImport(fixer, report, sourceImports);
                      },
                    });
                  } else {
                    const isTypeImport = report.node.importKind === 'type';

                    // we have a mixed type/value import, so we need to split them out into multiple exports
                    const importNames = (isTypeImport
                      ? report.valueSpecifiers
                      : report.typeSpecifiers
                    ).map(specifier => `"${specifier.local.name}"`);
                    context.report({
                      node: report.node,
                      messageId:
                        importNames.length === 1
                          ? isTypeImport
                            ? 'aImportInDecoMeta'
                            : 'aImportIsOnlyTypes'
                          : isTypeImport
                          ? 'someImportsInDecoMeta'
                          : 'someImportsAreOnlyTypes',
                      data: {
                        typeImports:
                          importNames.length === 1
                            ? importNames[0]
                            : [
                                importNames.slice(0, -1).join(', '),
                                importNames.slice(-1)[0],
                              ].join(' and '),
                      },
                      *fix(fixer) {
                        if (isTypeImport) {
                          yield* fixToValueImportInDecoMeta(
                            fixer,
                            report,
                            sourceImports,
                          );
                        } else {
                          yield* fixToTypeImport(fixer, report, sourceImports);
                        }
                      },
                    });
                  }
                }
              }
            },
          }
        : {
            // prefer no type imports
            'ImportDeclaration[importKind = "type"]'(
              node: TSESTree.ImportDeclaration,
            ): void {
              context.report({
                node,
                messageId: 'valueOverType',
                fix(fixer) {
                  return fixToValueImport(fixer, node);
                },
              });
            },
          }),
      ...(disallowTypeAnnotations
        ? {
            // disallow `import()` type
            TSImportType(node: TSESTree.TSImportType): void {
              context.report({
                node,
                messageId: 'noImportTypeAnnotations',
              });
            },
          }
        : {}),
    };

    function classifySpecifier(
      node: TSESTree.ImportDeclaration,
    ): {
      defaultSpecifier: TSESTree.ImportDefaultSpecifier | null;
      namespaceSpecifier: TSESTree.ImportNamespaceSpecifier | null;
      namedSpecifiers: TSESTree.ImportSpecifier[];
    } {
      const defaultSpecifier: TSESTree.ImportDefaultSpecifier | null =
        node.specifiers[0].type === AST_NODE_TYPES.ImportDefaultSpecifier
          ? node.specifiers[0]
          : null;
      const namespaceSpecifier: TSESTree.ImportNamespaceSpecifier | null =
        node.specifiers[0].type === AST_NODE_TYPES.ImportNamespaceSpecifier
          ? node.specifiers[0]
          : null;
      const namedSpecifiers: TSESTree.ImportSpecifier[] = node.specifiers.filter(
        (specifier): specifier is TSESTree.ImportSpecifier =>
          specifier.type === AST_NODE_TYPES.ImportSpecifier,
      );
      return {
        defaultSpecifier,
        namespaceSpecifier,
        namedSpecifiers,
      };
    }

    /**
     * Returns information for fixing named specifiers.
     */
    function getFixesNamedSpecifiers(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.ImportDeclaration,
      typeNamedSpecifiers: TSESTree.ImportSpecifier[],
      allNamedSpecifiers: TSESTree.ImportSpecifier[],
    ): {
      typeNamedSpecifiersText: string;
      removeTypeNamedSpecifiers: TSESLint.RuleFix[];
    } {
      const typeNamedSpecifiersTexts: string[] = [];
      const removeTypeNamedSpecifiers: TSESLint.RuleFix[] = [];
      if (typeNamedSpecifiers.length === allNamedSpecifiers.length) {
        // e.g.
        // import Foo, {Type1, Type2} from 'foo'
        // import DefType, {Type1, Type2} from 'foo'
        const openingBraceToken = util.nullThrows(
          sourceCode.getTokenBefore(
            typeNamedSpecifiers[0],
            util.isOpeningBraceToken,
          ),
          util.NullThrowsReasons.MissingToken('{', node.type),
        );
        const commaToken = util.nullThrows(
          sourceCode.getTokenBefore(openingBraceToken, util.isCommaToken),
          util.NullThrowsReasons.MissingToken(',', node.type),
        );
        const closingBraceToken = util.nullThrows(
          sourceCode.getFirstTokenBetween(
            openingBraceToken,
            node.source,
            util.isClosingBraceToken,
          ),
          util.NullThrowsReasons.MissingToken('}', node.type),
        );

        // import DefType, {...} from 'foo'
        //               ^^^^^^^ remove
        removeTypeNamedSpecifiers.push(
          fixer.removeRange([commaToken.range[0], closingBraceToken.range[1]]),
        );

        typeNamedSpecifiersTexts.push(
          sourceCode.text.slice(
            openingBraceToken.range[1],
            closingBraceToken.range[0],
          ),
        );
      } else {
        const typeNamedSpecifierGroups: TSESTree.ImportSpecifier[][] = [];
        let group: TSESTree.ImportSpecifier[] = [];
        for (const namedSpecifier of allNamedSpecifiers) {
          if (typeNamedSpecifiers.includes(namedSpecifier)) {
            group.push(namedSpecifier);
          } else if (group.length) {
            typeNamedSpecifierGroups.push(group);
            group = [];
          }
        }
        if (group.length) {
          typeNamedSpecifierGroups.push(group);
        }
        for (const namedSpecifiers of typeNamedSpecifierGroups) {
          const { removeRange, textRange } = getNamedSpecifierRanges(
            namedSpecifiers,
            allNamedSpecifiers,
          );
          removeTypeNamedSpecifiers.push(fixer.removeRange(removeRange));

          typeNamedSpecifiersTexts.push(sourceCode.text.slice(...textRange));
        }
      }
      return {
        typeNamedSpecifiersText: typeNamedSpecifiersTexts.join(','),
        removeTypeNamedSpecifiers,
      };
    }

    /**
     * Returns ranges for fixing named specifier.
     */
    function getNamedSpecifierRanges(
      namedSpecifierGroup: TSESTree.ImportSpecifier[],
      allNamedSpecifiers: TSESTree.ImportSpecifier[],
    ): {
      textRange: TSESTree.Range;
      removeRange: TSESTree.Range;
    } {
      const first = namedSpecifierGroup[0];
      const last = namedSpecifierGroup[namedSpecifierGroup.length - 1];
      const removeRange: TSESTree.Range = [first.range[0], last.range[1]];
      const textRange: TSESTree.Range = [...removeRange];
      const before = sourceCode.getTokenBefore(first)!;
      textRange[0] = before.range[1];
      if (util.isCommaToken(before)) {
        removeRange[0] = before.range[0];
      } else {
        removeRange[0] = before.range[1];
      }

      const isFirst = allNamedSpecifiers[0] === first;
      const isLast = allNamedSpecifiers[allNamedSpecifiers.length - 1] === last;
      const after = sourceCode.getTokenAfter(last)!;
      textRange[1] = after.range[0];
      if (isFirst || isLast) {
        if (util.isCommaToken(after)) {
          removeRange[1] = after.range[1];
        }
      }

      return {
        textRange,
        removeRange,
      };
    }

    /**
     * insert specifiers to named import node.
     * e.g.
     * import type { Already, Type1, Type2 } from 'foo'
     *                        ^^^^^^^^^^^^^ insert
     */
    function insertToNamedImport(
      fixer: TSESLint.RuleFixer,
      target: TSESTree.ImportDeclaration,
      insertText: string,
    ): TSESLint.RuleFix {
      const closingBraceToken = util.nullThrows(
        sourceCode.getFirstTokenBetween(
          sourceCode.getFirstToken(target)!,
          target.source,
          util.isClosingBraceToken,
        ),
        util.NullThrowsReasons.MissingToken('}', target.type),
      );
      const before = sourceCode.getTokenBefore(closingBraceToken)!;
      if (!util.isCommaToken(before) && !util.isOpeningBraceToken(before)) {
        insertText = ',' + insertText;
      }
      return fixer.insertTextBefore(closingBraceToken, insertText);
    }

    function* fixToTypeImport(
      fixer: TSESLint.RuleFixer,
      report: ReportValueImport,
      sourceImports: SourceImports,
    ): IterableIterator<TSESLint.RuleFix> {
      const { node } = report;

      const {
        defaultSpecifier,
        namespaceSpecifier,
        namedSpecifiers,
      } = classifySpecifier(node);

      if (namespaceSpecifier) {
        // e.g.
        // import * as types from 'foo'
        yield* fixToTypeImportByInsertType(fixer, node, false);
        return;
      } else if (defaultSpecifier) {
        if (
          report.typeSpecifiers.includes(defaultSpecifier) &&
          namedSpecifiers.length === 0
        ) {
          // e.g.
          // import Type from 'foo'
          yield* fixToTypeImportByInsertType(fixer, node, true);
          return;
        }
      } else {
        if (
          namedSpecifiers.every(specifier =>
            report.typeSpecifiers.includes(specifier),
          )
        ) {
          // e.g.
          // import {Type1, Type2} from 'foo'
          yield* fixToTypeImportByInsertType(fixer, node, false);
          return;
        }
      }

      const typeNamedSpecifiers = namedSpecifiers.filter(specifier =>
        report.typeSpecifiers.includes(specifier),
      );

      const fixesNamedSpecifiers = getFixesNamedSpecifiers(
        fixer,
        node,
        typeNamedSpecifiers,
        namedSpecifiers,
      );
      const afterFixes: TSESLint.RuleFix[] = [];
      if (typeNamedSpecifiers.length) {
        if (sourceImports.typeOnlyNamedImport) {
          const insertTypeNamedSpecifiers = insertToNamedImport(
            fixer,
            sourceImports.typeOnlyNamedImport,
            fixesNamedSpecifiers.typeNamedSpecifiersText,
          );
          if (sourceImports.typeOnlyNamedImport.range[1] <= node.range[0]) {
            yield insertTypeNamedSpecifiers;
          } else {
            afterFixes.push(insertTypeNamedSpecifiers);
          }
        } else {
          yield fixer.insertTextBefore(
            node,
            `import type {${
              fixesNamedSpecifiers.typeNamedSpecifiersText
            }} from ${sourceCode.getText(node.source)};\n`,
          );
        }
      }

      if (
        defaultSpecifier &&
        report.typeSpecifiers.includes(defaultSpecifier)
      ) {
        if (typeNamedSpecifiers.length === namedSpecifiers.length) {
          const importToken = util.nullThrows(
            sourceCode.getFirstToken(node, isImportToken),
            util.NullThrowsReasons.MissingToken('import', node.type),
          );
          // import type Type from 'foo'
          //        ^^^^ insert
          yield fixer.insertTextAfter(importToken, ' type');
        } else {
          yield fixer.insertTextBefore(
            node,
            `import type ${sourceCode.getText(
              defaultSpecifier,
            )} from ${sourceCode.getText(node.source)};\n`,
          );
          // import Type , {...} from 'foo'
          //        ^^^^^^ remove
          yield fixer.remove(defaultSpecifier);
          yield fixer.remove(sourceCode.getTokenAfter(defaultSpecifier)!);
        }
      }

      yield* fixesNamedSpecifiers.removeTypeNamedSpecifiers;

      yield* afterFixes;
    }

    function* fixToTypeImportByInsertType(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.ImportDeclaration,
      isDefaultImport: boolean,
    ): IterableIterator<TSESLint.RuleFix> {
      // import type Foo from 'foo'
      //       ^^^^^ insert
      const importToken = util.nullThrows(
        sourceCode.getFirstToken(node, isImportToken),
        util.NullThrowsReasons.MissingToken('import', node.type),
      );
      yield fixer.insertTextAfter(importToken, ' type');

      if (isDefaultImport) {
        // Has default import
        const openingBraceToken = sourceCode.getFirstTokenBetween(
          importToken,
          node.source,
          util.isOpeningBraceToken,
        );
        if (openingBraceToken) {
          // Only braces. e.g. import Foo, {} from 'foo'
          const commaToken = util.nullThrows(
            sourceCode.getTokenBefore(openingBraceToken, util.isCommaToken),
            util.NullThrowsReasons.MissingToken(',', node.type),
          );
          const closingBraceToken = util.nullThrows(
            sourceCode.getFirstTokenBetween(
              openingBraceToken,
              node.source,
              util.isClosingBraceToken,
            ),
            util.NullThrowsReasons.MissingToken('}', node.type),
          );

          // import type Foo, {} from 'foo'
          //                  ^^ remove
          yield fixer.removeRange([
            commaToken.range[0],
            closingBraceToken.range[1],
          ]);
          const specifiersText = sourceCode.text.slice(
            commaToken.range[1],
            closingBraceToken.range[1],
          );
          if (node.specifiers.length > 1) {
            // import type Foo from 'foo'
            // import type {...} from 'foo' // <- insert
            yield fixer.insertTextAfter(
              node,
              `\nimport type${specifiersText} from ${sourceCode.getText(
                node.source,
              )};`,
            );
          }
        }
      }
    }

    function* fixToValueImportInDecoMeta(
      fixer: TSESLint.RuleFixer,
      report: ReportValueImport,
      sourceImports: SourceImports,
    ): IterableIterator<TSESLint.RuleFix> {
      const { node } = report;

      const {
        defaultSpecifier,
        namespaceSpecifier,
        namedSpecifiers,
      } = classifySpecifier(node);

      if (namespaceSpecifier) {
        // e.g.
        // import type * as types from 'foo'
        yield* fixToValueImport(fixer, node);
        return;
      } else if (defaultSpecifier) {
        if (
          report.valueSpecifiers.includes(defaultSpecifier) &&
          namedSpecifiers.length === 0
        ) {
          // e.g.
          // import type Type from 'foo'
          yield* fixToValueImport(fixer, node);
          return;
        }
      } else {
        if (
          namedSpecifiers.every(specifier =>
            report.valueSpecifiers.includes(specifier),
          )
        ) {
          // e.g.
          // import type {Type1, Type2} from 'foo'
          yield* fixToValueImport(fixer, node);
          return;
        }
      }

      const valueNamedSpecifiers = namedSpecifiers.filter(specifier =>
        report.valueSpecifiers.includes(specifier),
      );

      const fixesNamedSpecifiers = getFixesNamedSpecifiers(
        fixer,
        node,
        valueNamedSpecifiers,
        namedSpecifiers,
      );
      const afterFixes: TSESLint.RuleFix[] = [];
      if (valueNamedSpecifiers.length) {
        if (sourceImports.valueOnlyNamedImport) {
          const insertTypeNamedSpecifiers = insertToNamedImport(
            fixer,
            sourceImports.valueOnlyNamedImport,
            fixesNamedSpecifiers.typeNamedSpecifiersText,
          );
          if (sourceImports.valueOnlyNamedImport.range[1] <= node.range[0]) {
            yield insertTypeNamedSpecifiers;
          } else {
            afterFixes.push(insertTypeNamedSpecifiers);
          }
        } else {
          yield fixer.insertTextBefore(
            node,
            `import {${
              fixesNamedSpecifiers.typeNamedSpecifiersText
            }} from ${sourceCode.getText(node.source)};\n`,
          );
        }
      }

      yield* fixesNamedSpecifiers.removeTypeNamedSpecifiers;

      yield* afterFixes;
    }

    function* fixToValueImport(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.ImportDeclaration,
    ): IterableIterator<TSESLint.RuleFix> {
      // import type Foo from 'foo'
      //        ^^^^ remove
      const importToken = util.nullThrows(
        sourceCode.getFirstToken(node, isImportToken),
        util.NullThrowsReasons.MissingToken('import', node.type),
      );
      const typeToken = util.nullThrows(
        sourceCode.getFirstTokenBetween(
          importToken,
          node.specifiers[0]?.local ?? node.source,
          isTypeToken,
        ),
        util.NullThrowsReasons.MissingToken('type', node.type),
      );
      yield fixer.remove(typeToken);
    }
  },
});
