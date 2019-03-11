import * as tsutils from 'tsutils';
import * as util from '../util';
import { Syntax } from '@typescript-eslint/parser';

interface Failure {
  unify: Unify;
  only2: boolean;
}
type Unify =
  | {
      kind: 'single-parameter-difference';
      p0: any;
      p1: any;
    }
  | {
      kind: 'extra-parameter';
      extraParameter: any;
      otherSignature: any;
    };

/**
 * Returns true if typeName is the name of an *outer* type parameter.
 * In: `interface I<T> { m<U>(x: U): T }`, only `T` is an outer type parameter.
 */
type IsTypeParameter = (typeName: string) => boolean;

export default util.createRule({
  name: 'unified-signatures',
  meta: {
    docs: {
      description:
        'Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter.',
      category: 'Variables',
      recommended: false,
      tslintName: 'unified-signatures',
    },
    type: 'suggestion',
    messages: {
      omittingRestParameter: '{{failureStringStart}} with a rest parameter.',
      omittingSingleParameter:
        '{{failureStringStart}} with an optional parameter.',
      singleParameterDifference:
        '{{failureStringStart}} taking `{{type1}} | {{type2}}`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function failureStringStart(otherLine?: number): string {
      // For only 2 overloads we don't need to specify which is the other one.
      const overloads =
        otherLine === undefined
          ? 'These overloads'
          : `This overload and the one on line ${otherLine}`;
      return `${overloads} can be combined into one signature`;
    }

    function addFailures(failures: Failure[]): void {
      for (const failure of failures) {
        const { unify, only2 } = failure;
        switch (unify.kind) {
          case 'single-parameter-difference': {
            const { p0, p1 } = unify;
            const lineOfOtherOverload = only2 ? undefined : p0.loc.start.line;
            context.report({
              loc: p1.loc,
              messageId: 'singleParameterDifference',
              data: {
                failureStringStart: failureStringStart(lineOfOtherOverload),
                type1: sourceCode.getText(p0.typeAnnotation.typeAnnotation),
                type2: sourceCode.getText(p1.typeAnnotation.typeAnnotation),
              },
              node: p1,
            });
            break;
          }
          case 'extra-parameter': {
            const { extraParameter, otherSignature } = unify;
            const lineOfOtherOverload = only2
              ? undefined
              : otherSignature.loc.start.line;

            context.report({
              loc: extraParameter.loc,
              messageId:
                extraParameter.type === Syntax.RestElement
                  ? 'omittingRestParameter'
                  : 'omittingSingleParameter',
              data: {
                failureStringStart: failureStringStart(lineOfOtherOverload),
              },
              node: extraParameter,
            });
          }
        }
      }
    }

    function checkOverloads(
      signatures: ReadonlyArray<any[]>,
      typeParameters: ReadonlyArray<any> | undefined,
    ): Failure[] {
      const result: Failure[] = [];
      const isTypeParameter = getIsTypeParameter(typeParameters);
      for (const overloads of signatures) {
        if (overloads.length === 2) {
          // Classes returns parameters on its value property
          const signature0 = overloads[0].value || overloads[0];
          const signature1 = overloads[1].value || overloads[1];

          const unify = compareSignatures(
            signature0,
            signature1,
            isTypeParameter,
          );
          if (unify !== undefined) {
            result.push({ unify, only2: true });
          }
        } else {
          forEachPair(overloads, (a, b) => {
            const unify = compareSignatures(a, b, isTypeParameter);
            if (unify !== undefined) {
              result.push({ unify, only2: false });
            }
          });
        }
      }
      return result;
    }

    function compareSignatures(
      a: any,
      b: any,
      isTypeParameter: IsTypeParameter,
    ): Unify | undefined {
      if (!signaturesCanBeUnified(a, b, isTypeParameter)) {
        return undefined;
      }

      return a.params.length === b.params.length
        ? signaturesDifferBySingleParameter(a.params, b.params)
        : signaturesDifferByOptionalOrRestParameter(a, b);
    }

    function signaturesCanBeUnified(
      a: any,
      b: any,
      isTypeParameter: IsTypeParameter,
    ): boolean {
      // Must return the same type.

      const aTypeParams =
        a.typeParameters !== undefined ? a.typeParameters.params : undefined;
      const bTypeParams =
        b.typeParameters !== undefined ? b.typeParameters.params : undefined;

      return (
        typesAreEqual(a.returnType, b.returnType) &&
        // Must take the same type parameters.
        // If one uses a type parameter (from outside) and the other doesn't, they shouldn't be joined.
        util.arraysAreEqual(aTypeParams, bTypeParams, typeParametersAreEqual) &&
        signatureUsesTypeParameter(a, isTypeParameter) ===
          signatureUsesTypeParameter(b, isTypeParameter)
      );
    }

    /** Detect `a(x: number, y: number, z: number)` and `a(x: number, y: string, z: number)`. */
    function signaturesDifferBySingleParameter(
      types1: ReadonlyArray<any>,
      types2: ReadonlyArray<any>,
    ): Unify | undefined {
      const index = getIndexOfFirstDifference(
        types1,
        types2,
        parametersAreEqual,
      );
      if (index === undefined) {
        return undefined;
      }

      // If remaining arrays are equal, the signatures differ by just one parameter type
      if (
        !util.arraysAreEqual(
          types1.slice(index + 1),
          types2.slice(index + 1),
          parametersAreEqual,
        )
      ) {
        return undefined;
      }

      const a = types1[index];
      const b = types2[index];
      // Can unify `a?: string` and `b?: number`. Can't unify `...args: string[]` and `...args: number[]`.
      // See https://github.com/Microsoft/TypeScript/issues/5077
      return parametersHaveEqualSigils(a, b) && a.type !== Syntax.RestElement
        ? { kind: 'single-parameter-difference', p0: a, p1: b }
        : undefined;
    }

    /**
     * Detect `a(): void` and `a(x: number): void`.
     * Returns the parameter declaration (`x: number` in this example) that should be optional/rest, and overload it's a part of.
     */
    function signaturesDifferByOptionalOrRestParameter(
      a: any,
      b: any,
    ): Unify | undefined {
      const sig1 = a.params;
      const sig2 = b.params;

      const minLength = Math.min(sig1.length, sig2.length);
      const longer = sig1.length < sig2.length ? sig2 : sig1;
      const shorter = sig1.length < sig2.length ? sig1 : sig2;
      const shorterSig = sig1.length < sig2.length ? a : b;

      // If one is has 2+ parameters more than the other, they must all be optional/rest.
      // Differ by optional parameters: f() and f(x), f() and f(x, ?y, ...z)
      // Not allowed: f() and f(x, y)
      for (let i = minLength + 1; i < longer.length; i++) {
        if (!parameterMayBeMissing(longer[i])) {
          return undefined;
        }
      }

      for (let i = 0; i < minLength; i++) {
        if (!typesAreEqual(sig1[i].typeAnnotation, sig2[i].typeAnnotation)) {
          return undefined;
        }
      }

      if (minLength > 0 && shorter[minLength - 1].type === Syntax.RestElement) {
        return undefined;
      }

      return {
        extraParameter: longer[longer.length - 1],
        kind: 'extra-parameter',
        otherSignature: shorterSig,
      };
    }

    /** Given type parameters, returns a function to test whether a type is one of those parameters. */
    function getIsTypeParameter(typeParameters: any): IsTypeParameter {
      if (typeParameters === undefined) {
        return () => false;
      }

      const set = new Set<string>();
      for (const t of typeParameters.params) {
        set.add(t.name.name);
      }
      return typeName => set.has(typeName);
    }

    /** True if any of the outer type parameters are used in a signature. */
    function signatureUsesTypeParameter(
      sig: any,
      isTypeParameter: IsTypeParameter,
    ): boolean {
      return sig.params.some(
        (p: any) => typeContainsTypeParameter(p.typeAnnotation) === true,
      );

      function typeContainsTypeParameter(type: any): boolean | undefined {
        if (!type) {
          return false;
        }

        if (type.type === Syntax.TSTypeReference) {
          const typeName = type.typeName;
          if (
            typeName.type === Syntax.Identifier &&
            isTypeParameter(typeName.name)
          ) {
            return true;
          }
        }

        return typeContainsTypeParameter(
          type.typeAnnotation || type.elementType,
        );
      }
    }

    function parametersAreEqual(a: any, b: any): boolean {
      return (
        parametersHaveEqualSigils(a, b) &&
        typesAreEqual(a.typeAnnotation, b.typeAnnotation)
      );
    }

    /** True for optional/rest parameters. */
    function parameterMayBeMissing(p: any): boolean {
      return p.type === Syntax.RestElement || p.optional;
    }

    /** False if one is optional and the other isn't, or one is a rest parameter and the other isn't. */
    function parametersHaveEqualSigils(a: any, b: any): boolean {
      return (
        (a.type === Syntax.RestElement) === (b.type === Syntax.RestElement) &&
        (a.optional !== undefined) === (b.optional !== undefined)
      );
    }

    function typeParametersAreEqual(a: any, b: any): boolean {
      return (
        a.name.name === b.name.name &&
        constraintsAreEqual(a.constraint, b.constraint)
      );
    }

    function typesAreEqual(a: any, b: any): boolean {
      return (
        a === b ||
        (a !== undefined &&
          b !== undefined &&
          a.typeAnnotation.type === b.typeAnnotation.type)
      );
    }

    function constraintsAreEqual(a: any, b: any): boolean {
      return (
        a === b || (a !== undefined && b !== undefined && a.type === b.type)
      );
    }

    /* Returns the first index where `a` and `b` differ. */
    function getIndexOfFirstDifference<T>(
      a: ReadonlyArray<T>,
      b: ReadonlyArray<T>,
      equal: util.Equal<T>,
    ): number | undefined {
      for (let i = 0; i < a.length && i < b.length; i++) {
        if (!equal(a[i], b[i])) {
          return i;
        }
      }
      return undefined;
    }

    /** Calls `action` for every pair of values in `values`. */
    function forEachPair<T, Out>(
      values: ReadonlyArray<T>,
      action: (a: T, b: T) => Out | undefined,
    ): Out | undefined {
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          const result = action(values[i], values[j]);
          if (result !== undefined) {
            return result;
          }
        }
      }
      return undefined;
    }

    interface Scope {
      overloads: Map<string, any>;
      parent: any;
      typeParameters: ReadonlyArray<any> | undefined;
    }

    const scopes: Scope[] = [];
    let currentScope: Scope | undefined = {
      overloads: new Map(),
      parent: undefined,
      typeParameters: undefined,
    };

    function createScope(parent: any, typeParameters: any = undefined) {
      currentScope && scopes.push(currentScope);
      currentScope = {
        overloads: new Map(),
        parent,
        typeParameters,
      };
    }

    function checkScope() {
      const failures = currentScope
        ? checkOverloads(
            Array.from(currentScope.overloads.values()),
            currentScope.typeParameters,
          )
        : [];
      addFailures(failures);
      currentScope = scopes.pop();
    }

    function addOverload(signature: any, key?: string) {
      key = key || getOverloadKey(signature);
      if (currentScope && signature.parent === currentScope.parent && key) {
        const overloads = currentScope.overloads.get(key);
        if (overloads !== undefined) {
          overloads.push(signature);
        } else {
          currentScope.overloads.set(key, [signature]);
        }
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      Program(node) {
        createScope(node);
      },
      TSModuleBlock(node) {
        createScope(node);
      },
      TSInterfaceDeclaration(node) {
        createScope(node.body, node.typeParameters);
      },
      ClassDeclaration(node) {
        createScope(node.body, node.typeParameters);
      },
      TSTypeLiteral(node) {
        createScope(node);
      },
      // collect overloads
      TSDeclareFunction(node) {
        if (node.id && !node.body) {
          addOverload(node, node.id.name);
        }
      },
      TSCallSignatureDeclaration: addOverload,
      TSConstructSignatureDeclaration: addOverload,
      TSMethodSignature: addOverload,
      TSAbstractMethodDefinition(node) {
        if (!node.value.body) {
          addOverload(node);
        }
      },
      MethodDefinition(node) {
        if (!node.value.body) {
          addOverload(node);
        }
      },
      // validate scopes
      'Program:exit': checkScope,
      'TSModuleBlock:exit': checkScope,
      'TSInterfaceDeclaration:exit': checkScope,
      'ClassDeclaration:exit': checkScope,
      'TSTypeLiteral:exit': checkScope,
    };
  },
});

function getOverloadKey(node: any): string | undefined {
  const info = getOverloadInfo(node);
  if (info === undefined) {
    return undefined;
  }

  return (node.computed ? '0' : '1') + (node.static ? '0' : '1') + info;
}

function getOverloadInfo(
  node: any,
): string | { name: string; computed?: boolean } | undefined {
  switch (node.type) {
    case Syntax.TSConstructSignatureDeclaration:
      return 'constructor';
    case Syntax.TSCallSignatureDeclaration:
      return '()';
    default: {
      const { key } = node;
      if (key === undefined) {
        return undefined;
      }

      switch (key.type) {
        case Syntax.Identifier:
          return key.name;
        case Syntax.Property:
          const { value } = key;
          return tsutils.isLiteralExpression(value)
            ? value.text
            : { name: value.getText(), computed: true };
        default:
          return tsutils.isLiteralExpression(key) ? value.text : undefined;
      }
    }
  }
}
