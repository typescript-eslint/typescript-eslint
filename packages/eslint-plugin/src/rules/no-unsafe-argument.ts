import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as util from '../util';

type MessageIds =
  | 'unsafeArgument'
  | 'unsafeTupleSpread'
  | 'unsafeArraySpread'
  | 'unsafeSpread';

class FunctionSignature {
  public static create(
    checker: ts.TypeChecker,
    tsNode: ts.CallLikeExpression,
  ): FunctionSignature | null {
    const signature = checker.getResolvedSignature(tsNode);
    if (!signature) {
      return null;
    }

    const paramTypes: ts.Type[] = [];
    let restType: ts.Type | null = null;

    for (const param of signature.getParameters()) {
      const type = checker.getTypeOfSymbolAtLocation(param, tsNode);

      const decl = param.getDeclarations()?.[0];
      if (decl && ts.isParameter(decl) && decl.dotDotDotToken) {
        // is a rest param
        if (checker.isArrayType(type)) {
          restType = checker.getTypeArguments(type)[0];
        } else {
          restType = type;
        }
        break;
      }

      paramTypes.push(type);
    }

    return new this(paramTypes, restType);
  }

  private hasConsumedArguments = false;

  private constructor(
    private paramTypes: ts.Type[],
    private restType: ts.Type | null,
  ) {}

  public getParameterType(index: number): ts.Type | null {
    if (index >= this.paramTypes.length || this.hasConsumedArguments) {
      return this.restType;
    }
    return this.paramTypes[index];
  }

  public consumeRemainingArguments(): void {
    this.hasConsumedArguments = true;
  }
}

export default util.createRule<[], MessageIds>({
  name: 'no-unsafe-argument',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows calling an function with an any type value',
      category: 'Possible Errors',
      // TODO - enable this with next breaking
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      unsafeArgument:
        'Unsafe argument of type `{{sender}}` assigned to a parameter of type `{{receiver}}`.',
      unsafeTupleSpread:
        'Unsafe spread of a tuple type. The {{index}} element is of type `{{sender}}` and is assigned to a parameter of type `{{reciever}}`.',
      unsafeArraySpread: 'Unsafe spread of an `any` array type.',
      unsafeSpread: 'Unsafe spread of an `any` type.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } = util.getParserServices(context);
    const checker = program.getTypeChecker();

    return {
      'CallExpression, NewExpression'(
        node: TSESTree.CallExpression | TSESTree.NewExpression,
      ): void {
        if (node.arguments.length === 0) {
          return;
        }

        // ignore any-typed calls as these are caught by no-unsafe-call
        if (
          util.isTypeAnyType(
            checker.getTypeAtLocation(esTreeNodeToTSNodeMap.get(node.callee)),
          )
        ) {
          return;
        }

        const tsNode = esTreeNodeToTSNodeMap.get(node);
        const signature = FunctionSignature.create(checker, tsNode);
        if (!signature) {
          return;
        }

        let parameterTypeIndex = 0;
        for (
          let i = 0;
          i < node.arguments.length;
          i += 1, parameterTypeIndex += 1
        ) {
          const argument = node.arguments[i];

          switch (argument.type) {
            // spreads consume
            case AST_NODE_TYPES.SpreadElement: {
              const spreadArgType = checker.getTypeAtLocation(
                esTreeNodeToTSNodeMap.get(argument.argument),
              );

              if (util.isTypeAnyType(spreadArgType)) {
                // foo(...any)
                context.report({
                  node: argument,
                  messageId: 'unsafeSpread',
                });
              } else if (util.isTypeAnyArrayType(spreadArgType, checker)) {
                // foo(...any[])

                // TODO - we could break down the spread and compare the array type against each argument
                context.report({
                  node: argument,
                  messageId: 'unsafeArraySpread',
                });
              } else if (checker.isTupleType(spreadArgType)) {
                // foo(...[tuple1, tuple2])
                const spreadTypeArguments = checker.getTypeArguments(
                  spreadArgType,
                );
                for (
                  let j = 0;
                  j < spreadTypeArguments.length;
                  j += 1, parameterTypeIndex += 1
                ) {
                  const tupleType = spreadTypeArguments[j];
                  const parameterType = signature.getParameterType(
                    parameterTypeIndex,
                  );
                  if (parameterType == null) {
                    continue;
                  }
                  const result = util.isUnsafeAssignment(
                    tupleType,
                    parameterType,
                    checker,
                  );
                  if (result) {
                    context.report({
                      node: argument,
                      messageId: 'unsafeTupleSpread',
                      data: {
                        sender: checker.typeToString(tupleType),
                        receiver: checker.typeToString(parameterType),
                      },
                    });
                  }
                }
                if (spreadArgType.target.hasRestElement) {
                  // the last element was a rest - so all remaining defined arguments can be considered "consumed"
                  // all remaining arguments should be compared against the rest type (if one exists)
                  signature.consumeRemainingArguments();
                }
              } else {
                // something that's iterable
                // handling this will be pretty complex - so we ignore it for now
                // TODO - handle generic iterable case
              }
              break;
            }

            default: {
              const parameterType = signature.getParameterType(i);
              if (parameterType == null) {
                continue;
              }

              const argumentType = checker.getTypeAtLocation(
                esTreeNodeToTSNodeMap.get(argument),
              );
              const result = util.isUnsafeAssignment(
                argumentType,
                parameterType,
                checker,
              );
              if (result) {
                context.report({
                  node: argument,
                  messageId: 'unsafeArgument',
                  data: {
                    sender: checker.typeToString(argumentType),
                    receiver: checker.typeToString(parameterType),
                  },
                });
              }
            }
          }
        }
      },
    };
  },
});
