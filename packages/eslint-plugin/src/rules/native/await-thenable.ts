import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type {
  Checker,
  Project,
  Type as NativeType,
} from '@typescript/native/unstable/sync';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isParameterDeclaration } from '@typescript/native/unstable/ast/is';

import type { MessageId } from '../await-thenable';

import * as util from '../../util';
import { getForStatementHeadLoc } from '../../util/getForStatementHeadLoc';
import { getStaticMemberAccessValue } from '../../util/misc';
import {
  getConstrainedTypeAtLocation,
  getWellKnownPropertyOfType,
  isPromiseConstructorLike,
  isTypeAnyType,
  isTypeParameter,
  isTypeUnknownType,
  unionConstituents,
} from './nativeTypeUtils';

type Options = [];

const promiseAggregatorMethods = new Set<unknown>([
  'all',
  'allSettled',
  'race',
  'any',
]);

enum Awaitable {
  Always,
  Never,
  May,
}

function isCallback(
  project: Project,
  checker: Checker,
  parameter: Parameters<Checker['getTypeOfSymbolAtLocation']>[0],
): boolean {
  const declaration = parameter.valueDeclaration?.resolve(project);
  if (declaration == null || !isParameterDeclaration(declaration)) {
    return false;
  }
  const parameterSymbol = checker.getSymbolAtLocation(declaration.name);
  if (parameterSymbol == null) {
    return false;
  }
  let type = checker.getApparentType(
    checker.getTypeOfSymbolAtLocation(parameterSymbol, declaration),
  );
  if (declaration.dotDotDotToken) {
    const numberIndexType = type.getNumberIndexType();
    if (numberIndexType == null) {
      return false;
    }
    type = numberIndexType;
  }
  return unionConstituents(type).some(
    typePart => typePart.getCallSignatures().length > 0,
  );
}

function isThenableType(
  project: Project,
  checker: Checker,
  node: Parameters<Checker['getTypeOfSymbolAtLocation']>[1],
  type: NativeType,
): boolean {
  return unionConstituents(checker.getApparentType(type)).some(typePart => {
    const then = typePart.getProperty('then');
    if (then == null) {
      return false;
    }
    return unionConstituents(
      checker.getApparentType(checker.getTypeOfSymbolAtLocation(then, node)),
    ).some(thenType =>
      thenType.getCallSignatures().some(signature => {
        const firstParameter = signature.getParameters().at(0);
        return (
          firstParameter != null && isCallback(project, checker, firstParameter)
        );
      }),
    );
  });
}

function needsToBeAwaited(
  project: Project,
  checker: Checker,
  node: Parameters<Checker['getTypeOfSymbolAtLocation']>[1],
  type: NativeType,
): Awaitable {
  const constraint = checker.getBaseConstraintOfType(type);
  if (isTypeParameter(type) && constraint == null) {
    return Awaitable.May;
  }

  const constrainedType = constraint ?? type;
  if (
    isTypeAnyType(constrainedType) ||
    isTypeUnknownType(constrainedType) ||
    isTypeParameter(constrainedType)
  ) {
    return Awaitable.May;
  }

  if (isThenableType(project, checker, node, constrainedType)) {
    return Awaitable.Always;
  }
  return Awaitable.Never;
}

function isAlwaysNonAwaitableType(
  project: Project,
  checker: Checker,
  node: Parameters<Checker['getTypeOfSymbolAtLocation']>[1],
  type: NativeType,
): boolean {
  return unionConstituents(type).every(
    typePart =>
      needsToBeAwaited(project, checker, node, typePart) === Awaitable.Never,
  );
}

function containsNonAwaitableType(
  project: Project,
  checker: Checker,
  node: Parameters<Checker['getTypeOfSymbolAtLocation']>[1],
  type: NativeType,
): boolean {
  return unionConstituents(type).some(
    typePart =>
      needsToBeAwaited(project, checker, node, typePart) === Awaitable.Never,
  );
}

function getValueTypesOfArrayLike(
  checker: Checker,
  type: NativeType,
): readonly NativeType[] | null {
  if (checker.isTupleType(type) && type.isTypeReference()) {
    return checker.getTypeArguments(type);
  }
  if (checker.isArrayLikeType(type)) {
    const numberIndexType = type.getNumberIndexType();
    return numberIndexType == null ? null : [numberIndexType];
  }
  if (type.isTypeReference()) {
    return checker.getTypeArguments(type).slice(0, 1);
  }
  return null;
}

function isInvalidPromiseAggregatorInput(
  services: ReturnType<typeof util.getNativeParserServices>,
  checker: Checker,
  node: Parameters<Checker['getTypeOfSymbolAtLocation']>[1],
  type: NativeType,
): boolean {
  if (
    !unionConstituents(type).every(
      typePart =>
        getWellKnownPropertyOfType(
          services.native.program,
          services.native.project,
          checker,
          typePart,
          '__@iterator',
        ) != null,
    )
  ) {
    return false;
  }

  return unionConstituents(type).some(typePart =>
    getValueTypesOfArrayLike(checker, typePart)?.some(valueType =>
      containsNonAwaitableType(
        services.native.project,
        checker,
        node,
        valueType,
      ),
    ),
  );
}

