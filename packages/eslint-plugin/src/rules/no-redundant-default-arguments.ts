import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { DefinitionType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  findVariable,
  getParserServices,
  nullThrows,
  NullThrowsReasons,
} from '../util';

type Primitive = bigint | boolean | number | string | null | undefined;
type Callable =
  ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression;

function isWrappedExpression(
  node: ts.Node,
): node is
  | ts.AsExpression
  | ts.NonNullExpression
  | ts.ParenthesizedExpression
  | ts.SatisfiesExpression
  | ts.TypeAssertion {
  return (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node) ||
    node.kind === ts.SyntaxKind.SatisfiesExpression
  );
}

export default createRule<[], 'redundantDefaultValue'>({
  name: 'no-redundant-default-arguments',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow explicitly passing arguments that match their default values',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      redundantDefaultValue:
        "This {{kind}} matches the default value of '{{name}}' and can be omitted.",
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const sourceCode = context.sourceCode;
    const callableCache = new WeakMap<Callable, boolean>();
    const writesCache = new WeakMap<ts.SourceFile, Set<ts.Symbol>>();

    function literalValue(node: ts.Node): { value: Primitive } | undefined {
      if (isWrappedExpression(node)) {
        return literalValue(node.expression);
      }
      if (
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node)
      ) {
        return { value: node.text };
      }
      if (ts.isNumericLiteral(node)) {
        return { value: Number(node.text) };
      }
      if (ts.isBigIntLiteral(node)) {
        return { value: BigInt(node.text.replaceAll('_', '').slice(0, -1)) };
      }
      switch (node.kind) {
        case ts.SyntaxKind.TrueKeyword:
          return { value: true };
        case ts.SyntaxKind.FalseKeyword:
          return { value: false };
        case ts.SyntaxKind.NullKeyword:
          return { value: null };
      }
      if (ts.isPrefixUnaryExpression(node)) {
        const operand = literalValue(node.operand)?.value;
        if (typeof operand === 'number' || typeof operand === 'bigint') {
          if (node.operator === ts.SyntaxKind.MinusToken) {
            return { value: -operand };
          }
          if (
            node.operator === ts.SyntaxKind.PlusToken &&
            typeof operand === 'number'
          ) {
            return { value: operand };
          }
        }
      }
      return undefined;
    }

    function matchesDefault(
      node: TSESTree.Expression,
      initializer: ts.Expression,
    ): boolean {
      const argument = literalValue(services.esTreeNodeToTSNodeMap.get(node));
      const defaultValue = literalValue(initializer);
      return (
        argument != null &&
        defaultValue != null &&
        Object.is(argument.value, defaultValue.value)
      );
    }

    function stableReference(
      node: TSESTree.Node,
      name: string,
      seen = new Set<TSESLint.Scope.Variable>(),
    ): boolean {
      const variable = findVariable(sourceCode.getScope(node), name);
      if (!variable || seen.has(variable) || variable.defs.length !== 1) {
        return false;
      }
      seen.add(variable);
      if (
        variable.references.some(
          reference => reference.isWrite() && !reference.init,
        )
      ) {
        return false;
      }
      const definition = variable.defs[0];
      if (
        definition.type === DefinitionType.FunctionName ||
        definition.type === DefinitionType.ImportBinding
      ) {
        return true;
      }
      if (
        definition.type !== DefinitionType.Variable ||
        definition.parent.kind !== 'const'
      ) {
        return false;
      }
      const initializer = definition.node.init;
      if (initializer?.type === AST_NODE_TYPES.Identifier) {
        return stableReference(initializer, initializer.name, seen);
      }
      return (
        initializer?.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        initializer?.type === AST_NODE_TYPES.FunctionExpression
      );
    }

    function writtenSymbols(file: ts.SourceFile): Set<ts.Symbol> {
      const cached = writesCache.get(file);
      if (cached) {
        return cached;
      }
      const symbols = new Set<ts.Symbol>();
      writesCache.set(file, symbols);
      function collectTarget(node: ts.Node): void {
        if (ts.isIdentifier(node)) {
          const symbol = checker.getSymbolAtLocation(node);
          if (symbol) {
            symbols.add(symbol);
          }
        } else if (
          ts.isParenthesizedExpression(node) ||
          ts.isSpreadElement(node) ||
          ts.isSpreadAssignment(node)
        ) {
          collectTarget(node.expression);
        } else if (ts.isArrayLiteralExpression(node)) {
          node.elements.forEach(collectTarget);
        } else if (ts.isObjectLiteralExpression(node)) {
          for (const property of node.properties) {
            if (ts.isPropertyAssignment(property)) {
              collectTarget(property.initializer);
            } else if (ts.isShorthandPropertyAssignment(property)) {
              const symbol =
                checker.getShorthandAssignmentValueSymbol(property);
              if (symbol) {
                symbols.add(symbol);
              }
            } else if (ts.isSpreadAssignment(property)) {
              collectTarget(property.expression);
            }
          }
        } else if (
          ts.isBinaryExpression(node) &&
          node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        ) {
          collectTarget(node.left);
        }
      }
      function visit(node: ts.Node): void {
        if (
          ts.isBinaryExpression(node) &&
          node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
          node.operatorToken.kind <= ts.SyntaxKind.LastAssignment
        ) {
          collectTarget(node.left);
        } else if (ts.isForInStatement(node) || ts.isForOfStatement(node)) {
          collectTarget(node.initializer);
        }
        ts.forEachChild(node, visit);
      }
      visit(file);
      return symbols;
    }

    function isStableCallable(declaration: Callable): boolean {
      const cached = callableCache.get(declaration);
      if (cached != null) {
        return cached;
      }
      let stable = true;
      if (ts.isFunctionDeclaration(declaration)) {
        const symbol =
          declaration.name && checker.getSymbolAtLocation(declaration.name);
        stable =
          !symbol || !writtenSymbols(declaration.getSourceFile()).has(symbol);
      } else if (ts.isVariableDeclaration(declaration.parent)) {
        stable =
          ts.isVariableDeclarationList(declaration.parent.parent) &&
          (declaration.parent.parent.flags & ts.NodeFlags.Const) !== 0;
      }
      // Omitting a value is observable through arguments, even with identical defaults.
      function visit(node: ts.Node): void {
        if (
          ts.isIdentifier(node) &&
          (node.text === 'arguments' || node.text === 'eval')
        ) {
          stable = false;
        } else if (stable) {
          ts.forEachChild(node, visit);
        }
      }
      if (stable && declaration.body) {
        visit(declaration);
      }
      callableCache.set(declaration, stable);
      return stable;
    }

    function resolvesToDeclaration(
      node: ts.Node,
      declaration: Callable,
      seen = new Set<ts.Symbol>(),
    ): boolean {
      if (isWrappedExpression(node)) {
        return resolvesToDeclaration(node.expression, declaration, seen);
      }
      if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
        return node === declaration;
      }
      let symbol = checker.getSymbolAtLocation(node);
      if (!symbol) {
        return false;
      }
      if (tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)) {
        symbol = checker.getAliasedSymbol(symbol);
      }
      if (seen.has(symbol)) {
        return false;
      }
      seen.add(symbol);
      const value = symbol.valueDeclaration;
      if (value === declaration) {
        return true;
      }
      return (
        value != null &&
        ts.isVariableDeclaration(value) &&
        ts.isVariableDeclarationList(value.parent) &&
        (value.parent.flags & ts.NodeFlags.Const) !== 0 &&
        value.initializer != null &&
        (ts.isIdentifier(value.initializer) ||
          ts.isArrowFunction(value.initializer) ||
          ts.isFunctionExpression(value.initializer)) &&
        resolvesToDeclaration(value.initializer, declaration, seen)
      );
    }
    function getCallable(
      node: TSESTree.CallExpression | TSESTree.JSXOpeningElement,
    ): Callable | undefined {
      const callee =
        node.type === AST_NODE_TYPES.CallExpression ? node.callee : node.name;
      if (
        callee.type === AST_NODE_TYPES.Identifier ||
        callee.type === AST_NODE_TYPES.JSXIdentifier
      ) {
        if (!stableReference(callee, callee.name)) {
          return undefined;
        }
      } else if (
        callee.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
        callee.type !== AST_NODE_TYPES.FunctionExpression
      ) {
        return undefined;
      }
      const tsCallee = services.esTreeNodeToTSNodeMap.get(callee);
      const type = checker.getTypeAtLocation(tsCallee);
      if (
        type.isUnion() ||
        type.getCallSignatures().length !== 1 ||
        type.getProperty('defaultProps')
      ) {
        return undefined;
      }
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      const declaration = checker
        .getResolvedSignature(tsNode)
        ?.getDeclaration();
      if (
        !declaration ||
        !(
          ts.isFunctionDeclaration(declaration) ||
          ts.isFunctionExpression(declaration) ||
          ts.isArrowFunction(declaration)
        ) ||
        !declaration.body ||
        !isStableCallable(declaration)
      ) {
        return undefined;
      }
      // Removing an argument can change inferred type arguments, even if its runtime value is unchanged.
      if (declaration.typeParameters?.length && !node.typeArguments) {
        return undefined;
      }
      // Structurally identical function types can hide different implementations and defaults.
      if (!resolvesToDeclaration(tsCallee, declaration)) {
        return undefined;
      }
      return declaration;
    }

    function withoutComments(
      range: TSESTree.Range,
      fixer: TSESLint.RuleFixer,
    ): TSESLint.RuleFix | null {
      if (
        sourceCode
          .getAllComments()
          .some(
            comment =>
              comment.range[0] >= range[0] && comment.range[1] <= range[1],
          )
      ) {
        return null;
      }
      return fixer.removeRange(range);
    }

    function report(
      node: TSESTree.Node,
      name: string,
      kind: string,
      range: TSESTree.Range,
    ): void {
      context.report({
        node,
        messageId: 'redundantDefaultValue',
        data: { name, kind },
        fix: fixer => withoutComments(range, fixer),
      });
    }

    function propertyName(name: ts.PropertyName): string | undefined {
      if (
        ts.isIdentifier(name) ||
        ts.isStringLiteral(name) ||
        ts.isNumericLiteral(name)
      ) {
        return name.text;
      }
      return undefined;
    }

    function defaults(
      pattern: ts.ObjectBindingPattern,
    ): Map<string, ts.BindingElement> | undefined {
      const properties = new Map<string, ts.BindingElement>();
      for (const element of pattern.elements) {
        if (element.dotDotDotToken) {
          continue;
        }
        const name = propertyName(
          element.propertyName ?? (element.name as ts.Identifier),
        );
        if (name == null || properties.has(name)) {
          return undefined;
        }
        properties.set(name, element);
      }
      return properties;
    }

    function isOptionalProperty(
      pattern: ts.ObjectBindingPattern,
      name: string,
    ): boolean {
      const property = checker.getPropertyOfType(
        checker.getTypeAtLocation(pattern),
        name,
      );
      return (
        property != null &&
        tsutils.isSymbolFlagSet(property, ts.SymbolFlags.Optional)
      );
    }
    function checkObject(
      node: TSESTree.ObjectExpression,
      pattern: ts.ObjectBindingPattern,
    ): void {
      const bindings = defaults(pattern);
      if (!bindings) {
        return;
      }
      const names = new Set<string>();
      for (const property of node.properties) {
        if (
          property.type !== AST_NODE_TYPES.Property ||
          property.computed ||
          property.kind !== 'init' ||
          property.method
        ) {
          return;
        }
        const name =
          property.key.type === AST_NODE_TYPES.Identifier
            ? property.key.name
            : String((property.key as TSESTree.Literal).value);
        if (names.has(name)) {
          return;
        }
        names.add(name);
      }
      for (let index = 0; index < node.properties.length; index++) {
        const property = node.properties[index] as TSESTree.Property;
        const name =
          property.key.type === AST_NODE_TYPES.Identifier
            ? property.key.name
            : String((property.key as TSESTree.Literal).value);
        // Without an own property, inherited Object.prototype members win over a default.
        if (name in Object.prototype) {
          continue;
        }
        const binding = bindings.get(name);
        if (!binding) {
          continue;
        }
        if (
          binding.initializer &&
          isOptionalProperty(pattern, name) &&
          matchesDefault(
            property.value as TSESTree.Expression,
            binding.initializer,
          )
        ) {
          const next = node.properties.at(index + 1);

          const comma =
            index > 0
              ? sourceCode.getTokenBefore(
                  property,
                  token => token.value === ',',
                )
              : null;
          const followingComma = sourceCode.getTokenAfter(
            property,
            token => token.value === ',',
          );
          const range: TSESTree.Range = next
            ? [property.range[0], next.range[0]]
            : [
                comma?.range[0] ?? property.range[0],
                followingComma && followingComma.range[0] < node.range[1]
                  ? followingComma.range[1]
                  : property.range[1],
              ];
          report(property, name, 'property', range);
        } else if (
          property.value.type === AST_NODE_TYPES.ObjectExpression &&
          ts.isObjectBindingPattern(binding.name)
        ) {
          checkObject(property.value, binding.name);
        }
      }
    }

    return {
      CallExpression(node): void {
        const declaration = getCallable(node);
        if (!declaration) {
          return;
        }
        const parameters = declaration.parameters.filter(
          parameter =>
            !ts.isIdentifier(parameter.name) || parameter.name.text !== 'this',
        );
        for (let index = 0; index < node.arguments.length; index++) {
          const argument = node.arguments[index];
          if (argument.type === AST_NODE_TYPES.SpreadElement) {
            break;
          }
          const parameter = parameters.at(index);
          if (
            argument.type === AST_NODE_TYPES.ObjectExpression &&
            parameter &&
            ts.isObjectBindingPattern(parameter.name)
          ) {
            checkObject(argument, parameter.name);
          }
        }
        let first = node.arguments.length;
        while (first > 0) {
          const index = first - 1;
          const argument = node.arguments[index];
          const parameter = parameters.at(index);
          if (
            argument.type === AST_NODE_TYPES.SpreadElement ||
            !parameter?.initializer ||
            !ts.isIdentifier(parameter.name) ||
            !matchesDefault(argument, parameter.initializer)
          ) {
            break;
          }
          first--;
        }
        if (
          first === node.arguments.length ||
          node.arguments.some(
            argument => argument.type === AST_NODE_TYPES.SpreadElement,
          )
        ) {
          return;
        }
        const open = nullThrows(
          sourceCode.getTokenAfter(
            node.typeArguments ?? node.callee,
            token => token.value === '(',
          ),
          NullThrowsReasons.MissingToken('(', 'function call'),
        );
        const close = nullThrows(
          sourceCode.getLastToken(node),
          NullThrowsReasons.MissingToken(')', 'function call'),
        );
        const comma =
          first > 0 &&
          sourceCode.getTokenBefore(
            node.arguments[first],
            token => token.value === ',',
          );
        const range: TSESTree.Range = [
          comma ? comma.range[0] : open.range[1],
          close.range[0],
        ];
        for (const argument of node.arguments.slice(first)) {
          report(
            argument,
            parameters[first++].name.getText(),
            'argument',
            range,
          );
        }
      },
      JSXOpeningElement(node): void {
        const declaration = getCallable(node);
        const parameter = declaration?.parameters[0];
        if (
          !parameter ||
          !ts.isObjectBindingPattern(parameter.name) ||
          node.attributes.some(
            attribute => attribute.type === AST_NODE_TYPES.JSXSpreadAttribute,
          )
        ) {
          return;
        }
        const bindings = defaults(parameter.name);
        if (!bindings) {
          return;
        }
        const names = new Set<string>();
        for (const attribute of node.attributes) {
          if (
            attribute.type !== AST_NODE_TYPES.JSXAttribute ||
            attribute.name.type !== AST_NODE_TYPES.JSXIdentifier ||
            names.has(attribute.name.name)
          ) {
            return;
          }
          names.add(attribute.name.name);
        }
        for (const attribute of node.attributes as TSESTree.JSXAttribute[]) {
          const name = (attribute.name as TSESTree.JSXIdentifier).name;
          if (name === 'key' || name === 'ref' || name in Object.prototype) {
            continue;
          }
          const initializer = bindings.get(name)?.initializer;
          const expected = initializer && literalValue(initializer);
          if (!expected || !isOptionalProperty(parameter.name, name)) {
            continue;
          }
          const value = attribute.value;
          const matches =
            value == null
              ? expected.value === true
              : value.type === AST_NODE_TYPES.Literal
                ? Object.is(value.value, expected.value)
                : value.type === AST_NODE_TYPES.JSXExpressionContainer &&
                  value.expression.type !== AST_NODE_TYPES.JSXEmptyExpression &&
                  matchesDefault(value.expression, initializer);
          if (matches) {
            report(attribute, name, 'prop', attribute.range);
          }
        }
      },
    };
  },
});
