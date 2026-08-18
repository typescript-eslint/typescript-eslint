import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import type {
  FunctionNode,
  Observation,
  RuleContext,
  RuleDependencies,
} from './shared';

import { isBuiltinSymbolLike } from '../../util';
import { createAnalysisState } from './analysis-state';
import { createCallableProjections } from './callable-projections';
import { createContractAnalysis } from './contracts';
import { createControlFlowAnalysis } from './control-flow';
import { createExpressionAnalysis } from './expression-observations';
import { createExpressionUtilities } from './expression-utils';
import { createPropertyProjections } from './property-projections';
import {
  GENERATOR_NAMES,
  isRuntimeFunctionLike,
  isRuntimeFunctionLikeWithBody,
  truncateTypeString,
  TYPE_STRING_MAX_LENGTH,
} from './shared';
import { createTypeAnalysis } from './type-analysis';

export function createNoMisleadingReturnTypeAnalyzer(
  context: RuleContext,
  services: RuleDependencies['services'],
): TSESLint.RuleListener {
  const program = services.program;
  const checker = program.getTypeChecker();
  const dependencies = { checker, context, program, services };
  const state = createAnalysisState(dependencies);
  const expressionUtilities = createExpressionUtilities(state);
  const controlFlow = createControlFlowAnalysis(
    dependencies,
    expressionUtilities,
  );
  const expressions = createExpressionAnalysis(
    state,
    controlFlow,
    expressionUtilities,
  );
  const callables = createCallableProjections(state, expressions);
  const properties = createPropertyProjections(
    state,
    controlFlow,
    expressions,
    callables,
  );
  const typeAnalysis = createTypeAnalysis(
    state,
    expressions,
    properties,
    callables,
  );
  const contracts = createContractAnalysis(state, properties);

  const {
    analysisBudgetExceeded,
    assignabilityComparisonFailed,
    exceedsAnalysisSyntaxDepth,
    isStackOverflowError,
    isUncertain,
    resetAnalysisWork,
    resolveObservation,
  } = state;
  const {
    blockCanCompleteNormally,
    blockCannotCompleteNormally,
    containsDirectEval,
    isAfterNeverCompletion,
    isTSNodeInStaticallyUnreachableBranch,
    onCodePathEnd,
    onCodePathSegmentEnd,
    onCodePathSegmentStart,
    onCodePathStart,
    reachableYields,
    recordBlockExit,
    recordCallExit,
    recordReturn,
    recordYield,
  } = controlFlow;
  const {
    collectBuiltinPromiseSettlementCalls,
    collectReturns,
    getBuiltinPromiseExecutor,
    getExpressionObservations,
  } = expressions;
  const { projectIterableElement, projectYieldedValues } = callables;
  const {
    analyzeResolvedType,
    analyzeTypeNode,
    collectUnobservedUnionMembers,
    resetTypeAnalysis,
  } = typeAnalysis;
  const {
    isAffectedByDecorators,
    isOverloadImplementation,
    mirrorsBaseContract,
    mirrorsContextualContract,
  } = contracts;

  /**
   * Collects the values each reachable `yield` produces, resolving
   * `yield*` delegation to its element type.
   */
  function collectGeneratorObservations(
    body: ts.Block,
    isAsync: boolean,
  ): Observation[] {
    const yields: Observation[] = [];

    function visit(node: ts.Node): void {
      if (isRuntimeFunctionLike(node)) {
        return;
      }
      if (ts.isYieldExpression(node)) {
        if (
          !reachableYields.has(node) ||
          isTSNodeInStaticallyUnreachableBranch(node) ||
          isAfterNeverCompletion(node, body.parent)
        ) {
          return;
        }
        if (node.expression == null) {
          yields.push({ node, type: checker.getUndefinedType() });
        } else if (node.asteriskToken != null) {
          yields.push(
            ...projectIterableElement(
              getExpressionObservations(node.expression),
              isAsync,
            ),
          );
        } else {
          yields.push(
            ...projectYieldedValues(
              getExpressionObservations(node.expression),
              isAsync,
            ),
          );
        }
        ts.forEachChild(node, visit);
        return;
      }
      ts.forEachChild(node, visit);
    }

    visit(body);
    return yields;
  }

  /**
   * Checks only the yielded-value channel: callers can inject `TReturn`
   * and `TNext` values through `generator.return()` / `generator.next()`.
   */
  function analyzeGenerator(
    node: FunctionNode,
    tsFunctionNode: ts.FunctionLikeDeclaration,
    body: ts.Block,
    returnTypeNode: TSESTree.TSTypeAnnotation,
    annotatedType: ts.Type,
  ): void {
    if (!isBuiltinSymbolLike(program, annotatedType, GENERATOR_NAMES)) {
      return;
    }

    const observations = collectGeneratorObservations(body, node.async);
    const unused: ts.Type[] = [];
    const expectedYields = projectIterableElement(
      [{ node: tsFunctionNode, type: annotatedType }],
      node.async,
    );
    if (observations.length === 0) {
      for (const yielded of expectedYields) {
        collectUnobservedUnionMembers(resolveObservation(yielded).type, unused);
      }
      report(returnTypeNode, annotatedType, unused);
      return;
    }
    for (const yielded of expectedYields) {
      const expectedYield = resolveObservation(yielded);
      analyzeResolvedType(
        expectedYield.type,
        tsFunctionNode,
        observations,
        unused,
        undefined,
      );
    }
    report(returnTypeNode, annotatedType, unused);
  }

  /**
   * Renders unused constituents deduplicated, with `true`+`false`
   * collapsed back to `boolean` and the list length capped.
   */
  function report(
    returnTypeNode: TSESTree.TSTypeAnnotation,
    annotatedType: ts.Type,
    unusedTypes: readonly ts.Type[],
  ): void {
    const trueType = checker.getTrueType();
    const falseType = checker.getFalseType();
    const hasUnusedBoolean =
      unusedTypes.includes(trueType) && unusedTypes.includes(falseType);
    let emittedBoolean = false;
    const unused = new Set<string>();
    const separatorLength = ' | '.length;
    let renderedLength = 0;
    for (const type of unusedTypes) {
      let rendered: string;
      if (hasUnusedBoolean && (type === trueType || type === falseType)) {
        if (emittedBoolean) {
          continue;
        }
        emittedBoolean = true;
        rendered = checker.typeToString(checker.getBooleanType());
      } else {
        rendered = checker.typeToString(type);
      }
      if (unused.has(rendered)) {
        continue;
      }
      unused.add(rendered);
      renderedLength +=
        rendered.length + (unused.size === 1 ? 0 : separatorLength);
      if (renderedLength >= TYPE_STRING_MAX_LENGTH) {
        break;
      }
    }
    if (unused.size === 0) {
      return;
    }

    context.report({
      data: {
        annotated: truncateTypeString(checker.typeToString(annotatedType)),
        unused: truncateTypeString([...unused].join(' | ')),
      },
      messageId: 'misleadingReturnType',
      node: returnTypeNode,
    });
  }

  /**
   * The per-function pipeline: bail conditions, contract mirroring, then
   * observation collection and constituent analysis.
   */
  function checkFunctionWithTypes(node: FunctionNode): void {
    const returnTypeNode = node.returnType;
    if (returnTypeNode == null) {
      return;
    }

    const tsFunctionNode = services.esTreeNodeToTSNodeMap.get(node);
    if (
      !isRuntimeFunctionLikeWithBody(tsFunctionNode) ||
      exceedsAnalysisSyntaxDepth(tsFunctionNode) ||
      isOverloadImplementation(tsFunctionNode) ||
      isAffectedByDecorators(tsFunctionNode) ||
      containsDirectEval(tsFunctionNode)
    ) {
      return;
    }

    const tsReturnTypeNode = services.esTreeNodeToTSNodeMap.get(
      returnTypeNode.typeAnnotation,
    );
    if (!ts.isTypeNode(tsReturnTypeNode)) {
      return;
    }

    const annotatedType = checker.getTypeFromTypeNode(tsReturnTypeNode);
    if (
      isUncertain(annotatedType) ||
      mirrorsBaseContract(node, annotatedType) ||
      mirrorsContextualContract(tsFunctionNode, annotatedType)
    ) {
      return;
    }

    if (node.generator) {
      if (ts.isBlock(tsFunctionNode.body)) {
        analyzeGenerator(
          node,
          tsFunctionNode,
          tsFunctionNode.body,
          returnTypeNode,
          annotatedType,
        );
      }
      return;
    }

    let observations: Observation[];
    if (
      node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
      node.expression
    ) {
      const expression = services.esTreeNodeToTSNodeMap.get(node.body);
      if (!ts.isExpression(expression)) {
        return;
      }
      observations = getExpressionObservations(expression);
    } else {
      const body = tsFunctionNode.body;
      if (!ts.isBlock(body)) {
        return;
      }
      observations = collectReturns(body);
      // The code path observation alone cannot see type-level completion
      // (a trailing `never`-returning call still ends the function), so the
      // implicit `undefined` needs both sources to agree.
      if (
        blockCanCompleteNormally.get(body) === true &&
        !blockCannotCompleteNormally(body)
      ) {
        observations.push({ node: body, type: checker.getUndefinedType() });
      }
    }

    if (observations.length === 0) {
      return;
    }

    const unused: ts.Type[] = [];
    analyzeTypeNode(tsReturnTypeNode, observations, unused);
    report(returnTypeNode, annotatedType, unused);
  }

  /**
   * Entry point that converts analysis aborts (budget, checker overflow)
   * into silence for this function only.
   */
  function checkFunction(node: FunctionNode): void {
    resetAnalysisWork();
    resetTypeAnalysis();
    try {
      checkFunctionWithTypes(node);
    } catch (error) {
      if (
        error !== analysisBudgetExceeded &&
        error !== assignabilityComparisonFailed &&
        !isStackOverflowError(error)
      ) {
        throw error;
      }
    }
  }

  return {
    'ArrowFunctionExpression:exit': checkFunction,
    'BlockStatement:exit'(node): void {
      recordBlockExit(services.esTreeNodeToTSNodeMap.get(node));
    },
    'CallExpression:exit'(node): void {
      recordCallExit(services.esTreeNodeToTSNodeMap.get(node));
    },
    'FunctionDeclaration:exit': checkFunction,
    'FunctionExpression:exit': checkFunction,
    NewExpression(node): void {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      const promiseExecutor = getBuiltinPromiseExecutor(tsNode);
      if (promiseExecutor != null) {
        collectBuiltinPromiseSettlementCalls(promiseExecutor);
      }
    },
    onCodePathEnd,
    onCodePathSegmentEnd,
    onCodePathSegmentStart,
    onCodePathStart,
    onUnreachableCodePathSegmentEnd: onCodePathSegmentEnd,
    onUnreachableCodePathSegmentStart: onCodePathSegmentStart,
    ReturnStatement(node): void {
      recordReturn(services.esTreeNodeToTSNodeMap.get(node));
    },
    YieldExpression(node): void {
      recordYield(services.esTreeNodeToTSNodeMap.get(node));
    },
  };
}
