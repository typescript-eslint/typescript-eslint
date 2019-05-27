import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Options = [
  {
    allowAliases?:
      | 'always'
      | 'never'
      | 'in-unions'
      | 'in-intersections'
      | 'in-unions-and-intersections';
    allowCallbacks?: 'always' | 'never';
    allowLiterals?:
      | 'always'
      | 'never'
      | 'in-unions'
      | 'in-intersections'
      | 'in-unions-and-intersections';
    allowMappedTypes?:
      | 'always'
      | 'never'
      | 'in-unions'
      | 'in-intersections'
      | 'in-unions-and-intersections';
  }
];
type MessageIds = 'noTypeAlias' | 'noCompositionAlias';

export default util.createRule<Options, MessageIds>({
  name: 'no-type-alias',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the use of type aliases',
      category: 'Stylistic Issues',
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
            enum: [
              'always',
              'never',
              'in-unions',
              'in-intersections',
              'in-unions-and-intersections',
            ],
          },
          allowCallbacks: {
            enum: ['always', 'never'],
          },
          allowLiterals: {
            enum: [
              'always',
              'never',
              'in-unions',
              'in-intersections',
              'in-unions-and-intersections',
            ],
          },
          allowMappedTypes: {
            enum: [
              'always',
              'never',
              'in-unions',
              'in-intersections',
              'in-unions-and-intersections',
            ],
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
      allowLiterals: 'never',
      allowMappedTypes: 'never',
    },
  ],
  create(
    context,
    [{ allowAliases, allowCallbacks, allowLiterals, allowMappedTypes }],
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
    const aliasTypes = [
      AST_NODE_TYPES.TSArrayType,
      AST_NODE_TYPES.TSTypeReference,
      AST_NODE_TYPES.TSLiteralType,
      AST_NODE_TYPES.TSTypeQuery,
    ];

    type CompositionType = TSESTree.TSUnionType | TSESTree.TSIntersectionType;
    /**
     * Determines if the given node is a union or an intersection.
     */
    function isComposition(node: TSESTree.TypeNode): node is CompositionType {
      return (
        node &&
        (node.type === AST_NODE_TYPES.TSUnionType ||
          node.type === AST_NODE_TYPES.TSIntersectionType)
      );
    }

    /**
     * Determines if the composition type is supported by the allowed flags.
     * @param isTopLevel a flag indicating this is the top level node.
     * @param compositionType the composition type (either TSUnionType or TSIntersectionType)
     * @param allowed the currently allowed flags.
     */
    function isSupportedComposition(
      isTopLevel: boolean,
      compositionType: string | undefined,
      allowed: string,
    ): boolean {
      return (
        compositions.indexOf(allowed) === -1 ||
        (!isTopLevel &&
          ((compositionType === AST_NODE_TYPES.TSUnionType &&
            unions.indexOf(allowed) > -1) ||
            (compositionType === AST_NODE_TYPES.TSIntersectionType &&
              intersections.indexOf(allowed) > -1)))
      );
    }

    /**
     * Determines if the given node is an alias type (keywords, arrays, type references and constants).
     * @param node the node to be evaluated.
     */
    function isAlias(
      node: TSESTree.Node,
    ): boolean /* not worth enumerating the ~25 individual types here */ {
      return (
        node &&
        (/Keyword$/.test(node.type) || aliasTypes.indexOf(node.type) > -1)
      );
    }

    /**
     * Determines if the given node is a callback type.
     * @param node the node to be evaluated.
     */
    function isCallback(node: TSESTree.Node): node is TSESTree.TSFunctionType {
      return node && node.type === AST_NODE_TYPES.TSFunctionType;
    }

    /**
     * Determines if the given node is a literal type (objects).
     * @param node the node to be evaluated.
     */
    function isLiteral(node: TSESTree.Node): node is TSESTree.TSTypeLiteral {
      return node && node.type === AST_NODE_TYPES.TSTypeLiteral;
    }

    /**
     * Determines if the given node is a mapped type.
     * @param node the node to be evaluated.
     */
    function isMappedType(node: TSESTree.Node): node is TSESTree.TSMappedType {
      return node && node.type === AST_NODE_TYPES.TSMappedType;
    }

    /**
     * Gets the message to be displayed based on the node type and whether the node is a top level declaration.
     * @param node the location
     * @param compositionType the type of composition this alias is part of (undefined if not
     *                                  part of a composition)
     * @param isRoot a flag indicating we are dealing with the top level declaration.
     * @param type the kind of type alias being validated.
     */
    function getMessage(
      node: TSESTree.Node,
      compositionType: string | undefined,
      isRoot: boolean,
      type?: string,
    ): TSESLint.ReportDescriptor<MessageIds> {
      if (isRoot) {
        return {
          node,
          messageId: 'noTypeAlias',
          data: {
            alias: type || 'aliases',
          },
        };
      }

      return {
        node,
        messageId: 'noCompositionAlias',
        data: {
          compositionType:
            compositionType === AST_NODE_TYPES.TSUnionType
              ? 'union'
              : 'intersection',
          typeName: util.upperCaseFirst(type!),
        },
      };
    }

    /**
     * Validates the node looking for aliases, callbacks and literals.
     * @param node the node to be validated.
     * @param isTopLevel a flag indicating this is the top level node.
     * @param compositionType the type of composition this alias is part of (undefined if not
     *                                  part of a composition)
     */
    function validateTypeAliases(
      node: TSESTree.Node,
      isTopLevel: boolean,
      compositionType?: string,
    ): void {
      if (isCallback(node)) {
        if (allowCallbacks === 'never') {
          context.report(
            getMessage(node, compositionType, isTopLevel, 'callbacks'),
          );
        }
      } else if (isLiteral(node)) {
        if (
          allowLiterals === 'never' ||
          !isSupportedComposition(isTopLevel, compositionType, allowLiterals!)
        ) {
          context.report(
            getMessage(node, compositionType, isTopLevel, 'literals'),
          );
        }
      } else if (isMappedType(node)) {
        if (
          allowMappedTypes === 'never' ||
          !isSupportedComposition(
            isTopLevel,
            compositionType,
            allowMappedTypes!,
          )
        ) {
          context.report(
            getMessage(node, compositionType, isTopLevel, 'mapped types'),
          );
        }
      } else if (isAlias(node)) {
        if (
          allowAliases === 'never' ||
          !isSupportedComposition(isTopLevel, compositionType, allowAliases!)
        ) {
          context.report(
            getMessage(node, compositionType, isTopLevel, 'aliases'),
          );
        }
      } else {
        context.report(getMessage(node, compositionType, isTopLevel));
      }
    }

    /**
     * Validates compositions (unions and/or intersections).
     */
    function validateCompositions(node: CompositionType): void {
      node.types.forEach(type => {
        if (isComposition(type)) {
          validateCompositions(type);
        } else {
          validateTypeAliases(type, false, node.type);
        }
      });
    }

    return {
      TSTypeAliasDeclaration(node) {
        if (isComposition(node.typeAnnotation)) {
          validateCompositions(node.typeAnnotation);
        } else {
          validateTypeAliases(node.typeAnnotation, true);
        }
      },
    };
  },
});
