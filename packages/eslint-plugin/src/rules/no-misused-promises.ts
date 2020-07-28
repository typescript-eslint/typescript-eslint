import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    checksConditionals?: boolean;
    checksVoidReturn?: boolean;
  },
];

export default util.createRule<Options, 'conditional' | 'voidReturn'>({
  name: 'no-misused-promises',
  meta: {
    docs: {
      description: 'Avoid using promises in places not designed to handle them',
      category: 'Best Practices',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      voidReturn:
        'Promise returned in function argument where a void return was expected.',
      conditional: 'Expected non-Promise value in a boolean conditional.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checksConditionals: {
            type: 'boolean',
          },
          checksVoidReturn: {
            type: 'boolean',
          },
        },
      },
    ],
    type: 'problem',
  },
  defaultOptions: [
    {
      checksConditionals: true,
      checksVoidReturn: true,
    },
  ],

  create(context, [{ checksConditionals, checksVoidReturn }]) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    const conditionalChecks: TSESLint.RuleListener = {
      ConditionalExpression: checkTestConditional,
      DoWhileStatement: checkTestConditional,
      ForStatement: checkTestConditional,
      IfStatement: checkTestConditional,
      LogicalExpression(node) {
        // We only check the lhs of a logical expression because the rhs might
        // be the return value of a short circuit expression.
        checkConditional(node.left);
      },
      UnaryExpression(node) {
        if (node.operator === '!') {
          checkConditional(node.argument);
        }
      },
      WhileStatement: checkTestConditional,
    };

    const voidReturnChecks: TSESLint.RuleListener = {
      CallExpression: checkArguments,
      NewExpression: checkArguments,
    };

    function checkTestConditional(node: {
      test: TSESTree.Expression | null;
    }): void {
      if (node.test) {
        checkConditional(node.test);
      }
    }

    function checkConditional(node: TSESTree.Expression): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      if (isAlwaysThenable(checker, tsNode)) {
        context.report({
          messageId: 'conditional',
          node,
        });
      }
    }

    function checkArguments(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const voidParams = voidFunctionParams(checker, tsNode);
      if (voidParams.size === 0) {
        return;
      }

      for (const [index, argument] of node.arguments.entries()) {
        if (!voidParams.has(index)) {
          continue;
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(argument);
        if (returnsThenable(checker, tsNode as ts.Expression)) {
          context.report({
            messageId: 'voidReturn',
            node: argument,
          });
        }
      }
    }

    return {
      ...(checksConditionals ? conditionalChecks : {}),
      ...(checksVoidReturn ? voidReturnChecks : {}),
    };
  },
});

// Variation on the thenable check which requires all forms of the type (read:
// alternates in a union) to be thenable. Otherwise, you might be trying to
// check if something is defined or undefined and get caught because one of the
// branches is thenable.
function isAlwaysThenable(checker: ts.TypeChecker, node: ts.Node): boolean {
  const type = checker.getTypeAtLocation(node);

  for (const subType of tsutils.unionTypeParts(checker.getApparentType(type))) {
    const thenProp = subType.getProperty('then');

    // If one of the alternates has no then property, it is not thenable in all
    // cases.
    if (thenProp === undefined) {
      return false;
    }

    // We walk through each variation of the then property. Since we know it
    // exists at this point, we just need at least one of the alternates to
    // be of the right form to consider it thenable.
    const thenType = checker.getTypeOfSymbolAtLocation(thenProp, node);
    let hasThenableSignature = false;
    for (const subType of tsutils.unionTypeParts(thenType)) {
      for (const signature of subType.getCallSignatures()) {
        if (
          signature.parameters.length !== 0 &&
          isFunctionParam(checker, signature.parameters[0], node)
        ) {
          hasThenableSignature = true;
          break;
        }
      }

      // We only need to find one variant of the then property that has a
      // function signature for it to be thenable.
      if (hasThenableSignature) {
        break;
      }
    }

    // If no flavors of the then property are thenable, we don't consider the
    // overall type to be thenable
    if (!hasThenableSignature) {
      return false;
    }
  }

  // If all variants are considered thenable (i.e. haven't returned false), we
  // consider the overall type thenable
  return true;
}

function isFunctionParam(
  checker: ts.TypeChecker,
  param: ts.Symbol,
  node: ts.Node,
): boolean {
  const type: ts.Type | undefined = checker.getApparentType(
    checker.getTypeOfSymbolAtLocation(param, node),
  );
  for (const subType of tsutils.unionTypeParts(type)) {
    if (subType.getCallSignatures().length !== 0) {
      return true;
    }
  }
  return false;
}

// Get the positions of parameters which are void functions (and not also
// thenable functions). These are the candidates for the void-return check at
// the current call site.
function voidFunctionParams(
  checker: ts.TypeChecker,
  node: ts.CallExpression | ts.NewExpression,
): Set<number> {
  const voidReturnIndices = new Set<number>();
  const thenableReturnIndices = new Set<number>();
  const type = checker.getTypeAtLocation(node.expression);

  for (const subType of tsutils.unionTypeParts(type)) {
    // Standard function calls and `new` have two different types of signatures
    const signatures = ts.isCallExpression(node)
      ? subType.getCallSignatures()
      : subType.getConstructSignatures();
    for (const signature of signatures) {
      for (const [index, parameter] of signature.parameters.entries()) {
        const type = checker.getTypeOfSymbolAtLocation(
          parameter,
          node.expression,
        );
        for (const subType of tsutils.unionTypeParts(type)) {
          for (const signature of subType.getCallSignatures()) {
            const returnType = signature.getReturnType();
            if (tsutils.isTypeFlagSet(returnType, ts.TypeFlags.Void)) {
              voidReturnIndices.add(index);
            } else if (
              tsutils.isThenableType(checker, node.expression, returnType)
            ) {
              thenableReturnIndices.add(index);
            }
          }
        }
      }
    }
  }

  // If a certain positional argument accepts both thenable and void returns,
  // a promise-returning function is valid
  for (const thenable of thenableReturnIndices) {
    voidReturnIndices.delete(thenable);
  }

  return voidReturnIndices;
}

// Returns true if the expression is a function that returns a thenable
function returnsThenable(
  checker: ts.TypeChecker,
  node: ts.Expression,
): boolean {
  const type = checker.getApparentType(checker.getTypeAtLocation(node));

  for (const subType of tsutils.unionTypeParts(type)) {
    for (const signature of subType.getCallSignatures()) {
      const returnType = signature.getReturnType();
      if (tsutils.isThenableType(checker, node, returnType)) {
        return true;
      }
    }
  }

  return false;
}
