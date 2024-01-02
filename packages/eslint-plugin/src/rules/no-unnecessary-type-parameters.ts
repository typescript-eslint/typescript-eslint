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
        'MethodDefinition',
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

        // XXX this collects a lot more usage than is needed for this rule.
        usage ??= tsutils.collectVariableUsage(tsNode.getSourceFile());

        let inferredCounts: Map<ts.Identifier, number> | null = null;
        if (!tsNode.type) {
          // We need to resolve and analyze the inferred return type to see
          // whether it contains additional references to the type parameters.
          inferredCounts = new Map<ts.Identifier, number>();
          const type = checker.getTypeAtLocation(tsNode);
          for (const sig of type.getCallSignatures()) {
            collectTypeParameterUsage(
              checker,
              sig.getReturnType(),
              inferredCounts,
            );
          }
        }

        // References to the type parameter in the function body are irrelevant
        // for a valid type signature.
        let declEndPos = tsNode.end;
        if ('body' in tsNode) {
          declEndPos = tsNode.body?.getStart() ?? tsNode.end;
        }

        for (const typeParameter of tsNode.typeParameters) {
          const { uses } = usage.get(typeParameter.name)!;
          let numExplicitUses = 0;
          for (const use of uses) {
            const pos = use.location.getStart();
            if (pos > tsNode.getStart() && pos < declEndPos) {
              numExplicitUses++;
            }
          }
          const inferredUses = inferredCounts?.get(typeParameter.name) ?? 0;
          const numUses = numExplicitUses + inferredUses;
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
  counts: Map<ts.Identifier, number>,
): void {
  const increment = (id: ts.Identifier): void => {
    counts.set(id, 1 + (counts.get(id) ?? 0));
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
      // This covers generic types like Map<K, V>.
      for (const t of type.typeArguments ?? []) {
        process(t);
      }
    } else if (tsutils.isObjectType(type)) {
      // This covers inferred object types. This should be _after_
      // isTypeReference to avoid descending into all the properties of a
      // generic interface/class, e.g. Map<K, V>.
      for (const sym of type.getProperties()) {
        process(checker.getTypeOfSymbol(sym));
      }
    }
    // If it's specifically a type parameter, then add it and we're done.
    // Compound types:
    // + union/intersection types
    // + array/tuple types
    // - object types
    // - mapped types
    // + types with generic type parameters
    // - type predicate
    // + indexed access types
    // - conditional types
  };

  process(rootType);
}
