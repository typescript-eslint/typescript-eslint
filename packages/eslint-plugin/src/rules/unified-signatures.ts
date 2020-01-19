import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

interface Failure {
  unify: Unify;
  only2: boolean;
}

type Unify =
  | {
      kind: 'single-parameter-difference';
      p0: TSESTree.Parameter;
      p1: TSESTree.Parameter;
    }
  | {
      kind: 'extra-parameter';
      extraParameter: TSESTree.Parameter;
      otherSignature: SignatureDefinition;
    };

/**
 * Returns true if typeName is the name of an *outer* type parameter.
 * In: `interface I<T> { m<U>(x: U): T }`, only `T` is an outer type parameter.
 */
type IsTypeParameter = (typeName: string) => boolean;

type ScopeNode =
  | TSESTree.Program
  | TSESTree.TSModuleBlock
  | TSESTree.TSInterfaceBody
  | TSESTree.ClassBody
  | TSESTree.TSTypeLiteral;

type OverloadNode = MethodDefinition | SignatureDefinition;
type ContainingNode =
  | TSESTree.ExportNamedDeclaration
  | TSESTree.ExportDefaultDeclaration;

type SignatureDefinition =
  | TSESTree.FunctionExpression
  | TSESTree.TSCallSignatureDeclaration
  | TSESTree.TSConstructSignatureDeclaration
  | TSESTree.TSDeclareFunction
  | TSESTree.TSEmptyBodyFunctionExpression
  | TSESTree.TSMethodSignature;

type MethodDefinition =
  | TSESTree.MethodDefinition
  | TSESTree.TSAbstractMethodDefinition;

