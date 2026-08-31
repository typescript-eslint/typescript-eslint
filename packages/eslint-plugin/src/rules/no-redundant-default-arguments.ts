import type { ScopeVariable } from '@typescript-eslint/scope-manager';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { DefinitionType } from '@typescript-eslint/scope-manager';
import { ASTUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  nullThrows,
  NullThrowsReasons,
} from '../util';

const NOT_HARDCODED = Symbol('notHardcoded');

type HardcodedValue = boolean | number | string | null;
type MessageIds = 'redundantDefaultValue';
type Options = [];

interface NamedDefault {
  name: string;
  value: HardcodedValue;
}

interface FunctionDefaults {
  objectProperties: Map<number, Map<string, NamedDefault>>;
  positional: Map<number, NamedDefault>;
}

export default createRule<Options, MessageIds>({
  name: 'no-redundant-default-arguments',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow arguments and JSX props that equal their parameter default',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      redundantDefaultValue:
        'This {{kind}} passes the default value {{value}} for "{{name}}" and can be omitted.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const sourceCode = context.sourceCode;

    function getVariable(
      node: TSESTree.Identifier | TSESTree.JSXIdentifier,
    ): ScopeVariable | null {
      return ASTUtils.findVariable(sourceCode.getScope(node), node.name);
    }

    function getDefaultsForCallee(
      identifier: TSESTree.Identifier | TSESTree.JSXIdentifier,
    ): FunctionDefaults | undefined {
      const variable = getVariable(identifier);
      if (variable == null || !isResolvableCallee(variable)) {
        return undefined;
      }

      const fromAst = getDefaultsFromVariable(variable);
      if (fromAst != null) {
        return fromAst;
      }

      const tsNode = services.esTreeNodeToTSNodeMap.get(identifier);
      const symbol = checker.getSymbolAtLocation(tsNode);
      if (symbol == null) {
        return undefined;
      }

      return getDefaultsFromTypeScriptSymbol(checker, symbol);
    }

    function checkCallExpression(node: TSESTree.CallExpression): void {
      if (
        node.callee.type !== AST_NODE_TYPES.Identifier ||
        node.arguments.length === 0
      ) {
        return;
      }

      const defaults = getDefaultsForCallee(node.callee);
      if (defaults == null) {
        return;
      }

      const spreadIndex = node.arguments.findIndex(
        argument => argument.type === AST_NODE_TYPES.SpreadElement,
      );

      if (spreadIndex === -1) {
        reportRedundantTrailingArguments(node, defaults.positional);
      }

      const alignedCount =
        spreadIndex === -1 ? node.arguments.length : spreadIndex;
      for (let index = 0; index < alignedCount; index++) {
        const argument = node.arguments[index];
        const objectDefaults = defaults.objectProperties.get(index);
        if (
          argument.type === AST_NODE_TYPES.ObjectExpression &&
          objectDefaults != null
        ) {
          reportRedundantObjectProperties(argument, objectDefaults);
        }
      }
    }

    function checkJSXOpeningElement(node: TSESTree.JSXOpeningElement): void {
      if (
        node.name.type !== AST_NODE_TYPES.JSXIdentifier ||
        node.name.name[0] !== node.name.name[0].toUpperCase() ||
        !node.attributes.some(
          attribute => attribute.type === AST_NODE_TYPES.JSXAttribute,
        )
      ) {
        return;
      }

      const defaults = getDefaultsForCallee(node.name);
      const propDefaults = defaults?.objectProperties.get(0);
      if (propDefaults == null) {
        return;
      }

      reportRedundantJSXAttributes(node, propDefaults);
    }

    function reportRedundantTrailingArguments(
      node: TSESTree.CallExpression,
      positional: Map<number, NamedDefault>,
    ): void {
      const redundant: {
        argument: TSESTree.CallExpressionArgument;
        defaultValue: NamedDefault;
      }[] = [];
      for (let index = node.arguments.length - 1; index >= 0; index--) {
        const argument = node.arguments[index];
        const defaultValue = positional.get(index);
        if (
          defaultValue == null ||
          !hardcodedValuesAreEqual(
            getHardcodedValue(argument),
            defaultValue.value,
          )
        ) {
          break;
        }
        redundant.push({ argument, defaultValue });
      }

      const firstRedundant = node.arguments.length - redundant.length;
      redundant.reverse();
      redundant.forEach(({ argument, defaultValue }, reportIndex) => {
        context.report({
          node: argument,
          messageId: 'redundantDefaultValue',
          data: {
            name: defaultValue.name,
            kind: 'argument',
            value: formatHardcodedValue(defaultValue.value),
          },
          fix:
            reportIndex === 0
              ? fixer =>
                  removeRangeIfUncommented(fixer, [
                    trailingArgumentRange(node, firstRedundant),
                  ])
              : undefined,
        });
      });
    }

    function reportRedundantObjectProperties(
      node: TSESTree.ObjectExpression,
      defaults: Map<string, NamedDefault>,
    ): void {
      const seen = new Set<string>();
      const redundant: {
        defaultValue: NamedDefault;
        index: number;
        property: TSESTree.Property;
      }[] = [];

      for (let index = node.properties.length - 1; index >= 0; index--) {
        const property = node.properties[index];
        if (property.type === AST_NODE_TYPES.SpreadElement) {
          return;
        }

        const name = getPropertyName(property);
        if (name == null) {
          continue;
        }
        if (seen.has(name)) {
          return;
        }
        seen.add(name);

        const defaultValue = defaults.get(name);
        if (
          defaultValue != null &&
          hardcodedValuesAreEqual(
            getHardcodedValue(property.value),
            defaultValue.value,
          )
        ) {
          redundant.push({ defaultValue, index, property });
        }
      }

      redundant.reverse();
      const indices = redundant.map(({ index }) => index);
      redundant.forEach(({ defaultValue, property }, reportIndex) => {
        context.report({
          node: property,
          messageId: 'redundantDefaultValue',
          data: {
            name: defaultValue.name,
            kind: 'property',
            value: formatHardcodedValue(defaultValue.value),
          },
          fix:
            reportIndex === 0
              ? fixer =>
                  removeRangeIfUncommented(
                    fixer,
                    objectPropertyRanges(node, indices),
                  )
              : undefined,
        });
      });
    }

    function reportRedundantJSXAttributes(
      node: TSESTree.JSXOpeningElement,
      defaults: Map<string, NamedDefault>,
    ): void {
      const redundant: {
        attribute: TSESTree.JSXAttribute;
        defaultValue: NamedDefault;
        index: number;
      }[] = [];

      for (let index = node.attributes.length - 1; index >= 0; index--) {
        const attribute = node.attributes[index];
        if (attribute.type === AST_NODE_TYPES.JSXSpreadAttribute) {
          return;
        }
        if (attribute.name.type !== AST_NODE_TYPES.JSXIdentifier) {
          continue;
        }

        const name = attribute.name.name;
        const defaultValue = defaults.get(name);
        if (
          defaultValue != null &&
          hardcodedValuesAreEqual(
            getJSXAttributeValue(attribute),
            defaultValue.value,
          )
        ) {
          redundant.push({ attribute, defaultValue, index });
        }
      }

      redundant.reverse();
      const indices = redundant.map(({ index }) => index);
      redundant.forEach(({ attribute, defaultValue }, reportIndex) => {
        context.report({
          node: attribute,
          messageId: 'redundantDefaultValue',
          data: {
            name: defaultValue.name,
            kind: 'prop',
            value: formatHardcodedValue(defaultValue.value),
          },
          fix:
            reportIndex === 0
              ? fixer =>
                  removeRangeIfUncommented(
                    fixer,
                    jsxAttributeRanges(node, indices),
                  )
              : undefined,
        });
      });
    }

    function rangeContainsComment(range: TSESTree.Range): boolean {
      return sourceCode
        .getAllComments()
        .some(
          comment =>
            comment.range[0] >= range[0] && comment.range[1] <= range[1],
        );
    }

    function removeRangeIfUncommented(
      fixer: TSESLint.RuleFixer,
      ranges: TSESTree.Range[],
    ): TSESLint.RuleFix[] | null {
      if (ranges.some(rangeContainsComment)) {
        return null;
      }
      return ranges.map(range => fixer.removeRange(range));
    }

    function trailingArgumentRange(
      node: TSESTree.CallExpression,
      firstIndex: number,
    ): TSESTree.Range {
      const firstArgument = node.arguments[firstIndex];
      const lastArgument = node.arguments[node.arguments.length - 1];
      const rangeStart =
        firstIndex > 0
          ? node.arguments[firstIndex - 1].range[1]
          : firstArgument.range[0];

      const tokenAfter = sourceCode.getTokenAfter(lastArgument);
      return [
        rangeStart,
        tokenAfter?.value === ',' ? tokenAfter.range[1] : lastArgument.range[1],
      ];
    }

    function objectPropertyRanges(
      node: TSESTree.ObjectExpression,
      indices: number[],
    ): TSESTree.Range[] {
      if (
        node.properties.length > 0 &&
        indices.length === node.properties.length &&
        indices[0] === 0 &&
        indices.at(-1) === node.properties.length - 1
      ) {
        const open = nullThrows(
          sourceCode.getFirstToken(node),
          NullThrowsReasons.MissingToken('{', 'object'),
        );
        const close = nullThrows(
          sourceCode.getLastToken(node),
          NullThrowsReasons.MissingToken('}', 'object'),
        );
        return [[open.range[1], close.range[0]]];
      }

      return contiguousRemovalRanges(
        node.properties,
        indices,
        (first, last, next, previous) => {
          if (next != null) {
            return [first.range[0], next.range[0]];
          }
          const tokenAfter = sourceCode.getTokenAfter(last);
          return [
            previous == null ? first.range[0] : previous.range[1],
            tokenAfter?.value === ',' ? tokenAfter.range[1] : last.range[1],
          ];
        },
      );
    }

    function jsxAttributeRanges(
      node: TSESTree.JSXOpeningElement,
      indices: number[],
    ): TSESTree.Range[] {
      return contiguousRemovalRanges(
        node.attributes,
        indices,
        (first, last, next, previous) => {
          if (next != null) {
            return [first.range[0], next.range[0]];
          }
          return [previous?.range[1] ?? node.name.range[1], last.range[1]];
        },
      );
    }

    return {
      CallExpression: checkCallExpression,
      JSXOpeningElement: checkJSXOpeningElement,
    };
  },
});

