import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export type MessageIds = 'preferRecordAnnotation';

export default createRule<[], MessageIds>({
  name: 'prefer-record-type-annotation',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce explicit Record<K, V> type annotations for object literals',
      recommended: 'stylistic',
    },
    fixable: 'code',
    messages: {
      preferRecordAnnotation:
        'Object literal should have explicit Record<{{keyType}}, {{valueType}}> type annotation.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {

    /**
     * Determines if all values in an object expression have compatible types
     * Returns the unified type name if compatible, null otherwise
     */
    function getUnifiedValueType(
      properties: TSESTree.ObjectExpressionProperty[],
    ): string | null {
      if (properties.length === 0) {
        return null;
      }

      // For now, we'll focus on literals and simple cases
      let unifiedType: string | null = null;

      for (const property of properties) {
        if (
          property.type !== AST_NODE_TYPES.Property ||
          property.computed ||
          property.method ||
          property.kind !== 'init'
        ) {
          return null; // Skip complex properties
        }

        const valueType = inferValueType(property.value);
        if (valueType === null) {
          return null; // Can't determine type
        }

        if (unifiedType === null) {
          unifiedType = valueType;
        } else if (unifiedType !== valueType) {
          // For mixed types, we could use union types, but for simplicity
          // let's just handle cases where all values have the same type
          if (
            (unifiedType === 'string' && valueType === 'string') ||
            (unifiedType === 'number' && valueType === 'number') ||
            (unifiedType === 'boolean' && valueType === 'boolean')
          ) {
            continue;
          }
          return null;
        }
      }

      return unifiedType;
    }

    /**
     * Infer the TypeScript type from a value expression
     */
    function inferValueType(value: TSESTree.Expression): string | null {
      switch (value.type) {
        case AST_NODE_TYPES.Literal:
          if (typeof value.value === 'string') return 'string';
          if (typeof value.value === 'number') return 'number';
          if (typeof value.value === 'boolean') return 'boolean';
          if (value.value === null) return 'null';
          break;
        case AST_NODE_TYPES.TemplateLiteral:
          return 'string';
        case AST_NODE_TYPES.UnaryExpression:
          if (value.operator === '-' && value.argument.type === AST_NODE_TYPES.Literal) {
            return 'number';
          }
          break;
        case AST_NODE_TYPES.Identifier:
          // Could be a variable, but we can't easily determine its type
          // For now, skip these cases
          return null;
        case AST_NODE_TYPES.ArrayExpression:
          return 'any[]'; // Could be more specific, but this is a start
        case AST_NODE_TYPES.ObjectExpression:
          return 'object';
      }
      return null;
    }

    /**
     * Generate Record type annotation text
     */
    function generateRecordType(
      keys: string[],
      valueType: string,
    ): string {
      const keyUnion = keys.map(key => `'${key}'`).join(' | ');
      return `Record<${keyUnion}, ${valueType}>`;
    }

    /**
     * Extract property keys from object expression
     */
    function extractPropertyKeys(
      properties: TSESTree.ObjectExpressionProperty[],
    ): string[] | null {
      const keys: string[] = [];

      for (const property of properties) {
        if (
          property.type !== AST_NODE_TYPES.Property ||
          property.computed ||
          property.method ||
          property.kind !== 'init'
        ) {
          return null; // Skip complex properties
        }

        if (property.key.type === AST_NODE_TYPES.Identifier) {
          keys.push(property.key.name);
        } else if (
          property.key.type === AST_NODE_TYPES.Literal &&
          typeof property.key.value === 'string'
        ) {
          keys.push(property.key.value);
        } else {
          return null; // Can't handle computed or complex keys
        }
      }

      return keys;
    }

    return {
      VariableDeclarator(node): void {
        // Skip if already has type annotation
        if (node.id.typeAnnotation) {
          return;
        }

        // Only handle simple identifier declarations
        if (node.id.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        // Only handle object expression initializers
        if (!node.init || node.init.type !== AST_NODE_TYPES.ObjectExpression) {
          return;
        }

        const objectExpression = node.init;
        const properties = objectExpression.properties;

        // Only handle simple properties (not spread, methods, etc.)
        const simpleProperties = properties.filter(
          (prop): prop is TSESTree.Property =>
            prop.type === AST_NODE_TYPES.Property &&
            !prop.computed &&
            !prop.method &&
            prop.kind === 'init',
        );

        if (simpleProperties.length !== properties.length) {
          return; // Has complex properties, skip
        }

        const keys = extractPropertyKeys(simpleProperties);
        if (!keys) {
          return;
        }

        const valueType = getUnifiedValueType(simpleProperties);
        if (!valueType) {
          return;
        }

        const keyType = keys.map(key => `'${key}'`).join(' | ');
        const recordType = generateRecordType(keys, valueType);

        context.report({
          node: node.id,
          messageId: 'preferRecordAnnotation',
          data: {
            keyType,
            valueType,
          },
          fix: (fixer): TSESLint.RuleFix => {
            return fixer.insertTextAfter(node.id, `: ${recordType}`);
          },
        });
      },
    };
  },
});