export default util.createRule({
  name: 'unified-signatures',
  meta: {
    docs: {
      description:
        'Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter',
      category: 'Variables',
      // too opinionated to be recommended
      recommended: false,
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

            const typeAnnotation0 = isTSParameterProperty(p0)
              ? p0.parameter.typeAnnotation
              : p0.typeAnnotation;
            const typeAnnotation1 = isTSParameterProperty(p1)
              ? p1.parameter.typeAnnotation
              : p1.typeAnnotation;

            context.report({
              loc: p1.loc,
              messageId: 'singleParameterDifference',
              data: {
                failureStringStart: failureStringStart(lineOfOtherOverload),
                type1: sourceCode.getText(typeAnnotation0?.typeAnnotation),
                type2: sourceCode.getText(typeAnnotation1?.typeAnnotation),
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
                extraParameter.type === AST_NODE_TYPES.RestElement
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
      signatures: readonly OverloadNode[][],
      typeParameters?: TSESTree.TSTypeParameterDeclaration,
    ): Failure[] {
      const result: Failure[] = [];
      const isTypeParameter = getIsTypeParameter(typeParameters);
      for (const overloads of signatures) {
        if (overloads.length === 2) {
          const signature0 =
            (overloads[0] as MethodDefinition).value || overloads[0];
          const signature1 =
            (overloads[1] as MethodDefinition).value || overloads[1];

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
            const signature0 = (a as MethodDefinition).value || a;
            const signature1 = (b as MethodDefinition).value || b;

            const unify = compareSignatures(
              signature0,
              signature1,
              isTypeParameter,
            );
            if (unify !== undefined) {
              result.push({ unify, only2: false });
            }
          });
        }
      }
      return result;
    }

    function compareSignatures(
      a: SignatureDefinition,
      b: SignatureDefinition,
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
      a: SignatureDefinition,
      b: SignatureDefinition,
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
      types1: readonly TSESTree.Parameter[],
      types2: readonly TSESTree.Parameter[],
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
      return parametersHaveEqualSigils(a, b) &&
        a.type !== AST_NODE_TYPES.RestElement
        ? { kind: 'single-parameter-difference', p0: a, p1: b }
        : undefined;
    }

    /**
     * Detect `a(): void` and `a(x: number): void`.
     * Returns the parameter declaration (`x: number` in this example) that should be optional/rest, and overload it's a part of.
     */
    function signaturesDifferByOptionalOrRestParameter(
      a: SignatureDefinition,
      b: SignatureDefinition,
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
        const sig1i = sig1[i];
        const sig2i = sig2[i];
        const typeAnnotation1 = isTSParameterProperty(sig1i)
          ? sig1i.parameter.typeAnnotation
          : sig1i.typeAnnotation;
        const typeAnnotation2 = isTSParameterProperty(sig2i)
          ? sig2i.parameter.typeAnnotation
          : sig2i.typeAnnotation;

        if (!typesAreEqual(typeAnnotation1, typeAnnotation2)) {
          return undefined;
        }
      }

      if (
        minLength > 0 &&
        shorter[minLength - 1].type === AST_NODE_TYPES.RestElement
      ) {
        return undefined;
      }

      return {
        extraParameter: longer[longer.length - 1],
        kind: 'extra-parameter',
        otherSignature: shorterSig,
      };
    }

    /** Given type parameters, returns a function to test whether a type is one of those parameters. */
    function getIsTypeParameter(
      typeParameters?: TSESTree.TSTypeParameterDeclaration,
    ): IsTypeParameter {
      if (typeParameters === undefined) {
        return (() => false) as IsTypeParameter;
      }

      const set = new Set<string>();
      for (const t of typeParameters.params) {
        set.add(t.name.name);
      }
      return (typeName => set.has(typeName)) as IsTypeParameter;
    }

    /** True if any of the outer type parameters are used in a signature. */
    function signatureUsesTypeParameter(
      sig: SignatureDefinition,
      isTypeParameter: IsTypeParameter,
    ): boolean {
      return sig.params.some((p: TSESTree.Parameter) =>
        typeContainsTypeParameter(
          isTSParameterProperty(p)
            ? p.parameter.typeAnnotation
            : p.typeAnnotation,
        ),
      );

      function typeContainsTypeParameter(
        type?: TSESTree.TSTypeAnnotation | TSESTree.TypeNode,
      ): boolean {
        if (!type) {
          return false;
        }

        if (type.type === AST_NODE_TYPES.TSTypeReference) {
          const typeName = type.typeName;
          if (isIdentifier(typeName) && isTypeParameter(typeName.name)) {
            return true;
          }
        }

        return typeContainsTypeParameter(
          (type as TSESTree.TSTypeAnnotation).typeAnnotation ||
            (type as TSESTree.TSArrayType).elementType,
        );
      }
    }

    function isTSParameterProperty(
      node: TSESTree.Node,
    ): node is TSESTree.TSParameterProperty {
      return (
        (node as TSESTree.TSParameterProperty).type ===
        AST_NODE_TYPES.TSParameterProperty
      );
    }

    function parametersAreEqual(
      a: TSESTree.Parameter,
      b: TSESTree.Parameter,
    ): boolean {
      const typeAnnotationA = isTSParameterProperty(a)
        ? a.parameter.typeAnnotation
        : a.typeAnnotation;
      const typeAnnotationB = isTSParameterProperty(b)
        ? b.parameter.typeAnnotation
        : b.typeAnnotation;

      return (
        parametersHaveEqualSigils(a, b) &&
        typesAreEqual(typeAnnotationA, typeAnnotationB)
      );
    }

    /** True for optional/rest parameters. */
    function parameterMayBeMissing(p: TSESTree.Parameter): boolean | undefined {
      const optional = isTSParameterProperty(p)
        ? p.parameter.optional
        : p.optional;

      return p.type === AST_NODE_TYPES.RestElement || optional;
    }

    /** False if one is optional and the other isn't, or one is a rest parameter and the other isn't. */
    function parametersHaveEqualSigils(
      a: TSESTree.Parameter,
      b: TSESTree.Parameter,
    ): boolean {
      const optionalA = isTSParameterProperty(a)
        ? a.parameter.optional
        : a.optional;
      const optionalB = isTSParameterProperty(b)
        ? b.parameter.optional
        : b.optional;

      return (
        (a.type === AST_NODE_TYPES.RestElement) ===
          (b.type === AST_NODE_TYPES.RestElement) &&
        (optionalA !== undefined) === (optionalB !== undefined)
      );
    }

    function typeParametersAreEqual(
      a: TSESTree.TSTypeParameter,
      b: TSESTree.TSTypeParameter,
    ): boolean {
      return (
        a.name.name === b.name.name &&
        constraintsAreEqual(a.constraint, b.constraint)
      );
    }

    function typesAreEqual(
      a: TSESTree.TSTypeAnnotation | undefined,
      b: TSESTree.TSTypeAnnotation | undefined,
    ): boolean {
      return (
        a === b ||
        (a !== undefined &&
          b !== undefined &&
          sourceCode.getText(a.typeAnnotation) ===
            sourceCode.getText(b.typeAnnotation))
      );
    }

    function constraintsAreEqual(
      a: TSESTree.TypeNode | undefined,
      b: TSESTree.TypeNode | undefined,
    ): boolean {
      return (
        a === b || (a !== undefined && b !== undefined && a.type === b.type)
      );
    }

    /* Returns the first index where `a` and `b` differ. */
    function getIndexOfFirstDifference<T>(
      a: readonly T[],
      b: readonly T[],
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
    function forEachPair<T>(
      values: readonly T[],
      action: (a: T, b: T) => void,
    ): void {
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          action(values[i], values[j]);
        }
      }
    }

    interface Scope {
      overloads: Map<string, OverloadNode[]>;
      parent?: ScopeNode;
      typeParameters?: TSESTree.TSTypeParameterDeclaration;
    }

    const scopes: Scope[] = [];
    let currentScope: Scope = {
      overloads: new Map(),
    };

    function createScope(
      parent: ScopeNode,
      typeParameters?: TSESTree.TSTypeParameterDeclaration,
    ): void {
      currentScope && scopes.push(currentScope);
      currentScope = {
        overloads: new Map(),
        parent,
        typeParameters,
      };
    }

    function checkScope(): void {
      const failures = checkOverloads(
        Array.from(currentScope.overloads.values()),
        currentScope.typeParameters,
      );
      addFailures(failures);
      currentScope = scopes.pop()!;
    }

    function addOverload(
      signature: OverloadNode,
      key?: string,
      containingNode?: ContainingNode,
    ): void {
      key = key ?? getOverloadKey(signature);
      if (
        currentScope &&
        (containingNode || signature).parent === currentScope.parent
      ) {
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
      Program: createScope,
      TSModuleBlock: createScope,
      TSInterfaceDeclaration(node): void {
        createScope(node.body, node.typeParameters);
      },
      ClassDeclaration(node): void {
        createScope(node.body, node.typeParameters);
      },
      TSTypeLiteral: createScope,

      // collect overloads
      TSDeclareFunction(node): void {
        const exportingNode = getExportingNode(node);
        addOverload(node, node.id?.name ?? exportingNode?.type, exportingNode);
      },
      TSCallSignatureDeclaration: addOverload,
      TSConstructSignatureDeclaration: addOverload,
      TSMethodSignature: addOverload,
      TSAbstractMethodDefinition(node): void {
        if (!node.value.body) {
          addOverload(node);
        }
      },
      MethodDefinition(node): void {
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

function getExportingNode(
  node: TSESTree.TSDeclareFunction,
):
  | TSESTree.ExportNamedDeclaration
  | TSESTree.ExportDefaultDeclaration
  | undefined {
  return node.parent &&
    (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
      node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration)
    ? node.parent
    : undefined;
}

function getOverloadKey(node: OverloadNode): string {
  const info = getOverloadInfo(node);

  return (
    ((node as MethodDefinition).computed ? '0' : '1') +
    ((node as MethodDefinition).static ? '0' : '1') +
    info
  );
}

function getOverloadInfo(node: OverloadNode): string {
  switch (node.type) {
    case AST_NODE_TYPES.TSConstructSignatureDeclaration:
      return 'constructor';
    case AST_NODE_TYPES.TSCallSignatureDeclaration:
      return '()';
    default: {
      const { key } = node as MethodDefinition;

      return isIdentifier(key) ? key.name : (key as TSESTree.Literal).raw;
    }
  }
}

function isIdentifier(node: TSESTree.Node): node is TSESTree.Identifier {
  return node.type === AST_NODE_TYPES.Identifier;
}
