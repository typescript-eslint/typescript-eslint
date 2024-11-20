import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getNameFromMember,
  nullThrows,
  NullThrowsReasons,
} from '../util';
import {
  getMemberHeadLoc,
  getParameterPropertyHeadLoc,
} from '../util/getMemberHeadLoc';
import { rangeToLoc } from '../util/rangeToLoc';

type AccessibilityLevel =
  | 'explicit' // require an accessor (including public)
  | 'no-public' // don't require public
  | 'off'; // don't check

export interface Config {
  accessibility?: AccessibilityLevel;
  ignoredMethodNames?: string[];
  overrides?: {
    accessors?: AccessibilityLevel;
    constructors?: AccessibilityLevel;
    methods?: AccessibilityLevel;
    parameterProperties?: AccessibilityLevel;
    properties?: AccessibilityLevel;
  };
}

type Options = [Config];

type MessageIds =
  | 'addExplicitAccessibility'
  | 'missingAccessibility'
  | 'unwantedPublicAccessibility';

export default createRule<Options, MessageIds>({
  name: 'explicit-member-accessibility',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require explicit accessibility modifiers on class properties and methods',
      // too opinionated to be recommended
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      addExplicitAccessibility: "Add '{{ type }}' accessibility modifier",
      missingAccessibility:
        'Missing accessibility modifier on {{type}} {{name}}.',
      unwantedPublicAccessibility:
        'Public accessibility modifier on {{type}} {{name}}.',
    },
    schema: [
      {
        type: 'object',
        $defs: {
          accessibilityLevel: {
            oneOf: [
              {
                type: 'string',
                description: 'Always require an accessor.',
                enum: ['explicit'],
              },
              {
                type: 'string',
                description: 'Require an accessor except when public.',
                enum: ['no-public'],
              },
              {
                type: 'string',
                description: 'Never check whether there is an accessor.',
                enum: ['off'],
              },
            ],
          },
        },
        additionalProperties: false,
        properties: {
          accessibility: {
            $ref: '#/items/0/$defs/accessibilityLevel',
            description:
              'Which accessibility modifier is required to exist or not exist.',
          },
          ignoredMethodNames: {
            type: 'array',
            description: 'Specific method names that may be ignored.',
            items: {
              type: 'string',
            },
          },
          overrides: {
            type: 'object',
            additionalProperties: false,
            description:
              'Changes to required accessibility modifiers for specific kinds of class members.',
            properties: {
              accessors: { $ref: '#/items/0/$defs/accessibilityLevel' },
              constructors: { $ref: '#/items/0/$defs/accessibilityLevel' },
              methods: { $ref: '#/items/0/$defs/accessibilityLevel' },
              parameterProperties: {
                $ref: '#/items/0/$defs/accessibilityLevel',
              },
              properties: { $ref: '#/items/0/$defs/accessibilityLevel' },
            },
          },
        },
      },
    ],
  },
  defaultOptions: [{ accessibility: 'explicit' }],
  create(context, [option]) {
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
      methodDefinition:
        | TSESTree.MethodDefinition
        | TSESTree.TSAbstractMethodDefinition,
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

      const { name: methodName } = getNameFromMember(
        methodDefinition,
        context.sourceCode,
      );

      if (check === 'off' || ignoredMethodNames.has(methodName)) {
        return;
      }

      if (
        check === 'no-public' &&
        methodDefinition.accessibility === 'public'
      ) {
        const publicKeyword = findPublicKeyword(methodDefinition);
        context.report({
          loc: rangeToLoc(context.sourceCode, publicKeyword.range),
          messageId: 'unwantedPublicAccessibility',
          data: {
            name: methodName,
            type: nodeType,
          },
          fix: fixer => fixer.removeRange(publicKeyword.rangeToRemove),
        });
      } else if (check === 'explicit' && !methodDefinition.accessibility) {
        context.report({
          loc: getMemberHeadLoc(context.sourceCode, methodDefinition),
          messageId: 'missingAccessibility',
          data: {
            name: methodName,
            type: nodeType,
          },
          suggest: getMissingAccessibilitySuggestions(methodDefinition),
        });
      }
    }

    /**
     * Returns an object containing a range that corresponds to the "public"
     * keyword for a node, and the range that would need to be removed to
     * remove the "public" keyword (including associated whitespace).
     */
    function findPublicKeyword(
      node:
        | TSESTree.MethodDefinition
        | TSESTree.PropertyDefinition
        | TSESTree.TSAbstractMethodDefinition
        | TSESTree.TSAbstractPropertyDefinition
        | TSESTree.TSParameterProperty,
    ): { range: TSESLint.AST.Range; rangeToRemove: TSESLint.AST.Range } {
      const tokens = context.sourceCode.getTokens(node);
      let rangeToRemove!: TSESLint.AST.Range;
      let keywordRange!: TSESLint.AST.Range;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (
          token.type === AST_TOKEN_TYPES.Keyword &&
          token.value === 'public'
        ) {
          keywordRange = structuredClone(token.range);
          const commensAfterPublicKeyword =
            context.sourceCode.getCommentsAfter(token);
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
      return { range: keywordRange, rangeToRemove };
    }

    /**
     * Creates a fixer that adds an accessibility modifier keyword
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
        if (node.decorators.length) {
          const lastDecorator = node.decorators[node.decorators.length - 1];
          const nextToken = nullThrows(
            context.sourceCode.getTokenAfter(lastDecorator),
            NullThrowsReasons.MissingToken('token', 'last decorator'),
          );
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

      const { name: propertyName } = getNameFromMember(
        propertyDefinition,
        context.sourceCode,
      );
      if (
        propCheck === 'no-public' &&
        propertyDefinition.accessibility === 'public'
      ) {
        const publicKeywordRange = findPublicKeyword(propertyDefinition);
        context.report({
          loc: rangeToLoc(context.sourceCode, publicKeywordRange.range),
          messageId: 'unwantedPublicAccessibility',
          data: {
            name: propertyName,
            type: nodeType,
          },
          fix: fixer => fixer.removeRange(publicKeywordRange.rangeToRemove),
        });
      } else if (
        propCheck === 'explicit' &&
        !propertyDefinition.accessibility
      ) {
        context.report({
          loc: getMemberHeadLoc(context.sourceCode, propertyDefinition),
          messageId: 'missingAccessibility',
          data: {
            name: propertyName,
            type: nodeType,
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
              loc: getParameterPropertyHeadLoc(
                context.sourceCode,
                node,
                nodeName,
              ),
              messageId: 'missingAccessibility',
              data: {
                name: nodeName,
                type: nodeType,
              },
              suggest: getMissingAccessibilitySuggestions(node),
            });
          }
          break;
        }
        case 'no-public': {
          if (node.accessibility === 'public' && node.readonly) {
            const publicKeyword = findPublicKeyword(node);
            context.report({
              loc: rangeToLoc(context.sourceCode, publicKeyword.range),
              messageId: 'unwantedPublicAccessibility',
              data: {
                name: nodeName,
                type: nodeType,
              },
              fix: fixer => fixer.removeRange(publicKeyword.rangeToRemove),
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
