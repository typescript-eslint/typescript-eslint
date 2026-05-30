import { ESLintUtils } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import { isRestParameterDeclaration } from './misc';

const { nullThrows } = ESLintUtils;

const enum RestTypeKind {
  Array,
  Tuple,
}

type RestType =
  | {
      index: number;
      kind: RestTypeKind.Array;
      type: ts.Type;
    }
  | {
      index: number;
      kind: RestTypeKind.Tuple;
      typeArguments: readonly ts.Type[];
    };

export class FunctionSignature {
  private hasConsumedArguments = false;

  private parameterTypeIndex = 0;

  private constructor(
    private readonly paramTypes: ts.Type[],
    private readonly restType: RestType | null,
  ) {}

  public static create(
    checker: ts.TypeChecker,
    tsNode: ts.CallLikeExpression,
    options?: {
      useDeclaredParameterTypes?: boolean;
    },
  ): FunctionSignature | null {
    const signature = checker.getResolvedSignature(tsNode);
    if (!signature) {
      return null;
    }

    const paramTypes = [];
    let restType: RestType | null = null;

    const parameters = signature.getParameters();
    for (let index = 0; index < parameters.length; index += 1) {
      const param = parameters[index];
      const declaration = param.getDeclarations()?.[0];
      const type =
        options?.useDeclaredParameterTypes &&
        declaration != null &&
        ts.isParameter(declaration) &&
        declaration.type != null
          ? checker.getTypeFromTypeNode(declaration.type)
          : checker.getTypeOfSymbolAtLocation(param, tsNode);
      const constrainedType = checker.getBaseConstraintOfType(type) ?? type;

      if (declaration && isRestParameterDeclaration(declaration)) {
        if (checker.isTupleType(constrainedType)) {
          restType = {
            index,
            kind: RestTypeKind.Tuple,
            typeArguments: checker.getTypeArguments(constrainedType),
          };
        } else {
          restType = {
            index,
            kind: RestTypeKind.Array,
            type: nullThrows(
              checker.getIndexTypeOfType(constrainedType, ts.IndexKind.Number),
              'rest parameter type should always provide a number index type',
            ),
          };
        }
        break;
      }

      paramTypes.push(type);
    }

    return new FunctionSignature(paramTypes, restType);
  }

  public consumeRemainingArguments(): void {
    this.hasConsumedArguments = true;
  }

  public getNextParameterType(): ts.Type | null {
    const index = this.parameterTypeIndex;
    this.parameterTypeIndex += 1;

    if (index >= this.paramTypes.length || this.hasConsumedArguments) {
      if (this.restType == null) {
        return null;
      }

      switch (this.restType.kind) {
        case RestTypeKind.Tuple: {
          const { typeArguments } = this.restType;
          if (this.hasConsumedArguments) {
            return typeArguments[typeArguments.length - 1];
          }

          const typeIndex = index - this.restType.index;
          if (typeIndex >= typeArguments.length) {
            return typeArguments[typeArguments.length - 1];
          }

          return typeArguments[typeIndex];
        }

        case RestTypeKind.Array:
          return this.restType.type;
      }
    }

    return this.paramTypes[index];
  }
}
