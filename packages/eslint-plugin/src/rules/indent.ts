/**
 * @fileoverview Rule to flag non-camelcased identifiers
 *
 * Note this file is rather type-unsafe in its current state.
 * This is due to some really funky type conversions between different node types.
 * This is done intentionally based on the internal implementation of the base indent rule.
 */

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import baseRule from 'eslint/lib/rules/indent';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;
type Range = [number, number];

const KNOWN_NODES = new Set([
  // Class properties aren't yet supported by eslint...
  'ClassProperty',

  // ts keywords
  'TSAbstractKeyword',
  'TSAnyKeyword',
  'TSBooleanKeyword',
  'TSNeverKeyword',
  'TSNumberKeyword',
  'TSStringKeyword',
  'TSSymbolKeyword',
  'TSUndefinedKeyword',
  'TSUnknownKeyword',
  'TSVoidKeyword',
  'TSNullKeyword',

  // ts specific nodes we want to support
  'TSAbstractClassProperty',
  'TSAbstractMethodDefinition',
  'TSArrayType',
  'TSAsExpression',
  'TSCallSignatureDeclaration',
  'TSConditionalType',
  'TSConstructorType',
  'TSConstructSignatureDeclaration',
  'TSDeclareFunction',
  'TSEmptyBodyFunctionExpression',
  'TSEnumDeclaration',
  'TSEnumMember',
  'TSExportAssignment',
  'TSExternalModuleReference',
  'TSFunctionType',
  'TSImportType',
  'TSIndexedAccessType',
  'TSIndexSignature',
  'TSInferType',
  'TSInterfaceBody',
  'TSInterfaceDeclaration',
  'TSInterfaceHeritage',
  'TSIntersectionType',
  'TSImportEqualsDeclaration',
  'TSLiteralType',
  'TSMappedType',
  'TSMethodSignature',
  'TSMinusToken',
  'TSModuleBlock',
  'TSModuleDeclaration',
  'TSNonNullExpression',
  'TSParameterProperty',
  'TSParenthesizedType',
  'TSPlusToken',
  'TSPropertySignature',
  'TSQualifiedName',
  'TSQuestionToken',
  'TSRestType',
  'TSThisType',
  'TSTupleType',
  'TSTypeAnnotation',
  'TSTypeLiteral',
  'TSTypeOperator',
  'TSTypeParameter',
  'TSTypeParameterDeclaration',
  'TSTypeReference',
  'TSUnionType'
]);

