/* eslint-disable */
import type { TSESTree } from '@typescript-eslint/utils';
import { analyze } from '@typescript-eslint/scope-manager';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

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

        const checker = parserServices.program.getTypeChecker();

        usage ??= tsutils.collectVariableUsage(tsNode.getSourceFile());

        let inferredCounts: Map<ts.Identifier, number> | null = null;
        if (!tsNode.type) {
          // We need to resolve and analyze the inferred return type to see
          // whether it contains additional references to the type parameters.
          const type = checker.getTypeAtLocation(tsNode);
          // const appType = checker.getApparentType(type);
          const returns = type.getCallSignatures().map(s => s.getReturnType());
          if (returns.length) {
            const returnTypeNode = returns[0];
            inferredCounts = collectTypeParameterUsage(checker, returnTypeNode);
          }
        }

        for (const typeParameter of tsNode.typeParameters) {
          const { uses } = usage.get(typeParameter.name)!;
          const inferredUses = inferredCounts?.get(typeParameter.name) ?? 0;
          const numUses = uses.length + inferredUses;
          // console.log('type parameter', typeParameter.name.text, 'explicit', uses.length, 'implicit', inferredUses);
          if (numUses === 1) {
            context.report({
              data: {
                name: typeParameter.name.text,
              },
              node: parserServices.tsNodeToESTreeNodeMap.get(typeParameter),
              messageId: 'sole',
            });
          }
        }
      },
    };
  },
});

function collectTypeParameterUsage(
  checker: ts.TypeChecker,
  rootType: ts.Type,
): Map<ts.Identifier, number> {
  const out = new Map<ts.Identifier, number>();

  const increment = (id: ts.Identifier): void => {
    out.set(id, 1 + (out.get(id) ?? 0));
  };

  const process = (type: ts.Type): void => {
    // console.log('process', checker.typeToString(type));
    if (tsutils.isTypeParameter(type)) {
      for (const decl of type.getSymbol()?.getDeclarations() ?? []) {
        // console.log(' got a type parameter!');
        increment((decl as ts.TypeParameterDeclaration).name);
        break;
      }
    }
    // XXX these should be "else if" but tsutils.isParameterType narrows type to never.
    if (tsutils.isUnionOrIntersectionType(type)) {
      type.types.forEach(process);
    } else if (tsutils.isIndexedAccessType(type)) {
      process(type.objectType);
      process(type.indexType);
    } else if (tsutils.isTypeReference(type)) {
      for (const t of type.typeArguments ?? []) {
        // console.log(t);
        process(t);
      }
    }
    // If it's specifically a type parameter, then add it and we're done.
    // Compound types:
    // + union/intersection types
    // - array/tuple types
    // - object types
    // - mapped types
    // - types with generic type parameters
    // - type predicate
    // + indexed access types
  };

  process(rootType);
  return out;
}
