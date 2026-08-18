import type { TSESLint } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { AnalysisState } from './analysis-state';
import type { ControlFlowAnalysis } from './control-flow';
import type { ExpressionUtilities } from './expression-utils';
import type { FunctionLikeDeclarationWithBody, Observation } from './shared';

import { isBuiltinSymbolLike, isSymbolFromDefaultLibrary } from '../../util';
import { isRuntimeFunctionLike, isRuntimeFunctionLikeWithBody } from './shared';

interface BuiltinPromiseExecutor {
  executor: ts.ArrowFunction | ts.FunctionExpression;
  rejecterSymbol: ts.Symbol | undefined;
  resolverSymbol: ts.Symbol;
}

export interface ExpressionAnalysis {
  collectBuiltinPromiseSettlementCalls: (
    promiseExecutor: BuiltinPromiseExecutor,
  ) => void;
  collectReturns: (body: ts.Node) => Observation[];
  getBuiltinPromiseExecutor: (
    expression: ts.NewExpression,
  ) => BuiltinPromiseExecutor | undefined;
  getExpressionObservations: (expression: ts.Expression) => Observation[];
  observationNeedsProjection: (node: ts.Node) => boolean;
  projectAwaited: (observations: readonly Observation[]) => Observation[];
}

export function createExpressionAnalysis(
  state: AnalysisState,
  controlFlow: ControlFlowAnalysis,
  expressionUtilities: ExpressionUtilities,
): ExpressionAnalysis {
  const {
    analyzableUndefinedType,
    checker,
    isNeverLike,
    isTypeAssignableTo,
    isUncertain,
    program,
    resolveObservation,
  } = state;
  const {
    callCodePathSegments,
    callExecutionOrder,
    containsDirectEval,
    expressionNeverCompletes,
    getTSStaticTruthiness,
    getTSStaticValue,
    isAfterNeverCompletion,
    isOverriddenByFinally,
    isTSNodeInStaticallyUnreachableBranch,
    promiseSettlementCalls,
    reachableCalls,
    reachableReturns,
    unwrapRuntimeExpression,
  } = controlFlow;
  const { unwrapImmutableAlias, unwrapTransparentExpression } =
    expressionUtilities;
  const symbolsWrittenFromNestedExecutionContexts = new WeakMap<
    FunctionLikeDeclarationWithBody,
    Set<ts.Symbol>
  >();

  /**
   * Whether a binding can hold a different value than its flow type shows:
   * parameters, catch variables, and non-`const` bindings that outer code
   * or nested contexts can write.
   */
  function bindingCanChange(
    declaration: ts.Declaration,
    symbol: ts.Symbol,
  ): boolean {
    const binding = ts.findAncestor(
      declaration,
      (node): node is ts.ParameterDeclaration | ts.VariableDeclaration =>
        ts.isParameter(node) || ts.isVariableDeclaration(node),
    );
    if (binding == null) {
      return false;
    }
    if (ts.isParameter(binding) || ts.isCatchClause(binding.parent)) {
      return true;
    }
    if (tsutils.isNodeFlagSet(binding.parent, ts.NodeFlags.Const)) {
      return false;
    }
    const declaringFunction = ts.findAncestor(
      binding.parent,
      isRuntimeFunctionLikeWithBody,
    );
    return (
      declaringFunction == null ||
      containsDirectEval(declaringFunction) ||
      getSymbolsWrittenFromNestedExecutionContexts(declaringFunction).has(
        symbol,
      )
    );
  }

  /**
   * Declared type for bindings owned by an enclosing scope, whose value
   * other calls may change between reads.
   */
  function getDeclaredNonLocalBindingType(
    expression: ts.Expression,
  ): ts.Type | undefined {
    if (!ts.isIdentifier(expression)) {
      return undefined;
    }
    const containingFunction = ts.findAncestor(
      expression.parent,
      isRuntimeFunctionLikeWithBody,
    );
    let symbol = checker.getSymbolAtLocation(expression);
    if (containingFunction == null || symbol == null) {
      return undefined;
    }
    if (tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)) {
      symbol = checker.getAliasedSymbol(symbol);
    }
    const declaration = symbol.valueDeclaration;
    if (
      declaration == null ||
      ts.findAncestor(
        declaration,
        ancestor => ancestor === containingFunction,
      ) != null ||
      !bindingCanChange(declaration, symbol)
    ) {
      return undefined;
    }
    return checker.getTypeOfSymbolAtLocation(symbol, declaration);
  }

  /**
   * Every symbol along a property/element access chain, receiver included.
   */
  function getAccessPathSymbols(expression: ts.Expression): ts.Symbol[] {
    const symbols: ts.Symbol[] = [];
    for (;;) {
      expression = unwrapRuntimeExpression(expression);
      if (ts.isPropertyAccessExpression(expression)) {
        const symbol = checker.getSymbolAtLocation(expression.name);
        if (symbol != null) {
          symbols.push(symbol);
        }
        expression = expression.expression;
        continue;
      }
      if (ts.isElementAccessExpression(expression)) {
        const symbol = checker.getSymbolAtLocation(
          expression.argumentExpression,
        );
        if (symbol != null) {
          symbols.push(symbol);
        }
        expression = expression.expression;
        continue;
      }
      const symbol = checker.getSymbolAtLocation(expression);
      if (symbol != null) {
        symbols.push(symbol);
      }
      return symbols;
    }
  }

  /**
   * The declared type of an access path, without flow narrowing, resolved member by
   * member from the declared receiver type.
   */
  function getDeclaredAccessType(
    expression: ts.Expression,
  ): ts.Type | undefined {
    expression = unwrapRuntimeExpression(expression);
    if (ts.isIdentifier(expression) || tsutils.isThisExpression(expression)) {
      const symbol = checker.getSymbolAtLocation(expression);
      return symbol == null
        ? undefined
        : checker.getTypeOfSymbolAtLocation(
            symbol,
            symbol.valueDeclaration ?? expression,
          );
    }

    if (ts.isPropertyAccessExpression(expression)) {
      const receiver = getDeclaredAccessType(expression.expression);
      const property =
        (receiver == null
          ? undefined
          : checker.getPropertyOfType(
              checker.getApparentType(receiver),
              expression.name.text,
            )) ?? checker.getSymbolAtLocation(expression.name);
      return property == null
        ? undefined
        : checker.getTypeOfSymbolAtLocation(property, expression);
    }

    if (ts.isElementAccessExpression(expression)) {
      const receiver = getDeclaredAccessType(expression.expression);
      if (receiver == null) {
        return undefined;
      }

      const keyType = checker.getTypeAtLocation(expression.argumentExpression);
      const property = getExactElementAccessProperty(receiver, keyType);
      if (property != null) {
        return checker.getTypeOfSymbolAtLocation(property, expression);
      }

      const indexKind = tsutils.isTypeFlagSet(keyType, ts.TypeFlags.NumberLike)
        ? ts.IndexKind.Number
        : tsutils.isTypeFlagSet(keyType, ts.TypeFlags.StringLike)
          ? ts.IndexKind.String
          : undefined;
      return indexKind == null
        ? undefined
        : checker.getIndexTypeOfType(receiver, indexKind);
    }

    return undefined;
  }

  /**
   * The concrete property a literal-keyed element access resolves to.
   */
  function getExactElementAccessProperty(
    receiver: ts.Type,
    keyType: ts.Type,
  ): ts.Symbol | undefined {
    const exactName = tsutils.isStringLiteralType(keyType)
      ? keyType.value
      : tsutils.isNumberLiteralType(keyType)
        ? String(keyType.value)
        : undefined;
    return exactName == null
      ? undefined
      : checker.getPropertyOfType(checker.getApparentType(receiver), exactName);
  }

  /**
   * An element access with no exact property, served by an index
   * signature — the position that can produce `undefined` at runtime.
   */
  function isUncheckedElementAccess(expression: ts.Expression): boolean {
    if (!ts.isElementAccessExpression(expression)) {
      return false;
    }
    const receiver = getDeclaredAccessType(expression.expression);
    return (
      receiver != null &&
      getExactElementAccessProperty(
        receiver,
        checker.getTypeAtLocation(expression.argumentExpression),
      ) == null &&
      getDeclaredAccessType(expression) != null
    );
  }

  /**
   * Symbols assigned inside nested functions of this function; their flow
   * narrowing cannot be trusted at the outer level.
   */
  function getSymbolsWrittenFromNestedExecutionContexts(
    functionNode: FunctionLikeDeclarationWithBody,
  ): Set<ts.Symbol> {
    const cached = symbolsWrittenFromNestedExecutionContexts.get(functionNode);
    if (cached != null) {
      return cached;
    }

    const symbols = new Set<ts.Symbol>();
    symbolsWrittenFromNestedExecutionContexts.set(functionNode, symbols);
    function visit(node: ts.Node, insideNestedContext: boolean): void {
      const nested =
        insideNestedContext ||
        (node !== functionNode &&
          (isRuntimeFunctionLike(node) ||
            ts.isClassDeclaration(node) ||
            ts.isClassExpression(node)));
      if (nested && ts.isExpression(node)) {
        const access = tsutils.getAccessKind(node);
        if (
          (access & (tsutils.AccessKind.Write | tsutils.AccessKind.Delete)) !==
          0
        ) {
          if (
            ts.isIdentifier(node) &&
            ts.isShorthandPropertyAssignment(node.parent) &&
            node.parent.name === node
          ) {
            const symbol = checker.getShorthandAssignmentValueSymbol(
              node.parent,
            );
            if (symbol != null) {
              symbols.add(symbol);
            }
          } else {
            for (const symbol of getAccessPathSymbols(node)) {
              symbols.add(symbol);
            }
          }
        }
      }
      ts.forEachChild(node, child => visit(child, nested));
    }
    visit(functionNode.body, false);
    return symbols;
  }

  /**
   * Declared type for reads whose access path contains a symbol written
   * from a nested execution context.
   */
  function getDeclaredCapturedType(
    expression: ts.Expression,
  ): ts.Type | undefined {
    const containingFunction = ts.findAncestor(
      expression.parent,
      isRuntimeFunctionLikeWithBody,
    );
    if (
      containingFunction == null ||
      !getAccessPathSymbols(expression).some(symbol =>
        getSymbolsWrittenFromNestedExecutionContexts(containingFunction).has(
          symbol,
        ),
      )
    ) {
      return undefined;
    }
    return getDeclaredAccessType(expression);
  }

  /**
   * An expression's observable type: declared types where narrowing is
   * unstable, otherwise the flow type, preserving type parameters that
   * contextual typing resolved to their whole constraint.
   */
  function getExpressionType(expression: ts.Expression): ts.Type {
    expression = unwrapTransparentExpression(expression);
    const capturedDeclaredType = getDeclaredCapturedType(expression);
    if (capturedDeclaredType != null) {
      return capturedDeclaredType;
    }
    const nonLocalDeclaredType = getDeclaredNonLocalBindingType(expression);
    if (nonLocalDeclaredType != null) {
      return nonLocalDeclaredType;
    }
    if (
      ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
    ) {
      const declaredAccessType = getDeclaredAccessType(expression);
      if (declaredAccessType != null) {
        return declaredAccessType;
      }
    }
    const type = checker.getTypeAtLocation(expression);
    if (!ts.isIdentifier(expression) || tsutils.isTypeParameter(type)) {
      return type;
    }

    // Contextual return typing can resolve an identifier whose declared type
    // is a type parameter to its constraint. Preserve that type parameter
    // only when the observed type is the entire constraint; a proper subset
    // is flow narrowing and must remain visible to the rule.
    const symbol = checker.getSymbolAtLocation(expression);
    const declaredType =
      symbol &&
      checker.getTypeOfSymbolAtLocation(
        symbol,
        symbol.valueDeclaration ?? expression,
      );
    if (declaredType && tsutils.isTypeParameter(declaredType)) {
      const constraint = checker.getBaseConstraintOfType(declaredType);
      if (
        (constraint == null && isUncertain(type)) ||
        (constraint != null &&
          isTypeAssignableTo(type, constraint) &&
          isTypeAssignableTo(constraint, type))
      ) {
        return declaredType;
      }
    }
    return type;
  }

  /**
   * The set of (node, type) values an expression can produce, splitting
   * conditionals, `??`, and comma chains and re-adding `undefined` where
   * the location type or unchecked index access implies it.
   */
  function getExpressionObservations(expression: ts.Expression): Observation[] {
    const runtimeExpression = unwrapImmutableAlias(expression, true);
    if (
      ts.isAsExpression(runtimeExpression) ||
      ts.isTypeAssertionExpression(runtimeExpression) ||
      ts.isNonNullExpression(runtimeExpression)
    ) {
      const operand = runtimeExpression.expression;
      const operandType = getExpressionType(operand);
      const assertedType = checker.getTypeAtLocation(runtimeExpression);
      if (
        isUncertain(operandType) ||
        (isTypeAssignableTo(assertedType, operandType) &&
          !isTypeAssignableTo(operandType, assertedType))
      ) {
        // Narrowing assertions are erased at runtime, so the operand retains
        // every value the function can actually return. Widening assertions
        // and incomparable casts are explicit escape hatches: the developer
        // pinned a contract the operand's type cannot express, and the
        // asserted type is what callers observe.
        return getExpressionObservations(operand);
      }
    }
    if (expressionNeverCompletes(runtimeExpression)) {
      return [];
    }
    if (ts.isConditionalExpression(runtimeExpression)) {
      const truthiness = getTSStaticTruthiness(runtimeExpression.condition);
      if (truthiness != null) {
        return getExpressionObservations(
          truthiness ? runtimeExpression.whenTrue : runtimeExpression.whenFalse,
        );
      }
      return [
        ...getExpressionObservations(runtimeExpression.whenTrue),
        ...getExpressionObservations(runtimeExpression.whenFalse),
      ];
    }
    if (ts.isBinaryExpression(runtimeExpression)) {
      if (runtimeExpression.operatorToken.kind === ts.SyntaxKind.CommaToken) {
        return getExpressionObservations(runtimeExpression.right);
      }
      if (
        runtimeExpression.operatorToken.kind ===
        ts.SyntaxKind.QuestionQuestionToken
      ) {
        const leftValue = getTSStaticValue(runtimeExpression.left);
        if (leftValue != null) {
          return getExpressionObservations(
            leftValue.value == null
              ? runtimeExpression.right
              : runtimeExpression.left,
          );
        }
        const nonNullishLeft = getExpressionObservations(
          runtimeExpression.left,
        ).flatMap(observation => {
          const resolved = resolveObservation(observation);
          const type = checker.getNonNullableType(resolved.type);
          return isNeverLike(type) ? [] : [{ ...observation, type }];
        });
        return [
          ...nonNullishLeft,
          ...getExpressionObservations(runtimeExpression.right),
        ];
      }
    }
    if (ts.isObjectLiteralExpression(runtimeExpression)) {
      return [{ node: runtimeExpression }];
    }

    const type = getExpressionType(runtimeExpression);
    const observations: Observation[] = [{ node: runtimeExpression, type }];
    if (
      analyzableUndefinedType != null &&
      !isTypeAssignableTo(analyzableUndefinedType, type)
    ) {
      const locationType = checker.getTypeAtLocation(runtimeExpression);
      if (
        isTypeAssignableTo(analyzableUndefinedType, locationType) ||
        isUncheckedElementAccess(runtimeExpression)
      ) {
        observations.push({
          node: runtimeExpression,
          type: analyzableUndefinedType,
        });
      }
    }
    return observations;
  }

  /**
   * Syntax whose literal shape can reveal a narrower value than its
   * contextually widened type.
   */
  function observationNeedsProjection(node: ts.Node): boolean {
    return (
      ts.isArrayLiteralExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isCallExpression(node) ||
      ts.isFunctionExpression(node) ||
      ts.isNewExpression(node) ||
      ts.isObjectLiteralExpression(node)
    );
  }

  /**
   * Observations for every reachable `return`, excluding nested functions
   * and returns overridden by a non-completing `finally`.
   */
  function collectReturns(body: ts.Node): Observation[] {
    const observations: Observation[] = [];

    function visit(node: ts.Node): void {
      if (isRuntimeFunctionLike(node)) {
        return;
      }
      if (ts.isReturnStatement(node)) {
        if (
          !reachableReturns.has(node) ||
          isTSNodeInStaticallyUnreachableBranch(node) ||
          isOverriddenByFinally(node, body.parent) ||
          isAfterNeverCompletion(node, body.parent)
        ) {
          return;
        }
        observations.push(
          ...(node.expression
            ? getExpressionObservations(node.expression)
            : [{ node, type: checker.getUndefinedType() }]),
        );
        return;
      }
      ts.forEachChild(node, visit);
    }

    visit(body);
    return observations;
  }

  /**
   * The executor of a built-in `new Promise(...)` call together with its
   * resolver/rejecter parameter symbols.
   */
  function getBuiltinPromiseExecutor(
    expression: ts.NewExpression,
  ): BuiltinPromiseExecutor | undefined {
    if (
      (expression.typeArguments?.length ?? 0) > 0 ||
      !isBuiltinSymbolLike(
        program,
        checker.getTypeAtLocation(expression.expression),
        'PromiseConstructor',
      )
    ) {
      return undefined;
    }

    const executorArgument = expression.arguments?.at(0);
    if (executorArgument == null) {
      return undefined;
    }
    const executor = unwrapRuntimeExpression(executorArgument);
    if (
      (!ts.isArrowFunction(executor) && !ts.isFunctionExpression(executor)) ||
      executor.parameters.length === 0 ||
      !ts.isIdentifier(executor.parameters[0].name)
    ) {
      return undefined;
    }

    const resolverSymbol = checker.getSymbolAtLocation(
      executor.parameters[0].name,
    );
    if (resolverSymbol == null) {
      return undefined;
    }
    const rejecterName = executor.parameters.at(1)?.name;
    const rejecterSymbol =
      rejecterName != null && ts.isIdentifier(rejecterName)
        ? checker.getSymbolAtLocation(rejecterName)
        : undefined;
    return { executor, rejecterSymbol, resolverSymbol };
  }

  /**
   * Registers every direct resolver/rejecter call inside an executor for
   * reachability tracking.
   */
  function collectBuiltinPromiseSettlementCalls(
    promiseExecutor: BuiltinPromiseExecutor,
  ): void {
    const { executor, rejecterSymbol, resolverSymbol } = promiseExecutor;
    function visit(node: ts.Node): void {
      if (ts.isCallExpression(node)) {
        const callee = unwrapRuntimeExpression(node.expression);
        if (ts.isIdentifier(callee)) {
          const symbol = checker.getSymbolAtLocation(callee);
          if (
            symbol === resolverSymbol ||
            (rejecterSymbol != null && symbol === rejecterSymbol)
          ) {
            promiseSettlementCalls.add(node);
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(executor.body);
  }

  /**
   * The value a directly-analyzable executor settles with: its first
   * reachable settlement per execution path, or nothing when the resolver
   * escapes.
   */
  function projectBuiltinPromiseResolution(
    observation: Observation,
  ): Observation[] | undefined {
    if (!ts.isNewExpression(observation.node)) {
      return undefined;
    }
    const promiseExecutor = getBuiltinPromiseExecutor(observation.node);
    if (promiseExecutor == null) {
      return undefined;
    }
    const { executor, rejecterSymbol, resolverSymbol } = promiseExecutor;
    const executorBody = executor.body;

    function getFirstSettlementCalls(
      calls: readonly ts.CallExpression[],
    ): readonly ts.CallExpression[] | undefined {
      const callsBySegment = new Map<
        TSESLint.CodePathSegment,
        ts.CallExpression[]
      >();
      const callSegments: TSESLint.CodePathSegment[] = [];
      for (const call of calls) {
        const segments = callCodePathSegments.get(call);
        if (
          segments == null ||
          segments.length === 0 ||
          !callExecutionOrder.has(call)
        ) {
          return undefined;
        }
        for (const segment of segments) {
          callSegments.push(segment);
          const segmentCalls = callsBySegment.get(segment);
          if (segmentCalls == null) {
            callsBySegment.set(segment, [call]);
          } else {
            segmentCalls.push(call);
          }
        }
      }
      for (const segmentCalls of callsBySegment.values()) {
        segmentCalls.sort(
          (a, b) =>
            (callExecutionOrder.get(a) ?? 0) - (callExecutionOrder.get(b) ?? 0),
        );
      }

      const initialSegments = new Set<TSESLint.CodePathSegment>();
      const preceding = [...callSegments];
      const visitedPreceding = new Set<TSESLint.CodePathSegment>();
      for (
        let segment = preceding.pop();
        segment != null;
        segment = preceding.pop()
      ) {
        if (visitedPreceding.has(segment)) {
          continue;
        }
        visitedPreceding.add(segment);
        if (segment.prevSegments.length === 0) {
          initialSegments.add(segment);
        } else {
          preceding.push(...segment.prevSegments);
        }
      }
      if (initialSegments.size !== 1) {
        return undefined;
      }

      const firstCalls = new Set<ts.CallExpression>();
      const pending = [...initialSegments];
      const seen = new Set<TSESLint.CodePathSegment>();
      for (
        let segment = pending.pop();
        segment != null;
        segment = pending.pop()
      ) {
        if (seen.has(segment) || !segment.reachable) {
          continue;
        }
        seen.add(segment);
        const first = callsBySegment.get(segment)?.at(0);
        if (first != null) {
          firstCalls.add(first);
          continue;
        }
        pending.push(...segment.nextSegments);
      }
      return [...firstCalls];
    }

    const localFunctionSymbols = new WeakMap<
      ts.FunctionLikeDeclaration,
      ts.Symbol
    >();
    const localFunctionBindings = new Map<ts.Symbol, Set<ts.Identifier>>();
    const localFunctionBindingNames = new WeakSet<ts.Identifier>();
    function collectLocalFunctionBindings(node: ts.Node): void {
      if (node !== executor && isRuntimeFunctionLike(node)) {
        let binding: ts.BindingName | undefined;
        if (ts.isFunctionDeclaration(node)) {
          binding = node.name;
        } else if (
          (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
          ts.isVariableDeclaration(node.parent) &&
          node.parent.initializer === node
        ) {
          binding = node.parent.name;
        }
        if (binding != null && ts.isIdentifier(binding)) {
          const symbol = checker.getSymbolAtLocation(binding);
          if (symbol != null) {
            localFunctionSymbols.set(node, symbol);
            localFunctionBindingNames.add(binding);
            const bindings = localFunctionBindings.get(symbol);
            if (bindings == null) {
              localFunctionBindings.set(symbol, new Set([binding]));
            } else {
              bindings.add(binding);
            }
          }
        }
      }
      ts.forEachChild(node, collectLocalFunctionBindings);
    }
    collectLocalFunctionBindings(executorBody);

    function isInDeferredInstanceFieldInitializer(node: ts.Node): boolean {
      let child = node;
      return (
        ts.findAncestor(node, ancestor => {
          if (ancestor === executor) {
            return 'quit';
          }
          const isInitializer =
            ts.isPropertyDeclaration(ancestor) &&
            ancestor.initializer === child;
          child = ancestor;
          return (
            isInitializer &&
            !tsutils.includesModifier(
              ancestor.modifiers,
              ts.SyntaxKind.StaticKeyword,
            )
          );
        }) != null
      );
    }

    const referencedByLocalFunction = new Map<ts.Symbol, Set<ts.Symbol>>();
    const rootLocalFunctionSymbols = new Set<ts.Symbol>();
    const opaqueRootLocalFunctionSymbols = new Set<ts.Symbol>();
    function recordLocalFunctionReference(
      referencedSymbol: ts.Symbol,
      location: ts.Identifier,
    ): void {
      if (isInDeferredInstanceFieldInitializer(location)) {
        opaqueRootLocalFunctionSymbols.add(referencedSymbol);
        return;
      }
      const containingFunction = ts.findAncestor(
        location.parent,
        isRuntimeFunctionLike,
      );
      const containingSymbol =
        containingFunction == null
          ? undefined
          : localFunctionSymbols.get(containingFunction);
      if (containingFunction === executor) {
        rootLocalFunctionSymbols.add(referencedSymbol);
        return;
      }
      if (containingSymbol == null) {
        opaqueRootLocalFunctionSymbols.add(referencedSymbol);
        return;
      }
      const referenced = referencedByLocalFunction.get(containingSymbol);
      if (referenced == null) {
        referencedByLocalFunction.set(
          containingSymbol,
          new Set([referencedSymbol]),
        );
      } else {
        referenced.add(referencedSymbol);
      }
    }

    function collectLocalFunctionReferences(node: ts.Node): void {
      if (ts.isTypeNode(node)) {
        return;
      }
      if (ts.isIdentifier(node) && !localFunctionBindingNames.has(node)) {
        const symbol = checker.getSymbolAtLocation(node);
        if (symbol != null && localFunctionBindings.has(symbol)) {
          recordLocalFunctionReference(symbol, node);
        }
      }
      ts.forEachChild(node, collectLocalFunctionReferences);
    }
    collectLocalFunctionReferences(executorBody);

    function collectReachableLocalFunctionSymbols(
      roots: ReadonlySet<ts.Symbol>,
    ): Set<ts.Symbol> {
      const reachable = new Set<ts.Symbol>();
      const pending = [...roots];
      for (let symbol = pending.pop(); symbol != null; symbol = pending.pop()) {
        if (reachable.has(symbol)) {
          continue;
        }
        reachable.add(symbol);
        for (const referenced of referencedByLocalFunction.get(symbol) ?? []) {
          if (!reachable.has(referenced)) {
            pending.push(referenced);
          }
        }
      }
      return reachable;
    }
    const reachableLocalFunctionSymbols = collectReachableLocalFunctionSymbols(
      rootLocalFunctionSymbols,
    );
    const opaqueReachableLocalFunctionSymbols =
      collectReachableLocalFunctionSymbols(opaqueRootLocalFunctionSymbols);

    function isUnreachableLocalFunction(
      node: ts.FunctionLikeDeclaration,
    ): boolean {
      const symbol = localFunctionSymbols.get(node);
      return (
        symbol != null &&
        !reachableLocalFunctionSymbols.has(symbol) &&
        !opaqueReachableLocalFunctionSymbols.has(symbol)
      );
    }

    const resolved: Observation[] = [];
    const resolutionsByCall = new Map<ts.CallExpression, Observation[]>();
    const directSettlementCalls: ts.CallExpression[] = [];
    function visit(node: ts.Node): true | undefined {
      if (
        node !== executor &&
        isRuntimeFunctionLike(node) &&
        isUnreachableLocalFunction(node)
      ) {
        return;
      }
      const settlementSymbol = ts.isIdentifier(node)
        ? checker.getSymbolAtLocation(node)
        : undefined;
      if (
        settlementSymbol === resolverSymbol ||
        (rejecterSymbol != null && settlementSymbol === rejecterSymbol)
      ) {
        if (isInDeferredInstanceFieldInitializer(node)) {
          return true;
        }
        const containingFunction = ts.findAncestor(
          node.parent,
          isRuntimeFunctionLike,
        );
        if (containingFunction !== executor) {
          const containingSymbol =
            containingFunction == null
              ? undefined
              : localFunctionSymbols.get(containingFunction);
          if (
            containingSymbol == null ||
            (!reachableLocalFunctionSymbols.has(containingSymbol) &&
              opaqueReachableLocalFunctionSymbols.has(containingSymbol))
          ) {
            return true;
          }
        }
        const parent = node.parent;
        if (ts.isCallExpression(parent) && parent.expression === node) {
          if (
            !reachableCalls.has(parent) ||
            isTSNodeInStaticallyUnreachableBranch(parent)
          ) {
            return;
          }
          const isResolution = settlementSymbol === resolverSymbol;
          const value = parent.arguments.at(0);
          const resolution = isResolution
            ? value == null
              ? [{ node: parent, type: checker.getUndefinedType() }]
              : projectAwaited(getExpressionObservations(value))
            : [];
          if (isResolution) {
            resolved.push(...resolution);
          }
          resolutionsByCall.set(parent, resolution);
          if (
            ts.findAncestor(parent.parent, isRuntimeFunctionLike) === executor
          ) {
            directSettlementCalls.push(parent);
          }
          return;
        }
        return true;
      }
      return ts.forEachChild(node, visit);
    }
    if (visit(executorBody) === true) {
      return undefined;
    }
    if (
      directSettlementCalls.length > 0 &&
      directSettlementCalls.length === resolutionsByCall.size
    ) {
      const firstCalls = getFirstSettlementCalls(directSettlementCalls);
      if (firstCalls != null) {
        return firstCalls.flatMap(call => resolutionsByCall.get(call) ?? []);
      }
    }
    return resolved;
  }

  /**
   * Awaited values of promise observations, using executor settlement and
   * `Promise.resolve` syntax before falling back to `getAwaitedType`.
   */
  function projectAwaited(observations: readonly Observation[]): Observation[] {
    return observations.flatMap(observation => {
      const constructed = projectBuiltinPromiseResolution(observation);
      if (constructed != null) {
        return constructed;
      }
      if (
        ts.isCallExpression(observation.node) &&
        observation.node.typeArguments == null &&
        ts.isPropertyAccessExpression(observation.node.expression) &&
        observation.node.expression.name.text === 'resolve'
      ) {
        const method = checker.getSymbolAtLocation(
          observation.node.expression.name,
        );
        if (
          method != null &&
          isSymbolFromDefaultLibrary(program, method) &&
          isBuiltinSymbolLike(
            program,
            checker.getTypeAtLocation(observation.node.expression.expression),
            'PromiseConstructor',
          )
        ) {
          const value = observation.node.arguments.at(0);
          return value == null
            ? [
                {
                  node: observation.node,
                  type: checker.getUndefinedType(),
                },
              ]
            : projectAwaited(getExpressionObservations(value));
        }
      }

      const resolved = resolveObservation(observation);
      const awaited = checker.getAwaitedType(resolved.type);
      return [
        {
          node: observation.node,
          type: awaited ?? resolved.type,
        },
      ];
    });
  }

  return {
    collectBuiltinPromiseSettlementCalls,
    collectReturns,
    getBuiltinPromiseExecutor,
    getExpressionObservations,
    observationNeedsProjection,
    projectAwaited,
  };
}