function isStableBinding(variable: ScopeVariable): boolean {
  return !variable.references.some(
    reference => reference.isWrite() && !reference.init,
  );
}

function isResolvableCallee(variable: ScopeVariable): boolean {
  if (!isStableBinding(variable)) {
    return false;
  }

  const functionNameDefs = variable.defs.filter(
    def => def.type === DefinitionType.FunctionName,
  );
  if (functionNameDefs.length > 1) {
    return false;
  }

  return variable.defs.some(def => {
    switch (def.type) {
      case DefinitionType.FunctionName:
      case DefinitionType.ImportBinding:
        return true;
      case DefinitionType.Variable:
        return def.node.parent.kind === 'const';
      default:
        return false;
    }
  });
}

function getDefaultsFromVariable(
  variable: ScopeVariable,
): FunctionDefaults | undefined {
  for (const def of variable.defs) {
    if (def.node.type === AST_NODE_TYPES.FunctionDeclaration) {
      const defaults = getFunctionDefaults(def.node);
      if (hasDefaults(defaults)) {
        return defaults;
      }
    }

    if (
      def.node.type === AST_NODE_TYPES.VariableDeclarator &&
      def.node.parent.kind === 'const'
    ) {
      const init = unwrapExpression(def.node.init);
      if (
        init?.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        init?.type === AST_NODE_TYPES.FunctionExpression
      ) {
        const defaults = getFunctionDefaults(init);
        if (hasDefaults(defaults)) {
          return defaults;
        }
      }
    }
  }
  return undefined;
}

