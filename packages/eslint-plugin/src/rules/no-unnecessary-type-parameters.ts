import type { Reference } from '@typescript-eslint/scope-manager';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { MakeRequired } from '../util';

import {
  createRule,
  getParserServices,
  getWrappingFixer,
  nullThrows,
  NullThrowsReasons,
} from '../util';

type NodeWithTypeParameters = MakeRequired<
  ts.ClassLikeDeclaration | ts.SignatureDeclaration,
  'typeParameters'
>;

export default createRule({
  name: 'no-unnecessary-type-parameters',
  meta: {
    type: 'problem',
    docs: {
      description: "Disallow type parameters that aren't used multiple times",
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      replaceUsagesWithConstraint:
        'Replace all usages of type parameter with its constraint.',
      sole: 'Type parameter {{name}} is {{uses}} in the {{descriptor}} signature.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getParserServices(context);

    function checkNode(node: TSESTree.FunctionLike, descriptor: string): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
        node,
      ) as NodeWithTypeParameters;

      const checker = parserServices.program.getTypeChecker();
      let counts: Map<ts.Identifier, number> | undefined;

      // Get the scope in which the type parameters are declared.
      const scope = context.sourceCode.getScope(node);

      for (const typeParameter of tsNode.typeParameters) {
        const esTypeParameter =
          parserServices.tsNodeToESTreeNodeMap.get<TSESTree.TSTypeParameter>(
            typeParameter,
          );

        const smTypeParameterVariable = nullThrows(
          (() => {
            const variable = scope.set.get(esTypeParameter.name.name);
            return variable?.isTypeVariable ? variable : undefined;
          })(),
          "Type parameter should be present in scope's variables.",
        );

        // Quick path: if the type parameter is used multiple times in the AST,
        // we don't need to dip into types to know it's repeated.
        if (
          isTypeParameterRepeatedInAST(
            esTypeParameter,
            smTypeParameterVariable.references,
            node.body?.range[0] ?? node.returnType?.range[1],
          )
        ) {
          continue;
        }

        // For any inferred types, we have to dip into type checking.
        counts ??= countTypeParameterUsage(checker, tsNode);
        const identifierCounts = counts.get(typeParameter.name);
        if (!identifierCounts || identifierCounts > 2) {
          continue;
        }

        context.report({
          node: esTypeParameter,
          messageId: 'sole',
          data: {
            name: typeParameter.name.text,
            descriptor,
            uses: identifierCounts === 1 ? 'never used' : 'used only once',
          },
          suggest: [
            {
              messageId: 'replaceUsagesWithConstraint',
              *fix(fixer): Generator<TSESLint.RuleFix> {
                // Replace all the usages of the type parameter with the constraint...

                const constraint = esTypeParameter.constraint;
                // special case - a constraint of 'any' actually acts like 'unknown'
                const constraintText =
                  constraint != null &&
                  constraint.type !== AST_NODE_TYPES.TSAnyKeyword
                    ? context.sourceCode.getText(constraint)
                    : 'unknown';
                for (const reference of smTypeParameterVariable.references) {
                  if (reference.isTypeReference) {
                    const referenceNode = reference.identifier;
                    const isComplexType =
                      constraint?.type === AST_NODE_TYPES.TSUnionType ||
                      constraint?.type === AST_NODE_TYPES.TSIntersectionType ||
                      constraint?.type === AST_NODE_TYPES.TSConditionalType;
                    const hasMatchingAncestorType = [
                      AST_NODE_TYPES.TSArrayType,
                      AST_NODE_TYPES.TSIndexedAccessType,
                      AST_NODE_TYPES.TSIntersectionType,
                      AST_NODE_TYPES.TSUnionType,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    ].some(type => referenceNode.parent.parent!.type === type);
                    if (isComplexType && hasMatchingAncestorType) {
                      const fixResult = getWrappingFixer({
                        node: referenceNode,
                        innerNode: constraint,
                        sourceCode: context.sourceCode,
                        wrap: constraintNode => constraintNode,
                      })(fixer);
                      yield fixResult;
                    } else {
                      yield fixer.replaceText(referenceNode, constraintText);
                    }
                  }
                }

                // ...and remove the type parameter itself from the declaration.

                const typeParamsNode = nullThrows(
                  node.typeParameters,
                  'node should have type parameters',
                );

                // We are assuming at this point that the reported type parameter
                // is present in the inspected node's type parameters.
                if (typeParamsNode.params.length === 1) {
                  // Remove the whole <T> generic syntax if we're removing the only type parameter in the list.
                  yield fixer.remove(typeParamsNode);
                } else {
                  const index = typeParamsNode.params.indexOf(esTypeParameter);

                  if (index === 0) {
                    const commaAfter = nullThrows(
                      context.sourceCode.getTokenAfter(
                        esTypeParameter,
                        token => token.value === ',',
                      ),
                      NullThrowsReasons.MissingToken(
                        'comma',
                        'type parameter list',
                      ),
                    );

                    const tokenAfterComma = nullThrows(
                      context.sourceCode.getTokenAfter(commaAfter, {
                        includeComments: true,
                      }),
                      NullThrowsReasons.MissingToken(
                        'token',
                        'type parameter list',
                      ),
                    );

                    yield fixer.removeRange([
                      esTypeParameter.range[0],
                      tokenAfterComma.range[0],
                    ]);
                  } else {
                    const commaBefore = nullThrows(
                      context.sourceCode.getTokenBefore(
                        esTypeParameter,
                        token => token.value === ',',
                      ),
                      NullThrowsReasons.MissingToken(
                        'comma',
                        'type parameter list',
                      ),
                    );

                    yield fixer.removeRange([
                      commaBefore.range[0],
                      esTypeParameter.range[1],
                    ]);
                  }
                }
              },
            },
          ],
        });
      }
    }

    return {
      [[
        'ArrowFunctionExpression[typeParameters]',
        'FunctionDeclaration[typeParameters]',
        'FunctionExpression[typeParameters]',
        'TSCallSignatureDeclaration[typeParameters]',
        'TSConstructorType[typeParameters]',
        'TSDeclareFunction[typeParameters]',
        'TSEmptyBodyFunctionExpression[typeParameters]',
        'TSFunctionType[typeParameters]',
        'TSMethodSignature[typeParameters]',
      ].join(', ')](node: TSESTree.FunctionLike): void {
        checkNode(node, 'function');
      },
      [[
        'ClassDeclaration[typeParameters]',
        'ClassExpression[typeParameters]',
      ].join(', ')](node: TSESTree.FunctionLike): void {
        checkNode(node, 'class');
      },
    };
  },
});

