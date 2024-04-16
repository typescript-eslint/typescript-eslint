import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { MakeRequired } from '../util';
import { createRule, getParserServices } from '../util';

type NodeWithTypeParameters = MakeRequired<
  ts.SignatureDeclaration | ts.ClassLikeDeclaration,
  'typeParameters'
>;

export default createRule({
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Disallow type parameters that only appear once',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      sole: 'Type parameter {{name}} is used only once.',
    },
    schema: [],
    type: 'problem',
  },
  name: 'no-unnecessary-type-parameters',
  create(context) {
    const parserServices = getParserServices(context);
    let usage: Map<ts.Identifier, tsutils.VariableInfo> | undefined;

    return {
      [[
        'ArrowFunctionExpression[typeParameters]',
        'ClassDeclaration[typeParameters]',
        'ClassExpression[typeParameters]',
        'FunctionDeclaration[typeParameters]',
        'FunctionExpression[typeParameters]',
        'TSCallSignatureDeclaration[typeParameters]',
        'TSConstructorType[typeParameters]',
        'TSDeclareFunction[typeParameters]',
        'TSEmptyBodyFunctionExpression[typeParameters]',
        'TSFunctionType[typeParameters]',
        'TSMethodSignature[typeParameters]',
      ].join(', ')](esNode: TSESTree.FunctionLike): void {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
          esNode,
        ) as NodeWithTypeParameters;

        const checker = parserServices.program.getTypeChecker();

        usage ??= tsutils.collectVariableUsage(tsNode.getSourceFile());

        // We need to resolve and analyze the inferred return type of a function
        // to see whether it contains additional references to the type parameters.
        // For classes, we need to do this for all their methods.
        const inferredCounts = countInferredTypeParameterUsage(checker, tsNode);

        // References to the type parameter in a function body are irrelevant
        // for a valid type signature.
        let declEndPos = tsNode.end;
        if (
          ts.isArrowFunction(tsNode) ||
          ts.isFunctionDeclaration(tsNode) ||
          ts.isFunctionExpression(tsNode) ||
          ts.isMethodDeclaration(tsNode)
        ) {
          declEndPos = tsNode.body?.getStart() ?? tsNode.end;
        }

        for (const typeParameter of tsNode.typeParameters) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const { uses } = usage.get(typeParameter.name)!;
          let explicitUsesCount = 0;
          for (const use of uses) {
            // Type parameters passed as type arguments might legitimately be used
            // Example:
            //   type Props<T> = { onClick: (value: T) => T; }
            //   declare function Component<T>(props: Props<T>): void;
            if (
              ts.isTypeReferenceNode(use.location.parent) &&
              ts.isTypeReferenceNode(use.location.parent.parent)
            ) {
              explicitUsesCount = Infinity;
              break;
            }
            const pos = use.location.getStart();
            if (pos > tsNode.getStart() && pos < declEndPos) {
              explicitUsesCount++;
              if (explicitUsesCount >= 2) {
                break;
              }
            }
          }
          const inferredUsesCount =
            inferredCounts?.get(typeParameter.name) ?? 0;
          if (explicitUsesCount + inferredUsesCount === 1) {
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

/**
 * Fills in a counter of the number of times each type parameter appears in
 * the given type.
 */
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
    // This should be "else if" but tsutils.isParameterType narrows type to never.
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

/** Count uses of type parameters in inferred return types. */
function countInferredTypeParameterUsage(
  checker: ts.TypeChecker,
  tsNode: NodeWithTypeParameters,
): Map<ts.Identifier, number> | null {
  let inferredCounts: Map<ts.Identifier, number> | null = null;
  const functionNodes = [];
  if (ts.isFunctionLike(tsNode)) {
    functionNodes.push(tsNode);
  } else if (ts.isClassLike(tsNode)) {
    for (const member of tsNode.members) {
      if (ts.isFunctionLike(member)) {
        functionNodes.push(member);
      }
    }
  }
  for (const functionNode of functionNodes) {
    if (!functionNode.type) {
      inferredCounts ??= new Map<ts.Identifier, number>();
      const type = checker.getTypeAtLocation(functionNode);
      for (const sig of type.getCallSignatures()) {
        collectTypeParameterUsage(checker, sig.getReturnType(), inferredCounts);
      }
    }
  }
  return inferredCounts;
}
