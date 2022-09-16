import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type AccessibilityLevel =
  | 'explicit' // require an accessor (including public)
  | 'no-public' // don't require public
  | 'off'; // don't check

interface Config {
  accessibility?: AccessibilityLevel;
  ignoredMethodNames?: string[];
  overrides?: {
    accessors?: AccessibilityLevel;
    constructors?: AccessibilityLevel;
    methods?: AccessibilityLevel;
    properties?: AccessibilityLevel;
    parameterProperties?: AccessibilityLevel;
  };
}

type Options = [Config];

type MessageIds =
  | 'unwantedPublicAccessibility'
  | 'missingAccessibility'
  | 'addExplicitAccessibility';

const accessibilityLevel = {
  oneOf: [
    {
      const: 'explicit',
      description: 'Always require an accessor.',
    },
    {
      const: 'no-public',
      description: 'Require an accessor except when public.',
    },
    {
      const: 'off',
      description: 'Never check whether there is an accessor.',
    },
  ],
};

export default util.createRule<Options, MessageIds>({
  name: 'explicit-member-accessibility',
  meta: {
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description:
        'Require explicit accessibility modifiers on class properties and methods',
      // too opinionated to be recommended
      recommended: false,
    },
    fixable: 'code',
    messages: {
      missingAccessibility:
        'Missing accessibility modifier on {{type}} {{name}}.',
      unwantedPublicAccessibility:
        'Public accessibility modifier on {{type}} {{name}}.',
      addExplicitAccessibility: "Add '{{ type }}' accessibility modifier",
    },
    schema: {
      $defs: {
        accessibilityLevel,
      },
      prefixItems: [
        {
          type: 'object',
          properties: {
            accessibility: { $ref: '#/$defs/accessibilityLevel' },
            overrides: {
              type: 'object',
              properties: {
                accessors: { $ref: '#/$defs/accessibilityLevel' },
                constructors: { $ref: '#/$defs/accessibilityLevel' },
                methods: { $ref: '#/$defs/accessibilityLevel' },
                properties: { $ref: '#/$defs/accessibilityLevel' },
                parameterProperties: {
                  $ref: '#/$defs/accessibilityLevel',
                },
              },

              additionalProperties: false,
            },
            ignoredMethodNames: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          additionalProperties: false,
        },
      ],
      type: 'array',
    },
  },
  defaultOptions: [{ accessibility: 'explicit' }],
  create(context, [option]) {
    const sourceCode = context.getSourceCode();
    const baseCheck: AccessibilityLevel = option.accessibility ?? 'explicit';
    const overrides = option.overrides ?? {};
    const ctorCheck = overrides.constructors ?? baseCheck;
    const accessorCheck = overrides.accessors ?? baseCheck;
    const methodCheck = overrides.methods ?? baseCheck;
    const propCheck = overrides.properties ?? baseCheck;
    const paramPropCheck = overrides.parameterProperties ?? baseCheck;
    const ignoredMethodNames = new Set(option.ignoredMethodNames ?? []);

    /**
     * Checks if a method declaration has an accessibility modifier.
     * @param methodDefinition The node representing a MethodDefinition.
     */
    function checkMethodAccessibilityModifier(
      methodDefinition: TSESTree.MethodDefinition,
    ): void {
      if (methodDefinition.key.type === AST_NODE_TYPES.PrivateIdentifier) {
        return;
      }

      let nodeType = 'method definition';
      let check = baseCheck;
      switch (methodDefinition.kind) {
        case 'method':
          check = methodCheck;
          break;
        case 'constructor':
          check = ctorCheck;
          break;
        case 'get':
        case 'set':
          check = accessorCheck;
          nodeType = `${methodDefinition.kind} property accessor`;
          break;
      }

      const { name: methodName } = util.getNameFromMember(
        methodDefinition,
        sourceCode,
      );

      if (check === 'off' || ignoredMethodNames.has(methodName)) {
        return;
      }

      if (
        check === 'no-public' &&
        methodDefinition.accessibility === 'public'
      ) {
        context.report({
          node: methodDefinition,
          messageId: 'unwantedPublicAccessibility',
          data: {
            type: nodeType,
            name: methodName,
          },
          fix: getUnwantedPublicAccessibilityFixer(methodDefinition),
        });
      } else if (check === 'explicit' && !methodDefinition.accessibility) {
        context.report({
          node: methodDefinition,
          messageId: 'missingAccessibility',
          data: {
            type: nodeType,
            name: methodName,
          },
          suggest: getMissingAccessibilitySuggestions(methodDefinition),
        });
      }
    }

    /**
     * Creates a fixer that removes a "public" keyword with following spaces
     */
    function getUnwantedPublicAccessibilityFixer(
      node:
        | TSESTree.MethodDefinition
        | TSESTree.PropertyDefinition
        | TSESTree.TSAbstractMethodDefinition
        | TSESTree.TSAbstractPropertyDefinition
        | TSESTree.TSParameterProperty,
    ): TSESLint.ReportFixFunction {
      return function (fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
        const tokens = sourceCode.getTokens(node);
        let rangeToRemove: TSESLint.AST.Range;
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          if (
            token.type === AST_TOKEN_TYPES.Keyword &&
            token.value === 'public'
          ) {
            const commensAfterPublicKeyword =
              sourceCode.getCommentsAfter(token);
            if (commensAfterPublicKeyword.length) {
              // public /* Hi there! */ static foo()
              // ^^^^^^^
              rangeToRemove = [
                token.range[0],
                commensAfterPublicKeyword[0].range[0],
              ];
              break;
            } else {
              // public static foo()
              // ^^^^^^^
              rangeToRemove = [token.range[0], tokens[i + 1].range[0]];
              break;
            }
          }
        }
        return fixer.removeRange(rangeToRemove!);
      };
    }

    /**
     * Creates a fixer that adds a "public" keyword with following spaces
     */
    function getMissingAccessibilitySuggestions(
      node:
        | TSESTree.MethodDefinition
        | TSESTree.PropertyDefinition
        | TSESTree.TSAbstractMethodDefinition
        | TSESTree.TSAbstractPropertyDefinition
        | TSESTree.TSParameterProperty,
    ): TSESLint.ReportSuggestionArray<MessageIds> {
      function fix(
        accessibility: TSESTree.Accessibility,
        fixer: TSESLint.RuleFixer,
      ): TSESLint.RuleFix | null {
        if (node?.decorators?.length) {
          const lastDecorator = node.decorators[node.decorators.length - 1];
          const nextToken = sourceCode.getTokenAfter(lastDecorator)!;
          return fixer.insertTextBefore(nextToken, `${accessibility} `);
        }
        return fixer.insertTextBefore(node, `${accessibility} `);
      }

      return [
        {
          messageId: 'addExplicitAccessibility',
          data: { type: 'public' },
          fix: fixer => fix('public', fixer),
        },
        {
          messageId: 'addExplicitAccessibility',
          data: { type: 'private' },
          fix: fixer => fix('private', fixer),
        },
        {
          messageId: 'addExplicitAccessibility',
          data: { type: 'protected' },
          fix: fixer => fix('protected', fixer),
        },
      ];
    }

    /**
     * Checks if property has an accessibility modifier.
     * @param propertyDefinition The node representing a PropertyDefinition.
     */
    function checkPropertyAccessibilityModifier(
      propertyDefinition:
        | TSESTree.PropertyDefinition
        | TSESTree.TSAbstractPropertyDefinition,
    ): void {
      if (propertyDefinition.key.type === AST_NODE_TYPES.PrivateIdentifier) {
        return;
      }

      const nodeType = 'class property';

      const { name: propertyName } = util.getNameFromMember(
        propertyDefinition,
        sourceCode,
      );
      if (
        propCheck === 'no-public' &&
        propertyDefinition.accessibility === 'public'
      ) {
        context.report({
          node: propertyDefinition,
          messageId: 'unwantedPublicAccessibility',
          data: {
            type: nodeType,
            name: propertyName,
          },
          fix: getUnwantedPublicAccessibilityFixer(propertyDefinition),
        });
      } else if (
        propCheck === 'explicit' &&
        !propertyDefinition.accessibility
      ) {
        context.report({
          node: propertyDefinition,
          messageId: 'missingAccessibility',
          data: {
            type: nodeType,
            name: propertyName,
          },
          suggest: getMissingAccessibilitySuggestions(propertyDefinition),
        });
      }
    }

    /**
     * Checks that the parameter property has the desired accessibility modifiers set.
     * @param node The node representing a Parameter Property
     */
    function checkParameterPropertyAccessibilityModifier(
      node: TSESTree.TSParameterProperty,
    ): void {
      const nodeType = 'parameter property';
      // HAS to be an identifier or assignment or TSC will throw
      if (
        node.parameter.type !== AST_NODE_TYPES.Identifier &&
        node.parameter.type !== AST_NODE_TYPES.AssignmentPattern
      ) {
        return;
      }

      const nodeName =
        node.parameter.type === AST_NODE_TYPES.Identifier
          ? node.parameter.name
          : // has to be an Identifier or TSC will throw an error
            (node.parameter.left as TSESTree.Identifier).name;

      switch (paramPropCheck) {
        case 'explicit': {
          if (!node.accessibility) {
            context.report({
              node,
              messageId: 'missingAccessibility',
              data: {
                type: nodeType,
                name: nodeName,
              },
              suggest: getMissingAccessibilitySuggestions(node),
            });
          }
          break;
        }
        case 'no-public': {
          if (node.accessibility === 'public' && node.readonly) {
            context.report({
              node,
              messageId: 'unwantedPublicAccessibility',
              data: {
                type: nodeType,
                name: nodeName,
              },
              fix: getUnwantedPublicAccessibilityFixer(node),
            });
          }
          break;
        }
      }
    }

    return {
      'MethodDefinition, TSAbstractMethodDefinition':
        checkMethodAccessibilityModifier,
      'PropertyDefinition, TSAbstractPropertyDefinition':
        checkPropertyAccessibilityModifier,
      TSParameterProperty: checkParameterPropertyAccessibilityModifier,
    };
  },
});