export function create(
  context: Readonly<TSESLint.RuleContext<MessageId, Options>>,
): TSESLint.RuleListener {
  const services = util.getNativeParserServices(context);
  const { checker, program, project } = services.native;

  const removeAwaitSuggestion = (node: TSESTree.Node, description: string) => ({
    fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
      return fixer.remove(
        util.nullThrows(
          context.sourceCode.getFirstToken(node, util.isAwaitKeyword),
          util.NullThrowsReasons.MissingToken('await', description),
        ),
      );
    },
    messageId: 'removeAwait' as const,
  });

  return {
    AwaitExpression(node): void {
      const type = services.getTypeAtLocation(node.argument);
      const nativeNode = services.esTreeNodeToTSNodeMap.get(node.argument);
      if (
        needsToBeAwaited(project, checker, nativeNode, type) === Awaitable.Never
      ) {
        context.report({
          messageId: 'await',
          node,
          suggest: [removeAwaitSuggestion(node, 'await expression')],
        });
      }
    },

    CallExpression(node): void {
      if (
        node.callee.type !== AST_NODE_TYPES.MemberExpression ||
        !promiseAggregatorMethods.has(
          getStaticMemberAccessValue(node.callee, context),
        ) ||
        !isPromiseConstructorLike(
          program,
          project,
          checker,
          services.getTypeAtLocation(node.callee.object),
        )
      ) {
        return;
      }

      const argument = node.arguments.at(0);
      if (argument == null) {
        return;
      }
      if (argument.type === AST_NODE_TYPES.ArrayExpression) {
        const elements = argument.elements.filter(
          (element): element is TSESTree.Expression | TSESTree.SpreadElement =>
            element != null,
        );
        const types = services.getTypesAtLocations(elements);
        for (const [index, element] of elements.entries()) {
          if (
            isAlwaysNonAwaitableType(
              project,
              checker,
              services.esTreeNodeToTSNodeMap.get(element),
              types[index],
            )
          ) {
            context.report({
              messageId: 'invalidPromiseAggregatorInput',
              node: element,
            });
          }
        }
        return;
      }

      const argumentType = getConstrainedTypeAtLocation(services, argument);
      if (
        isInvalidPromiseAggregatorInput(
          services,
          checker,
          services.esTreeNodeToTSNodeMap.get(argument),
          argumentType,
        )
      ) {
        context.report({
          messageId: 'invalidPromiseAggregatorInput',
          node: argument,
        });
      }
    },

    'ForOfStatement[await=true]'(node: TSESTree.ForOfStatement): void {
      const type = services.getTypeAtLocation(node.right);
      if (
        isTypeAnyType(type) ||
        unionConstituents(type).some(
          typePart =>
            getWellKnownPropertyOfType(
              program,
              project,
              checker,
              typePart,
              '__@asyncIterator',
            ) != null,
        )
      ) {
        return;
      }
      context.report({
        loc: getForStatementHeadLoc(context.sourceCode, node),
        messageId: 'forAwaitOfNonAsyncIterable',
        suggest: [
          // Note that this suggestion causes broken code for sync iterables
          // of promises, since the loop variable is not awaited.
          {
            ...removeAwaitSuggestion(node, 'for await loop'),
            messageId: 'convertToOrdinaryFor',
          },
        ],
      });
    },

    'VariableDeclaration[kind="await using"]'(
      node: TSESTree.VariableDeclaration,
    ): void {
      const declaratorsWithInitializers = node.declarations.flatMap(
        declarator =>
          declarator.init == null
            ? []
            : [[declarator, declarator.init] as const],
      );
      const initializers = declaratorsWithInitializers.map(
        ([, initializer]) => initializer,
      );
      const types = services.getTypesAtLocations(initializers);
      for (const [index, initializer] of initializers.entries()) {
        if (
          isTypeAnyType(types[index]) ||
          unionConstituents(types[index]).some(
            typePart =>
              getWellKnownPropertyOfType(
                program,
                project,
                checker,
                typePart,
                '__@asyncDispose',
              ) != null,
          )
        ) {
          continue;
        }
        context.report({
          messageId: 'awaitUsingOfNonAsyncDisposable',
          node: initializer,
          // let the user figure out what to do if there's
          // await using a = b, c = d, e = f;
          // it's rare and not worth the complexity to handle.
          ...util.getFixOrSuggest({
            fixOrSuggest: node.declarations.length === 1 ? 'suggest' : 'none',
            suggestion: removeAwaitSuggestion(node, 'await using'),
          }),
        });
      }
    },
  };
}
