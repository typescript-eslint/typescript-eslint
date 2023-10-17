import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  getTypeArguments,
  isTypeAnyArrayType,
  isTypeAnyType,
  isUnsafeAssignment,
} from '../util';

type MessageIds =
  | 'unsafeArgument'
  | 'unsafeArraySpread'
  | 'unsafeSpread'
  | 'unsafeTupleSpread';

const enum RestTypeKind {
  Array,
  Tuple,
  Other,
}
type RestType =
  | {
      type: ts.Type;
      kind: RestTypeKind.Array;
      index: number;
    }
  | {
      type: ts.Type;
      kind: RestTypeKind.Other;
      index: number;
    }
  | {
      typeArguments: readonly ts.Type[];
      kind: RestTypeKind.Tuple;
      index: number;
    };

class FunctionSignature {
  private parameterTypeIndex = 0;

  public static create(
    checker: ts.TypeChecker,
    tsNode: ts.CallLikeExpression,
  ): FunctionSignature | null {
    const signature = checker.getResolvedSignature(tsNode);
    if (!signature) {
      return null;
    }

    const paramTypes: ts.Type[] = [];
    let restType: RestType | null = null;

    const parameters = signature.getParameters();
    for (let i = 0; i < parameters.length; i += 1) {
      const param = parameters[i];
      const type = checker.getTypeOfSymbolAtLocation(param, tsNode);

      const decl = param.getDeclarations()?.[0];
      if (decl && ts.isParameter(decl) && decl.dotDotDotToken) {
        // is a rest param
        if (checker.isArrayType(type)) {
          restType = {
            type: getTypeArguments(type, checker)[0],
            kind: RestTypeKind.Array,
            index: i,
          };
        } else if (checker.isTupleType(type)) {
          restType = {
            typeArguments: getTypeArguments(type, checker),
            kind: RestTypeKind.Tuple,
            index: i,
          };
        } else {
          restType = {
            type,
            kind: RestTypeKind.Other,
            index: i,
          };
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
    private restType: RestType | null,
  ) {}

  public getNextParameterType(): ts.Type | null {
    const index = this.parameterTypeIndex;
    this.parameterTypeIndex += 1;

    if (index >= this.paramTypes.length || this.hasConsumedArguments) {
      if (this.restType == null) {
        return null;
      }

      switch (this.restType.kind) {
        case RestTypeKind.Tuple: {
          const typeArguments = this.restType.typeArguments;
          if (this.hasConsumedArguments) {
            // all types consumed by a rest - just assume it's the last type
            // there is one edge case where this is wrong, but we ignore it because
            // it's rare and really complicated to handle
            // eg: function foo(...a: [number, ...string[], number])
            return typeArguments[typeArguments.length - 1];
          }

          const typeIndex = index - this.restType.index;
          if (typeIndex >= typeArguments.length) {
            return typeArguments[typeArguments.length - 1];
          }

          return typeArguments[typeIndex];
        }

        case RestTypeKind.Array:
        case RestTypeKind.Other:
          return this.restType.type;
      }
    }
    return this.paramTypes[index];
  }

  public consumeRemainingArguments(): void {
    this.hasConsumedArguments = true;
  }
}

export default createRule<[], MessageIds>({
  name: 'no-unsafe-argument',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow calling a function with a value with type `any`',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeArgument:
        'Unsafe argument of type `{{sender}}` assigned to a parameter of type `{{receiver}}`.',
      unsafeTupleSpread:
        'Unsafe spread of a tuple type. The argument is of type `{{sender}}` and is assigned to a parameter of type `{{receiver}}`.',
      unsafeArraySpread: 'Unsafe spread of an `any` array type.',
      unsafeSpread: 'Unsafe spread of an `any` type.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      'CallExpression, NewExpression'(
        node: TSESTree.CallExpression | TSESTree.NewExpression,
      ): void {
        if (node.arguments.length === 0) {
          return;
        }

        // ignore any-typed calls as these are caught by no-unsafe-call
        if (isTypeAnyType(services.getTypeAtLocation(node.callee))) {
          return;
        }

        const tsNode = services.esTreeNodeToTSNodeMap.get(node);
        const signature = FunctionSignature.create(checker, tsNode);
        if (!signature) {
          return;
        }

        for (const argument of node.arguments) {
          switch (argument.type) {
            // spreads consume
            case AST_NODE_TYPES.SpreadElement: {
              const spreadArgType = services.getTypeAtLocation(
                argument.argument,
              );

              if (isTypeAnyType(spreadArgType)) {
                // foo(...any)
                context.report({
                  node: argument,
                  messageId: 'unsafeSpread',
                });
              } else if (isTypeAnyArrayType(spreadArgType, checker)) {
                // foo(...any[])

                // TODO - we could break down the spread and compare the array type against each argument
                context.report({
                  node: argument,
                  messageId: 'unsafeArraySpread',
                });
              } else if (checker.isTupleType(spreadArgType)) {
                // foo(...[tuple1, tuple2])
                const spreadTypeArguments = getTypeArguments(
                  spreadArgType,
                  checker,
                );
                for (const tupleType of spreadTypeArguments) {
                  const parameterType = signature.getNextParameterType();
                  if (parameterType == null) {
                    continue;
                  }
                  const result = isUnsafeAssignment(
                    tupleType,
                    parameterType,
                    checker,
                    // we can't pass the individual tuple members in here as this will most likely be a spread variable
                    // not a spread array
                    null,
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
              const parameterType = signature.getNextParameterType();
              if (parameterType == null) {
                continue;
              }

              const argumentType = services.getTypeAtLocation(argument);
              const result = isUnsafeAssignment(
                argumentType,
                parameterType,
                checker,
                argument,
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