function getFunctionDefaults(
  node:
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression,
): FunctionDefaults {
  const defaults: FunctionDefaults = {
    objectProperties: new Map(),
    positional: new Map(),
  };

  let runtimeIndex = 0;
  for (const parameter of node.params) {
    if (
      parameter.type === AST_NODE_TYPES.Identifier &&
      parameter.name === 'this'
    ) {
      continue;
    }

    if (parameter.type === AST_NODE_TYPES.AssignmentPattern) {
      if (parameter.left.type === AST_NODE_TYPES.Identifier) {
        const value = getHardcodedValue(parameter.right);
        if (value !== NOT_HARDCODED) {
          defaults.positional.set(runtimeIndex, {
            name: parameter.left.name,
            value,
          });
        }
      } else if (parameter.left.type === AST_NODE_TYPES.ObjectPattern) {
        const properties = getObjectPatternDefaults(parameter.left);
        if (properties.size > 0) {
          defaults.objectProperties.set(runtimeIndex, properties);
        }
      }
    } else if (parameter.type === AST_NODE_TYPES.ObjectPattern) {
      const properties = getObjectPatternDefaults(parameter);
      if (properties.size > 0) {
        defaults.objectProperties.set(runtimeIndex, properties);
      }
    }

    runtimeIndex += 1;
  }

  return defaults;
}

