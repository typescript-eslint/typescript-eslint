import type * as ts from 'typescript';

import { isRestParameterDeclaration } from '../../util';
import { isTypeOrConstraintAssignableTo } from './isTypeOrConstraintAssignableTo';

export type MethodAssignabilityFailure =
  | MethodExcessParametersFailure
  | MethodParameterFailure;

export interface MethodExcessParametersFailure {
  reason: 'excess-parameters';
}

export interface MethodParameterFailure {
  params: FailingParameters[];
  reason: 'parameter';
}

export interface FailingParameters {
  base: FailingParameter;
  derived: FailingParameter;
}

export interface FailingParameter {
  name: string;
  index: number;
}

export function checkMethodAssignability(
  checker: ts.TypeChecker,
  base: ts.Type,
  derived: ts.Type,
): MethodAssignabilityFailure | undefined {
  const baseSignature = base.getCallSignatures()[0];
  const derivedSignature = derived.getCallSignatures()[0];

  // TODO: add back in at the end?
  //   if (derivedSignature.parameters.length > baseSignature.parameters.length) {
  //     return { reason: 'excess-parameters' } as const;
  //   }

  const failures: FailingParameters[] = [];

  // Check parameters, using pointers that each stop progressing upon hitting any rest parameter
  let baseParameterIndex = 0;
  let derivedParameterIndex = 0;

  while (true) {
    // If only base exhausts its parameters list, derived has excess parameters to report.
    if (baseParameterIndex === baseSignature.parameters.length) {
      if (derivedParameterIndex === derivedSignature.parameters.length) {
        break;
      }

      return { reason: 'excess-parameters' };
    }

    const baseParameter = baseSignature.parameters[baseParameterIndex];
    const derivedParameter = derivedSignature.parameters[derivedParameterIndex];

    const baseIsRest = isSignatureRestParameter(baseParameter);
    const derivedIsRest = isSignatureRestParameter(derivedParameter);

    const baseType = checker.getTypeOfSymbol(baseParameter);
    const derivedType = checker.getTypeOfSymbol(derivedParameter);

    // A alternate/final "base" case would be getting to two rest params.
    // We can directly compare the remaining array types.
    if (baseIsRest && derivedIsRest) {
      if (!isTypeOrConstraintAssignableTo(checker, baseType, derivedType)) {
        addFailure(baseParameter, derivedParameter);
      }
      break;
    }

    // One-at-a-time: the base param is rest but derived is not.
    // Compare the base reset element type against the current derived param.
    if (baseIsRest) {
      const baseElementType = baseType.getNumberIndexType();
      if (!baseElementType) {
        return;
      }

      if (
        !isTypeOrConstraintAssignableTo(checker, baseElementType, derivedType)
      ) {
        addFailure(baseParameter, derivedParameter);
      }
      derivedParameterIndex += 1;
      continue;
    }

    // One-at-a-time: the derived param is rest but base is not.
    // Compare the current base param against the derived rest element type.
    if (derivedIsRest) {
      const derivedElementType = derivedType.getNumberIndexType();
      if (!derivedElementType) {
        return;
      }

      if (
        !isTypeOrConstraintAssignableTo(checker, baseType, derivedElementType)
      ) {
        addFailure(baseParameter, derivedParameter);
      }
      baseParameterIndex += 1;
      continue;
    }

    // Finally, the most common "base" case is neither param being a rest param.
    // We can compare their types directly.
    if (!isTypeOrConstraintAssignableTo(checker, baseType, derivedType)) {
      addFailure(baseParameter, derivedParameter);
    }

    baseParameterIndex += 1;
    derivedParameterIndex += 1;
  }

  // If any of the corresponding parameters were not assignable, report that first.
  if (failures.length > 0) {
    return { params: failures, reason: 'parameter' };
  }

  // Following that, if there was a parameter count mismatch, report that.

  // TODO: return types?

  // Otherwise, finally, there were no issues.
  return undefined;

  function addFailure(baseParameter: ts.Symbol, derivedParameter: ts.Symbol) {
    failures.push({
      base: { index: baseParameterIndex, name: baseParameter.name },
      derived: { index: derivedParameterIndex, name: derivedParameter.name },
    });
  }
}

function isSignatureRestParameter(parameter: ts.Symbol) {
  return (
    !!parameter.valueDeclaration &&
    isRestParameterDeclaration(parameter.valueDeclaration)
  );
}
