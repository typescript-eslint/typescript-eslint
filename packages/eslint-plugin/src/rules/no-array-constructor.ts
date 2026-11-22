import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { DefinitionType, ScopeType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  isOpeningParenToken,
  isClosingParenToken,
} from '@typescript-eslint/utils/ast-utils';

import {
  createRule,
  findShadowingVariable,
  isGlobalScript,
  isReferenceToGlobalFunction,
  isStartOfExpressionStatement,
  needsPrecedingSemicolon,
} from '../util';

export default createRule({
  name: 'no-array-constructor',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow generic `Array` constructors',
      extendsBaseRule: true,
      recommended: 'recommended',
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      replaceWithLiteral: 'Replace with an array literal.',
      useLiteral: 'The array literal notation [] is preferable.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    /**
     * Checks whether `Array` is the global one. Types and namespaces without
     * values don't hide it.
     */
    function isGlobalArray(callee: TSESTree.Identifier): boolean {
      if (isReferenceToGlobalFunction('Array', callee, sourceCode)) {
        return true;
      }

      // In a script, a top-level `declare var Array: ArrayConstructor`
      // redeclares the global. It emits nothing, so `Array` is the global at
      // runtime even if TypeScript treats the file as a module. Other types
      // could make `new Array(...)` mean something other than an array, and
      // `isGlobalScript` can be wrong, so only that exact type counts.
      const variable = findShadowingVariable(
        'Array',
        sourceCode.getScope(callee),
        'value',
      );
      return (
        !!variable &&
        (variable.scope.type === ScopeType.global ||
          variable.scope.type === ScopeType.module) &&
        isGlobalScript(sourceCode) &&
        variable.references.every(reference => !reference.isWrite()) &&
        variable.defs.every(
          def =>
            def.type === DefinitionType.Type ||
            (def.type === DefinitionType.Variable &&
              def.parent.declare &&
              def.parent.kind === 'var' &&
              def.node.id.type === AST_NODE_TYPES.Identifier &&
              isGlobalArrayConstructorType(def.node.id.typeAnnotation)),
        )
      );
    }

    /**
     * Checks whether a type annotation is exactly the lib's `ArrayConstructor`.
     * Any declaration of that name in the file counts as hiding it, even one
     * that would merge into the global, since that can change its signatures.
     */
    function isGlobalArrayConstructorType(
      annotation: TSESTree.TSTypeAnnotation | undefined,
    ): boolean {
      const type = annotation?.typeAnnotation;
      return (
        type?.type === AST_NODE_TYPES.TSTypeReference &&
        type.typeName.type === AST_NODE_TYPES.Identifier &&
        type.typeName.name === 'ArrayConstructor' &&
        !type.typeArguments &&
        !findShadowingVariable(
          'ArrayConstructor',
          sourceCode.getScope(type),
          'type',
        )
      );
    }

    function hasCommentsOutsideArguments(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): boolean {
      const lastToken = sourceCode.getLastToken(node);
      let token = sourceCode.getLastToken(node.callee);

      while (token && token !== lastToken && !isOpeningParenToken(token)) {
        token = sourceCode.getTokenAfter(token);
      }

      const argumentsStart = token?.range[0] ?? node.range[1];

      return sourceCode
        .getCommentsInside(node)
        .some(comment => comment.range[1] <= argumentsStart);
    }

    function getArgumentsText(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ) {
      const lastToken = sourceCode.getLastToken(node);

      if (lastToken == null || !isClosingParenToken(lastToken)) {
        return '';
      }

      let firstToken: TSESTree.Expression | TSESTree.Token | null = node.callee;

      do {
        firstToken = sourceCode.getTokenAfter(firstToken);
        if (!firstToken || firstToken === lastToken) {
          return '';
        }
      } while (!isOpeningParenToken(firstToken));

      return sourceCode.text.slice(firstToken.range[1], lastToken.range[0]);
    }

    /**
     * Disallow construction of dense arrays using the Array constructor
     * @param node node to evaluate
     */
    function check(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      if (
        node.arguments.length !== 1 &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'Array' &&
        !node.typeArguments &&
        isGlobalArray(node.callee)
      ) {
        const fix = hasCommentsOutsideArguments(node)
          ? null
          : (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
              const semicolon =
                isStartOfExpressionStatement(node) &&
                needsPrecedingSemicolon(sourceCode, node)
                  ? ';'
                  : '';

              return fixer.replaceText(
                node,
                `${semicolon}[${getArgumentsText(node)}]`,
              );
            };

        // With fewer than two other arguments, spread arguments can add up to
        // a single number, which `Array` takes as the length:
        // `new Array(...[3])` is `[, , ,]`, not `[3]`
        const isUnsafe =
          node.arguments.some(
            argument => argument.type === AST_NODE_TYPES.SpreadElement,
          ) &&
          node.arguments.filter(
            argument => argument.type !== AST_NODE_TYPES.SpreadElement,
          ).length < 2;

        context.report({
          node,
          messageId: 'useLiteral',
          fix: isUnsafe ? null : fix,
          suggest:
            isUnsafe && fix ? [{ messageId: 'replaceWithLiteral', fix }] : null,
        });
      }
    }

    return {
      CallExpression: check,
      NewExpression: check,
    };
  },
});
