import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import { createRule, getParserServices, nullThrows } from '../util';

const NOT_HARDCODED = Symbol('not hardcoded');

type HardcodedValue = bigint | boolean | number | string | null;

interface NamedDefault {
  name: string;
  value: HardcodedValue;
}

interface ParameterDefaults {
  positional: Map<number, NamedDefault>;
  properties: Map<number, Map<string, NamedDefault>>;
}

function getStaticLiteralValue(
  node: TSESTree.Node,
): HardcodedValue | typeof NOT_HARDCODED {
  switch (node.type) {
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
      return getStaticLiteralValue(node.expression);

    case AST_NODE_TYPES.Literal: {
      const { value } = node;
      if (value == null) {
        // A regex literal's value is null in environments that don't support
        // its flags; only a true `null` literal counts.
        return node.raw === 'null' ? null : NOT_HARDCODED;
      }
      if (typeof value === 'object') {
        // RegExp literal.
        return NOT_HARDCODED;
      }
      return value;
    }

    case AST_NODE_TYPES.TemplateLiteral: {
      if (node.expressions.length !== 0) {
        return NOT_HARDCODED;
      }
      const cooked = node.quasis[0].value.cooked;
      return cooked;
    }

    case AST_NODE_TYPES.UnaryExpression: {
      if (node.operator !== '-' && node.operator !== '+') {
        return NOT_HARDCODED;
      }
      const operand = getStaticLiteralValue(node.argument);
      if (typeof operand === 'number') {
        return node.operator === '-' ? -operand : operand;
      }
      if (typeof operand === 'bigint' && node.operator === '-') {
        return -operand;
      }
      return NOT_HARDCODED;
    }

    default:
      return NOT_HARDCODED;
  }
}

function unwrapTsExpression(node: ts.Expression): ts.Expression {
  if (
    ts.isAsExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isParenthesizedExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    return unwrapTsExpression(node.expression);
  }
  return node;
}

function getTsStaticLiteralValue(
  expression: ts.Expression,
): HardcodedValue | typeof NOT_HARDCODED {
  const node = unwrapTsExpression(expression);

  if (ts.isStringLiteralLike(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }
  if (ts.isBigIntLiteral(node)) {
    const text = node.text.replaceAll('_', '');
    return BigInt(text.endsWith('n') ? text.slice(0, -1) : text);
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
  if (ts.isPrefixUnaryExpression(node)) {
    const operand = getTsStaticLiteralValue(node.operand);
    if (typeof operand === 'number') {
      if (node.operator === ts.SyntaxKind.MinusToken) {
        return -operand;
      }
      if (node.operator === ts.SyntaxKind.PlusToken) {
        return operand;
      }
    }
    if (
      typeof operand === 'bigint' &&
      node.operator === ts.SyntaxKind.MinusToken
    ) {
      return -operand;
    }
  }
  return NOT_HARDCODED;
}

function getTsPropertyName(
  node: ts.BindingName | ts.PropertyName,
): string | undefined {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return String(Number(node.text));
  }
  return undefined;
}

function getTsObjectPatternDefaults(
  pattern: ts.ObjectBindingPattern,
): Map<string, NamedDefault> {
  const defaults = new Map<string, NamedDefault>();

  for (const element of pattern.elements) {
    if (element.dotDotDotToken || element.initializer == null) {
      continue;
    }

    const name = getTsPropertyName(element.propertyName ?? element.name);
    if (name == null) {
      continue;
    }

    const value = getTsStaticLiteralValue(element.initializer);
    if (value !== NOT_HARDCODED) {
      defaults.set(name, { name, value });
    }
  }

  return defaults;
}

type TrustedDeclaration =
  ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression;

function getParameterDefaults(
  declaration: TrustedDeclaration,
): ParameterDefaults {
  const defaults: ParameterDefaults = {
    positional: new Map(),
    properties: new Map(),
  };
  let parameterIndex = 0;

  for (const parameter of declaration.parameters) {
    if (ts.isIdentifier(parameter.name) && parameter.name.text === 'this') {
      continue;
    }

    if (ts.isIdentifier(parameter.name) && parameter.initializer != null) {
      const value = getTsStaticLiteralValue(parameter.initializer);
      if (value !== NOT_HARDCODED) {
        defaults.positional.set(parameterIndex, {
          name: parameter.name.text,
          value,
        });
      }
    } else if (ts.isObjectBindingPattern(parameter.name)) {
      const properties = getTsObjectPatternDefaults(parameter.name);
      if (properties.size > 0) {
        defaults.properties.set(parameterIndex, properties);
      }
    }

    parameterIndex++;
  }

  return defaults;
}

/**
 * A declaration's parameter defaults are only trusted when the value called at
 * runtime is guaranteed to be the declared function itself: a function
 * declaration, or a function expression assigned directly to a `const`
 * variable.
 */
function isTrustedFunctionDeclaration(
  declaration: ts.JSDocSignature | ts.SignatureDeclaration,
): declaration is TrustedDeclaration {
  if (ts.isFunctionDeclaration(declaration)) {
    return declaration.body != null;
  }

  if (
    !ts.isArrowFunction(declaration) &&
    !ts.isFunctionExpression(declaration)
  ) {
    return false;
  }

  let node: ts.Node = declaration;
  while (
    ts.isParenthesizedExpression(node.parent) ||
    ts.isAsExpression(node.parent) ||
    ts.isSatisfiesExpression(node.parent) ||
    ts.isNonNullExpression(node.parent) ||
    ts.isTypeAssertionExpression(node.parent)
  ) {
    node = node.parent;
  }

  return (
    ts.isVariableDeclaration(node.parent) &&
    node.parent.initializer === node &&
    (ts.getCombinedNodeFlags(node.parent) & ts.NodeFlags.Const) !== 0
  );
}

function getPropertyName(property: TSESTree.Property): string | undefined {
  if (property.computed) {
    return undefined;
  }
  if (property.key.type === AST_NODE_TYPES.Identifier) {
    return property.key.name;
  }
  return String(property.key.value);
}

function formatValue(value: HardcodedValue): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'bigint') {
    return `${value}n`;
  }
  if (Object.is(value, -0)) {
    return '-0';
  }
  return String(value);
}