const defaultOptions: Options = [
  // typescript docs and playground use 4 space indent
  4,
  {
    // typescript docs indent the case from the switch
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-8.html#example-4
    SwitchCase: 1,
    flatTernaryExpressions: false,
    ignoredNodes: []
  }
];

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent indentation',
      extraDescription: [util.tslintRule('indent')],
      category: 'Stylistic Issues',
      recommended: 'error',
      url: util.metaDocsUrl('indent')
    },
    fixable: 'whitespace',
    schema: baseRule.meta!.schema,
    messages: baseRule.meta!.messages
  },

  create(context) {
    // because we extend the base rule, have to update opts on the context
    // the context defines options as readonly though...
    const contextWithDefaults: typeof context = Object.create(context, {
      options: {
        writable: false,
        configurable: false,
        value: util.applyDefault(defaultOptions, context.options)
      }
    });

    const rules = baseRule.create(contextWithDefaults);

    /**
     * Converts from a TSPropertySignature to a Property
     * @param node a TSPropertySignature node
     * @param [type] the type to give the new node
     * @returns a Property node
     */
    function TSPropertySignatureToProperty(
      node:
        | TSESTree.TSPropertySignature
        | TSESTree.TSEnumMember
        | TSESTree.TypeElement,
      type:
        | AST_NODE_TYPES.ClassProperty
        | AST_NODE_TYPES.Property = AST_NODE_TYPES.Property
    ): TSESTree.Node | null {
      const base = {
        // indent doesn't actually use these
        key: null as any,
        value: null as any,

        // Property flags
        computed: false,
        method: false,
        kind: 'init',
        // this will stop eslint from interrogating the type literal
        shorthand: true,

        // location data
        parent: node.parent,
        range: node.range,
        loc: node.loc
      };
      if (type === AST_NODE_TYPES.Property) {
        return {
          type,
          ...base
        } as TSESTree.Property;
      } else {
        return {
          type,
          static: false,
          readonly: false,
          ...base
        } as TSESTree.ClassProperty;
      }
    }

    return Object.assign({}, rules, {
      // overwrite the base rule here so we can use our KNOWN_NODES list instead
      '*:exit'(node: TSESTree.Node) {
        // For nodes we care about, skip the default handling, because it just marks the node as ignored...
        if (!KNOWN_NODES.has(node.type)) {
          rules['*:exit'](node);
        }
      },

      TSAsExpression(node: TSESTree.TSAsExpression) {
        // transform it to a BinaryExpression
        return rules['BinaryExpression, LogicalExpression']({
          type: AST_NODE_TYPES.BinaryExpression,
          operator: 'as',
          left: node.expression,
          // the first typeAnnotation includes the as token
          right: node.typeAnnotation as any,

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      TSConditionalType(node: TSESTree.TSConditionalType) {
        // transform it to a ConditionalExpression
        return rules.ConditionalExpression({
          type: AST_NODE_TYPES.ConditionalExpression,
          test: {
            type: AST_NODE_TYPES.BinaryExpression,
            operator: 'extends',
            left: node.checkType as any,
            right: node.extendsType as any,

            // location data
            range: [node.checkType.range[0], node.extendsType.range[1]],
            loc: {
              start: node.checkType.loc.start,
              end: node.extendsType.loc.end
            }
          },
          consequent: node.trueType as any,
          alternate: node.falseType as any,

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      'TSEnumDeclaration, TSTypeLiteral'(
        node: TSESTree.TSEnumDeclaration | TSESTree.TSTypeLiteral
      ) {
        // transform it to an ObjectExpression
        return rules['ObjectExpression, ObjectPattern']({
          type: AST_NODE_TYPES.ObjectExpression,
          properties: (node.members as (
            | TSESTree.TSEnumMember
            | TSESTree.TypeElement)[]).map(
            member => TSPropertySignatureToProperty(member) as TSESTree.Property
          ),

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      TSImportEqualsDeclaration(node: TSESTree.TSImportEqualsDeclaration) {
        // transform it to an VariableDeclaration
        // use VariableDeclaration instead of ImportDeclaration because it's essentially the same thing
        const { id, moduleReference } = node;

        return rules.VariableDeclaration({
          type: AST_NODE_TYPES.VariableDeclaration,
          kind: 'const' as 'const',
          declarations: [
            {
              type: AST_NODE_TYPES.VariableDeclarator,
              range: [id.range[0], moduleReference.range[1]] as Range,
              loc: {
                start: id.loc.start,
                end: moduleReference.loc.end
              },
              id: id,
              init: {
                type: AST_NODE_TYPES.CallExpression,
                callee: {
                  type: AST_NODE_TYPES.Identifier,
                  name: 'require',
                  range: [
                    moduleReference.range[0],
                    moduleReference.range[0] + 'require'.length
                  ] as Range,
                  loc: {
                    start: moduleReference.loc.start,
                    end: {
                      line: moduleReference.loc.end.line,
                      column: moduleReference.loc.start.line + 'require'.length
                    }
                  }
                },
                arguments:
                  'expression' in moduleReference
                    ? [moduleReference.expression]
                    : [],

                // location data
                range: moduleReference.range,
                loc: moduleReference.loc
              }
            }
          ],

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      TSIndexedAccessType(node: TSESTree.TSIndexedAccessType) {
        // convert to a MemberExpression
        return rules['MemberExpression, JSXMemberExpression, MetaProperty']({
          type: AST_NODE_TYPES.MemberExpression,
          object: node.objectType as any,
          property: node.indexType as any,

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      TSInterfaceBody(node: TSESTree.TSInterfaceBody) {
        // transform it to an ClassBody
        return rules['BlockStatement, ClassBody']({
          type: AST_NODE_TYPES.ClassBody,
          body: node.body.map(
            p =>
              TSPropertySignatureToProperty(
                p,
                AST_NODE_TYPES.ClassProperty
              ) as TSESTree.ClassProperty
          ),

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      'TSInterfaceDeclaration[extends.length > 0]'(
        node: TSESTree.TSInterfaceDeclaration
      ) {
        // transform it to a ClassDeclaration
        return rules[
          'ClassDeclaration[superClass], ClassExpression[superClass]'
        ]({
          type: AST_NODE_TYPES.ClassDeclaration,
          body: node.body as any,
          id: undefined,
          // TODO: This is invalid, there can be more than one extends in interface
          superClass: node.extends![0].expression as any,

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      TSMappedType(node: TSESTree.TSMappedType) {
        const sourceCode = context.getSourceCode();
        const squareBracketStart = sourceCode.getTokenBefore(
          node.typeParameter
        )!;

        // transform it to an ObjectExpression
        return rules['ObjectExpression, ObjectPattern']({
          type: AST_NODE_TYPES.ObjectExpression,
          properties: [
            {
              type: AST_NODE_TYPES.Property,
              key: node.typeParameter as any,
              value: node.typeAnnotation as any,

              // location data
              range: [
                squareBracketStart.range[0],
                node.typeAnnotation
                  ? node.typeAnnotation.range[1]
                  : squareBracketStart.range[0]
              ] as Range,
              loc: {
                start: squareBracketStart.loc.start,
                end: node.typeAnnotation
                  ? node.typeAnnotation.loc.end
                  : squareBracketStart.loc.end
              },
              kind: 'init' as 'init',
              computed: false,
              method: false,
              shorthand: false
            }
          ],

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      TSModuleBlock(node: TSESTree.TSModuleBlock) {
        // transform it to a BlockStatement
        return rules['BlockStatement, ClassBody']({
          type: AST_NODE_TYPES.BlockStatement,
          body: node.body,

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      TSQualifiedName(node: TSESTree.TSQualifiedName) {
        return rules['MemberExpression, JSXMemberExpression, MetaProperty']({
          type: AST_NODE_TYPES.MemberExpression,
          object: node.left as any,
          property: node.right as any,

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      TSTupleType(node: TSESTree.TSTupleType) {
        // transform it to an ArrayExpression
        return rules['ArrayExpression, ArrayPattern']({
          type: AST_NODE_TYPES.ArrayExpression,
          elements: node.elementTypes as any,

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      },

      TSTypeParameterDeclaration(node: TSESTree.TSTypeParameterDeclaration) {
        const [name, ...attributes] = node.params;

        // JSX is about the closest we can get because the angle brackets
        // it's not perfect but it works!
        return rules.JSXOpeningElement({
          type: AST_NODE_TYPES.JSXOpeningElement,
          selfClosing: false,
          name: name as any,
          attributes: attributes as any,

          // location data
          parent: node.parent,
          range: node.range,
          loc: node.loc
        });
      }
    });
  }
};
export default rule;
export { Options, MessageIds };