function isTypeParameterRepeatedInAST(
  node: TSESTree.TSTypeParameter,
  references: Reference[],
  startOfBody = Infinity,
): boolean {
  let total = 0;

  for (const reference of references) {
    // References inside the type parameter's definition don't count...
    if (
      reference.identifier.range[0] < node.range[1] &&
      reference.identifier.range[1] > node.range[0]
    ) {
      continue;
    }

    // ...nor references that are outside the declaring signature.
    if (reference.identifier.range[0] > startOfBody) {
      continue;
    }

    // Neither do references that aren't to the same type parameter,
    // namely value-land (non-type) identifiers of the type parameter's type,
    // and references to different type parameters or values.
    if (
      !reference.isTypeReference ||
      reference.identifier.name !== node.name.name
    ) {
      continue;
    }

    // If the type parameter is being used as a type argument, then we
    // know the type parameter is being reused and can't be reported.
    if (reference.identifier.parent.type === AST_NODE_TYPES.TSTypeReference) {
      const grandparent = skipConstituentsUpward(
        reference.identifier.parent.parent,
      );

      if (
        grandparent.type === AST_NODE_TYPES.TSTypeParameterInstantiation &&
        grandparent.params.includes(reference.identifier.parent) &&
        // Array and ReadonlyArray must be handled carefully
        // let's defer the check to the type-aware phase
        !(
          grandparent.parent.type === AST_NODE_TYPES.TSTypeReference &&
          grandparent.parent.typeName.type === AST_NODE_TYPES.Identifier &&
          ['Array', 'ReadonlyArray'].includes(grandparent.parent.typeName.name)
        )
      ) {
        return true;
      }
    }

    total += 1;

    if (total >= 2) {
      return true;
    }
  }

  return false;
}

function skipConstituentsUpward(node: TSESTree.Node): TSESTree.Node {
  switch (node.type) {
    case AST_NODE_TYPES.TSIntersectionType:
    case AST_NODE_TYPES.TSUnionType:
      return skipConstituentsUpward(node.parent);
    default:
      return node;
  }
}

