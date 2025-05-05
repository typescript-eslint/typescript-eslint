import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
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

export type MessageIds = 'unnecessaryTypeParameter';

export default createRule<[], MessageIds>({
  name: 'no-unnecessary-type-arguments',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      recommended: 'strict',
      description: 'Disallow type arguments that are equal to the default',
      requiresTypeChecking: true,
    },
    messages: {
      unnecessaryTypeParameter:
        'This is the default value for this type parameter, so it can be omitted.',
    },
    schema: [],
  },
  defaultOptions: [],
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
        node: arg,
        messageId: 'unnecessaryTypeParameter',
        fix: fixer =>
          fixer.removeRange(
            i === 0
              ? esParameters.range
              : [esParameters.params[i - 1].range[1], arg.range[1]],
          ),
      });
    }

    return {
      TSTypeParameterInstantiation(node): void {
        const expression = services.esTreeNodeToTSNodeMap.get(node);
        const typeParameters = getTypeParametersFromNode(
          node,
          expression,
          checker,
        );

        if (typeParameters) {
          checkTSArgsAndParameters(node, typeParameters);
        }
      },
    };
  },
});

function getTypeParametersFromNode(
  node: TSESTree.TSTypeParameterInstantiation,
  tsNode: ParameterCapableTSNode,
  checker: ts.TypeChecker,
): readonly ts.TypeParameterDeclaration[] | undefined {
  if (ts.isExpressionWithTypeArguments(tsNode)) {
    return getTypeParametersFromType(node, tsNode.expression, checker);
  }

  if (ts.isTypeReferenceNode(tsNode)) {
    return getTypeParametersFromType(node, tsNode.typeName, checker);
  }

  if (
    ts.isCallExpression(tsNode) ||
    ts.isNewExpression(tsNode) ||
    ts.isTaggedTemplateExpression(tsNode) ||
    ts.isJsxOpeningElement(tsNode) ||
    ts.isJsxSelfClosingElement(tsNode)
  ) {
    return getTypeParametersFromCall(node, tsNode, checker);
  }

  return undefined;
}

function getTypeParametersFromType(
  node: TSESTree.TSTypeParameterInstantiation,
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

  const sortedDeclaraions = sortDeclarationsByTypeValueContext(
    node,
    declarations,
  );
  return findFirstResult(sortedDeclaraions, decl => {
    if (
      ts.isTypeAliasDeclaration(decl) ||
      ts.isInterfaceDeclaration(decl) ||
      ts.isClassLike(decl)
    ) {
      return decl.typeParameters;
    }
    if (ts.isVariableDeclaration(decl)) {
      return getConstructSignatureDeclaration(symAtLocation, checker)
        ?.typeParameters;
    }
    return undefined;
  });
}

function getTypeParametersFromCall(
  node: TSESTree.TSTypeParameterInstantiation,
  tsNode:
    | ts.CallExpression
    | ts.JsxOpeningElement
    | ts.JsxSelfClosingElement
    | ts.NewExpression
    | ts.TaggedTemplateExpression,
  checker: ts.TypeChecker,
): readonly ts.TypeParameterDeclaration[] | undefined {
  const sig = checker.getResolvedSignature(tsNode);
  const sigDecl = sig?.getDeclaration();
  if (!sigDecl) {
    return ts.isNewExpression(tsNode)
      ? getTypeParametersFromType(node, tsNode.expression, checker)
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

function isInTypeContext(node: TSESTree.TSTypeParameterInstantiation) {
  return (
    node.parent.type === AST_NODE_TYPES.TSInterfaceHeritage ||
    node.parent.type === AST_NODE_TYPES.TSTypeReference ||
    node.parent.type === AST_NODE_TYPES.TSClassImplements
  );
}

function isTypeContextDeclaration(decl: ts.Declaration) {
  return ts.isTypeAliasDeclaration(decl) || ts.isInterfaceDeclaration(decl);
}

function typeFirstCompare(declA: ts.Declaration, declB: ts.Declaration) {
  const aIsType = isTypeContextDeclaration(declA);
  const bIsType = isTypeContextDeclaration(declB);

  return Number(bIsType) - Number(aIsType);
}

function sortDeclarationsByTypeValueContext(
  node: TSESTree.TSTypeParameterInstantiation,
  declarations: ts.Declaration[],
) {
  const sorted = [...declarations].sort(typeFirstCompare);
  if (isInTypeContext(node)) {
    return sorted;
  }
  return sorted.reverse();
}

function getConstructSignatureDeclaration(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): ts.SignatureDeclaration | undefined {
  const type = checker.getTypeOfSymbol(symbol);
  const sig = type.getConstructSignatures();
  return sig.at(0)?.getDeclaration();
}
