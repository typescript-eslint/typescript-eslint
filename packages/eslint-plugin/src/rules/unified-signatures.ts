import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import { getKeys } from '@typescript-eslint/visitor-keys';

import type { Equal } from '../util';

import { arraysAreEqual, createRule, nullThrows } from '../util';

interface Failure {
  only2: boolean;
  unify: Unify;
}

type Unify =
  | {
      extraParameter: TSESTree.Parameter;
      kind: 'extra-parameter';
      otherSignature: SignatureDefinition;
    }
  | {
      kind: 'single-parameter-difference';
      p0: TSESTree.Parameter;
      p1: TSESTree.Parameter;
    };

/**
 * Returns true if typeName is the name of an *outer* type parameter.
 * In: `interface I<T> { m<U>(x: U): T }`, only `T` is an outer type parameter.
 */
type IsTypeParameter = (typeName: string) => boolean;

type ScopeNode =
  | TSESTree.ClassBody
  | TSESTree.Program
  | TSESTree.TSInterfaceBody
  | TSESTree.TSModuleBlock
  | TSESTree.TSTypeLiteral;

type OverloadNode = MethodDefinition | SignatureDefinition;
type ContainingNode =
  | TSESTree.ExportDefaultDeclaration
  | TSESTree.ExportNamedDeclaration;

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

export type MessageIds =
  | 'omittingRestParameter'
  | 'omittingSingleParameter'
  | 'singleParameterDifference';

export type Options = [
  {
    ignoreDifferentlyNamedParameters?: boolean;
    ignoreOverloadsWithDifferentJSDoc?: boolean;
  },
];