/**
 * Count uses of type parameters in inferred return types.
 * We need to resolve and analyze the inferred return type of a function
 * to see whether it contains additional references to the type parameters.
 * For classes, we need to do this for all their methods.
 */
function countTypeParameterUsage(
  checker: ts.TypeChecker,
  node: NodeWithTypeParameters,
): Map<ts.Identifier, number> {
  const counts = new Map<ts.Identifier, number>();

  if (ts.isClassLike(node)) {
    for (const typeParameter of node.typeParameters) {
      collectTypeParameterUsageCounts(checker, typeParameter, counts, true);
    }
    for (const member of node.members) {
      collectTypeParameterUsageCounts(checker, member, counts, true);
    }
  } else {
    collectTypeParameterUsageCounts(checker, node, counts, false);
  }

  return counts;
}

/**
 * Populates {@link foundIdentifierUsages} by the number of times each type parameter
 * appears in the given type by checking its uses through its type references.
 * This is essentially a limited subset of the scope manager, but for types.
 */
function collectTypeParameterUsageCounts(
  checker: ts.TypeChecker,
  node: ts.Node,
  foundIdentifierUsages: Map<ts.Identifier, number>,
  fromClass: boolean, // We are talking about the type parameters of a class or one of its methods
): void {
  const visitedSymbolLists = new Set<ts.Symbol[]>();
  const type = checker.getTypeAtLocation(node);
  const typeUsages = new Map<ts.Type, number>();
  const visitedConstraints = new Set<ts.TypeNode>();
  let functionLikeType = false;
  let visitedDefault = false;

  if (
    ts.isCallSignatureDeclaration(node) ||
    ts.isConstructorDeclaration(node)
  ) {
    functionLikeType = true;
    visitSignature(checker.getSignatureFromDeclaration(node));
  }

  if (!functionLikeType) {
    visitType(type, false);
  }

  function visitType(
    type: ts.Type | undefined,
    assumeMultipleUses: boolean,
    isReturnType = false,
  ): void {
    // Seeing the same type > (threshold=3 ** 2) times indicates a likely
    // recursive type, like `type T = { [P in keyof T]: T }`.
    // If it's not recursive, then heck, we've seen it enough times that any
    // referenced types have been counted enough to qualify as used.
    if (!type || incrementTypeUsages(type) > 9) {
      return;
    }

    if (tsutils.isTypeParameter(type)) {
      const declaration = type.getSymbol()?.getDeclarations()?.[0] as
        | ts.TypeParameterDeclaration
        | undefined;

      if (declaration) {
        incrementIdentifierCount(declaration.name, assumeMultipleUses);

        // Visiting the type of a constrained type parameter will recurse into
        // the constraint. We avoid infinite loops by visiting each only once.
        if (
          declaration.constraint &&
          !visitedConstraints.has(declaration.constraint)
        ) {
          visitedConstraints.add(declaration.constraint);
          visitType(checker.getTypeAtLocation(declaration.constraint), false);
        }

        if (declaration.default && !visitedDefault) {
          visitedDefault = true;
          visitType(checker.getTypeAtLocation(declaration.default), false);
        }
      }
    }

    // Catch-all: generic type references like `Exclude<T, null>`
    else if (type.aliasTypeArguments) {
      // We don't descend into the definition of the type alias, so we don't
      // know whether it's used multiple times. It's safest to assume it is.
      visitTypesList(type.aliasTypeArguments, true);
    }

    // Intersections and unions like `0 | 1`
    else if (tsutils.isUnionOrIntersectionType(type)) {
      visitTypesList(type.types, assumeMultipleUses);
    }

    // Index access types like `T[K]`
    else if (tsutils.isIndexedAccessType(type)) {
      visitType(type.objectType, assumeMultipleUses);
      visitType(type.indexType, assumeMultipleUses);
    }

    // Tuple types like `[K, V]`
    // Generic type references like `Map<K, V>`
    else if (tsutils.isTypeReference(type)) {
      for (const typeArgument of type.typeArguments ?? []) {
        // currently, if we are in a "class context", everything is accepted
        let thisAssumeMultipleUses = fromClass || assumeMultipleUses;

        // special cases - readonly arrays/tuples are considered only to use the
        // type parameter once. Mutable arrays/tuples are considered to use the
        // type parameter multiple times if and only if they are returned.
        // other kind of type references always count as multiple uses
        thisAssumeMultipleUses ||= tsutils.isTupleType(type.target)
          ? isReturnType && !type.target.readonly
          : checker.isArrayType(type.target)
            ? isReturnType &&
              (type.symbol as ts.Symbol | undefined)?.getName() === 'Array'
            : true;

        visitType(typeArgument, thisAssumeMultipleUses, isReturnType);
      }
    }

    // Template literals like `a${T}b`
    else if (tsutils.isTemplateLiteralType(type)) {
      for (const subType of type.types) {
        visitType(subType, assumeMultipleUses);
      }
    }

    // Conditional types like `T extends string ? T : never`
    else if (tsutils.isConditionalType(type)) {
      visitType(type.checkType, assumeMultipleUses);
      visitType(type.extendsType, assumeMultipleUses);
    }

    // Catch-all: inferred object types like `{ K: V }`.
    // These catch-alls should be _after_ more specific checks like
    // `isTypeReference` to avoid descending into all the properties of a
    // generic interface/class, e.g. `Map<K, V>`.
    else if (tsutils.isObjectType(type)) {
      const properties = type.getProperties();
      visitSymbolsListOnce(properties, false);

      if (isMappedType(type)) {
        visitType(type.typeParameter, false);
        if (properties.length === 0) {
          // TS treats mapped types like `{[k in "a"]: T}` like `{a: T}`.
          // They have properties, so we need to avoid double-counting.
          visitType(type.templateType ?? type.constraintType, false);
        }
      }

      visitType(type.getNumberIndexType(), true);
      visitType(type.getStringIndexType(), true);

      type.getCallSignatures().forEach(signature => {
        functionLikeType = true;
        visitSignature(signature);
      });

      type.getConstructSignatures().forEach(signature => {
        functionLikeType = true;
        visitSignature(signature);
      });
    }

    // Catch-all: operator types like `keyof T`
    else if (isOperatorType(type)) {
      visitType(type.type, assumeMultipleUses);
    }
  }

  function incrementIdentifierCount(
    id: ts.Identifier,
    assumeMultipleUses: boolean,
  ): void {
    const identifierCount = foundIdentifierUsages.get(id) ?? 0;
    const value = assumeMultipleUses ? 2 : 1;
    foundIdentifierUsages.set(id, identifierCount + value);
  }

  function incrementTypeUsages(type: ts.Type): number {
    const count = (typeUsages.get(type) ?? 0) + 1;
    typeUsages.set(type, count);
    return count;
  }

  function visitSignature(signature: ts.Signature | undefined): void {
    if (!signature) {
      return;
    }

    if (signature.thisParameter) {
      visitType(checker.getTypeOfSymbol(signature.thisParameter), false);
    }

    for (const parameter of signature.parameters) {
      visitType(checker.getTypeOfSymbol(parameter), false);
    }

    for (const typeParameter of signature.getTypeParameters() ?? []) {
      visitType(typeParameter, false);
    }

    visitType(
      checker.getTypePredicateOfSignature(signature)?.type ??
        signature.getReturnType(),
      false,
      true,
    );
  }

  function visitSymbolsListOnce(
    symbols: ts.Symbol[],
    assumeMultipleUses: boolean,
  ): void {
    if (visitedSymbolLists.has(symbols)) {
      return;
    }

    visitedSymbolLists.add(symbols);

    for (const symbol of symbols) {
      visitType(checker.getTypeOfSymbol(symbol), assumeMultipleUses);
    }
  }

  function visitTypesList(
    types: readonly ts.Type[],
    assumeMultipleUses: boolean,
  ): void {
    for (const type of types) {
      visitType(type, assumeMultipleUses);
    }
  }
}

interface MappedType extends ts.ObjectType {
  constraintType?: ts.Type;
  templateType?: ts.Type;
  typeParameter?: ts.Type;
}

function isMappedType(type: ts.Type): type is MappedType {
  return 'typeParameter' in type;
}

interface OperatorType extends ts.Type {
  type: ts.Type;
}

function isOperatorType(type: ts.Type): type is OperatorType {
  return 'type' in type && !!type.type;
}