function getObjectPatternDefaults(
  pattern: TSESTree.ObjectPattern,
): Map<string, NamedDefault> {
  const defaults = new Map<string, NamedDefault>();
  for (const property of pattern.properties) {
    if (
      property.type !== AST_NODE_TYPES.Property ||
      property.value.type !== AST_NODE_TYPES.AssignmentPattern
    ) {
      continue;
    }
    const name = getPropertyName(property);
    const value = getHardcodedValue(property.value.right);
    if (name != null && value !== NOT_HARDCODED) {
      defaults.set(name, { name, value });
    }
  }
  return defaults;
}

function getDefaultsFromTypeScriptSymbol(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
): FunctionDefaults | undefined {
  const resolved = tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)
    ? checker.getAliasedSymbol(symbol)
    : symbol;

  const functionLikes: ts.SignatureDeclarationBase[] = [];
  for (const declaration of resolved.getDeclarations() ?? []) {
    const functionLike = getTypeScriptFunctionLike(declaration);
    if (functionLike != null) {
      functionLikes.push(functionLike);
    }
  }
  if (functionLikes.length !== 1) {
    return undefined;
  }

  const defaults = getTypeScriptFunctionDefaults(functionLikes[0]);
  return hasDefaults(defaults) ? defaults : undefined;
}

function getTypeScriptFunctionLike(
  declaration: ts.Declaration,
): ts.SignatureDeclarationBase | undefined {
  if (
    ts.isFunctionDeclaration(declaration) ||
    ts.isFunctionExpression(declaration) ||
    ts.isArrowFunction(declaration)
  ) {
    return declaration;
  }
  if (
    !ts.isVariableDeclaration(declaration) ||
    declaration.initializer == null ||
    !ts.isVariableDeclarationList(declaration.parent) ||
    (declaration.parent.flags & ts.NodeFlags.Const) === 0
  ) {
    return undefined;
  }
  const initializer = unwrapTypeScriptExpression(declaration.initializer);
  return ts.isFunctionExpression(initializer) || ts.isArrowFunction(initializer)
    ? initializer
    : undefined;
}

function getTypeScriptFunctionDefaults(
  node: ts.SignatureDeclarationBase,
): FunctionDefaults {
  const defaults: FunctionDefaults = {
    objectProperties: new Map(),
    positional: new Map(),
  };
  let runtimeIndex = 0;

  for (const parameter of node.parameters) {
    if (ts.isIdentifier(parameter.name) && parameter.name.text === 'this') {
      continue;
    }

    if (parameter.initializer != null && ts.isIdentifier(parameter.name)) {
      const value = getTypeScriptHardcodedValue(parameter.initializer);
      if (value !== NOT_HARDCODED) {
        defaults.positional.set(runtimeIndex, {
          name: parameter.name.text,
          value,
        });
      }
    } else if (ts.isObjectBindingPattern(parameter.name)) {
      const properties = getTypeScriptObjectDefaults(parameter.name);
      if (properties.size > 0) {
        defaults.objectProperties.set(runtimeIndex, properties);
      }
    }

    runtimeIndex += 1;
  }

  return defaults;
}

function getTypeScriptObjectDefaults(
  pattern: ts.ObjectBindingPattern,
): Map<string, NamedDefault> {
  const defaults = new Map<string, NamedDefault>();
  for (const element of pattern.elements) {
    if (element.dotDotDotToken != null || element.initializer == null) {
      continue;
    }
    const name = getTypeScriptPropertyName(
      element.propertyName ?? element.name,
    );
    const value = getTypeScriptHardcodedValue(element.initializer);
    if (name != null && value !== NOT_HARDCODED) {
      defaults.set(name, { name, value });
    }
  }
  return defaults;
}

function getTypeScriptPropertyName(
  node: ts.BindingName | ts.PropertyName,
): string | undefined {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return String(Number(node.text.replaceAll('_', '')));
  }
  return undefined;
}

