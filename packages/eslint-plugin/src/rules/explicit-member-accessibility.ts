import { TSESTree } from '@typescript-eslint/util';
import * as util from '../util';

export default util.createRule({
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
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    /**
     * Checks if a method declaration has an accessibility modifier.
     * @param methodDefinition The node representing a MethodDefinition.
     */
    function checkMethodAccessibilityModifier(
      methodDefinition: TSESTree.MethodDefinition,
    ): void {
      if (
        !methodDefinition.accessibility &&
        util.isTypeScriptFile(context.getFilename())
      ) {
        context.report({
          node: methodDefinition,
          messageId: 'missingAccessibility',
          data: {
            type: 'method definition',
            name: util.getNameFromClassMember(methodDefinition, sourceCode),
          },
        });
      }
    }

    /**
     * Checks if property has an accessibility modifier.
     * @param classProperty The node representing a ClassProperty.
     */
    function checkPropertyAccessibilityModifier(
      classProperty: TSESTree.ClassProperty,
    ): void {
      if (
        !classProperty.accessibility &&
        util.isTypeScriptFile(context.getFilename())
      ) {
        context.report({
          node: classProperty,
          messageId: 'missingAccessibility',
          data: {
            type: 'class property',
            name: util.getNameFromPropertyName(classProperty.key),
          },
        });
      }
    }

    return {
      ClassProperty: checkPropertyAccessibilityModifier,
      MethodDefinition: checkMethodAccessibilityModifier,
    };
  },
});
