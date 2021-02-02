import {
  AST_NODE_TYPES,
  ParserServices,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

export default util.createRule({
  name: 'no-return-in-void-callback',
  meta: {
    docs: {
      description:
        'Avoid returning a value when the function return type is void',
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      returnInVoidCallback:
        'Value returned in function where a void return was expected.',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function checkExpressionArgument(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
      argument: TSESTree.Expression,
      index: number,
    ): void {
      if (util.isFunction(argument)) {
        checkFunctionArgument(node, argument, index);
      } else if (argument.type === AST_NODE_TYPES.ConditionalExpression) {
        checkExpressionArgument(node, argument.alternate, index);
        checkExpressionArgument(node, argument.consequent, index);
      } else if (argument.type === AST_NODE_TYPES.ObjectExpression) {
        for (const property of argument.properties) {
          if (
            property.type !== AST_NODE_TYPES.SpreadElement &&
            util.isFunction(property.value) &&
            !property.computed &&
            property.key.type === AST_NODE_TYPES.Identifier
          ) {
            checkFunctionArgument(
              node,
              property.value,
              index,
              property.key.name,
            );
          }
        }
      }
    }

    function checkFunctionArgument(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
      argument: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
      index: number,
      path?: string,
    ): void {
      const tsArgument = parserServices.esTreeNodeToTSNodeMap.get(argument);
      if (
        returnsNonVoid(checker, tsArgument as ts.Expression) &&
        !expectNonVoidCallback(checker, parserServices, node, index, path)
      ) {
        context.report({ messageId: 'returnInVoidCallback', node: argument });
      }
    }

    return {
      'CallExpression, NewExpression'(
        node: TSESTree.CallExpression | TSESTree.NewExpression,
      ): void {
        for (const [index, argument] of node.arguments.entries()) {
          checkExpressionArgument(node, argument, index);
        }
      },
    };
  },
});

function returnsNonVoid(checker: ts.TypeChecker, node: ts.Expression): boolean {
  const type = checker.getApparentType(checker.getTypeAtLocation(node));

  for (const subType of tsutils.unionTypeParts(type)) {
    for (const signature of subType.getCallSignatures()) {
      const returnType = signature.getReturnType();
      if (!tsutils.isTypeFlagSet(returnType, ts.TypeFlags.Void)) {
        return true;
      }
    }
  }

  return false;
}

function expectNonVoidCallback(
  checker: ts.TypeChecker,
  parserServices: ParserServices,
  node: TSESTree.CallExpression | TSESTree.NewExpression,
  index: number,
  path?: string,
): boolean {
  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
  const expressionType = checker.getTypeAtLocation(tsNode.expression);

  const signatures = ts.isCallExpression(tsNode)
    ? expressionType.getCallSignatures()
    : expressionType.getConstructSignatures();

  for (const signature of signatures) {
    const parameter = signature.getParameters()[index] as ts.Symbol | undefined;
    if (!parameter) {
      continue;
    }

    let parameterType = checker.getTypeOfSymbolAtLocation(
      parameter,
      tsNode.expression,
    );
    if (path) {
      const property = parameterType.getProperty(path);
      if (!property) {
        continue;
      }
      parameterType = checker.getTypeOfSymbolAtLocation(
        property,
        tsNode.expression,
      );
    }

    for (const parameterSignature of parameterType.getCallSignatures()) {
      if (
        !tsutils.isTypeFlagSet(
          parameterSignature.getReturnType(),
          ts.TypeFlags.Void,
        )
      ) {
        return true;
      }
    }
  }

  return false;
}
