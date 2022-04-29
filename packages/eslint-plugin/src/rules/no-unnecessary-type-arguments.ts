import { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';
import * as util from '../util';
import { findFirstResult } from '../util';

type ParameterCapableTSNode =
  | ts.TaggedTemplateExpression
  | ts.ImportTypeNode
  | ts.CallExpression
  | ts.NewExpression
  | ts.TypeReferenceNode
  | ts.ExpressionWithTypeArguments
  | ts.JsxOpeningElement
  | ts.JsxSelfClosingElement;

type MessageIds = 'unnecessaryTypeParameter';

export default util.createRule<[], MessageIds>({
  name: 'no-unnecessary-type-arguments',
  meta: {
    docs: {
      description:
        'Enforces that type arguments will not be used if not required',
      recommended: false,
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      unnecessaryTypeParameter:
        'This is the default value for this type parameter, so it can be omitted.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function getTypeForComparison(type: ts.Type): {
      type: ts.Type;
      typeArguments: readonly ts.Type[];
    } {
      if (util.isTypeReferenceType(type)) {
        return {
          type: type.target,
          typeArguments: util.getTypeArguments(type, checker),
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
      const param = typeParameters[i];
      if (!param?.default) {
        return;
      }

      // TODO: would like checker.areTypesEquivalent. https://github.com/Microsoft/TypeScript/issues/13502
      const defaultType = checker.getTypeAtLocation(param.default);
      const argTsNode = parserServices.esTreeNodeToTSNodeMap.get(arg);
      const argType = checker.getTypeAtLocation(argTsNode);
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
        const expression = parserServices.esTreeNodeToTSNodeMap.get(node);

        const typeParameters = getTypeParametersFromNode(expression, checker);
        if (typeParameters) {
          checkTSArgsAndParameters(node, typeParameters);
        }
      },
    };
  },
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

  if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
    return getTypeParametersFromCall(node, checker);
  }

  return undefined;
}

function getTypeParametersFromType(
  type: ts.EntityName | ts.Expression | ts.ClassDeclaration,
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
  node: ts.CallExpression | ts.NewExpression,
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
  return util.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}
