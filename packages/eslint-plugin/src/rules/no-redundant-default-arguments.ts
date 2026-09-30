import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isCommaToken,
  nullThrows,
  NullThrowsReasons,
} from '../util';

type MessageIds =
  | 'redundantArguments'
  | 'redundantProperty'
  | 'removeArguments'
  | 'removeProperty';

// Omitting these own properties exposes an inherited value instead of the default.
const inheritedPropertyNames = new Set([
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
  '__proto__',
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf',
]);

function unwrapParentheses(node: ts.Node): ts.Node {
  while (ts.isParenthesizedExpression(node)) {
    node = node.expression;
  }
  return node;
}

function readPrimitive(
  node: ts.Node | undefined,
): { value: bigint | boolean | number | string | null } | undefined {
  if (!node) {
    return undefined;
  }
  node = unwrapParentheses(node);
  if (
    ts.isAsExpression(node) &&
    ts.isTypeReferenceNode(node.type) &&
    ts.isIdentifier(node.type.typeName) &&
    node.type.typeName.text === 'const'
  ) {
    return readPrimitive(node.expression);
  }
  if (ts.isNumericLiteral(node)) {
    return { value: Number(node.text) };
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return { value: node.text };
  }
  if (ts.isBigIntLiteral(node)) {
    return { value: BigInt(node.text.replaceAll('_', '').slice(0, -1)) };
  }
  if (
    node.kind === ts.SyntaxKind.TrueKeyword ||
    node.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return { value: node.kind === ts.SyntaxKind.TrueKeyword };
  }
  if (node.kind === ts.SyntaxKind.NullKeyword) {
    return { value: null };
  }
  if (ts.isPrefixUnaryExpression(node)) {
    const operand = readPrimitive(node.operand);
    if (
      operand &&
      (typeof operand.value === 'number' || typeof operand.value === 'bigint')
    ) {
      if (node.operator === ts.SyntaxKind.MinusToken) {
        return { value: -operand.value };
      }
      if (
        node.operator === ts.SyntaxKind.PlusToken &&
        typeof operand.value === 'number'
      ) {
        return operand;
      }
    }
  }
  return undefined;
}

function observesArguments(node: ts.Node): boolean {
  return (
    (ts.isIdentifier(node) &&
      (node.text === 'arguments' || node.text === 'eval')) ||
    !!ts.forEachChild(node, child => observesArguments(child) || undefined)
  );
}

function propertyName(node: ts.Node) {
  return ts.isIdentifier(node) || ts.isStringLiteral(node)
    ? node.text
    : undefined;
}

function readProperties(parameter: ts.ParameterDeclaration) {
  if (!ts.isObjectBindingPattern(parameter.name)) {
    return undefined;
  }
  const properties = new Map<string, ReturnType<typeof readPrimitive>>();
  for (const binding of parameter.name.elements) {
    const name = propertyName(binding.propertyName ?? binding.name);
    if (
      name == null ||
      inheritedPropertyNames.has(name) ||
      binding.dotDotDotToken ||
      !ts.isIdentifier(binding.name) ||
      properties.has(name)
    ) {
      return undefined;
    }
    properties.set(name, readPrimitive(binding.initializer));
  }
  return properties;
}

