import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
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

type MessageIds = 'unwantedPublicAccessibility' | 'missingAccessibility';

const accessibilityLevel = { enum: ['explicit', 'no-public', 'off'] };

export default util.createRule<Options, MessageIds>({
  name: 'explicit-member-accessibility',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require explicit accessibility modifiers on class properties and methods',
      category: 'Stylistic Issues',
      // too opinionated to be recommended
      recommended: false,
    },
    messages: {
      missingAccessibility:
        'Missing accessibility modifier on {{type}} {{name}}.',
      unwantedPublicAccessibility:
        'Public accessibility modifier on {{type}} {{name}}.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          accessibility: accessibilityLevel,
          overrides: {
            type: 'object',
            properties: {
              accessors: accessibilityLevel,
              constructors: accessibilityLevel,
              methods: accessibilityLevel,
              properties: accessibilityLevel,
              parameterProperties: accessibilityLevel,
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
  },
  defaultOptions: [{ accessibility: 'explicit' }],
  create(context, [option]) {
    const sourceCode = context.getSourceCode();
    const baseCheck: AccessibilityLevel = option.accessibility || 'explicit';
    const overrides = option.overrides || {};
    const ctorCheck = overrides.constructors || baseCheck;
    const accessorCheck = overrides.accessors || baseCheck;
    const methodCheck = overrides.methods || baseCheck;
    const propCheck = overrides.properties || baseCheck;
    const paramPropCheck = overrides.parameterProperties || baseCheck;
    const ignoredMethodNames = new Set(option.ignoredMethodNames || []);
    /**
     * Generates the report for rule violations
     */
    function reportIssue(
      messageId: MessageIds,
      nodeType: string,
      node: TSESTree.Node,
      nodeName: string,
    ): void {
      context.report({
        node: node,
        messageId: messageId,
        data: {
          type: nodeType,
          name: nodeName,
        },
      });
    }

    /**
     * Checks if a method declaration has an accessibility modifier.
     * @param methodDefinition The node representing a MethodDefinition.
     */
    function checkMethodAccessibilityModifier(
      methodDefinition: TSESTree.MethodDefinition,
    ): void {
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

      const methodName = util.getNameFromClassMember(
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
        reportIssue(
          'unwantedPublicAccessibility',
          nodeType,
          methodDefinition,
          methodName,
        );
      } else if (check === 'explicit' && !methodDefinition.accessibility) {
        reportIssue(
          'missingAccessibility',
          nodeType,
          methodDefinition,
          methodName,
        );
      }
    }

    /**
     * Checks if property has an accessibility modifier.
     * @param classProperty The node representing a ClassProperty.
     */
    function checkPropertyAccessibilityModifier(
      classProperty: TSESTree.ClassProperty,
    ): void {
      const nodeType = 'class property';

      const propertyName = util.getNameFromPropertyName(classProperty.key);
      if (
        propCheck === 'no-public' &&
        classProperty.accessibility === 'public'
      ) {
        reportIssue(
          'unwantedPublicAccessibility',
          nodeType,
          classProperty,
          propertyName,
        );
      } else if (propCheck === 'explicit' && !classProperty.accessibility) {
        reportIssue(
          'missingAccessibility',
          nodeType,
          classProperty,
          propertyName,
        );
      }
    }

    /**
     * Checks that the parameter property has the desired accessibility modifiers set.
     * @param {TSESTree.TSParameterProperty} node The node representing a Parameter Property
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
            reportIssue('missingAccessibility', nodeType, node, nodeName);
          }
          break;
        }
        case 'no-public': {
          if (node.accessibility === 'public' && node.readonly) {
            reportIssue(
              'unwantedPublicAccessibility',
              nodeType,
              node,
              nodeName,
            );
          }
          break;
        }
      }
    }

    return {
      TSParameterProperty: checkParameterPropertyAccessibilityModifier,
      ClassProperty: checkPropertyAccessibilityModifier,
      MethodDefinition: checkMethodAccessibilityModifier,
    };
  },
});
