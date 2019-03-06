import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

enum Check {
  Yes,
  No,
  NoPublic,
}

interface NoPublic {
  noPublic?: boolean;
}

type Override = boolean | NoPublic;

/**
 * Type guard to ease checking on which kind of override is being supplied
 *
 * @param {Override} [option]
 * @returns {option is NoPublic}
 */
function isNoPublic(option?: Override): option is NoPublic {
  return typeof option !== 'boolean';
}

interface Config {
  noPublic?: boolean;
  overrides?: {
    accessors?: Override;
    constructors?: Override;
    methods?: Override;
    properties?: Override;
    parameterProperties?: Override;
  };
}
type Options = [Config];

type MessageIds = 'unwantedPublicAccessibility' | 'missingAccessibility';

const override = {
  type: ['object', 'boolean'],
  properties: {
    noPublic: {
      type: 'boolean',
    },
  },
};

export default util.createRule<Options, MessageIds>({
  name: 'explicit-member-accessibility',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require explicit accessibility modifiers on class properties and methods',
      tslintRuleName: 'member-access',
      category: 'Best Practices',
      recommended: 'error',
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
          noPublic: {
            type: 'boolean',
          },
          overrides: {
            type: 'object',
            properties: {
              accessors: override,
              constructors: override,
              methods: override,
              properties: override,
              parameterProperties: override,
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    // technically there is a default, but the overrides mean
    // that if we apply them here, it will break the no override case.
    {},
  ],
  create(context) {
    const option: Config = util.applyDefault([{}], context.options)[0];

    /**
     * @param defaultCheck
     * @param overrideToCheck
     */

    /**
     * Reads the value set on the Override and returns a Check value
     * Check value is used to control what, if any accessiblity modifiers are required or banned
     * @param {Check} defaultCheck
     * @param {Override} [overrideToCheck]
     * @returns {Check}
     */
    function parseOverride(
      defaultCheck: Check,
      overrideToCheck?: Override,
    ): Check {
      let result: Check = defaultCheck;
      if (typeof overrideToCheck !== 'undefined') {
        if (isNoPublic(overrideToCheck)) {
          if (overrideToCheck.noPublic) {
            result = Check.NoPublic;
          } else {
            result = Check.Yes;
          }
        } else if (!overrideToCheck) {
          result = Check.No;
        }
      }
      return result;
    }

    let baseCheck = Check.Yes;
    if (option.noPublic) {
      baseCheck = Check.NoPublic;
    }
    let ctorCheck: Check = baseCheck;
    let accessorCheck: Check = baseCheck;
    let methodCheck: Check = baseCheck;
    let propCheck: Check = baseCheck;
    let paramPropCheck: Check = baseCheck;
    if (option.overrides) {
      ctorCheck = parseOverride(baseCheck, option.overrides.constructors);
      accessorCheck = parseOverride(baseCheck, option.overrides.accessors);
      methodCheck = parseOverride(baseCheck, option.overrides.methods);
      propCheck = parseOverride(baseCheck, option.overrides.properties);
      paramPropCheck = parseOverride(
        baseCheck,
        option.overrides.parameterProperties,
      );
    }

    /**
     *Generates the report for rule violations
     *
     * @param {MessageIds} messageId
     * @param {string} nodeType
     * @param {(TSESTree.MethodDefinition | TSESTree.ClassProperty)} node
     */
    function reportIssue(
      messageId: MessageIds,
      nodeType: string,
      node:
        | TSESTree.MethodDefinition
        | TSESTree.ClassProperty
        | TSESTree.TSParameterProperty,
      nodeName: string,
    ) {
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
      let check: Check = baseCheck;
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
      if (check == Check.No) {
        return;
      }

      if (util.isTypeScriptFile(context.getFilename())) {
        const methodName = util.getNameFromPropertyName(methodDefinition.key);
        if (
          check === Check.NoPublic &&
          methodDefinition.accessibility === 'public'
        ) {
          reportIssue(
            'unwantedPublicAccessibility',
            nodeType,
            methodDefinition,
            methodName,
          );
        } else if (check === Check.Yes && !methodDefinition.accessibility) {
          reportIssue(
            'missingAccessibility',
            nodeType,
            methodDefinition,
            methodName,
          );
        }
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

      if (util.isTypeScriptFile(context.getFilename())) {
        const propertyName = util.getNameFromPropertyName(classProperty.key);
        if (
          propCheck === Check.NoPublic &&
          classProperty.accessibility === 'public'
        ) {
          reportIssue(
            'unwantedPublicAccessibility',
            nodeType,
            classProperty,
            propertyName,
          );
        } else if (propCheck === Check.Yes && !classProperty.accessibility) {
          reportIssue(
            'missingAccessibility',
            nodeType,
            classProperty,
            propertyName,
          );
        }
      }
    }

    /**
     * Checks that the parameter property has accessiblity modifiers set.
     *
     * @param {TSESTree.TSParameterProperty} node
     * @returns
     */
    function checkParameterPropertyAccessibilityModifier(
      node: TSESTree.TSParameterProperty,
    ) {
      const nodeType = 'parameter property';
      if (util.isTypeScriptFile(context.getFilename())) {
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

        if (
          paramPropCheck === Check.NoPublic &&
          node.accessibility === 'public'
        ) {
          reportIssue('unwantedPublicAccessibility', nodeType, node, nodeName);
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