export default createRule<[], MessageIds>({
  name: 'no-redundant-default-arguments',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow arguments that match their declared default values',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      redundantArguments:
        'These trailing arguments match their declared default values.',
      redundantProperty:
        "Property '{{name}}' matches its declared default value.",
      removeArguments: 'Remove the matching trailing arguments.',
      removeProperty: "Remove property '{{name}}'.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const defaults = new WeakMap<
      ts.SignatureDeclaration,
      {
        parameters: {
          declaration: ts.ParameterDeclaration;
          value: ReturnType<typeof readPrimitive>;
          properties: ReturnType<typeof readProperties>;
        }[];
        minimumArguments: number;
        restIndex: number;
      } | null
    >();
    const writes = new WeakMap<ts.Symbol, boolean>();
    const genericContexts = new WeakMap<ts.Node, boolean>();
    const parameterTypes = new WeakMap<ts.ParameterDeclaration, ts.Type>();
    const optionalPropertyTypes = new WeakMap<
      ts.ParameterDeclaration,
      Map<string, ts.Type | null>
    >();

    function inGenericContext(node: ts.Node): boolean {
      const cached = genericContexts.get(node);
      if (cached != null) {
        return cached;
      }
      const generic =
        !!(
          (ts.isFunctionLike(node) || ts.isClassLike(node)) &&
          node.typeParameters?.length
        ) ||
        (!ts.isSourceFile(node) && inGenericContext(node.parent));
      genericContexts.set(node, generic);
      return generic;
    }

    function getArgumentProperties(argument: TSESTree.ObjectExpression) {
      const properties = new Map<string, TSESTree.Property>();
      for (const property of argument.properties) {
        if (
          property.type !== AST_NODE_TYPES.Property ||
          property.computed ||
          property.method ||
          property.shorthand ||
          property.kind !== 'init'
        ) {
          return undefined;
        }
        const name = propertyName(
          services.esTreeNodeToTSNodeMap.get(property.key),
        );
        if (
          name == null ||
          inheritedPropertyNames.has(name) ||
          properties.has(name)
        ) {
          return undefined;
        }
        properties.set(name, property);
      }
      return properties;
    }

    function getParameterType(parameter: ts.ParameterDeclaration) {
      let type = parameterTypes.get(parameter);
      if (!type) {
        type = checker.getTypeAtLocation(parameter);
        parameterTypes.set(parameter, type);
      }
      return type;
    }

    function getOptionalPropertyType(
      parameter: ts.ParameterDeclaration,
      name: string,
    ) {
      let properties = optionalPropertyTypes.get(parameter);
      if (!properties) {
        properties = new Map();
        optionalPropertyTypes.set(parameter, properties);
      }
      if (!properties.has(name)) {
        const type = getParameterType(parameter);
        const symbol = tsutils.isTypeFlagSet(type, ts.TypeFlags.Object)
          ? checker.getPropertyOfType(type, name)
          : undefined;
        properties.set(
          name,
          symbol && tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Optional)
            ? checker.getTypeOfSymbolAtLocation(symbol, parameter)
            : null,
        );
      }
      return properties.get(name);
    }

    function getDefaults(declaration: ts.SignatureDeclaration) {
      if (!defaults.has(declaration)) {
        if (
          !(
            ts.isFunctionDeclaration(declaration) ||
            ts.isFunctionExpression(declaration) ||
            ts.isArrowFunction(declaration)
          ) ||
          !declaration.body ||
          inGenericContext(declaration) ||
          observesArguments(declaration)
        ) {
          defaults.set(declaration, null);
        } else {
          const runtimeParameters = declaration.parameters.filter(
            parameter =>
              !(
                ts.isIdentifier(parameter.name) &&
                parameter.name.text === 'this'
              ),
          );
          let minimumArguments = 0;
          const parameters = runtimeParameters.map((parameter, index) => {
            if (
              !parameter.initializer &&
              !parameter.questionToken &&
              !parameter.dotDotDotToken
            ) {
              minimumArguments = index + 1;
            }
            return {
              declaration: parameter,
              properties: readProperties(parameter),
              value: readPrimitive(parameter.initializer),
            };
          });
          defaults.set(declaration, {
            minimumArguments,
            parameters,
            restIndex: runtimeParameters.findIndex(
              parameter => !!parameter.dotDotDotToken,
            ),
          });
        }
      }
      return defaults.get(declaration);
    }

    function getDeclaration(
      node: TSESTree.CallExpression | TSESTree.JSXOpeningElement,
      calleeNode: TSESTree.Node,
    ) {
      const declaration = checker
        .getResolvedSignature(services.esTreeNodeToTSNodeMap.get(node))
        ?.getDeclaration();
      const callee = unwrapParentheses(
        services.esTreeNodeToTSNodeMap.get(calleeNode),
      );
      if (!declaration) {
        return;
      }
      if (ts.isIdentifier(callee)) {
        let symbol = checker.getSymbolAtLocation(callee);
        if (symbol) {
          if (!writes.has(symbol)) {
            const variable = ASTUtils.findVariable(
              context.sourceCode.getScope(node),
              callee.text,
            );
            writes.set(
              symbol,
              variable?.references.some(
                reference => reference.isWrite() && !reference.init,
              ) ?? false,
            );
          }
          if (writes.get(symbol)) {
            return;
          }
        }
        if (symbol && tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)) {
          if (
            declaration.getSourceFile() === callee.getSourceFile() ||
            !symbol
              .getDeclarations()
              ?.every(
                declaration =>
                  ts.isImportSpecifier(declaration) ||
                  ts.isImportClause(declaration),
              )
          ) {
            return;
          }
          symbol = checker.getAliasedSymbol(symbol);
        }
        const binding = symbol?.valueDeclaration;
        if (
          binding !== declaration &&
          (!binding ||
            !ts.isVariableDeclaration(binding) ||
            binding.type ||
            !binding.initializer ||
            unwrapParentheses(binding.initializer) !== declaration ||
            !(binding.parent.flags & ts.NodeFlags.Const))
        ) {
          return;
        }
      } else if (callee !== declaration) {
        return;
      }
      return declaration;
    }

    return {
      CallExpression(node) {
        if (
          !node.arguments.length ||
          node.optional ||
          (node.callee.type !== AST_NODE_TYPES.Identifier &&
            node.callee.type !== AST_NODE_TYPES.FunctionExpression &&
            node.callee.type !== AST_NODE_TYPES.ArrowFunctionExpression)
        ) {
          return;
        }
        const argumentValues = node.arguments.map(argument =>
          readPrimitive(services.esTreeNodeToTSNodeMap.get(argument)),
        );
        if (
          argumentValues.at(-1) == null &&
          !node.arguments.some(
            argument => argument.type === AST_NODE_TYPES.ObjectExpression,
          )
        ) {
          return;
        }
        const declaration = getDeclaration(node, node.callee);
        if (!declaration) {
          return;
        }
        const metadata = getDefaults(declaration);
        const spreadIndex = node.arguments.findIndex(
          argument => argument.type === AST_NODE_TYPES.SpreadElement,
        );
        if (
          !metadata ||
          node.arguments.length < metadata.minimumArguments ||
          (metadata.restIndex === -1 &&
            (spreadIndex !== -1 ||
              node.arguments.length > metadata.parameters.length)) ||
          (spreadIndex !== -1 && spreadIndex < metadata.restIndex)
        ) {
          return;
        }
        const { parameters } = metadata;
        for (const [index, argument] of node.arguments.entries()) {
          if (index === metadata.restIndex || index === spreadIndex) {
            break;
          }
          const parameter = parameters[index].declaration;
          if (
            argument.type !== AST_NODE_TYPES.ObjectExpression ||
            !parameters[index].properties
          ) {
            continue;
          }
          const properties = getArgumentProperties(argument);
          if (!properties) {
            continue;
          }
          for (const [name, property] of properties) {
            const initializer = parameters[index].properties.get(name);
            const value = readPrimitive(
              services.esTreeNodeToTSNodeMap.get(property.value),
            );
            if (
              !initializer ||
              !value ||
              !Object.is(initializer.value, value.value)
            ) {
              continue;
            }
            const type = getOptionalPropertyType(parameter, name);
            if (
              !type ||
              !checker.isTypeAssignableTo(
                services.getTypeAtLocation(property.value),
                type,
              )
            ) {
              continue;
            }
            let start = nullThrows(
              context.sourceCode.getFirstToken(property),
              NullThrowsReasons.MissingToken('property', 'object'),
            );
            let end = nullThrows(
              context.sourceCode.getLastToken(property),
              NullThrowsReasons.MissingToken('property', 'object'),
            );
            const after = context.sourceCode.getTokenAfter(property);
            const before = context.sourceCode.getTokenBefore(property);
            if (after && isCommaToken(after)) {
              end = after;
            } else if (before && isCommaToken(before)) {
              start = before;
            }
            context.report({
              node: property,
              messageId: 'redundantProperty',
              data: { name },
              suggest: context.sourceCode.commentsExistBetween(start, end)
                ? []
                : [
                    {
                      messageId: 'removeProperty',
                      data: { name },
                      fix: fixer =>
                        fixer.removeRange([start.range[0], end.range[1]]),
                    },
                  ],
            });
          }
        }
        if (metadata.restIndex !== -1 || spreadIndex !== -1) {
          return;
        }
        let first = node.arguments.length;
        while (first > 0) {
          const initializer = parameters[first - 1]?.value;
          const expression = argumentValues[first - 1];
          if (
            !initializer ||
            !expression ||
            !Object.is(initializer.value, expression.value) ||
            !checker.isTypeAssignableTo(
              services.getTypeAtLocation(node.arguments[first - 1]),
              getParameterType(parameters[first - 1].declaration),
            )
          ) {
            break;
          }
          first--;
        }
        if (first === node.arguments.length) {
          return;
        }
        const argument = node.arguments[first];
        const last = node.arguments[node.arguments.length - 1];
        const call = services.esTreeNodeToTSNodeMap.get(node);
        const firstToken = nullThrows(
          context.sourceCode.getTokenByRangeStart(
            call.arguments[first].getStart(),
          ),
          NullThrowsReasons.MissingToken('argument', 'call'),
        );
        const start =
          first === 0
            ? firstToken
            : nullThrows(
                context.sourceCode.getTokenBefore(firstToken),
                NullThrowsReasons.MissingToken(',', 'argument'),
              );
        const closing = nullThrows(
          context.sourceCode.getLastToken(node),
          NullThrowsReasons.MissingToken(')', 'call'),
        );
        const end = nullThrows(
          context.sourceCode.getTokenBefore(closing),
          NullThrowsReasons.MissingToken('argument', 'call'),
        );
        context.report({
          loc: { start: argument.loc.start, end: last.loc.end },
          messageId: 'redundantArguments',
          suggest: context.sourceCode.commentsExistBetween(start, end)
            ? []
            : [
                {
                  messageId: 'removeArguments',
                  fix: fixer =>
                    fixer.removeRange([start.range[0], end.range[1]]),
                },
              ],
        });
      },
      JSXOpeningElement(node) {
        if (
          node.name.type !== AST_NODE_TYPES.JSXIdentifier ||
          !/^[A-Z]/u.test(node.name.name) ||
          !node.attributes.length
        ) {
          return;
        }
        const attributes = new Map<string, TSESTree.JSXAttribute>();
        for (const attribute of node.attributes) {
          if (
            attribute.type !== AST_NODE_TYPES.JSXAttribute ||
            attribute.name.type !== AST_NODE_TYPES.JSXIdentifier ||
            attributes.has(attribute.name.name)
          ) {
            return;
          }
          attributes.set(attribute.name.name, attribute);
        }
        const declaration = getDeclaration(node, node.name);
        if (!declaration) {
          return;
        }
        const metadata = getDefaults(declaration);
        if (metadata?.parameters.length !== 1) {
          return;
        }
        const parameter = metadata.parameters[0];
        if (!parameter.properties) {
          return;
        }
        for (const [name, attribute] of attributes) {
          if (name === 'key' || name === 'ref' || name === 'children') {
            continue;
          }
          const initializer = parameter.properties.get(name);
          const expression =
            attribute.value?.type === AST_NODE_TYPES.JSXExpressionContainer
              ? attribute.value.expression
              : attribute.value;
          const value = !expression
            ? { value: true }
            : expression.type === AST_NODE_TYPES.Literal &&
                typeof expression.value === 'string'
              ? { value: expression.value }
              : readPrimitive(services.esTreeNodeToTSNodeMap.get(expression));
          if (
            !initializer ||
            !value ||
            !Object.is(initializer.value, value.value)
          ) {
            continue;
          }
          const type = getOptionalPropertyType(parameter.declaration, name);
          if (
            !type ||
            !checker.isTypeAssignableTo(
              expression
                ? services.getTypeAtLocation(expression)
                : checker.getTrueType(),
              type,
            )
          ) {
            continue;
          }
          if (
            checker.getPropertyOfType(
              services.getTypeAtLocation(node.name),
              'defaultProps',
            )
          ) {
            return;
          }
          const start = nullThrows(
            context.sourceCode.getFirstToken(attribute),
            NullThrowsReasons.MissingToken('attribute', 'JSX element'),
          );
          const end = nullThrows(
            context.sourceCode.getLastToken(attribute),
            NullThrowsReasons.MissingToken('attribute', 'JSX element'),
          );
          context.report({
            node: attribute,
            messageId: 'redundantProperty',
            data: { name },
            suggest: context.sourceCode.commentsExistBetween(start, end)
              ? []
              : [
                  {
                    messageId: 'removeProperty',
                    data: { name },
                    fix: fixer => fixer.remove(attribute),
                  },
                ],
          });
        }
      },
    };
  },
});
