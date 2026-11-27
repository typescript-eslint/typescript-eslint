import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  ASTUtils,
} from '@typescript-eslint/utils';

import {
  createRule,
  getTextWithParentheses,
  isAssignee,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export default createRule({
  name: 'prefer-for-of',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce the use of `for-of` loop over the standard `for` loop where possible',
      recommended: 'stylistic',
    },
    hasSuggestions: true,
    messages: {
      preferForOf:
        'Expected a `for-of` loop instead of a `for` loop with this simple iteration.',
      suggestForOf: 'Replace with a `for-of` loop.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    function isSingleVariableDeclaration(
      node: TSESTree.Node | null,
    ): node is TSESTree.VariableDeclaration {
      return (
        node?.type === AST_NODE_TYPES.VariableDeclaration &&
        node.kind !== 'const' &&
        node.declarations.length === 1
      );
    }

    function isLiteral(
      node: TSESTree.Expression | TSESTree.PrivateIdentifier,
      value: number,
    ): boolean {
      return node.type === AST_NODE_TYPES.Literal && node.value === value;
    }

    function isZeroInitialized(node: TSESTree.VariableDeclarator): boolean {
      return node.init != null && isLiteral(node.init, 0);
    }

    function isMatchingIdentifier(
      node: TSESTree.Expression | TSESTree.PrivateIdentifier,
      name: string,
    ): boolean {
      return node.type === AST_NODE_TYPES.Identifier && node.name === name;
    }

    function isLessThanLengthExpression(
      node: TSESTree.Node | null,
      name: string,
    ): TSESTree.Expression | null {
      if (
        node?.type === AST_NODE_TYPES.BinaryExpression &&
        node.operator === '<' &&
        isMatchingIdentifier(node.left, name) &&
        node.right.type === AST_NODE_TYPES.MemberExpression &&
        isMatchingIdentifier(node.right.property, 'length')
      ) {
        return node.right.object;
      }
      return null;
    }

    function isIncrement(node: TSESTree.Node | null, name: string): boolean {
      if (!node) {
        return false;
      }

      switch (node.type) {
        case AST_NODE_TYPES.UpdateExpression:
          // x++ or ++x
          return (
            node.operator === '++' && isMatchingIdentifier(node.argument, name)
          );
        case AST_NODE_TYPES.AssignmentExpression:
          if (isMatchingIdentifier(node.left, name)) {
            if (node.operator === '+=') {
              // x += 1
              return isLiteral(node.right, 1);
            }
            if (node.operator === '=') {
              // x = x + 1 or x = 1 + x
              const expr = node.right;
              return (
                expr.type === AST_NODE_TYPES.BinaryExpression &&
                expr.operator === '+' &&
                ((isMatchingIdentifier(expr.left, name) &&
                  isLiteral(expr.right, 1)) ||
                  (isLiteral(expr.left, 1) &&
                    isMatchingIdentifier(expr.right, name)))
              );
            }
          }
      }
      return false;
    }

    function contains(outer: TSESTree.Node, inner: TSESTree.Node): boolean {
      return (
        outer.range[0] <= inner.range[0] && outer.range[1] >= inner.range[1]
      );
    }

    function isIndexOnlyUsedWithArray(
      body: TSESTree.Statement,
      indexVar: TSESLint.Scope.Variable,
      arrayExpression: TSESTree.Expression,
    ): boolean {
      const arrayText = context.sourceCode.getText(arrayExpression);
      return indexVar.references.every(reference => {
        const id = reference.identifier;
        const node = id.parent;
        return (
          !contains(body, id) ||
          (node.type === AST_NODE_TYPES.MemberExpression &&
            node.object.type !== AST_NODE_TYPES.ThisExpression &&
            node.property === id &&
            context.sourceCode.getText(node.object) === arrayText &&
            !isAssignee(node))
        );
      });
    }

    // The function, class field or static block that sets `this` and `super`
    // at `node`.
    function getThisScope(node: TSESTree.Node): TSESTree.Node | undefined {
      let current = node.parent;
      while (current) {
        switch (current.type) {
          case AST_NODE_TYPES.AccessorProperty:
          case AST_NODE_TYPES.FunctionDeclaration:
          case AST_NODE_TYPES.FunctionExpression:
          case AST_NODE_TYPES.PropertyDefinition:
          case AST_NODE_TYPES.StaticBlock:
            return current;
        }
        current = current.parent;
      }
      return undefined;
    }

    // `scope` and its child scopes, keeping only what's inside `node`.
    function getScopesInside(
      scope: TSESLint.Scope.Scope,
      node: TSESTree.Node,
    ): TSESLint.Scope.Scope[] {
      return [
        scope,
        ...scope.childScopes
          .filter(child => contains(node, child.block))
          .flatMap(child => getScopesInside(child, node)),
      ];
    }

    function getReferencesInside(
      scope: TSESLint.Scope.Scope,
      node: TSESTree.Node,
    ): TSESLint.Scope.Reference[] {
      return getScopesInside(scope, node).flatMap(inner =>
        inner.references.filter(reference =>
          contains(node, reference.identifier),
        ),
      );
    }

    function isCalled(node: TSESTree.Expression): boolean {
      const parent = node.parent;
      switch (parent.type) {
        case AST_NODE_TYPES.TSAsExpression:
        case AST_NODE_TYPES.TSNonNullExpression:
        case AST_NODE_TYPES.TSSatisfiesExpression:
        case AST_NODE_TYPES.TSTypeAssertion:
          return isCalled(parent);
        case AST_NODE_TYPES.CallExpression:
          return parent.callee === node;
        case AST_NODE_TYPES.TaggedTemplateExpression:
          return parent.tag === node;
        default:
          return false;
      }
    }

    // If the array expression is a chain of property reads like `a.b[c]` on a
    // name, `this` or `super`, returns its root and the text of each link.
    // Anything else, like a call, may give a different array on each access.
    function getArrayChain(
      node: TSESTree.Expression,
    ): { links: Set<string>; root: TSESTree.Node } | null {
      const links = new Set<string>();
      let current: TSESTree.Node = node;
      while (true) {
        switch (current.type) {
          case AST_NODE_TYPES.TSAsExpression:
          case AST_NODE_TYPES.TSNonNullExpression:
          case AST_NODE_TYPES.TSSatisfiesExpression:
          case AST_NODE_TYPES.TSTypeAssertion:
            current = current.expression;
            continue;
          case AST_NODE_TYPES.MemberExpression:
            if (
              current.computed &&
              current.property.type !== AST_NODE_TYPES.Identifier &&
              current.property.type !== AST_NODE_TYPES.Literal
            ) {
              return null;
            }
            links.add(context.sourceCode.getText(current));
            current = current.object;
            continue;
          case AST_NODE_TYPES.Super:
            // `for (const value of super)` isn't valid syntax.
            return current === node ? null : { links, root: current };
          case AST_NODE_TYPES.Identifier:
          case AST_NODE_TYPES.ThisExpression:
            links.add(context.sourceCode.getText(current));
            return { links, root: current };
          default:
            return null;
        }
      }
    }

    // `for...of` reads the array once, the loop reads it on every access, so
    // the loop body must not assign to any link of the chain or to a name in it.
    function isArrayAssignedInBody(
      node: TSESTree.ForStatement,
      chain: { links: Set<string>; root: TSESTree.Node },
      arrayReferences: TSESLint.Scope.Reference[],
    ): boolean {
      const { root } = chain;
      const bodyReferences = getReferencesInside(
        context.sourceCode.getScope(node),
        node.body,
      );
      const roots =
        root.type === AST_NODE_TYPES.Identifier
          ? bodyReferences
              .filter(reference => reference.identifier.name === root.name)
              .map(reference => reference.identifier)
          : context.sourceCode
              .getTokens(node.body)
              .filter(
                token =>
                  token.type === AST_TOKEN_TYPES.Keyword &&
                  token.value === context.sourceCode.getText(root),
              )
              .map(token =>
                nullThrows(
                  context.sourceCode.getNodeByRangeIndex(token.range[0]),
                  'Missing node for keyword token',
                ),
              );

      return (
        bodyReferences.some(
          reference =>
            reference.isWrite() &&
            arrayReferences.some(
              arrayReference =>
                arrayReference.identifier.name === reference.identifier.name &&
                arrayReference.resolved === reference.resolved,
            ),
        ) ||
        roots.some(occurrence => {
          for (
            let current: TSESTree.Node = occurrence;
            current.parent?.type === AST_NODE_TYPES.MemberExpression &&
            current.parent.object === current;
            current = current.parent
          ) {
            if (
              chain.links.has(context.sourceCode.getText(current.parent)) &&
              isAssignee(current.parent)
            ) {
              return true;
            }
          }
          return false;
        })
      );
    }

    // Whether `member`, one of the loop's `arr[i]` reads, can become the new
    // variable without changing what it reads or how it's used.
    function canReplaceElement(
      node: TSESTree.ForStatement,
      member: TSESTree.MemberExpression,
      chain: { links: Set<string>; root: TSESTree.Node },
      arrayReferences: TSESLint.Scope.Reference[],
    ): boolean {
      const loopScope = context.sourceCode.getScope(node);
      const memberScope = context.sourceCode.getScope(member);
      return (
        // The read is replaced, so comments in it would be lost.
        context.sourceCode.getCommentsInside(member).length === 0 &&
        // `arr[i]()` calls with `this` set to `arr`, `value()` doesn't.
        !isCalled(member) &&
        // An inner `arr` would be a different variable.
        arrayReferences.every(
          arrayReference =>
            ASTUtils.findVariable(
              memberScope,
              arrayReference.identifier.name,
            ) === arrayReference.resolved,
        ) &&
        // An inner function has its own `this` and `super`.
        (chain.root.type === AST_NODE_TYPES.Identifier ||
          getThisScope(member) === getThisScope(node)) &&
        // With `var`, an inner function may read the index after the loop
        // moved on.
        ((node.init as TSESTree.VariableDeclaration).kind !== 'var' ||
          memberScope.variableScope === loopScope.variableScope)
      );
    }

    // Each `arr[i]` matches the array expression by text. The suggestion is
    // only offered if they also mean the same thing and nothing else in the
    // loop depends on the index.
    function canSuggest(
      node: TSESTree.ForStatement,
      indexVar: TSESLint.Scope.Variable,
      arrayExpression: TSESTree.Expression,
    ): boolean {
      const chain = getArrayChain(arrayExpression);
      if (!chain) {
        return false;
      }

      // The header is replaced, so comments in it would be lost.
      if (
        context.sourceCode
          .getCommentsInside(node)
          .some(comment => comment.range[1] <= node.body.range[0])
      ) {
        return false;
      }

      const arrayReferences = getReferencesInside(
        context.sourceCode.getScope(node),
        arrayExpression,
      );
      if (isArrayAssignedInBody(node, chain, arrayReferences)) {
        return false;
      }

      return indexVar.references.every(
        ({ identifier }) =>
          // The fix deletes the index, so it can't be used in code the fix
          // keeps: outside a `var` loop, or in the array expression.
          contains(node, identifier) &&
          !contains(arrayExpression, identifier) &&
          (!contains(node.body, identifier) ||
            canReplaceElement(
              node,
              // `isIndexOnlyUsedWithArray` already checked that each use in
              // the body is an `arr[i]` read.
              identifier.parent as TSESTree.MemberExpression,
              chain,
              arrayReferences,
            )),
      );
    }

    // Names visible at the loop, plus names declared or used inside it.
    // The new variable must not shadow or capture any of them.
    function getElementName(node: TSESTree.ForStatement): string {
      const loopScope = context.sourceCode.getScope(node);
      const names = new Set<string>();
      for (
        let scope: TSESLint.Scope.Scope | null = loopScope;
        scope;
        scope = scope.upper
      ) {
        for (const variable of scope.variables) {
          names.add(variable.name);
        }
      }
      for (const scope of getScopesInside(loopScope, node)) {
        for (const variable of scope.variables) {
          names.add(variable.name);
        }
      }
      for (const reference of getReferencesInside(loopScope, node)) {
        names.add(reference.identifier.name);
      }

      let name = 'value';
      for (let suffix = 1; names.has(name); suffix++) {
        name = `value${suffix}`;
      }
      return name;
    }

    return {
      'ForStatement:exit'(node: TSESTree.ForStatement): void {
        if (!isSingleVariableDeclaration(node.init)) {
          return;
        }

        const declarator = node.init.declarations[0] as
          TSESTree.VariableDeclarator | undefined;
        if (
          !declarator ||
          !isZeroInitialized(declarator) ||
          declarator.id.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        const indexName = declarator.id.name;
        const arrayExpression = isLessThanLengthExpression(
          node.test,
          indexName,
        );
        if (!arrayExpression) {
          return;
        }

        const [indexVar] = context.sourceCode.getDeclaredVariables(node.init);
        if (
          isIncrement(node.update, indexName) &&
          isIndexOnlyUsedWithArray(node.body, indexVar, arrayExpression)
        ) {
          context.report({
            node,
            messageId: 'preferForOf',
            suggest: canSuggest(node, indexVar, arrayExpression)
              ? [
                  {
                    messageId: 'suggestForOf',
                    *fix(fixer) {
                      const name = getElementName(node);
                      yield fixer.replaceTextRange(
                        [
                          node.range[0],
                          nullThrows(
                            context.sourceCode.getTokenBefore(node.body),
                            NullThrowsReasons.MissingToken(')', 'for loop'),
                          ).range[1],
                        ],
                        `for (const ${name} of ${getTextWithParentheses(
                          context.sourceCode,
                          arrayExpression,
                        )})`,
                      );
                      for (const reference of indexVar.references) {
                        if (contains(node.body, reference.identifier)) {
                          yield fixer.replaceText(
                            reference.identifier.parent,
                            name,
                          );
                        }
                      }
                    },
                  },
                ]
              : null,
          });
        }
      },
    };
  },
});