export default createRule({
  name: 'no-redundant-default-arguments',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow explicitly passing arguments that are equal to their parameter default value',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      redundantDefault:
        'Explicitly passing the default value ({{value}}) of `{{name}}` is redundant.',
      removeArguments: 'Remove the redundant trailing arguments.',
      removeAttribute: 'Remove the redundant attribute.',
      removeProperty: 'Remove the redundant property.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isStableIdentifier(
      identifier: TSESTree.Identifier | TSESTree.JSXIdentifier,
    ): boolean {
      const variable = ASTUtils.findVariable(
        context.sourceCode.getScope(identifier),
        identifier.name,
      );
      return (
        variable != null &&
        variable.defs.length > 0 &&
        !variable.references.some(
          reference => reference.isWrite() && !reference.init,
        )
      );
    }

    function getCallLikeDefaults(
      node: TSESTree.CallExpression | TSESTree.JSXOpeningElement,
    ): ParameterDefaults | undefined {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      const declaration = checker.getResolvedSignature(tsNode)?.declaration;
      if (declaration == null || !isTrustedFunctionDeclaration(declaration)) {
        return undefined;
      }

      return getParameterDefaults(declaration);
    }

    function hasCommentInRange(range: TSESTree.Range): boolean {
      return context.sourceCode
        .getAllComments()
        .some(
          comment =>
            comment.range[0] >= range[0] && comment.range[1] <= range[1],
        );
    }

    /**
     * Computes the source range that removes all arguments from `firstIndex`
     * through the end of the argument list, or `undefined` when the removal
     * cannot be done safely.
     */
    function getTrailingArgumentsRemovalRange(
      node: TSESTree.CallExpression,
      firstIndex: number,
    ): TSESTree.Range | undefined {
      const closingParen = nullThrows(
        context.sourceCode.getLastToken(node),
        'Call expressions always end with a closing parenthesis.',
      );

      let start: number;
      if (firstIndex === 0) {
        // Walk left over any parentheses wrapping the first argument to find
        // the call expression's own opening parenthesis.
        let openingParen: TSESTree.Token | undefined;
        let token = context.sourceCode.getTokenBefore(
          nullThrows(
            context.sourceCode.getFirstToken(node.arguments[0]),
            'Arguments always contain at least one token.',
          ),
        );
        while (token != null && ASTUtils.isOpeningParenToken(token)) {
          openingParen = token;
          token = context.sourceCode.getTokenBefore(token);
        }
        start = nullThrows(
          openingParen,
          'The first argument is always preceded by the opening parenthesis.',
        ).range[1];
      } else {
        // Walk right over any parentheses wrapping the previous argument to
        // find the comma that separates it from the removed arguments.
        let token = context.sourceCode.getTokenAfter(
          node.arguments[firstIndex - 1],
        );
        while (token != null && ASTUtils.isClosingParenToken(token)) {
          token = context.sourceCode.getTokenAfter(token);
        }
        const comma = nullThrows(
          token != null && ASTUtils.isCommaToken(token) ? token : undefined,
          'Arguments are always separated by a comma.',
        );
        start = nullThrows(
          context.sourceCode.getTokenBefore(comma),
          'A comma token always has a preceding token.',
        ).range[1];
      }

      const range: TSESTree.Range = [start, closingParen.range[0]];
      if (hasCommentInRange(range)) {
        return undefined;
      }
      return range;
    }

    function getPropertyRemovalRange(
      property: TSESTree.Property,
    ): TSESTree.Range | undefined {
      const tokenBefore = nullThrows(
        context.sourceCode.getTokenBefore(property),
        'Object properties always have a preceding token.',
      );
      const tokenAfter = nullThrows(
        context.sourceCode.getTokenAfter(property),
        'Object properties always have a following token.',
      );

      let range: TSESTree.Range;
      if (ASTUtils.isCommaToken(tokenAfter)) {
        const tokenAfterComma = nullThrows(
          context.sourceCode.getTokenAfter(tokenAfter),
          'A comma inside an object literal always has a following token.',
        );
        range = [property.range[0], tokenAfterComma.range[0]];
      } else if (ASTUtils.isCommaToken(tokenBefore)) {
        range = [tokenBefore.range[0], property.range[1]];
      } else {
        range = [tokenBefore.range[1], tokenAfter.range[0]];
      }
      if (hasCommentInRange(range)) {
        return undefined;
      }
      return range;
    }

    function getAttributeRemovalRange(
      attribute: TSESTree.JSXAttribute,
    ): TSESTree.Range | undefined {
      const tokenBefore = nullThrows(
        context.sourceCode.getTokenBefore(attribute),
        'JSX attributes always have a preceding token.',
      );

      const range: TSESTree.Range = [tokenBefore.range[1], attribute.range[1]];
      if (hasCommentInRange(range)) {
        return undefined;
      }
      return range;
    }

    function report(
      node: TSESTree.Node,
      defaultValue: NamedDefault,
      suggestionMessageId:
        'removeArguments' | 'removeAttribute' | 'removeProperty',
      removalRange: TSESTree.Range | undefined,
    ): void {
      context.report({
        node,
        messageId: 'redundantDefault',
        data: {
          name: defaultValue.name,
          value: formatValue(defaultValue.value),
        },
        suggest:
          removalRange == null
            ? null
            : [
                {
                  messageId: suggestionMessageId,
                  fix: fixer => fixer.removeRange(removalRange),
                },
              ],
      });
    }

    function checkObjectArgument(
      node: TSESTree.ObjectExpression,
      defaults: Map<string, NamedDefault>,
    ): void {
      if (
        node.properties.some(
          property => property.type === AST_NODE_TYPES.SpreadElement,
        )
      ) {
        return;
      }

      const seen = new Set<string>();
      // Iterate from the end so that only the last occurrence of a duplicate
      // property name - the one that wins at runtime - is considered.
      for (let index = node.properties.length - 1; index >= 0; index--) {
        const property = node.properties[index];
        if (
          property.type !== AST_NODE_TYPES.Property ||
          property.kind !== 'init'
        ) {
          continue;
        }

        const name = getPropertyName(property);
        if (name == null || seen.has(name)) {
          continue;
        }
        seen.add(name);

        const defaultValue = defaults.get(name);
        if (defaultValue == null) {
          continue;
        }

        const value = getStaticLiteralValue(property.value);
        if (value !== NOT_HARDCODED && Object.is(value, defaultValue.value)) {
          report(
            property,
            defaultValue,
            'removeProperty',
            getPropertyRemovalRange(property),
          );
        }
      }
    }

    function checkCallArguments(
      node: TSESTree.CallExpression,
      defaults: ParameterDefaults,
    ): void {
      const firstSpreadIndex = node.arguments.findIndex(
        argument => argument.type === AST_NODE_TYPES.SpreadElement,
      );

      if (firstSpreadIndex === -1) {
        // Only a trailing run of redundant arguments is reported: removing an
        // earlier argument would shift the position of later ones.
        let firstRedundantIndex = node.arguments.length;
        for (let index = node.arguments.length - 1; index >= 0; index--) {
          const defaultValue = defaults.positional.get(index);
          if (defaultValue == null) {
            break;
          }
          const value = getStaticLiteralValue(node.arguments[index]);
          if (
            value === NOT_HARDCODED ||
            !Object.is(value, defaultValue.value)
          ) {
            break;
          }
          firstRedundantIndex = index;
        }

        if (firstRedundantIndex < node.arguments.length) {
          const removalRange = getTrailingArgumentsRemovalRange(
            node,
            firstRedundantIndex,
          );
          for (
            let index = firstRedundantIndex;
            index < node.arguments.length;
            index++
          ) {
            report(
              node.arguments[index],
              nullThrows(
                defaults.positional.get(index),
                'Indices in the trailing run always have a default.',
              ),
              'removeArguments',
              removalRange,
            );
          }
        }
      }

      // Arguments after a spread element are not necessarily aligned with the
      // parameter at the same index.
      const alignedArgumentCount =
        firstSpreadIndex === -1 ? node.arguments.length : firstSpreadIndex;
      for (let index = 0; index < alignedArgumentCount; index++) {
        const argument = node.arguments[index];
        const propertyDefaults = defaults.properties.get(index);
        if (
          propertyDefaults != null &&
          argument.type === AST_NODE_TYPES.ObjectExpression
        ) {
          checkObjectArgument(argument, propertyDefaults);
        }
      }
    }

    function checkJsxAttributes(
      node: TSESTree.JSXOpeningElement,
      defaults: Map<string, NamedDefault>,
    ): void {
      if (
        node.attributes.some(
          attribute => attribute.type === AST_NODE_TYPES.JSXSpreadAttribute,
        )
      ) {
        return;
      }

      const seen = new Set<string>();
      // Iterate from the end so that only the last occurrence of a duplicate
      // attribute name - the one that wins at runtime - is considered.
      for (let index = node.attributes.length - 1; index >= 0; index--) {
        const attribute = node.attributes[index];
        if (
          attribute.type !== AST_NODE_TYPES.JSXAttribute ||
          attribute.name.type !== AST_NODE_TYPES.JSXIdentifier
        ) {
          continue;
        }

        const name = attribute.name.name;
        if (seen.has(name)) {
          continue;
        }
        seen.add(name);

        const defaultValue = defaults.get(name);
        if (defaultValue == null) {
          continue;
        }

        let value: HardcodedValue | typeof NOT_HARDCODED;
        if (attribute.value == null) {
          // A shorthand attribute (`<Component enabled />`) passes `true`.
          value = true;
        } else if (
          attribute.value.type === AST_NODE_TYPES.JSXExpressionContainer
        ) {
          value =
            attribute.value.expression.type ===
            AST_NODE_TYPES.JSXEmptyExpression
              ? NOT_HARDCODED
              : getStaticLiteralValue(attribute.value.expression);
        } else if (attribute.value.type === AST_NODE_TYPES.Literal) {
          value = getStaticLiteralValue(attribute.value);
        } else {
          value = NOT_HARDCODED;
        }

        if (value !== NOT_HARDCODED && Object.is(value, defaultValue.value)) {
          report(
            attribute,
            defaultValue,
            'removeAttribute',
            getAttributeRemovalRange(attribute),
          );
        }
      }
    }

    return {
      CallExpression(node): void {
        if (
          node.callee.type !== AST_NODE_TYPES.Identifier ||
          !isStableIdentifier(node.callee)
        ) {
          return;
        }

        const defaults = getCallLikeDefaults(node);
        if (defaults != null) {
          checkCallArguments(node, defaults);
        }
      },

      JSXOpeningElement(node): void {
        if (
          node.name.type !== AST_NODE_TYPES.JSXIdentifier ||
          node.name.name[0] !== node.name.name[0].toUpperCase() ||
          !isStableIdentifier(node.name)
        ) {
          return;
        }

        const propertyDefaults = getCallLikeDefaults(node)?.properties.get(0);
        if (propertyDefaults != null) {
          checkJsxAttributes(node, propertyDefaults);
        }
      },
    };
  },
});
