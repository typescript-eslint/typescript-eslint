import type { TSESTree } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  findFirstResult,
  getParserServices,
  isTypeReferenceType,
} from '../util';

type ParameterCapableTSNode =
  | ts.CallExpression
  | ts.ExpressionWithTypeArguments
  | ts.ImportTypeNode
  | ts.JsxOpeningElement
  | ts.JsxSelfClosingElement
  | ts.NewExpression
  | ts.TaggedTemplateExpression
  | ts.TypeQueryNode
  | ts.TypeReferenceNode;

type MessageIds = 'unnecessaryTypeParameter';

export default createRule<[], MessageIds>({
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function getTypeForComparison(type: ts.Type): {
      type: ts.Type;
      typeArguments: readonly ts.Type[];
    } {
      if (isTypeReferenceType(type)) {
        return {
          type: type.target,
          typeArguments: checker.getTypeArguments(type),
        };
      }
      return {
        type,
        typeArguments: [],
      };
    }

    function checkTSArgsAndParameters(
      esParameters: TSESTree.TSTypeParameterInstantiation,
      typeParameters: readonly ts.TypeParameterDeclaration[],
    ): void {
      // Just check the last one. Must specify previous type parameters if the last one is specified.
      const i = esParameters.params.length - 1;
      const arg = esParameters.params[i];
      const param = typeParameters.at(i);
      if (!param?.default) {
        return;
      }

      // TODO: would like checker.areTypesEquivalent. https://github.com/Microsoft/TypeScript/issues/13502
      const defaultType = checker.getTypeAtLocation(param.default);
      const argType = services.getTypeAtLocation(arg);
      // this check should handle some of the most simple cases of like strings, numbers, etc
      if (defaultType !== argType) {
        // For more complex types (like aliases to generic object types) - TS won't always create a
        // global shared type object for the type - so we need to resort to manually comparing the
        // reference type and the passed type arguments.
        // Also - in case there are aliases - we need to resolve them before we do checks
        const defaultTypeResolved = getTypeForComparison(defaultType);
        const argTypeResolved = getTypeForComparison(argType);
        if (
          // ensure the resolved type AND all the parameters are the same
          defaultTypeResolved.type !== argTypeResolved.type ||
          defaultTypeResolved.typeArguments.length !==
            argTypeResolved.typeArguments.length ||
          defaultTypeResolved.typeArguments.some(
            (t, i) => t !== argTypeResolved.typeArguments[i],
          )
        ) {
          return;
        }
      }

      context.report({
        fix: fixer =>
          fixer.removeRange(
            i === 0
              ? esParameters.range
              : [esParameters.params[i - 1].range[1], arg.range[1]],
          ),
        messageId: 'unnecessaryTypeParameter',
        node: arg,
      });
    }

    return {
      TSTypeParameterInstantiation(node): void {
        const expression = services.esTreeNodeToTSNodeMap.get(node);

        const typeParameters = getTypeParametersFromNode(expression, checker);
        if (typeParameters) {
          checkTSArgsAndParameters(node, typeParameters);
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow type arguments that are equal to the default',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      unnecessaryTypeParameter:
        'This is the default value for this type parameter, so it can be omitted.',
    },
    schema: [],
  },
  name: 'no-unnecessary-type-arguments',
});

function getTypeParametersFromNode(
  node: ParameterCapableTSNode,
  checker: ts.TypeChecker,
): readonly ts.TypeParameterDeclaration[] | undefined {
  if (ts.isExpressionWithTypeArguments(node)) {
    return getTypeParametersFromType(node.expression, checker);
  }

  if (ts.isTypeReferenceNode(node)) {
    return getTypeParametersFromType(node.typeName, checker);
  }

  if (
    ts.isCallExpression(node) ||
    ts.isNewExpression(node) ||
    ts.isTaggedTemplateExpression(node)
  ) {
    return getTypeParametersFromCall(node, checker);
  }

  return undefined;
}

function getTypeParametersFromType(
  type: ts.ClassDeclaration | ts.EntityName | ts.Expression,
  checker: ts.TypeChecker,
): readonly ts.TypeParameterDeclaration[] | undefined {
  const symAtLocation = checker.getSymbolAtLocation(type);
  if (!symAtLocation) {
    return undefined;
  }

  const sym = getAliasedSymbol(symAtLocation, checker);
  const declarations = sym.getDeclarations();

  if (!declarations) {
    return undefined;
  }

  return findFirstResult(declarations, decl =>
    ts.isClassLike(decl) ||
    ts.isTypeAliasDeclaration(decl) ||
    ts.isInterfaceDeclaration(decl)
      ? decl.typeParameters
      : undefined,
  );
}

function getTypeParametersFromCall(
  node: ts.CallExpression | ts.NewExpression | ts.TaggedTemplateExpression,
  checker: ts.TypeChecker,
): readonly ts.TypeParameterDeclaration[] | undefined {
  const sig = checker.getResolvedSignature(node);
  const sigDecl = sig?.getDeclaration();
  if (!sigDecl) {
    return ts.isNewExpression(node)
      ? getTypeParametersFromType(node.expression, checker)
      : undefined;
  }

  return sigDecl.typeParameters;
}

function getAliasedSymbol(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): ts.Symbol {
  return tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}
