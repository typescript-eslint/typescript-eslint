import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import ts from 'typescript';
import * as util from '../util';
import { findFirstResult } from '../util';

interface ArgsAndParams {
  typeArguments: ts.NodeArray<ts.TypeNode>;
  typeParameters: readonly ts.TypeParameterDeclaration[];
}

type ExtendingClassLikeDeclaration = ts.ClassLikeDeclaration & {
  heritageClauses: ts.NodeArray<ts.HeritageClause>;
};

type ParameterCapableTSNode =
  | ts.CallExpression
  | ts.NewExpression
  | ts.TypeReferenceNode
  | ts.ExpressionWithTypeArguments;

type MessageIds = 'unnecessaryTypeParameter';

export default util.createRule<[], MessageIds>({
  name: 'no-unnecessary-type-arguments',
  meta: {
    docs: {
      description:
        'Warns if an explicitly specified type argument is the default for that type parameter',
      category: 'Best Practices',
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

    function checkTSArgsAndParameters(
      esParameters: TSESTree.TSTypeParameterInstantiation,
      { typeArguments, typeParameters }: ArgsAndParams,
    ): void {
      // Just check the last one. Must specify previous type parameters if the last one is specified.
      const i = typeArguments.length - 1;
      const arg = typeArguments[i];
      const param = typeParameters[i];

      // TODO: would like checker.areTypesEquivalent. https://github.com/Microsoft/TypeScript/issues/13502
      if (
        param.default === undefined ||
        param.default.getText() !== arg.getText()
      ) {
        return;
      }

      context.report({
        fix: fixer =>
          fixer.removeRange(
            i === 0
              ? [typeArguments.pos - 1, typeArguments.end + 1]
              : [typeArguments[i - 1].end, arg.end],
          ),
        messageId: 'unnecessaryTypeParameter',
        node: esParameters.params[i],
      });
    }

    return {
      TSTypeParameterInstantiation(node): void {
        const parentDeclaration = parserServices.esTreeNodeToTSNodeMap.get<
          ExtendingClassLikeDeclaration | ParameterCapableTSNode
        >(node.parent!);

        const expression = tsutils.isClassLikeDeclaration(parentDeclaration)
          ? parentDeclaration.heritageClauses[0].types[0]
          : parentDeclaration;

        const argsAndParams = getArgsAndParameters(expression, checker);
        if (argsAndParams !== undefined) {
          checkTSArgsAndParameters(node, argsAndParams);
        }
      },
    };
  },
});

function getArgsAndParameters(
  node: ParameterCapableTSNode,
  checker: ts.TypeChecker,
): ArgsAndParams | undefined {
  const typeParameters = getTypeParametersFromNode(node, checker);
  return typeParameters === undefined
    ? undefined
    : { typeArguments: node.typeArguments!, typeParameters };
}

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

  return getTypeParametersFromCall(node, checker);
}

function getTypeParametersFromType(
  type: ts.EntityName | ts.Expression | ts.ClassDeclaration,
  checker: ts.TypeChecker,
): readonly ts.TypeParameterDeclaration[] | undefined {
  const symAtLocation = checker.getSymbolAtLocation(type);
  if (symAtLocation === undefined) {
    return undefined;
  }

  const sym = getAliasedSymbol(symAtLocation, checker);
  if (sym === undefined || sym.declarations === undefined) {
    return undefined;
  }

  return findFirstResult(sym.declarations, decl =>
    tsutils.isClassLikeDeclaration(decl) ||
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
  const sigDecl = sig === undefined ? undefined : sig.getDeclaration();
  if (sigDecl === undefined) {
    return ts.isNewExpression(node)
      ? getTypeParametersFromType(node.expression, checker)
      : undefined;
  }

  return sigDecl.typeParameters;
}

function getAliasedSymbol(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): ts.Symbol | undefined {
  return tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}
