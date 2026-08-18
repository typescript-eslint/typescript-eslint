import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { ExpressionUtilities } from './expression-utils';
import type {
  FunctionLikeDeclarationWithBody,
  RuleDependencies,
} from './shared';

import { getStaticValue, isPossiblyFalsy, isPossiblyTruthy } from '../../util';
import {
  isRuntimeFunctionLike,
  isUncertain,
  STATIC_SWITCH_NO_ENTRY,
  STATIC_SWITCH_UNKNOWN,
} from './shared';

export interface ControlFlowAnalysis {
  blockCanCompleteNormally: WeakMap<ts.Block, boolean>;
  blockCannotCompleteNormally: (block: ts.Block) => boolean;
  callCodePathSegments: WeakMap<
    ts.CallExpression,
    readonly TSESLint.CodePathSegment[]
  >;
  callExecutionOrder: WeakMap<ts.CallExpression, number>;
  containsDirectEval: (
    functionNode: FunctionLikeDeclarationWithBody,
  ) => boolean;
  expressionNeverCompletes: (expression: ts.Expression) => boolean;
  getTSStaticTruthiness: (expression: ts.Expression) => boolean | undefined;
  getTSStaticValue: (
    expression: ts.Expression,
  ) => { value: unknown } | undefined;
  isAfterNeverCompletion: (
    completion: ts.Node,
    functionNode: ts.Node,
  ) => boolean;
  isOverriddenByFinally: (
    completion: ts.Node,
    functionNode: ts.Node,
  ) => boolean;
  isTSNodeInStaticallyUnreachableBranch: (node: ts.Node) => boolean;
  onCodePathEnd: () => void;
  onCodePathSegmentEnd: (segment: TSESLint.CodePathSegment) => void;
  onCodePathSegmentStart: (segment: TSESLint.CodePathSegment) => void;
  onCodePathStart: () => void;
  promiseSettlementCalls: WeakSet<ts.CallExpression>;
  reachableCalls: WeakSet<ts.CallExpression>;
  reachableReturns: WeakSet<ts.ReturnStatement>;
  reachableYields: WeakSet<ts.YieldExpression>;
  recordBlockExit: (block: ts.Block) => void;
  recordCallExit: (call: ts.CallExpression) => void;
  recordReturn: (statement: ts.ReturnStatement) => void;
  recordYield: (expression: ts.YieldExpression) => void;
  unwrapRuntimeExpression: (expression: ts.Expression) => ts.Expression;
}

