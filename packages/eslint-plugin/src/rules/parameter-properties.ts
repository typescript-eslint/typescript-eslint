import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type Modifier =
  | 'readonly'
  | 'private'
  | 'protected'
  | 'public'
  | 'private readonly'
  | 'protected readonly'
  | 'public readonly';

type Prefer = 'class-property' | 'parameter-property';

type Options = [
  {
    allow?: Modifier[];
    prefer?: Prefer;
  },
];

type MessageIds = 'preferClassProperty' | 'preferParameterProperty';

export default util.createRule<Options, MessageIds>({
  name: 'parameter-properties',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require or disallow parameter properties in class constructors',
    },
    messages: {
      preferClassProperty:
        'Property {{parameter}} should be declared as a class property.',
      preferParameterProperty:
        'Property {{parameter}} should be declared as a parameter property.',
    },
    schema: {
      $defs: {
        modifier: {
          enum: [
            'readonly',
            'private',
            'protected',
            'public',
            'private readonly',
            'protected readonly',
            'public readonly',
          ],
        },
      },
      prefixItems: [
        {
          type: 'object',
          properties: {
            allow: {
              type: 'array',
              items: {
                $ref: '#/$defs/modifier',
              },
              minItems: 1,
            },
            prefer: {
              enum: ['class-property', 'parameter-property'],
            },
          },
          additionalProperties: false,
        },
      ],
      type: 'array',
    },
  },
  defaultOptions: [
    {
      allow: [],
      prefer: 'class-property',
    },
  ],
  create(context, [{ allow = [], prefer = 'class-property' }]) {
    /**
     * Gets the modifiers of `node`.
     * @param node the node to be inspected.
     */
    function getModifiers(
      node: TSESTree.PropertyDefinition | TSESTree.TSParameterProperty,
    ): Modifier {
      const modifiers: Modifier[] = [];

      if (node.accessibility) {
        modifiers.push(node.accessibility);
      }
      if (node.readonly) {
        modifiers.push('readonly');
      }

      return modifiers.filter(Boolean).join(' ') as Modifier;
    }

    if (prefer === 'class-property') {
      return {
        TSParameterProperty(node): void {
          const modifiers = getModifiers(node);

          if (!allow.includes(modifiers)) {
            // HAS to be an identifier or assignment or TSC will throw
            if (
              node.parameter.type !== AST_NODE_TYPES.Identifier &&
              node.parameter.type !== AST_NODE_TYPES.AssignmentPattern
            ) {
              return;
            }

            const name =
              node.parameter.type === AST_NODE_TYPES.Identifier
                ? node.parameter.name
                : // has to be an Identifier or TSC will throw an error
                  (node.parameter.left as TSESTree.Identifier).name;

            context.report({
              node,
              messageId: 'preferClassProperty',
              data: {
                parameter: name,
              },
            });
          }
        },
      };
    }

    interface PropertyNodes {
      classProperty?: TSESTree.PropertyDefinition;
      constructorAssignment?: TSESTree.AssignmentExpression;
      constructorParameter?: TSESTree.Identifier;
    }

    const propertyNodesByNameStack: Map<string, PropertyNodes>[] = [];

    function getNodesByName(name: string): PropertyNodes {
      const propertyNodesByName =
        propertyNodesByNameStack[propertyNodesByNameStack.length - 1];
      const existing = propertyNodesByName.get(name);
      if (existing) {
        return existing;
      }

      const created: PropertyNodes = {};
      propertyNodesByName.set(name, created);
      return created;
    }

    const sourceCode = context.getSourceCode();

    function typeAnnotationsMatch(
      classProperty: TSESTree.PropertyDefinition,
      constructorParameter: TSESTree.Identifier,
    ): boolean {
      if (
        !classProperty.typeAnnotation ||
        !constructorParameter.typeAnnotation
      ) {
        return (
          classProperty.typeAnnotation === constructorParameter.typeAnnotation
        );
      }

      return (
        sourceCode.getText(classProperty.typeAnnotation) ===
        sourceCode.getText(constructorParameter.typeAnnotation)
      );
    }

    return {
      'ClassDeclaration, ClassExpression'(): void {
        propertyNodesByNameStack.push(new Map());
      },

      ':matches(ClassDeclaration, ClassExpression):exit'(): void {
        const propertyNodesByName = propertyNodesByNameStack.pop()!;

        for (const [name, nodes] of propertyNodesByName) {
          if (
            nodes.classProperty &&
            nodes.constructorAssignment &&
            nodes.constructorParameter &&
            typeAnnotationsMatch(
              nodes.classProperty,
              nodes.constructorParameter,
            )
          ) {
            context.report({
              data: {
                parameter: name,
              },
              messageId: 'preferParameterProperty',
              node: nodes.classProperty,
            });
          }
        }
      },

      ClassBody(node): void {
        for (const element of node.body) {
          if (
            element.type === AST_NODE_TYPES.PropertyDefinition &&
            element.key.type === AST_NODE_TYPES.Identifier &&
            !element.value &&
            !allow.includes(getModifiers(element))
          ) {
            getNodesByName(element.key.name).classProperty = element;
          }
        }
      },

      'MethodDefinition[kind="constructor"]'(
        node: TSESTree.MethodDefinition,
      ): void {
        for (const parameter of node.value.params) {
          if (parameter.type === AST_NODE_TYPES.Identifier) {
            getNodesByName(parameter.name).constructorParameter = parameter;
          }
        }

        for (const statement of node.value.body?.body ?? []) {
          if (
            statement.type !== AST_NODE_TYPES.ExpressionStatement ||
            statement.expression.type !== AST_NODE_TYPES.AssignmentExpression ||
            statement.expression.left.type !==
              AST_NODE_TYPES.MemberExpression ||
            statement.expression.left.object.type !==
              AST_NODE_TYPES.ThisExpression ||
            statement.expression.left.property.type !==
              AST_NODE_TYPES.Identifier ||
            statement.expression.right.type !== AST_NODE_TYPES.Identifier
          ) {
            break;
          }

          getNodesByName(
            statement.expression.right.name,
          ).constructorAssignment = statement.expression;
        }
      },
    };
  },
});
