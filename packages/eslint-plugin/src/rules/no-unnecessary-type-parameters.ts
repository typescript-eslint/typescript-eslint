/* eslint-disable */
import type { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';
import * as tsutils from 'ts-api-utils';

import { createRule, getParserServices } from '../util';

type ESTreeFunctionLikeWithTypeParameters = TSESTree.FunctionLike & {
  typeParameters: {};
};

type TSSignatureDeclarationWithTypeParameters = ts.SignatureDeclaration & {
  typeParameters: {};
};

export default createRule({
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Disallow signatures using a generic parameter only once',
    },
    messages: {
      sole: 'Type parameter {{name}} is used only once.',
    },
    schema: [],
    type: 'problem',
  },
  name: 'no-unnecessary-generics',
  create(context) {
    const parserServices = getParserServices(context);
    let usage: Map<ts.Identifier, tsutils.VariableInfo> | undefined;
    /*
    function checkTypeParameters(
      typeParameters: readonly ts.TypeParameterDeclaration[],
      signature: ts.SignatureDeclaration,
    ) {

      // XXX need to rewrite this (didn't even realize JS had labeled loops!)
      outer: for (const typeParameter of typeParameters) {
        let usedInParameters = false;
        let usedInReturnOrExtends = isFunctionWithBody(signature);
        for (const use of usage.get(typeParameter.name)!.uses) {
          if (
            use.location.pos > signature.parameters.pos &&
            use.location.pos < signature.parameters.end
          ) {
            if (usedInParameters) {
              continue outer;
            }
            usedInParameters = true;
          } else if (!usedInReturnOrExtends) {
            usedInReturnOrExtends =
              use.location.pos > signature.parameters.end ||
              isUsedInConstraint(use.location, typeParameters);
          }
        }
        // XXX why are these handled differently?
        if (!usedInParameters) {
          context.report({
            data: {
              name: typeParameter.name.text,
            },
            node: parserServices.tsNodeToESTreeNodeMap.get(typeParameter),
            messageId: 'sole',
          });
        } else if (
          !usedInReturnOrExtends
          // && !isConstrainedByOtherTypeParameter(typeParameter, typeParameters)
        ) {
          context.report({
            data: {
              name: typeParameter.name.text,
              replacement: typeParameter.constraint
                ? typeParameter.constraint.getText(signature.getSourceFile())
                : 'unknown',
            },
            node: parserServices.tsNodeToESTreeNodeMap.get(typeParameter),
            messageId: 'sole',
          });
        }
      }
    }
    */

    return {
      [[
        'ArrowFunctionExpression[typeParameters]',
        'FunctionDeclaration[typeParameters]',
        'FunctionExpression[typeParameters]',
        'TSCallSignatureDeclaration[typeParameters]',
        'TSConstructorType[typeParameters]',
        'TSDeclareFunction[typeParameters]',
        'TSFunctionType[typeParameters]',
        'TSMethodSignature[typeParameters]',
      ].join(', ')](esNode: ESTreeFunctionLikeWithTypeParameters): void {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
          esNode,
        ) as TSSignatureDeclarationWithTypeParameters;
        if (!tsNode.typeParameters) {
          return;
        }

        // const checker = parserServices.program.getTypeChecker();

        if (usage === undefined) {
          usage = tsutils.collectVariableUsage(tsNode.getSourceFile());
        }

        for (const typeParameter of tsNode.typeParameters) {
          const { uses } = usage.get(typeParameter.name)!;
          if (uses.length === 1) {
            context.report({
              data: {
                name: typeParameter.name.text,
              },
              node: parserServices.tsNodeToESTreeNodeMap.get(typeParameter),
              messageId: 'sole',
            });
          }
        }

        // checkTypeParameters(tsNode.typeParameters, tsNode);

        // if (result === 'ok') {
        //   continue;
        // }
        //
        // context.report({
        //   data: { name: typeParameter.name.text },
        //   messageId: result,
        //   node: parserServices.tsNodeToESTreeNodeMap.get(typeParameter),
        // });
      },
    };
  },
});

function isUsedInConstraint(
  use: ts.Identifier,
  typeParameters: readonly ts.TypeParameterDeclaration[],
) {
  for (const typeParameter of typeParameters) {
    if (
      typeParameter.constraint !== undefined &&
      use.pos >= typeParameter.constraint.pos &&
      use.pos < typeParameter.constraint.end
    ) {
      return true;
    }
  }
  return false;
}

export function isFunctionWithBody(
  node: ts.Node,
): node is ts.FunctionLikeDeclaration & { body: {} } {
  switch (node.kind) {
    case ts.SyntaxKind.GetAccessor:
    case ts.SyntaxKind.SetAccessor:
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.Constructor:
      return (<ts.FunctionLikeDeclaration>node).body !== undefined;
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
      return true;
    default:
      return false;
  }
}