export function createControlFlowAnalysis(
  { checker, context, services }: RuleDependencies,
  expressionUtilities: ExpressionUtilities,
): ControlFlowAnalysis {
  const { unwrapImmutableAlias, unwrapTransparentExpression } =
    expressionUtilities;
  const codePathSegmentStack: Set<TSESLint.CodePathSegment>[] = [];
  let currentCodePathSegments = new Set<TSESLint.CodePathSegment>();
  const reachableReturns = new WeakSet<ts.ReturnStatement>();
  const reachableYields = new WeakSet<ts.YieldExpression>();
  const reachableCalls = new WeakSet<ts.CallExpression>();
  const promiseSettlementCalls = new WeakSet<ts.CallExpression>();
  const callCodePathSegments = new WeakMap<
    ts.CallExpression,
    readonly TSESLint.CodePathSegment[]
  >();
  const callExecutionOrder = new WeakMap<ts.CallExpression, number>();
  let nextCallExecutionOrder = 0;
  const blockCanCompleteNormally = new WeakMap<ts.Block, boolean>();
  const blockCannotCompleteNormallyCache = new WeakMap<ts.Block, boolean>();
  const statementCannotCompleteNormallyCache = new WeakMap<
    ts.Statement,
    boolean
  >();
  const staticSwitchEntries = new WeakMap<TSESTree.SwitchStatement, number>();
  const staticallyUnreachableSwitchCases = new WeakMap<
    TSESTree.SwitchStatement,
    ReadonlySet<TSESTree.SwitchCase>
  >();
  const statementsAfterNeverCompletion = new WeakMap<
    ts.Block | ts.CaseClause | ts.DefaultClause,
    WeakSet<ts.Statement>
  >();
  const staticTruthiness = new WeakMap<TSESTree.Expression, boolean | null>();
  const directEvalByFunction = new WeakMap<
    ts.FunctionLikeDeclaration,
    boolean
  >();

  function isCurrentCodePathReachable(): boolean {
    for (const segment of currentCodePathSegments) {
      if (segment.reachable) {
        return true;
      }
    }
    return false;
  }

  // A type whose every constituent is truthy (or falsy) decides a branch
  // just as reliably as a static value: the checker's flow type at the test
  // site is exactly what TypeScript itself narrows with.
  function getTypeLevelTruthiness(
    expression: ts.Expression,
  ): boolean | undefined {
    const type = checker.getTypeAtLocation(expression);
    if (isUncertain(type)) {
      return undefined;
    }
    if (!isPossiblyFalsy(type)) {
      return true;
    }
    if (!isPossiblyTruthy(type)) {
      return false;
    }
    return undefined;
  }

  /**
   * Static-value truthiness first, then type-level truthiness; both
   * outcomes (including "unknown") are cached per node.
   */
  function getStaticTruthiness(node: TSESTree.Expression): boolean | undefined {
    if (staticTruthiness.has(node)) {
      return staticTruthiness.get(node) ?? undefined;
    }
    const result = getESTreeStaticValue(node);
    let value = result == null ? undefined : Boolean(result.value);
    if (value == null) {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      if (ts.isExpression(tsNode)) {
        value = getTypeLevelTruthiness(tsNode);
      }
    }
    staticTruthiness.set(node, value ?? null);
    return value;
  }

  function isStaticSwitchValue(
    value: unknown,
  ): value is bigint | boolean | number | string | null | undefined {
    return (
      value == null ||
      typeof value === 'bigint' ||
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string'
    );
  }

  /**
   * The case index a statically-known discriminant enters, or the
   * NO_ENTRY / UNKNOWN sentinels.
   */
  function getStaticSwitchEntry(node: TSESTree.SwitchStatement): number {
    const cached = staticSwitchEntries.get(node);
    if (cached != null) {
      return cached;
    }

    const discriminant = getESTreeStaticValue(node.discriminant);
    if (discriminant == null || !isStaticSwitchValue(discriminant.value)) {
      staticSwitchEntries.set(node, STATIC_SWITCH_UNKNOWN);
      return STATIC_SWITCH_UNKNOWN;
    }

    let defaultIndex = STATIC_SWITCH_NO_ENTRY;
    for (const [index, switchCase] of node.cases.entries()) {
      if (switchCase.test == null) {
        defaultIndex = index;
        continue;
      }
      const caseValue = getESTreeStaticValue(switchCase.test);
      if (caseValue == null || !isStaticSwitchValue(caseValue.value)) {
        staticSwitchEntries.set(node, STATIC_SWITCH_UNKNOWN);
        return STATIC_SWITCH_UNKNOWN;
      }
      if (caseValue.value === discriminant.value) {
        staticSwitchEntries.set(node, index);
        return index;
      }
    }
    staticSwitchEntries.set(node, defaultIndex);
    return defaultIndex;
  }

  /**
   * Cases before the static entry, or sealed off by an earlier case that
   * cannot fall through.
   */
  function switchCaseIsStaticallyUnreachable(
    switchCase: TSESTree.SwitchCase,
    switchStatement: TSESTree.SwitchStatement,
  ): boolean {
    const cached = staticallyUnreachableSwitchCases.get(switchStatement);
    if (cached != null) {
      return cached.has(switchCase);
    }

    const unreachable = new Set<TSESTree.SwitchCase>();
    staticallyUnreachableSwitchCases.set(switchStatement, unreachable);
    const entryIndex = getStaticSwitchEntry(switchStatement);
    if (entryIndex === STATIC_SWITCH_UNKNOWN) {
      return false;
    }
    if (entryIndex === STATIC_SWITCH_NO_ENTRY) {
      for (const currentCase of switchStatement.cases) {
        unreachable.add(currentCase);
      }
      return unreachable.has(switchCase);
    }

    let fallthroughCanReach = true;
    for (const [index, currentCase] of switchStatement.cases.entries()) {
      if (index < entryIndex || !fallthroughCanReach) {
        unreachable.add(currentCase);
        continue;
      }
      fallthroughCanReach = !currentCase.consequent.some(statement => {
        const tsStatement = services.esTreeNodeToTSNodeMap.get(statement);
        return (
          ts.isStatement(tsStatement) &&
          statementCannotCompleteNormally(tsStatement)
        );
      });
    }
    return unreachable.has(switchCase);
  }

  /**
   * Walks ancestors pruning branches whose test truthiness or switch
   * entry is statically decided.
   */
  function isInStaticallyUnreachableBranch(node: TSESTree.Node): boolean {
    let current = node;
    while (current.parent != null) {
      const parent = current.parent;
      switch (parent.type) {
        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.FunctionDeclaration:
        case AST_NODE_TYPES.FunctionExpression:
          return false;

        case AST_NODE_TYPES.ConditionalExpression:
        case AST_NODE_TYPES.IfStatement: {
          const truthiness = getStaticTruthiness(parent.test);
          if (
            (truthiness === false && current === parent.consequent) ||
            (truthiness === true && current === parent.alternate)
          ) {
            return true;
          }
          break;
        }

        case AST_NODE_TYPES.ForStatement:
          if (
            current === parent.body &&
            parent.test != null &&
            getStaticTruthiness(parent.test) === false
          ) {
            return true;
          }
          break;

        case AST_NODE_TYPES.LogicalExpression:
          if (current === parent.right) {
            const left = getESTreeStaticValue(parent.left);
            if (
              left != null &&
              ((parent.operator === '&&' && !left.value) ||
                (parent.operator === '||' && Boolean(left.value)) ||
                (parent.operator === '??' && left.value != null))
            ) {
              return true;
            }
          }
          break;

        case AST_NODE_TYPES.SwitchCase:
          if (switchCaseIsStaticallyUnreachable(parent, parent.parent)) {
            return true;
          }
          break;

        case AST_NODE_TYPES.WhileStatement:
          if (
            current === parent.body &&
            getStaticTruthiness(parent.test) === false
          ) {
            return true;
          }
          break;
      }
      current = parent;
    }
    return false;
  }

  /**
   * TS-node adapter for the ESTree unreachable-branch walk.
   */
  function isTSNodeInStaticallyUnreachableBranch(node: ts.Node): boolean {
    if (!services.tsNodeToESTreeNodeMap.has(node)) {
      return false;
    }
    return isInStaticallyUnreachableBranch(
      services.tsNodeToESTreeNodeMap.get(node),
    );
  }

  /**
   * A `finally` block that cannot complete normally replaces completions
   * from the guarded region.
   */
  function isOverriddenByFinally(
    completion: ts.Node,
    functionNode: ts.Node,
  ): boolean {
    return (
      ts.findAncestor(completion, current => {
        if (current === functionNode || ts.isSourceFile(current)) {
          return 'quit';
        }
        const parent = current.parent;
        return (
          ts.isTryStatement(parent) &&
          parent.finallyBlock != null &&
          current !== parent.finallyBlock &&
          blockCannotCompleteNormally(parent.finallyBlock)
        );
      }) != null
    );
  }

  /**
   * Combines the CodePath observation of the block's end with statement
   * completion analysis, cached.
   */
  function blockCannotCompleteNormally(block: ts.Block): boolean {
    const cached = blockCannotCompleteNormallyCache.get(block);
    if (cached != null) {
      return cached;
    }
    const result =
      blockCanCompleteNormally.get(block) === false ||
      block.statements.some(statementCannotCompleteNormally);
    blockCannotCompleteNormallyCache.set(block, result);
    return result;
  }

  /**
   * Whether left-to-right evaluation reaches a `never`-typed call before
   * the expression can produce a value.
   */
  function expressionNeverCompletes(expression: ts.Expression): boolean {
    expression = unwrapRuntimeExpression(expression);
    if (
      (ts.isAwaitExpression(expression) ||
        ts.isCallExpression(expression) ||
        ts.isNewExpression(expression) ||
        ts.isTaggedTemplateExpression(expression)) &&
      tsutils.isTypeFlagSet(
        checker.getTypeAtLocation(expression),
        ts.TypeFlags.Never,
      )
    ) {
      return true;
    }

    if (ts.isConditionalExpression(expression)) {
      if (expressionNeverCompletes(expression.condition)) {
        return true;
      }
      const truthiness = getTSStaticTruthiness(expression.condition);
      return truthiness == null
        ? expressionNeverCompletes(expression.whenTrue) &&
            expressionNeverCompletes(expression.whenFalse)
        : expressionNeverCompletes(
            truthiness ? expression.whenTrue : expression.whenFalse,
          );
    }

    if (ts.isBinaryExpression(expression)) {
      if (expressionNeverCompletes(expression.left)) {
        return true;
      }
      if (
        expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
      ) {
        return (
          getTSStaticTruthiness(expression.left) === true &&
          expressionNeverCompletes(expression.right)
        );
      }
      if (expression.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
        return (
          getTSStaticTruthiness(expression.left) === false &&
          expressionNeverCompletes(expression.right)
        );
      }
      if (
        expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
      ) {
        const left = getTSStaticValue(expression.left);
        return (
          left != null &&
          left.value == null &&
          expressionNeverCompletes(expression.right)
        );
      }
      return expressionNeverCompletes(expression.right);
    }

    if (ts.isArrayLiteralExpression(expression)) {
      return expression.elements.some(element => {
        if (ts.isOmittedExpression(element)) {
          return false;
        }
        return expressionNeverCompletes(
          ts.isSpreadElement(element) ? element.expression : element,
        );
      });
    }

    if (ts.isObjectLiteralExpression(expression)) {
      return expression.properties.some(property => {
        const name = ts.getNameOfDeclaration(property);
        if (
          name != null &&
          ts.isComputedPropertyName(name) &&
          expressionNeverCompletes(name.expression)
        ) {
          return true;
        }
        if (ts.isPropertyAssignment(property)) {
          return expressionNeverCompletes(property.initializer);
        }
        if (ts.isShorthandPropertyAssignment(property)) {
          return (
            expressionNeverCompletes(property.name) ||
            (property.objectAssignmentInitializer != null &&
              expressionNeverCompletes(property.objectAssignmentInitializer))
          );
        }
        if (ts.isSpreadAssignment(property)) {
          return expressionNeverCompletes(property.expression);
        }
        return false;
      });
    }

    if (ts.isCallExpression(expression)) {
      return (
        expressionNeverCompletes(expression.expression) ||
        (!ts.isCallChain(expression) &&
          expression.arguments.some(argument =>
            expressionNeverCompletes(
              ts.isSpreadElement(argument) ? argument.expression : argument,
            ),
          ))
      );
    }

    if (ts.isNewExpression(expression)) {
      return (
        expressionNeverCompletes(expression.expression) ||
        expression.arguments?.some(argument =>
          expressionNeverCompletes(
            ts.isSpreadElement(argument) ? argument.expression : argument,
          ),
        ) === true
      );
    }

    if (ts.isPropertyAccessExpression(expression)) {
      return expressionNeverCompletes(expression.expression);
    }

    if (ts.isElementAccessExpression(expression)) {
      return (
        expressionNeverCompletes(expression.expression) ||
        (expression.questionDotToken == null &&
          expressionNeverCompletes(expression.argumentExpression))
      );
    }

    if (ts.isTaggedTemplateExpression(expression)) {
      return (
        expressionNeverCompletes(expression.tag) ||
        (ts.isTemplateExpression(expression.template) &&
          expression.template.templateSpans.some(span =>
            expressionNeverCompletes(span.expression),
          ))
      );
    }

    if (ts.isTemplateExpression(expression)) {
      return expression.templateSpans.some(span =>
        expressionNeverCompletes(span.expression),
      );
    }

    if (
      ts.isAwaitExpression(expression) ||
      ts.isDeleteExpression(expression) ||
      ts.isTypeOfExpression(expression) ||
      ts.isVoidExpression(expression)
    ) {
      return expressionNeverCompletes(expression.expression);
    }

    if (
      ts.isPostfixUnaryExpression(expression) ||
      ts.isPrefixUnaryExpression(expression)
    ) {
      return expressionNeverCompletes(expression.operand);
    }

    if (ts.isYieldExpression(expression) && expression.expression != null) {
      return expressionNeverCompletes(expression.expression);
    }

    return false;
  }

  /**
   * Skips wrappers with no runtime effect: parentheses, `satisfies`, and
   * every type assertion form.
   */
  function unwrapRuntimeExpression(expression: ts.Expression): ts.Expression {
    for (;;) {
      expression = unwrapTransparentExpression(expression);
      if (
        ts.isAsExpression(expression) ||
        ts.isTypeAssertionExpression(expression) ||
        ts.isNonNullExpression(expression)
      ) {
        expression = expression.expression;
        continue;
      }
      return expression;
    }
  }

  /**
   * Prefers the ESTree evaluator through the reverse node map, falling
   * back to checker constants for nodes without an ESTree counterpart.
   */
  function getTSStaticValue(
    expression: ts.Expression,
  ): { value: unknown } | undefined {
    if (!services.tsNodeToESTreeNodeMap.has(expression)) {
      return getTSConstantValue(expression);
    }
    const node =
      services.tsNodeToESTreeNodeMap.get<TSESTree.Expression>(expression);
    return getESTreeStaticValue(node);
  }

  /**
   * ESLint's scoped static evaluator, extended with checker-computed
   * constants (enum members) it cannot see.
   */
  function getESTreeStaticValue(
    node: TSESTree.Expression,
  ): { value: unknown } | undefined {
    const staticValue = getStaticValue(node, context.sourceCode.getScope(node));
    if (staticValue != null) {
      return staticValue;
    }
    const tsNode = services.esTreeNodeToTSNodeMap.get(node);
    return ts.isExpression(tsNode) ? getTSConstantValue(tsNode) : undefined;
  }

  /**
   * Checker-computed constants: enum member accesses, including element
   * accesses whose key is itself statically known.
   */
  function getTSConstantValue(
    expression: ts.Expression,
  ): { value: unknown } | undefined {
    expression = unwrapStaticValueExpression(expression);
    if (
      ts.isElementAccessExpression(expression) ||
      ts.isPropertyAccessExpression(expression)
    ) {
      let declaration =
        checker.getSymbolAtLocation(expression)?.valueDeclaration;
      let constantValue =
        checker.getConstantValue(expression) ??
        (declaration != null && ts.isEnumMember(declaration)
          ? checker.getConstantValue(declaration)
          : undefined);
      if (constantValue == null && ts.isElementAccessExpression(expression)) {
        const receiver = unwrapStaticValueExpression(expression.expression);
        let receiverSymbol = checker.getSymbolAtLocation(receiver);
        if (
          receiverSymbol != null &&
          tsutils.isSymbolFlagSet(receiverSymbol, ts.SymbolFlags.Alias)
        ) {
          receiverSymbol = checker.getAliasedSymbol(receiverSymbol);
        }
        const memberName = getTSStaticValue(
          expression.argumentExpression,
        )?.value;
        if (
          receiverSymbol != null &&
          tsutils.isSymbolFlagSet(receiverSymbol, ts.SymbolFlags.Enum) &&
          typeof memberName === 'string'
        ) {
          declaration = checker.getPropertyOfType(
            checker.getTypeAtLocation(receiver),
            memberName,
          )?.valueDeclaration;
          if (declaration != null && ts.isEnumMember(declaration)) {
            constantValue = checker.getConstantValue(declaration);
          }
        }
      }
      if (constantValue != null) {
        return { value: constantValue };
      }
    }
    return undefined;
  }

  /**
   * Runtime-transparent wrappers plus immutable `const` aliases, with
   * cycle protection.
   */
  function unwrapStaticValueExpression(
    expression: ts.Expression,
  ): ts.Expression {
    const seen = new Set<ts.Expression>();
    for (;;) {
      expression = unwrapRuntimeExpression(expression);
      if (seen.has(expression)) {
        return expression;
      }
      seen.add(expression);

      const initializerExpression = unwrapImmutableAlias(expression);
      if (initializerExpression === expression) {
        return expression;
      }
      expression = initializerExpression;
    }
  }

  /**
   * Static-value truthiness first, then type-level truthiness.
   */
  function getTSStaticTruthiness(
    expression: ts.Expression,
  ): boolean | undefined {
    const value = getTSStaticValue(expression);
    if (value != null) {
      return Boolean(value.value);
    }
    return getTypeLevelTruthiness(expression);
  }

  /**
   * Whether this `break` exits the given switch rather than an inner
   * loop, switch, or labeled statement.
   */
  function breakExitsSwitch(
    statement: ts.BreakStatement,
    switchStatement: ts.SwitchStatement,
  ): boolean {
    if (statement.label != null) {
      const labelText = statement.label.text;
      const label = ts.findAncestor(statement.parent, ancestor => {
        if (isRuntimeFunctionLike(ancestor)) {
          return 'quit';
        }
        return (
          ts.isLabeledStatement(ancestor) && ancestor.label.text === labelText
        );
      });
      return (
        label != null &&
        ts.isLabeledStatement(label) &&
        ts.findAncestor(
          switchStatement,
          ancestor => ancestor === label.statement,
        ) != null
      );
    }

    return (
      ts.findAncestor(
        statement.parent,
        ancestor =>
          ts.isSwitchStatement(ancestor) ||
          ts.isIterationStatement(ancestor, false),
      ) === switchStatement
    );
  }

  /**
   * Whether a `break`/`continue` transfers control out of the given
   * iteration statement, following labels.
   */
  function controlTransferTargetsIteration(
    statement: ts.BreakOrContinueStatement,
    iteration: ts.IterationStatement,
  ): boolean {
    if (statement.label != null) {
      const labelText = statement.label.text;
      const label = ts.findAncestor(statement.parent, ancestor => {
        if (isRuntimeFunctionLike(ancestor)) {
          return 'quit';
        }
        return (
          ts.isLabeledStatement(ancestor) && ancestor.label.text === labelText
        );
      });
      return (
        label != null &&
        ts.isLabeledStatement(label) &&
        ts.findAncestor(iteration, ancestor => ancestor === label.statement) !=
          null
      );
    }

    return (
      ts.findAncestor(
        statement.parent,
        ancestor =>
          ts.isIterationStatement(ancestor, false) ||
          (ts.isBreakStatement(statement) && ts.isSwitchStatement(ancestor)),
      ) === iteration
    );
  }

  /**
   * Whether the loop body can exit the loop itself, which lets an
   * otherwise-infinite loop complete normally.
   */
  function iterationHasTargetedControlTransfer(
    statement: ts.IterationStatement,
  ): boolean {
    let found = false;
    function visit(node: ts.Node): void {
      if (found || isRuntimeFunctionLike(node)) {
        return;
      }
      if (
        ts.isBreakOrContinueStatement(node) &&
        controlTransferTargetsIteration(node, statement)
      ) {
        found = true;
        return;
      }
      ts.forEachChild(node, visit);
    }
    visit(statement.statement);
    return found;
  }

  function variableDeclarationListNeverCompletes(
    declarationList: ts.VariableDeclarationList,
  ): boolean {
    return declarationList.declarations.some(
      declaration =>
        declaration.initializer != null &&
        expressionNeverCompletes(declaration.initializer),
    );
  }

  /** Whether a `break` matching `exits` occurs within the same function. */
  function hasExitingBreak(
    root: ts.Node,
    exits: (breakNode: ts.BreakStatement) => boolean,
  ): boolean {
    function visit(node: ts.Node): ts.BreakStatement | undefined {
      if (isRuntimeFunctionLike(node)) {
        return undefined;
      }
      if (ts.isBreakStatement(node) && exits(node)) {
        return node;
      }
      return ts.forEachChild(node, visit);
    }
    return visit(root) != null;
  }

  /**
   * A switch with a default and no exiting break completes like its last
   * clause.
   */
  function switchCannotCompleteNormally(
    statement: ts.SwitchStatement,
  ): boolean {
    if (expressionNeverCompletes(statement.expression)) {
      return true;
    }

    const clauses = statement.caseBlock.clauses;
    if (!clauses.some(ts.isDefaultClause)) {
      return false;
    }

    if (
      hasExitingBreak(statement.caseBlock, breakNode =>
        breakExitsSwitch(breakNode, statement),
      )
    ) {
      return false;
    }

    return (
      clauses.at(-1)?.statements.some(statementCannotCompleteNormally) === true
    );
  }

  /**
   * A labeled statement completes normally wherever a matching labeled
   * `break` escapes it.
   */
  function labeledStatementCannotCompleteNormally(
    statement: ts.LabeledStatement,
  ): boolean {
    const labelText = statement.label.text;
    return (
      !hasExitingBreak(
        statement.statement,
        breakNode => breakNode.label?.text === labelText,
      ) && statementCannotCompleteNormally(statement.statement)
    );
  }

  /**
   * Cached JavaScript completion semantics per statement.
   */
  function statementCannotCompleteNormally(statement: ts.Statement): boolean {
    const cached = statementCannotCompleteNormallyCache.get(statement);
    if (cached != null) {
      return cached;
    }
    const result = computeStatementCannotCompleteNormally(statement);
    statementCannotCompleteNormallyCache.set(statement, result);
    return result;
  }

  /**
   * Structural completion analysis mirroring runtime semantics per
   * statement kind.
   */
  function computeStatementCannotCompleteNormally(
    statement: ts.Statement,
  ): boolean {
    if (
      ts.isBreakOrContinueStatement(statement) ||
      ts.isReturnStatement(statement) ||
      ts.isThrowStatement(statement)
    ) {
      return true;
    }
    if (ts.isExpressionStatement(statement)) {
      return expressionNeverCompletes(statement.expression);
    }
    if (ts.isVariableStatement(statement)) {
      return variableDeclarationListNeverCompletes(statement.declarationList);
    }
    if (ts.isBlock(statement)) {
      return blockCannotCompleteNormally(statement);
    }
    if (ts.isIfStatement(statement)) {
      return (
        expressionNeverCompletes(statement.expression) ||
        (statement.elseStatement != null &&
          statementCannotCompleteNormally(statement.thenStatement) &&
          statementCannotCompleteNormally(statement.elseStatement))
      );
    }
    if (ts.isSwitchStatement(statement)) {
      return switchCannotCompleteNormally(statement);
    }
    if (ts.isDoStatement(statement)) {
      return (
        !iterationHasTargetedControlTransfer(statement) &&
        (statementCannotCompleteNormally(statement.statement) ||
          expressionNeverCompletes(statement.expression))
      );
    }
    if (ts.isWhileStatement(statement)) {
      return expressionNeverCompletes(statement.expression);
    }
    if (ts.isForStatement(statement)) {
      return (
        (statement.initializer != null &&
          (ts.isVariableDeclarationList(statement.initializer)
            ? variableDeclarationListNeverCompletes(statement.initializer)
            : expressionNeverCompletes(statement.initializer))) ||
        (statement.condition != null &&
          expressionNeverCompletes(statement.condition))
      );
    }
    if (ts.isForInStatement(statement) || ts.isForOfStatement(statement)) {
      return expressionNeverCompletes(statement.expression);
    }
    if (ts.isLabeledStatement(statement)) {
      return labeledStatementCannotCompleteNormally(statement);
    }
    if (ts.isTryStatement(statement)) {
      if (
        statement.finallyBlock != null &&
        blockCannotCompleteNormally(statement.finallyBlock)
      ) {
        return true;
      }
      return (
        blockCannotCompleteNormally(statement.tryBlock) &&
        (statement.catchClause == null ||
          blockCannotCompleteNormally(statement.catchClause.block))
      );
    }
    return false;
  }

  /**
   * Whether a node sits after a statement that cannot complete normally
   * within its statement list.
   */
  function isAfterNeverCompletion(
    completion: ts.Node,
    functionNode: ts.Node,
  ): boolean {
    function getUnreachableStatements(
      container: ts.Block | ts.CaseClause | ts.DefaultClause,
    ): WeakSet<ts.Statement> {
      const cached = statementsAfterNeverCompletion.get(container);
      if (cached != null) {
        return cached;
      }

      const unreachable = new WeakSet<ts.Statement>();
      let precedingStatementNeverCompletes = false;
      for (const statement of container.statements) {
        if (precedingStatementNeverCompletes) {
          unreachable.add(statement);
          continue;
        }
        precedingStatementNeverCompletes =
          statementCannotCompleteNormally(statement);
      }
      statementsAfterNeverCompletion.set(container, unreachable);
      return unreachable;
    }

    return (
      ts.findAncestor(completion, current => {
        if (current === functionNode || ts.isSourceFile(current)) {
          return 'quit';
        }
        const parent = current.parent;
        return (
          ts.isStatement(current) &&
          (ts.isBlock(parent) ||
            ts.isCaseClause(parent) ||
            ts.isDefaultClause(parent)) &&
          getUnreachableStatements(parent).has(current)
        );
      }) != null
    );
  }

  /**
   * Captures whether the block's end was reachable when the visitor
   * left it.
   */
  function recordBlockExit(block: ts.Block): void {
    blockCanCompleteNormally.set(block, isCurrentCodePathReachable());
  }

  /**
   * Direct `eval` can rebind any local, so its presence invalidates every
   * binding-based conclusion in the function.
   */
  function containsDirectEval(
    functionNode: FunctionLikeDeclarationWithBody,
  ): boolean {
    const cached = directEvalByFunction.get(functionNode);
    if (cached != null) {
      return cached;
    }

    let found = false;
    function visit(node: ts.Node): void {
      if (found) {
        return;
      }
      if (ts.isCallExpression(node) && !ts.isCallChain(node)) {
        const callee = unwrapRuntimeExpression(node.expression);
        if (ts.isIdentifier(callee) && callee.text === 'eval') {
          found = true;
          return;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(functionNode.body);
    directEvalByFunction.set(functionNode, found);
    return found;
  }

  /**
   * Tracks reachable Promise settlement calls with their execution order
   * and CodePath segments.
   */
  function recordCallExit(call: ts.CallExpression): void {
    if (!promiseSettlementCalls.has(call) || !isCurrentCodePathReachable()) {
      return;
    }
    reachableCalls.add(call);
    callExecutionOrder.set(call, nextCallExecutionOrder);
    nextCallExecutionOrder += 1;
    callCodePathSegments.set(call, [...currentCodePathSegments]);
  }

  function recordReturn(statement: ts.ReturnStatement): void {
    if (isCurrentCodePathReachable()) {
      reachableReturns.add(statement);
    }
  }

  function recordYield(expression: ts.YieldExpression): void {
    if (isCurrentCodePathReachable()) {
      reachableYields.add(expression);
    }
  }

  function onCodePathEnd(): void {
    currentCodePathSegments =
      codePathSegmentStack.pop() ?? new Set<TSESLint.CodePathSegment>();
  }

  function onCodePathSegmentEnd(segment: TSESLint.CodePathSegment): void {
    currentCodePathSegments.delete(segment);
  }

  function onCodePathSegmentStart(segment: TSESLint.CodePathSegment): void {
    currentCodePathSegments.add(segment);
  }

  function onCodePathStart(): void {
    codePathSegmentStack.push(currentCodePathSegments);
    currentCodePathSegments = new Set();
  }

  return {
    blockCanCompleteNormally,
    blockCannotCompleteNormally,
    callCodePathSegments,
    callExecutionOrder,
    containsDirectEval,
    expressionNeverCompletes,
    getTSStaticTruthiness,
    getTSStaticValue,
    isAfterNeverCompletion,
    isOverriddenByFinally,
    isTSNodeInStaticallyUnreachableBranch,
    onCodePathEnd,
    onCodePathSegmentEnd,
    onCodePathSegmentStart,
    onCodePathStart,
    promiseSettlementCalls,
    reachableCalls,
    reachableReturns,
    reachableYields,
    recordBlockExit,
    recordCallExit,
    recordReturn,
    recordYield,
    unwrapRuntimeExpression,
  };
}
