import { ESLintUtils } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import { isRestParameterDeclaration } from './misc';

const { nullThrows } = ESLintUtils;

const enum RestTypeKind {
  Array,
  Other,
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
      kind: RestTypeKind.Other;
      type: ts.Type;
    }
  | {
      index: number;
      kind: RestTypeKind.Tuple;
      typeArguments: readonly ts.Type[];
    };

/**
 * Tracks checking the parameters of a single function signature.
 * This allows rules to "consume" parameters and check for unsafe comparisons.
 */
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
  ): FunctionSignature {
    // getResolvedSignature only returns undefined for nodes outside the parse
    // tree, and tsNode always comes from the AST node map.
    const signature = nullThrows(
      checker.getResolvedSignature(tsNode),
      'Expected the call-like node to resolve to a signature.',
    );

    const paramTypes = [];
    let restType: RestType | null = null;

    const parameters = signature.getParameters();
    for (let index = 0; index < parameters.length; index += 1) {
      const param = parameters[index];
      const declaration = param.getDeclarations()?.[0];
      const type = checker.getTypeOfSymbolAtLocation(param, tsNode);
      const constrainedType = checker.getBaseConstraintOfType(type) ?? type;

      if (declaration && isRestParameterDeclaration(declaration)) {
        if (checker.isTupleType(constrainedType)) {
          restType = {
            index,
            kind: RestTypeKind.Tuple,
            typeArguments: checker.getTypeArguments(constrainedType),
          };
        } else {
          const elementType = checker.getIndexTypeOfType(
            constrainedType,
            ts.IndexKind.Number,
          );
          restType = elementType
            ? { index, kind: RestTypeKind.Array, type: elementType }
            : { index, kind: RestTypeKind.Other, type: constrainedType };
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
        case RestTypeKind.Other:
          return this.restType.type;
      }
    }

    return this.paramTypes[index];
  }
}
