import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import * as ts from 'typescript';

export default util.createRule({
  name: 'no-unnecessary-generics',
  meta: {
    docs: {
      description: 'Forbids signatures using a generic parameter only once',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      failureString: 'Type parameter {{typeParameter}} is used only once.',
      failureStringNever: 'Type parameter {{typeParameter}} is never used',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      'FunctionDeclaration, FunctionExpression, ArrowFunctionExpression, TSCallSignatureDeclaration, TSMethodSignature, TSFunctionType, TSConstructorType, TSDeclareFunction'(
        node:
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression
          | TSESTree.ArrowFunctionExpression
          | TSESTree.TSCallSignatureDeclaration
          | TSESTree.TSMethodSignature
          | TSESTree.TSFunctionType
          | TSESTree.TSConstructorType
          | TSESTree.TSDeclareFunction,
      ): void {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        if (tsNode && ts.isFunctionLike(tsNode)) {
          checkSignature(tsNode);
        }

        // copied from https://github.com/microsoft/dtslint/blob/88b6f8975bb3ae9091c7150ddd52a11732324009/src/rules/noUnnecessaryGenericsRule.ts#L42
        function checkSignature(sig: ts.SignatureDeclaration): void {
          if (!sig.typeParameters) {
            return;
          }

          for (const tp of sig.typeParameters) {
            const typeParameter = tp.name.text;
            const res = getSoleUse(
              sig,
              assertDefined(checker.getSymbolAtLocation(tp.name)),
              checker,
            );
            switch (res.type) {
              case 'ok':
                break;
              case 'sole':
                context.report({
                  node: parserServices.tsNodeToESTreeNodeMap.get(res.soleUse),
                  messageId: 'failureString',
                  data: {
                    typeParameter,
                  },
                });
                break;
              case 'never':
                context.report({
                  node: parserServices.tsNodeToESTreeNodeMap.get(tp),
                  messageId: 'failureString',
                  data: {
                    typeParameter,
                  },
                });
                break;
              default:
                assertNever(res);
            }
          }
        }
      },
    };
  },
});

type Result =
  | { type: 'ok' | 'never' }
  | { type: 'sole'; soleUse: ts.Identifier };
function getSoleUse(
  sig: ts.SignatureDeclaration,
  typeParameterSymbol: ts.Symbol,
  checker: ts.TypeChecker,
): Result {
  const exit = {};
  let soleUse: ts.Identifier | undefined;

  try {
    if (sig.typeParameters) {
      for (const tp of sig.typeParameters) {
        if (tp.constraint) {
          recur(tp.constraint);
        }
      }
    }
    for (const param of sig.parameters) {
      if (param.type) {
        recur(param.type);
      }
    }
    if (sig.type) {
      recur(sig.type);
    }
  } catch (err) {
    if (err === exit) {
      return { type: 'ok' };
    }
    throw err;
  }

  return soleUse ? { type: 'sole', soleUse } : { type: 'never' };

  function recur(node: ts.TypeNode): void {
    if (ts.isIdentifier(node)) {
      if (checker.getSymbolAtLocation(node) === typeParameterSymbol) {
        if (soleUse === undefined) {
          soleUse = node;
        } else {
          throw exit;
        }
      }
    } else {
      node.forEachChild(recur as (node: ts.Node) => void);
    }
  }
}

function assertDefined<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error('unreachable');
  }
  return value;
}
function assertNever(_: never): never {
  throw new Error('unreachable');
}
