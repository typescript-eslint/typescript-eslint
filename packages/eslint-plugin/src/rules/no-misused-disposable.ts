import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { nullThrows } from '@typescript-eslint/utils/eslint-utils';
import * as tsutils from 'ts-api-utils';

import { createRule, findVariable, getParserServices } from '../util';

type DisposeKind = 'asyncDispose' | 'dispose';

interface TrackedVariable {
  /** The segments active at the point the variable was declared. */
  declaredSegments: TSESLint.CodePathSegment[];
  disposeKind: DisposeKind;
  reportNode: TSESTree.Node;
}

interface FunctionInfo {
  codePath: TSESLint.CodePath;
  currentSegments: Set<TSESLint.CodePathSegment>;
  /** Variables declared (and tracked) within this code path. */
  trackedVariables: Map<number, TrackedVariable>;
  upper: FunctionInfo | null;
}

// BIG TODO - all iterators apparently are Disposable (why??).
// So we need to find some way to detect that and not report them all over.
// Perhaps if a disposable is created that is also an iterator, iteration should
// be a form a handling it?

// also - vi.spy() sort of stuff triggers all over.
// This might be big pain.

export default createRule({
  name: 'no-misused-disposable',
  meta: {
    type: 'problem',
    docs: {
      description: "Disallow using disposables in a way that won't be disposed",
      requiresTypeChecking: true,
    },
    messages: {
      misusedDisposable:
        'This value creates a Disposable that is not guaranteed to be disposed. ' +
        "It must be declared with 'using'/'await using', returned, passed to a " +
        'function accepting a disposable, or explicitly disposed on every code path.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    let funcInfo: FunctionInfo | null = null;

    // Per-segment, per-tracked-variable "handled" state. Keyed by
    // `${segment.id}:${variable.$id}`.
    const handledAtSegment = new Map<string, boolean>();

    function currentFuncInfo(): FunctionInfo {
      return nullThrows(funcInfo, 'expected to be inside of a code path');
    }

    function segmentKey(
      segment: TSESLint.CodePathSegment,
      variableId: number,
    ): string {
      return `${segment.id}:${String(variableId)}`;
    }

    /** Checks whether `target` is reachable from any of `from` by following `nextSegments`. */
    function isSegmentReachableFromAny(
      from: TSESLint.CodePathSegment[],
      target: TSESLint.CodePathSegment,
    ): boolean {
      const visited = new Set<string>();
      const stack = [...from];
      while (stack.length > 0) {
        const segment = nullThrows(stack.pop(), 'stack is non-empty');
        if (segment === target) {
          return true;
        }
        if (visited.has(segment.id)) {
          continue;
        }
        visited.add(segment.id);
        stack.push(...segment.nextSegments);
      }
      return false;
    }

    /**
     * A segment is considered handled for `variableId`
     * if the variable's declaration can't reach it (the variable was never
     * live on that path, so there is nothing to require), or if it was
     * explicitly marked handled.
     */
    function isHandledAtSegment(
      segment: TSESLint.CodePathSegment,
      variable: TrackedVariable,
      variableId: number,
    ): boolean {
      return (
        !isSegmentReachableFromAny(variable.declaredSegments, segment) ||
        handledAtSegment.get(segmentKey(segment, variableId)) === true
      );
    }

    function getDisposeKind(type: ts.Type): DisposeKind | undefined {
      if (tsutils.getWellKnownSymbolPropertyOfType(type, 'dispose', checker)) {
        return 'dispose';
      }
      if (
        tsutils.getWellKnownSymbolPropertyOfType(type, 'asyncDispose', checker)
      ) {
        return 'asyncDispose';
      }
      return undefined;
    }

    // TODO - it matters what type of disposable it is.
    function typeAcceptsDisposable(type: ts.Type): boolean {
      return tsutils
        .unionConstituents(type)
        .some(part => getDisposeKind(part) != null);
    }

    /** Skips parenthesization and control-flow-transparent wrapper expressions. */
    function traverseUpTransparentParents(node: TSESTree.Node): TSESTree.Node {
      const { parent } = node;
      if (parent == null) {
        return node;
      }
      switch (parent.type) {
        case AST_NODE_TYPES.ConditionalExpression:
          if (parent.test !== node) {
            return traverseUpTransparentParents(parent);
          }
          return node;
        case AST_NODE_TYPES.LogicalExpression:
          // `a && b` evaluates to `b` whenever `a` is truthy, which is
          // always the case for a (non-nullish) disposable object -- so
          // `a`'s value is discarded and only `b` (the right side) can
          // carry the disposable through. `a || b`, on the other hand, may
          // evaluate to either operand depending on `a`'s runtime
          // truthiness, so both sides are treated as transparent.
          if (
            parent.operator === '||' ||
            (parent.operator === '&&' && parent.right === node)
          ) {
            return traverseUpTransparentParents(parent);
          }
          return node;
        case AST_NODE_TYPES.SequenceExpression:
          if (parent.expressions.at(-1) === node) {
            return traverseUpTransparentParents(parent);
          }
          return node;
        case AST_NODE_TYPES.TSSatisfiesExpression:
        case AST_NODE_TYPES.TSAsExpression:
        case AST_NODE_TYPES.TSTypeAssertion:
          // parent.expression === node since we're in a value context
          return traverseUpTransparentParents(parent);

        default:
          return node;
      }
    }

    /**
     * Checks whether `node`, used as an argument in a call/new expression,
     * is passed to a parameter whose contextual type accepts a disposable.
     * If so, the disposable is considered to have escaped.
     */
    function isEscapingCallArgument(node: TSESTree.Node): boolean {
      const { parent } = node;
      if (
        parent == null ||
        (parent.type !== AST_NODE_TYPES.CallExpression &&
          parent.type !== AST_NODE_TYPES.NewExpression)
      ) {
        return false;
      }
      const argIndex = parent.arguments.indexOf(
        node as TSESTree.CallExpressionArgument,
      );
      if (argIndex === -1) {
        return false;
      }
      const tsCallLike = services.esTreeNodeToTSNodeMap.get(parent);
      const contextualType = checker.getContextualTypeForArgumentAtIndex(
        tsCallLike,
        argIndex,
      );
      return typeAcceptsDisposable(contextualType);
    }

    /**
     * Checks whether `node`, used as a `return` statement's argument, is
     * returned to a context whose (contextual or declared) type accepts a
     * disposable. If not, the disposable does not actually escape via this
     * return (e.g. the enclosing function's return type is `unknown`).
     */
    function isEscapingReturnArgument(node: TSESTree.Expression): boolean {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node) as ts.Expression;
      const contextualType = checker.getContextualType(tsNode);
      if (contextualType == null) {
        return true;
      }
      return typeAcceptsDisposable(contextualType);
    }

    /** Checks whether an expression at `node` is handled at this exact location. */
    function isImmediatelyHandled(node: TSESTree.Node): boolean {
      const target = traverseUpTransparentParents(node);
      const { parent } = target;
      if (parent == null) {
        return false;
      }

      if (
        parent.type === AST_NODE_TYPES.VariableDeclarator &&
        parent.init === target &&
        (parent.parent.kind === 'using' || parent.parent.kind === 'await using')
      ) {
        return true;
      }

      if (parent.type === AST_NODE_TYPES.ReturnStatement) {
        return isEscapingReturnArgument(target as TSESTree.Expression);
      }

      return isEscapingCallArgument(target);
    }

    /**
     * Checks whether `node` (an Identifier reference) is the callee object
     * of a manual disposal call, e.g. `x[Symbol.dispose]()`.
     */
    function isManualDisposeCall(
      node: TSESTree.Identifier,
      disposeKind: DisposeKind,
    ): boolean {
      // Question - why isn't this part of isImmediatelyHandled?
      const { parent } = node;
      if (!(
        parent.type === AST_NODE_TYPES.MemberExpression &&
        parent.object === node &&
        parent.computed &&
        parent.parent.type === AST_NODE_TYPES.CallExpression &&
        parent.parent.callee === parent
      )) {
        return false;
      }

      const propertyType = services.getTypeAtLocation(parent.property);
      // this should specifically be checking for the right well-known symbol.
      // OR, syntactically checking for Symbol.dispose/Symbol.asyncDispose.

      // TODO - is this whole following section just a workaround for the fact that
      // TypeScript doesn't have a way to get the type of a symbol property access?

      if (!tsutils.isUniqueESSymbolType(propertyType)) {
        return false;
      }

      const nodeType = services.getTypeAtLocation(node);
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      // Optional chaining (e.g. `foo?.[Symbol.dispose]()`) adds `| undefined`
      // to the member access's resolved type, so compare against the
      // non-nullable type to still recognize the dispose call.
      const actualType = checker.getNonNullableType(
        services.getTypeAtLocation(parent),
      );
      return tsutils.unionConstituents(nodeType).some(part => {
        const expectedSymbol = tsutils.getWellKnownSymbolPropertyOfType(
          part,
          disposeKind,
          checker,
        );
        if (expectedSymbol == null) {
          return false;
        }

        // Both `parent.property` and `expectedSymbol` are keyed off of the
        // same well-known symbol iff their resolved (unique) types match.
        const expectedType = checker.getTypeOfSymbolAtLocation(
          expectedSymbol,
          tsNode,
        );
        return actualType === expectedType;
      });
    }

    function markHandled(variableId: number): void {
      for (const segment of currentFuncInfo().currentSegments) {
        // why is the segment.reachable check necessary?
        // No tests fail if it's removed.
        if (segment.reachable) {
          handledAtSegment.set(segmentKey(segment, variableId), true);
        }
      }
    }

    /**
     * Checks a reference to a tracked variable, marking it handled on the
     * current code path segments if this reference constitutes handling.
     */
    function checkTrackedVariableReference(node: TSESTree.Identifier): void {
      const scope = context.sourceCode.getScope(node);
      const variable = findVariable(scope, node);
      if (variable == null) {
        return;
      }

      const info = currentFuncInfo().trackedVariables.get(variable.$id);
      if (info == null) {
        return;
      }

      if (
        isImmediatelyHandled(node) ||
        isManualDisposeCall(node, info.disposeKind)
      ) {
        markHandled(variable.$id);
      }
    }

    /**
     * If `variableId`'s currently tracked disposable (if any) is still live
     * (unhandled) on the current segments, it's about to be overwritten and
     * lost -- report it immediately, since its fate can't depend on
     * anything that happens after this point.
     */
    function reportIfOverwritingLiveTrackedVariable(variableId: number): void {
      const info = currentFuncInfo();
      const existing = info.trackedVariables.get(variableId);
      if (existing == null) {
        return;
      }

      const stillLive = [...info.currentSegments].some(
        segment => !isHandledAtSegment(segment, existing, variableId),
      );
      if (stillLive) {
        context.report({
          node: existing.reportNode,
          messageId: 'misusedDisposable',
        });
      }
    }

    /**
     * Registers `id` as holding a not-yet-handled disposable as of the
     * current segments, reporting first if this overwrites a previous live
     * tracked disposable. If there's no conflicting overwrite, the new
     * declaration point is merged into any existing tracked entry so that
     * disposals/escapes reachable from either registration are honored.
     */
    function registerTrackedVariable(
      id: TSESTree.Identifier,
      disposeKind: DisposeKind,
    ): void {
      const scope = context.sourceCode.getScope(id);
      const variable = findVariable(scope, id);
      if (variable == null) {
        return;
      }

      reportIfOverwritingLiveTrackedVariable(variable.$id);

      const info = currentFuncInfo();
      const existing = info.trackedVariables.get(variable.$id);
      if (existing != null) {
        existing.declaredSegments.push(...info.currentSegments);
        existing.reportNode = id;
        return;
      }

      info.trackedVariables.set(variable.$id, {
        declaredSegments: [...info.currentSegments],
        disposeKind,
        reportNode: id,
      });
    }

    /**
     * Checks an assignment `id = <non-disposable value>`, reporting if `id`
     * currently holds a live (unhandled) tracked disposable: that value is
     * about to be overwritten and lost.
     */
    function checkAssignmentExpression(
      node: TSESTree.AssignmentExpression,
    ): void {
      if (
        node.operator !== '=' ||
        node.left.type !== AST_NODE_TYPES.Identifier
      ) {
        return;
      }

      const type = services.getTypeAtLocation(node.right);
      // ?
      if (getDisposeKind(type) != null) {
        // Handled by `checkProducedDisposable`, which also accounts for the
        // possibility of overwriting a previously tracked disposable.
        return;
      }

      const scope = context.sourceCode.getScope(node.left);
      const variable = findVariable(scope, node.left);
      if (variable == null) {
        return;
      }

      reportIfOverwritingLiveTrackedVariable(variable.$id);
      currentFuncInfo().trackedVariables.delete(variable.$id);
    }

    function checkProducedDisposable(node: TSESTree.Expression): void {
      const type = services.getTypeAtLocation(node);
      const disposeKind = getDisposeKind(type);
      if (disposeKind == null) {
        return;
      }

      if (isImmediatelyHandled(node)) {
        return;
      }

      // why traverseUpParents inside isImmediatelyHandled if we also traverseUp manually here?
      // seems like that's not what immediately means?

      const target = traverseUpTransparentParents(node);
      const { parent } = target;
      // TODO - what about var?
      if (
        parent?.type === AST_NODE_TYPES.VariableDeclarator &&
        parent.init === target &&
        (parent.parent.kind === 'const' || parent.parent.kind === 'let') &&
        parent.id.type === AST_NODE_TYPES.Identifier
      ) {
        registerTrackedVariable(parent.id, disposeKind);
        return;
      }

      // what about &&= and ??= and ||= ?
      if (
        parent?.type === AST_NODE_TYPES.AssignmentExpression &&
        parent.operator === '=' &&
        parent.right === target &&
        parent.left.type === AST_NODE_TYPES.Identifier
      ) {
        registerTrackedVariable(parent.left, disposeKind);
        return;
      }

      context.report({
        node,
        messageId: 'misusedDisposable',
      });
    }

    /** Updates a single segment's "handled" state from its `prevSegments`. */
    function updateHandledFromPrevSegments(
      segment: TSESLint.CodePathSegment,
      trackedVariables: Map<number, TrackedVariable>,
    ): void {
      for (const [variableId, variable] of trackedVariables) {
        const handled =
          segment.prevSegments.length > 0 &&
          segment.prevSegments.every(prev =>
            isHandledAtSegment(prev, variable, variableId),
          );
        if (handled) {
          handledAtSegment.set(segmentKey(segment, variableId), true);
        }
      }
    }

    const codePathListeners: Partial<{
      onCodePathEnd: (codePath: TSESLint.CodePath) => void;
      onCodePathSegmentEnd: (segment: TSESLint.CodePathSegment) => void;
      onCodePathSegmentLoop: (
        fromSegment: TSESLint.CodePathSegment,
        toSegment: TSESLint.CodePathSegment,
      ) => void;
      onCodePathSegmentStart: (segment: TSESLint.CodePathSegment) => void;
      onCodePathStart: (codePath: TSESLint.CodePath) => void;
      onUnreachableCodePathSegmentEnd: (
        segment: TSESLint.CodePathSegment,
      ) => void;
      onUnreachableCodePathSegmentStart: (
        segment: TSESLint.CodePathSegment,
      ) => void;
    }> = {
      onCodePathEnd(codePath) {
        const info = currentFuncInfo();
        for (const [variableId, tracked] of info.trackedVariables) {
          const allFinalSegmentsHandled = codePath.finalSegments.every(
            segment => isHandledAtSegment(segment, tracked, variableId),
          );
          if (!allFinalSegmentsHandled) {
            context.report({
              node: tracked.reportNode,
              messageId: 'misusedDisposable',
            });
          }
        }
        funcInfo = info.upper;
      },
      onCodePathSegmentEnd(segment) {
        currentFuncInfo().currentSegments.delete(segment);
      },
      onCodePathSegmentLoop(fromSegment, toSegment) {
        const info = currentFuncInfo();
        info.codePath.traverseSegments(
          { first: toSegment, last: fromSegment },
          segment => {
            updateHandledFromPrevSegments(segment, info.trackedVariables);
          },
        );
      },
      onCodePathSegmentStart(segment) {
        const info = currentFuncInfo();
        info.currentSegments.add(segment);
        updateHandledFromPrevSegments(segment, info.trackedVariables);
      },
      onCodePathStart(codePath) {
        funcInfo = {
          codePath,
          currentSegments: new Set(),
          trackedVariables: new Map(),
          upper: funcInfo,
        };
      },
      onUnreachableCodePathSegmentEnd(segment) {
        currentFuncInfo().currentSegments.delete(segment);
      },
      onUnreachableCodePathSegmentStart(segment) {
        currentFuncInfo().currentSegments.add(segment);
      },
    };

    return {
      ...(codePathListeners as TSESLint.RuleListener),

      'AssignmentExpression:exit': checkAssignmentExpression,
      CallExpression: checkProducedDisposable,
      'Identifier:exit': checkTrackedVariableReference,
      NewExpression: checkProducedDisposable,
    };
  },
});