export default createRule<Options, MessageIds>({
  name: 'unified-signatures',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow two overloads that could be unified into one with a union or an optional/rest parameter',
      // too opinionated to be recommended
      recommended: 'strict',
    },
    messages: {
      omittingRestParameter: '{{failureStringStart}} with a rest parameter.',
      omittingSingleParameter:
        '{{failureStringStart}} with an optional parameter.',
      singleParameterDifference:
        '{{failureStringStart}} taking `{{type1}} | {{type2}}`.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreDifferentlyNamedParameters: {
            type: 'boolean',
            description:
              'Whether two parameters with different names at the same index should be considered different even if their types are the same.',
          },
          ignoreOverloadsWithDifferentJSDoc: {
            type: 'boolean',
            description:
              'Whether two overloads with different JSDoc comments should be considered different even if their parameter and return types are the same.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      ignoreDifferentlyNamedParameters: false,
      ignoreOverloadsWithDifferentJSDoc: false,
    },
  ],
  create(
    context,
    [{ ignoreDifferentlyNamedParameters, ignoreOverloadsWithDifferentJSDoc }],
  ) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function failureStringStart(otherLine?: number): string {
      // For only 2 overloads we don't need to specify which is the other one.
      const overloads =
        otherLine == null
          ? 'These overloads'
          : `This overload and the one on line ${otherLine}`;
      return `${overloads} can be combined into one signature`;
    }

    function addFailures(failures: Failure[]): void {
      for (const failure of failures) {
        const { only2, unify } = failure;
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
              node: p1,
              messageId: 'singleParameterDifference',
              data: {
                failureStringStart: failureStringStart(lineOfOtherOverload),
                type1: context.sourceCode.getText(
                  typeAnnotation0?.typeAnnotation,
                ),
                type2: context.sourceCode.getText(
                  typeAnnotation1?.typeAnnotation,
                ),
              },
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
              node: extraParameter,
              messageId:
                extraParameter.type === AST_NODE_TYPES.RestElement
                  ? 'omittingRestParameter'
                  : 'omittingSingleParameter',
              data: {
                failureStringStart: failureStringStart(lineOfOtherOverload),
              },
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
        forEachPair(overloads, (a, b) => {
          const signature0 = (a as Partial<MethodDefinition>).value ?? a;
          const signature1 = (b as Partial<MethodDefinition>).value ?? b;

          const unify = compareSignatures(
            signature0 as SignatureDefinition,
            signature1 as SignatureDefinition,
            isTypeParameter,
          );
          if (unify != null) {
            result.push({ only2: overloads.length === 2, unify });
          }
        });
      }
      return result;
    }

    function compareSignatures(
      a: SignatureDefinition,
      b: SignatureDefinition,
      isTypeParameter: IsTypeParameter,
    ): Unify | undefined {
      // Type parameters declared on the overloads themselves are compared by
      // their constraint rather than by name, so that two overloads using the
      // same constraint under different type parameter names can still unify.
      const ownTypeParametersA = getOwnTypeParameterConstraints(a);
      const ownTypeParametersB = getOwnTypeParameterConstraints(b);

      if (
        !signaturesCanBeUnified(
          a,
          b,
          isTypeParameter,
          ownTypeParametersA,
          ownTypeParametersB,
        )
      ) {
        return undefined;
      }

      return a.params.length === b.params.length
        ? signaturesDifferBySingleParameter(
            a.params,
            b.params,
            ownTypeParametersA,
            ownTypeParametersB,
          )
        : signaturesDifferByOptionalOrRestParameter(
            a,
            b,
            ownTypeParametersA,
            ownTypeParametersB,
          );
    }

    function signaturesCanBeUnified(
      a: SignatureDefinition,
      b: SignatureDefinition,
      isTypeParameter: IsTypeParameter,
      ownTypeParametersA: ReadonlyMap<string, string>,
      ownTypeParametersB: ReadonlyMap<string, string>,
    ): boolean {
      // Must return the same type.

      const aTypeParams =
        a.typeParameters != null ? a.typeParameters.params : undefined;
      const bTypeParams =
        b.typeParameters != null ? b.typeParameters.params : undefined;

      if (ignoreDifferentlyNamedParameters) {
        const commonParamsLength = Math.min(a.params.length, b.params.length);
        for (let i = 0; i < commonParamsLength; i += 1) {
          if (
            a.params[i].type === b.params[i].type &&
            getStaticParameterName(a.params[i]) !==
              getStaticParameterName(b.params[i])
          ) {
            return false;
          }
        }
      }

      if (ignoreOverloadsWithDifferentJSDoc) {
        const aComment = getBlockCommentForNode(getCommentTargetNode(a));
        const bComment = getBlockCommentForNode(getCommentTargetNode(b));
        if (aComment?.value !== bComment?.value) {
          return false;
        }
      }

      return (
        typesAreEqual(
          a.returnType,
          b.returnType,
          ownTypeParametersA,
          ownTypeParametersB,
        ) &&
        // Must take the same type parameters.
        // If one uses a type parameter (from outside) and the other doesn't, they shouldn't be joined.
        arraysAreEqual(aTypeParams, bTypeParams, typeParametersAreEqual) &&
        signatureUsesTypeParameter(a, isTypeParameter) ===
          signatureUsesTypeParameter(b, isTypeParameter)
      );
    }

    /** Detect `a(x: number, y: number, z: number)` and `a(x: number, y: string, z: number)`. */
    function signaturesDifferBySingleParameter(
      types1: readonly TSESTree.Parameter[],
      types2: readonly TSESTree.Parameter[],
      ownTypeParameters1: ReadonlyMap<string, string>,
      ownTypeParameters2: ReadonlyMap<string, string>,
    ): Unify | undefined {
      const firstParam1 = types1[0];
      const firstParam2 = types2[0];

      // exempt signatures with `this: void` from the rule
      if (isThisVoidParam(firstParam1) || isThisVoidParam(firstParam2)) {
        return undefined;
      }

      const parametersAreEqualConsideringTypeParameters = (
        p1: TSESTree.Parameter,
        p2: TSESTree.Parameter,
      ): boolean =>
        parametersAreEqual(p1, p2, ownTypeParameters1, ownTypeParameters2);

      const index = getIndexOfFirstDifference(
        types1,
        types2,
        parametersAreEqualConsideringTypeParameters,
      );
      if (index == null) {
        return undefined;
      }

      // If remaining arrays are equal, the signatures differ by just one parameter type
      if (
        !arraysAreEqual(
          types1.slice(index + 1),
          types2.slice(index + 1),
          parametersAreEqualConsideringTypeParameters,
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

    function isThisParam(param: TSESTree.Parameter | undefined): boolean {
      return param?.type === AST_NODE_TYPES.Identifier && param.name === 'this';
    }

    function isThisVoidParam(param: TSESTree.Parameter | undefined) {
      return (
        isThisParam(param) &&
        (param as TSESTree.Identifier).typeAnnotation?.typeAnnotation.type ===
          AST_NODE_TYPES.TSVoidKeyword
      );
    }

    /**
     * Detect `a(): void` and `a(x: number): void`.
     * Returns the parameter declaration (`x: number` in this example) that should be optional/rest, and overload it's a part of.
     */
    function signaturesDifferByOptionalOrRestParameter(
      a: SignatureDefinition,
      b: SignatureDefinition,
      ownTypeParameters1: ReadonlyMap<string, string>,
      ownTypeParameters2: ReadonlyMap<string, string>,
    ): Unify | undefined {
      const sig1 = a.params;
      const sig2 = b.params;

      const minLength = Math.min(sig1.length, sig2.length);
      const longer = sig1.length < sig2.length ? sig2 : sig1;
      const shorter = sig1.length < sig2.length ? sig1 : sig2;
      const shorterSig = sig1.length < sig2.length ? a : b;

      const firstParam1 = sig1.at(0);
      const firstParam2 = sig2.at(0);
      // If one signature has explicit this type and another doesn't, they can't
      // be unified.
      if (isThisParam(firstParam1) !== isThisParam(firstParam2)) {
        return undefined;
      }

      // exempt signatures with `this: void` from the rule
      if (isThisVoidParam(firstParam1) || isThisVoidParam(firstParam2)) {
        return undefined;
      }

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

        if (
          !typesAreEqual(
            typeAnnotation1,
            typeAnnotation2,
            ownTypeParameters1,
            ownTypeParameters2,
          )
        ) {
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
      if (typeParameters == null) {
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
          (type as Partial<TSESTree.TSTypeAnnotation>).typeAnnotation ??
            (type as TSESTree.TSArrayType).elementType,
        );
      }
    }

    function isTSParameterProperty(
      node: TSESTree.Node,
    ): node is TSESTree.TSParameterProperty {
      return node.type === AST_NODE_TYPES.TSParameterProperty;
    }

    function parametersAreEqual(
      a: TSESTree.Parameter,
      b: TSESTree.Parameter,
      ownTypeParametersA: ReadonlyMap<string, string>,
      ownTypeParametersB: ReadonlyMap<string, string>,
    ): boolean {
      const typeAnnotationA = isTSParameterProperty(a)
        ? a.parameter.typeAnnotation
        : a.typeAnnotation;
      const typeAnnotationB = isTSParameterProperty(b)
        ? b.parameter.typeAnnotation
        : b.typeAnnotation;

      return (
        parametersHaveEqualSigils(a, b) &&
        typesAreEqual(
          typeAnnotationA,
          typeAnnotationB,
          ownTypeParametersA,
          ownTypeParametersB,
        )
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
          (b.type === AST_NODE_TYPES.RestElement) && optionalA === optionalB
      );
    }

    function typeParametersAreEqual(
      a: TSESTree.TSTypeParameter,
      b: TSESTree.TSTypeParameter,
    ): boolean {
      // The names are intentionally not compared: two overloads declaring a
      // type parameter with the same constraint (and default) can be unified
      // even if those parameters are named differently, e.g. `<T extends string>`
      // and `<R extends string>`.
      return (
        constraintsAreEqual(a.constraint, b.constraint) &&
        constraintsAreEqual(a.default, b.default)
      );
    }

    function typesAreEqual(
      a: TSESTree.TSTypeAnnotation | undefined,
      b: TSESTree.TSTypeAnnotation | undefined,
      ownTypeParametersA: ReadonlyMap<string, string>,
      ownTypeParametersB: ReadonlyMap<string, string>,
    ): boolean {
      return (
        a === b ||
        (a != null &&
          b != null &&
          normalizeTypeText(a.typeAnnotation, ownTypeParametersA) ===
            normalizeTypeText(b.typeAnnotation, ownTypeParametersB))
      );
    }

    /**
     * Maps each type parameter declared on the signature itself to a token
     * derived from its constraint. References to these parameters are then
     * compared by constraint instead of by name, while references to type
     * parameters from an outer scope (absent from the map) keep being compared
     * by name.
     */
    function getOwnTypeParameterConstraints(
      signature: SignatureDefinition,
    ): ReadonlyMap<string, string> {
      const constraints = new Map<string, string>();
      for (const typeParameter of signature.typeParameters?.params ?? []) {
        constraints.set(
          typeParameter.name.name,
          typeParameter.constraint == null
            ? ''
            : context.sourceCode.getText(typeParameter.constraint),
        );
      }
      return constraints;
    }

    /**
     * Returns the source text of a type node with every reference to one of the
     * signature's own type parameters replaced by a token derived from that
     * parameter's constraint. The token is wrapped in `\0`, which cannot appear
     * in source code, so it can never collide with an unrelated type that
     * happens to be spelled like the constraint.
     */
    function normalizeTypeText(
      node: TSESTree.TypeNode,
      ownTypeParameters: ReadonlyMap<string, string>,
    ): string {
      const text = context.sourceCode.getText(node);
      if (ownTypeParameters.size === 0) {
        return text;
      }

      const offset = node.range[0];
      const replacements: { end: number; start: number; text: string }[] = [];
      forEachTypeReference(node, reference => {
        const constraint = ownTypeParameters.get(reference.name);
        if (constraint != null) {
          replacements.push({
            start: reference.range[0] - offset,
            end: reference.range[1] - offset,
            text: `\0${constraint}\0`,
          });
        }
      });
      if (replacements.length === 0) {
        return text;
      }

      replacements.sort((x, y) => x.start - y.start);
      let result = '';
      let lastIndex = 0;
      for (const replacement of replacements) {
        result += text.slice(lastIndex, replacement.start) + replacement.text;
        lastIndex = replacement.end;
      }
      return result + text.slice(lastIndex);
    }

    /** Calls `callback` for the name of every type reference found within `node`. */
    function forEachTypeReference(
      node: TSESTree.Node,
      callback: (reference: TSESTree.Identifier) => void,
    ): void {
      if (
        node.type === AST_NODE_TYPES.TSTypeReference &&
        isIdentifier(node.typeName)
      ) {
        callback(node.typeName);
      }

      const properties = node as unknown as Record<string, unknown>;
      for (const key of getKeys(node)) {
        const value = properties[key];
        if (Array.isArray(value)) {
          for (const child of value as unknown[]) {
            if (isNode(child)) {
              forEachTypeReference(child, callback);
            }
          }
        } else if (isNode(value)) {
          forEachTypeReference(value, callback);
        }
      }
    }

    function isNode(value: unknown): value is TSESTree.Node {
      return value != null && typeof value === 'object' && 'type' in value;
    }

    function constraintsAreEqual(
      a: TSESTree.TypeNode | undefined,
      b: TSESTree.TypeNode | undefined,
    ): boolean {
      return (
        a === b ||
        (a != null &&
          b != null &&
          context.sourceCode.getText(a) === context.sourceCode.getText(b))
      );
    }

    /* Returns the first index where `a` and `b` differ. */
    function getIndexOfFirstDifference<T>(
      a: readonly T[],
      b: readonly T[],
      equal: Equal<T>,
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
    let currentScope: Scope | undefined = {
      overloads: new Map<string, OverloadNode[]>(),
    };

    function createScope(
      parent: ScopeNode,
      typeParameters?: TSESTree.TSTypeParameterDeclaration,
    ): void {
      if (currentScope) {
        scopes.push(currentScope);
      }
      currentScope = {
        overloads: new Map<string, OverloadNode[]>(),
        parent,
        typeParameters,
      };
    }

    function checkScope(): void {
      const scope = nullThrows(
        currentScope,
        'checkScope() called without a current scope',
      );
      const failures = checkOverloads(
        [...scope.overloads.values()],
        scope.typeParameters,
      );
      addFailures(failures);
      currentScope = scopes.pop();
    }

    /**
     * @returns the first valid JSDoc comment annotating `node`
     */
    function getBlockCommentForNode(
      node: TSESTree.Node,
    ): TSESTree.Comment | undefined {
      return context.sourceCode
        .getCommentsBefore(node)
        .reverse()
        .find(comment => comment.type === AST_TOKEN_TYPES.Block);
    }

    function addOverload(
      signature: OverloadNode,
      key?: string,
      containingNode?: ContainingNode,
    ): void {
      key ??= getOverloadKey(signature);
      if ((containingNode ?? signature).parent === currentScope?.parent) {
        const overloads = currentScope.overloads.get(key);
        if (overloads != null) {
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
      ClassDeclaration(node): void {
        createScope(node.body, node.typeParameters);
      },
      Program: createScope,
      TSInterfaceDeclaration(node): void {
        createScope(node.body, node.typeParameters);
      },
      TSModuleBlock: createScope,
      TSTypeLiteral: createScope,

      // collect overloads
      MethodDefinition(node): void {
        if (!node.value.body && !isGetterOrSetter(node)) {
          addOverload(node);
        }
      },
      TSAbstractMethodDefinition(node): void {
        if (!node.value.body && !isGetterOrSetter(node)) {
          addOverload(node);
        }
      },
      TSCallSignatureDeclaration: addOverload,
      TSConstructSignatureDeclaration: addOverload,
      TSDeclareFunction(node): void {
        const exportingNode = getExportingNode(node);
        addOverload(node, node.id?.name ?? exportingNode?.type, exportingNode);
      },
      TSMethodSignature(node): void {
        if (!isGetterOrSetter(node)) {
          addOverload(node);
        }
      },

      // validate scopes
      'ClassDeclaration:exit': checkScope,
      'Program:exit': checkScope,
      'TSInterfaceDeclaration:exit': checkScope,
      'TSModuleBlock:exit': checkScope,
      'TSTypeLiteral:exit': checkScope,
    };
  },
});

function getCommentTargetNode(node: SignatureDefinition) {
  if (node.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression) {
    return node.parent;
  }

  return getExportingNode(node) ?? node;
}

function getExportingNode(
  node: SignatureDefinition,
):
  | TSESTree.ExportDefaultDeclaration
  | TSESTree.ExportNamedDeclaration
  | undefined {
  return node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
    node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration
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

      if (isPrivateIdentifier(key)) {
        return `private_identifier_${key.name}`;
      }

      if (isIdentifier(key)) {
        return `identifier_${key.name}`;
      }

      return (key as TSESTree.Literal).raw;
    }
  }
}

function getStaticParameterName(param: TSESTree.Node): string | undefined {
  switch (param.type) {
    case AST_NODE_TYPES.Identifier:
      return param.name;
    case AST_NODE_TYPES.RestElement:
      return getStaticParameterName(param.argument);
    default:
      return undefined;
  }
}
function isIdentifier(node: TSESTree.Node): node is TSESTree.Identifier {
  return node.type === AST_NODE_TYPES.Identifier;
}

function isPrivateIdentifier(
  node: TSESTree.Node,
): node is TSESTree.PrivateIdentifier {
  return node.type === AST_NODE_TYPES.PrivateIdentifier;
}

function isGetterOrSetter(
  node:
    | TSESTree.MethodDefinition
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.TSMethodSignature,
): boolean {
  return node.kind === 'get' || node.kind === 'set';
}
