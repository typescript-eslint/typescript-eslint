import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule, getParserServices } from '../util';

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
        'ClassDeclaration[typeParameters]',
        'ClassExpression[typeParameters]',
        'ArrowFunctionExpression[typeParameters]',
        'FunctionDeclaration[typeParameters]',
        'FunctionExpression[typeParameters]',
        'TSCallSignatureDeclaration[typeParameters]',
        'TSConstructorType[typeParameters]',
        'TSDeclareFunction[typeParameters]',
        'TSFunctionType[typeParameters]',
        'TSMethodSignature[typeParameters]',
        'TSEmptyBodyFunctionExpression[typeParameters]',
      ].join(', ')](esNode: TSESTree.FunctionLike): void {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(esNode) as
          | ts.SignatureDeclaration
          | ts.ClassLikeDeclaration;
        if (!tsNode.typeParameters) {
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        // XXX this collects a lot more usage than is needed for this rule.
        usage ??= tsutils.collectVariableUsage(tsNode.getSourceFile());

        // We need to resolve and analyze the inferred return type of a function
        // to see whether it contains additional references to the type parameters.
        // For classes, we need to do this for all their methods.
        let inferredCounts: Map<ts.Identifier, number> | null = null;
        const fnNodes = [];
        if (ts.isFunctionLike(tsNode)) {
          fnNodes.push(tsNode);
        } else if (ts.isClassLike(tsNode)) {
          for (const member of tsNode.members) {
            if (ts.isFunctionLike(member)) {
              fnNodes.push(member);
            }
          }
        }
        for (const fnNode of fnNodes) {
          if (!fnNode.type) {
            inferredCounts ??= new Map<ts.Identifier, number>();
            const type = checker.getTypeAtLocation(fnNode);
            for (const sig of type.getCallSignatures()) {
              collectTypeParameterUsage(
                checker,
                sig.getReturnType(),
                inferredCounts,
              );
            }
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

// Fill in a counter of the number of times each type parameter appears in
// the given type.
function collectTypeParameterUsage(
  checker: ts.TypeChecker,
  rootType: ts.Type,
  counts: Map<ts.Identifier, number>,
): void {
  const increment = (id: ts.Identifier): void => {
    counts.set(id, 1 + (counts.get(id) ?? 0));
  };

  const process = (type: ts.Type): void => {
    if (tsutils.isTypeParameter(type)) {
      for (const decl of type.getSymbol()?.getDeclarations() ?? []) {
        increment((decl as ts.TypeParameterDeclaration).name);
        break;
      }
    }
    // XXX these should be "else if" but tsutils.isParameterType narrows type to never.
    if (tsutils.isUnionOrIntersectionType(type)) {
      type.types.forEach(process);
    } else if (tsutils.isIndexedAccessType(type)) {
      // This covers index access types like "T[K]"
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
    // TODO: mapped types, type predicate, conditional types, function types
  };

  process(rootType);
}
