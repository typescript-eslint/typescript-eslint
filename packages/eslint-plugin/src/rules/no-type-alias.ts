import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Values =
  | 'always'
  | 'never'
  | 'in-unions'
  | 'in-intersections'
  | 'in-unions-and-intersections';
const enumValues: Values[] = [
  'always',
  'never',
  'in-unions',
  'in-intersections',
  'in-unions-and-intersections',
];

type Options = [
  {
    allowAliases?: Values;
    allowCallbacks?: 'always' | 'never';
    allowConditionalTypes?: 'always' | 'never';
    allowConstructors?: 'always' | 'never';
    allowLiterals?: Values;
    allowMappedTypes?: Values;
    allowTupleTypes?: Values;
  },
];
type MessageIds = 'noTypeAlias' | 'noCompositionAlias';

type CompositionType =
  | AST_NODE_TYPES.TSUnionType
  | AST_NODE_TYPES.TSIntersectionType;
interface TypeWithLabel {
  node: TSESTree.Node;
  compositionType: CompositionType | null;
}

export default util.createRule<Options, MessageIds>({
  name: 'no-type-alias',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the use of type aliases',
      category: 'Stylistic Issues',
      // too opinionated to be recommended
      recommended: false,
    },
    messages: {
      noTypeAlias: 'Type {{alias}} are not allowed.',
      noCompositionAlias:
        '{{typeName}} in {{compositionType}} types are not allowed.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowAliases: {
            enum: enumValues,
          },
          allowCallbacks: {
            enum: ['always', 'never'],
          },
          allowConditionalTypes: {
            enum: ['always', 'never'],
          },
          allowConstructors: {
            enum: ['always', 'never'],
          },
          allowLiterals: {
            enum: enumValues,
          },
          allowMappedTypes: {
            enum: enumValues,
          },
          allowTupleTypes: {
            enum: enumValues,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowAliases: 'never',
      allowCallbacks: 'never',
      allowConditionalTypes: 'never',
      allowConstructors: 'never',
      allowLiterals: 'never',
      allowMappedTypes: 'never',
      allowTupleTypes: 'never',
    },
  ],
  create(
    context,
    [
      {
        allowAliases,
        allowCallbacks,
        allowConditionalTypes,
        allowConstructors,
        allowLiterals,
        allowMappedTypes,
        allowTupleTypes,
      },
    ],
  ) {
    const unions = ['always', 'in-unions', 'in-unions-and-intersections'];
    const intersections = [
      'always',
      'in-intersections',
      'in-unions-and-intersections',
    ];
    const compositions = [
      'in-unions',
      'in-intersections',
      'in-unions-and-intersections',
    ];
    const aliasTypes = new Set([
      AST_NODE_TYPES.TSArrayType,
      AST_NODE_TYPES.TSTypeReference,
      AST_NODE_TYPES.TSLiteralType,
      AST_NODE_TYPES.TSTypeQuery,
      AST_NODE_TYPES.TSIndexedAccessType,
    ]);

    /**
     * Determines if the composition type is supported by the allowed flags.
     * @param isTopLevel a flag indicating this is the top level node.
     * @param compositionType the composition type (either TSUnionType or TSIntersectionType)
     * @param allowed the currently allowed flags.
     */
    function isSupportedComposition(
      isTopLevel: boolean,
      compositionType: CompositionType | null,
      allowed: string,
    ): boolean {
      return (
        !compositions.includes(allowed) ||
        (!isTopLevel &&
          ((compositionType === AST_NODE_TYPES.TSUnionType &&
            unions.includes(allowed)) ||
            (compositionType === AST_NODE_TYPES.TSIntersectionType &&
              intersections.includes(allowed))))
      );
    }

    /**
     * Gets the message to be displayed based on the node type and whether the node is a top level declaration.
     * @param node the location
     * @param compositionType the type of composition this alias is part of (undefined if not
     *                                  part of a composition)
     * @param isRoot a flag indicating we are dealing with the top level declaration.
     * @param type the kind of type alias being validated.
     */
    function reportError(
      node: TSESTree.Node,
      compositionType: CompositionType | null,
      isRoot: boolean,
      type: string,
    ): void {
      if (isRoot) {
        return context.report({
          node,
          messageId: 'noTypeAlias',
          data: {
            alias: type.toLowerCase(),
          },
        });
      }

      return context.report({
        node,
        messageId: 'noCompositionAlias',
        data: {
          compositionType:
            compositionType === AST_NODE_TYPES.TSUnionType
              ? 'union'
              : 'intersection',
          typeName: type,
        },
      });
    }

    const isValidTupleType = (type: TypeWithLabel): boolean => {
      if (type.node.type === AST_NODE_TYPES.TSTupleType) {
        return true;
      }
      if (type.node.type === AST_NODE_TYPES.TSTypeOperator) {
        if (
          ['keyof', 'readonly'].includes(type.node.operator) &&
          type.node.typeAnnotation &&
          type.node.typeAnnotation.type === AST_NODE_TYPES.TSTupleType
        ) {
          return true;
        }
      }
      return false;
    };

    const checkAndReport = (
      optionValue: Values,
      isTopLevel: boolean,
      type: TypeWithLabel,
      label: string,
    ): void => {
      if (
        optionValue === 'never' ||
        !isSupportedComposition(isTopLevel, type.compositionType, optionValue)
      ) {
        reportError(type.node, type.compositionType, isTopLevel, label);
      }
    };

    /**
     * Validates the node looking for aliases, callbacks and literals.
     * @param type the type of composition this alias is part of (null if not
     *                                  part of a composition)
     * @param isTopLevel a flag indicating this is the top level node.
     */
    function validateTypeAliases(
      type: TypeWithLabel,
      isTopLevel = false,
    ): void {
      if (type.node.type === AST_NODE_TYPES.TSFunctionType) {
        // callback
        if (allowCallbacks === 'never') {
          reportError(type.node, type.compositionType, isTopLevel, 'Callbacks');
        }
      } else if (type.node.type === AST_NODE_TYPES.TSConditionalType) {
        // conditional type
        if (allowConditionalTypes === 'never') {
          reportError(
            type.node,
            type.compositionType,
            isTopLevel,
            'Conditional types',
          );
        }
      } else if (type.node.type === AST_NODE_TYPES.TSConstructorType) {
        if (allowConstructors === 'never') {
          reportError(
            type.node,
            type.compositionType,
            isTopLevel,
            'Constructors',
          );
        }
      } else if (type.node.type === AST_NODE_TYPES.TSTypeLiteral) {
        // literal object type
        checkAndReport(allowLiterals!, isTopLevel, type, 'Literals');
      } else if (type.node.type === AST_NODE_TYPES.TSMappedType) {
        // mapped type
        checkAndReport(allowMappedTypes!, isTopLevel, type, 'Mapped types');
      } else if (isValidTupleType(type)) {
        // tuple types
        checkAndReport(allowTupleTypes!, isTopLevel, type, 'Tuple Types');
      } else if (
        // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
        type.node.type.endsWith('Keyword') ||
        aliasTypes.has(type.node.type) ||
        (type.node.type === AST_NODE_TYPES.TSTypeOperator &&
          type.node.operator === 'readonly' &&
          type.node.typeAnnotation &&
          aliasTypes.has(type.node.typeAnnotation.type))
      ) {
        // alias / keyword
        checkAndReport(allowAliases!, isTopLevel, type, 'Aliases');
      } else {
        // unhandled type - shouldn't happen
        reportError(type.node, type.compositionType, isTopLevel, 'Unhandled');
      }
    }

    /**
     * Flatten the given type into an array of its dependencies
     */
    function getTypes(
      node: TSESTree.Node,
      compositionType: CompositionType | null = null,
    ): TypeWithLabel[] {
      if (
        node.type === AST_NODE_TYPES.TSUnionType ||
        node.type === AST_NODE_TYPES.TSIntersectionType
      ) {
        return node.types.reduce<TypeWithLabel[]>((acc, type) => {
          acc.push(...getTypes(type, node.type));
          return acc;
        }, []);
      }
      if (node.type === AST_NODE_TYPES.TSParenthesizedType) {
        return getTypes(node.typeAnnotation, compositionType);
      }
      return [{ node, compositionType }];
    }

    return {
      TSTypeAliasDeclaration(node): void {
        const types = getTypes(node.typeAnnotation);
        if (types.length === 1) {
          // is a top level type annotation
          validateTypeAliases(types[0], true);
        } else {
          // is a composition type
          types.forEach(type => {
            validateTypeAliases(type);
          });
        }
      },
    };
  },
});