function getTypeScriptHardcodedValue(
  expression: ts.Expression,
): HardcodedValue | typeof NOT_HARDCODED {
  const node = unwrapTypeScriptExpression(expression);
  if (ts.isStringLiteralLike(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return Number(node.text.replaceAll('_', ''));
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }
  if (node.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  }
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken
  ) {
    const operand = getTypeScriptHardcodedValue(node.operand);
    if (typeof operand === 'number') {
      return -operand;
    }
  }
  return NOT_HARDCODED;
}

function unwrapTypeScriptExpression(node: ts.Expression): ts.Expression {
  if (
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isParenthesizedExpression(node) ||
    ts.isSatisfiesExpression(node)
  ) {
    return unwrapTypeScriptExpression(node.expression);
  }
  return node;
}

function unwrapExpression(
  node: TSESTree.Expression | null | undefined,
): TSESTree.Expression | null | undefined {
  if (node == null) {
    return node;
  }
  switch (node.type) {
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
      return unwrapExpression(node.expression);
    default:
      return node;
  }
}

function getHardcodedValue(
  node: TSESTree.Node,
): HardcodedValue | typeof NOT_HARDCODED {
  switch (node.type) {
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
      return getHardcodedValue(node.expression);
    case AST_NODE_TYPES.Literal:
      if (
        node.value == null ||
        typeof node.value === 'string' ||
        typeof node.value === 'number' ||
        typeof node.value === 'boolean'
      ) {
        return node.value;
      }
      return NOT_HARDCODED;
    case AST_NODE_TYPES.TemplateLiteral:
      if (
        node.expressions.length === 0 &&
        node.quasis[0]?.value.cooked != null
      ) {
        return node.quasis[0].value.cooked;
      }
      return NOT_HARDCODED;
    case AST_NODE_TYPES.UnaryExpression:
      if (
        node.operator === '-' &&
        node.argument.type === AST_NODE_TYPES.Literal &&
        typeof node.argument.value === 'number'
      ) {
        return -node.argument.value;
      }
      return NOT_HARDCODED;
    default:
      return NOT_HARDCODED;
  }
}

function getJSXAttributeValue(
  attribute: TSESTree.JSXAttribute,
): HardcodedValue | typeof NOT_HARDCODED {
  if (attribute.value == null) {
    return true;
  }
  if (attribute.value.type === AST_NODE_TYPES.JSXExpressionContainer) {
    return getHardcodedValue(attribute.value.expression);
  }
  return getHardcodedValue(attribute.value);
}

function getPropertyName(property: TSESTree.Property): string | undefined {
  if (property.computed) {
    return undefined;
  }
  if (property.key.type === AST_NODE_TYPES.Identifier) {
    return property.key.name;
  }
  if (
    typeof property.key.value === 'string' ||
    typeof property.key.value === 'number'
  ) {
    return String(property.key.value);
  }
  return undefined;
}

function hasDefaults(defaults: FunctionDefaults): boolean {
  return defaults.positional.size > 0 || defaults.objectProperties.size > 0;
}

function hardcodedValuesAreEqual(
  actual: HardcodedValue | typeof NOT_HARDCODED,
  expected: HardcodedValue,
): boolean {
  return actual !== NOT_HARDCODED && Object.is(actual, expected);
}

function formatHardcodedValue(value: HardcodedValue): string {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

function contiguousRemovalRanges<T extends { range: TSESTree.Range }>(
  nodes: T[],
  indices: number[],
  rangeForRun: (
    first: T,
    last: T,
    next: T | undefined,
    previous: T | undefined,
  ) => TSESTree.Range,
): TSESTree.Range[] {
  const ranges: TSESTree.Range[] = [];
  for (const { start, end } of getContiguousRuns(indices)) {
    ranges.push(
      rangeForRun(nodes[start], nodes[end], nodes[end + 1], nodes[start - 1]),
    );
  }
  return ranges;
}

function getContiguousRuns(
  indices: number[],
): { end: number; start: number }[] {
  const runs: { end: number; start: number }[] = [];
  for (const index of indices) {
    const previous = runs.at(-1);
    if (previous?.end === index - 1) {
      previous.end = index;
    } else {
      runs.push({ start: index, end: index });
    }
  }
  return runs;
}
