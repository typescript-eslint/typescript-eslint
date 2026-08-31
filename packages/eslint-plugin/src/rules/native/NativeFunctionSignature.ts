import type { Node } from '@typescript/native/unstable/ast';
import type { Checker, Project, Type } from '@typescript/native/unstable/sync';

import { isParameterDeclaration } from '@typescript/native/unstable/ast';

const enum RestTypeKind {
  Array,
  Other,
  Tuple,
}

type RestType =
  | { index: number; kind: RestTypeKind.Array; type: Type }
  | { index: number; kind: RestTypeKind.Other; type: Type }
  | { index: number; kind: RestTypeKind.Tuple; typeArguments: readonly Type[] };

export class NativeFunctionSignature {
  private hasConsumedArguments = false;
  private parameterTypeIndex = 0;

  private constructor(
    private readonly parameterTypes: Type[],
    private readonly restType: RestType | null,
  ) {}

  public static create(
    checker: Checker,
    project: Project,
    callNode: Node,
  ): NativeFunctionSignature {
    const signature = checker.getResolvedSignature(callNode);
    if (checker.isUnknownSignature(signature)) {
      return new NativeFunctionSignature([], null);
    }

    const parameterTypes: Type[] = [];
    let restType: RestType | null = null;

    for (const [index, parameter] of signature.getParameters().entries()) {
      const type = checker.getTypeOfSymbolAtLocation(parameter, callNode);
      const constrainedType = checker.getBaseConstraintOfType(type) ?? type;
      // Native symbols expose declaration handles directly rather than through getDeclarations().
      // eslint-disable-next-line @typescript-eslint/internal/no-poorly-typed-ts-props
      const declaration = parameter.declarations[0]?.resolve(project);

      if (
        declaration &&
        isParameterDeclaration(declaration) &&
        declaration.dotDotDotToken
      ) {
        if (
          checker.isTupleType(constrainedType) &&
          constrainedType.isTypeReference()
        ) {
          restType = {
            index,
            kind: RestTypeKind.Tuple,
            typeArguments: checker.getTypeArguments(constrainedType),
          };
        } else {
          const elementType = constrainedType.getNumberIndexType();
          restType = elementType
            ? { index, kind: RestTypeKind.Array, type: elementType }
            : { index, kind: RestTypeKind.Other, type: constrainedType };
        }
        break;
      }

      parameterTypes.push(type);
    }

    return new NativeFunctionSignature(parameterTypes, restType);
  }

  public consumeRemainingArguments(): void {
    this.hasConsumedArguments = true;
  }

  public getNextParameterType(): Type | null {
    const index = this.parameterTypeIndex++;

    if (index >= this.parameterTypes.length || this.hasConsumedArguments) {
      if (this.restType == null) {
        return null;
      }

      switch (this.restType.kind) {
        case RestTypeKind.Tuple: {
          const { typeArguments } = this.restType;
          if (this.hasConsumedArguments) {
            return typeArguments[typeArguments.length - 1];
          }

          return (
            typeArguments[index - this.restType.index] ??
            typeArguments[typeArguments.length - 1]
          );
        }
        case RestTypeKind.Array:
        case RestTypeKind.Other:
          return this.restType.type;
      }
    }

    return this.parameterTypes[index];
  }
}
