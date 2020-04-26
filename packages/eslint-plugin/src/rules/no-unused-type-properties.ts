import * as util from '../util';
import baseRule from 'eslint/lib/rules/no-extra-parens';
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

type MessageIds = 'unusedProperties';

//TODO(question): are there type checker somewhere ?
function isProperty(
  property: TSESTree.Property | TSESTree.RestElement,
): property is TSESTree.Property {
  return property.type === AST_NODE_TYPES.Property;
}

function isObjectPattern(
  param: TSESTree.Parameter,
): param is TSESTree.ObjectPattern {
  return param.type === AST_NODE_TYPES.ObjectPattern;
}

function isTypeAliasDeclaration(
  item: TSESTree.Statement,
): item is TSESTree.TSTypeAliasDeclaration {
  return item.type === AST_NODE_TYPES.TSTypeAliasDeclaration;
}

export default util.createRule<[], MessageIds>({
  name: 'no-unused-type-properties',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows unused type properties for destructured function arguments',
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: false,
    },
    messages: {
      unusedProperties:
        'Destructuring does not use all of the properties of the type {{name}}, you should either: remove the properties from the type, or use Omit<{{name}}, ...> to explicitly exclude the properties.',
    },
    schema: baseRule.meta.schema,
  },
  defaultOptions: [],

  create(context) {
    //returns the type property if missing in the properties list.
    const checkIfPropertyIsPresent = (
      objectPattern: TSESTree.ObjectPattern,
    ) => (typeProperty: TSESTree.TypeElement): void => {
      //type property name

      if (typeProperty.type !== AST_NODE_TYPES.TSPropertySignature) {
        return;
      }

      if (typeProperty.key.type !== AST_NODE_TYPES.Identifier) {
        return; //unnamed property, ex { "1"+"2" : 3}
      }

      const name = typeProperty.key.name;
      const properties = objectPattern.properties.filter(isProperty);

      const property = properties.find(
        property =>
          property.key.type === AST_NODE_TYPES.Identifier &&
          property.key.name === name,
      );
      if (!property) {
        context.report({
          node: objectPattern, //we report at the reference
          messageId: 'unusedProperties',
          data: {
            name: name,
          },
        }); //we explicitly know that a property is missing
        return;
      }

      //at this point, we have the property and and the name of type
      if (
        typeProperty.typeAnnotation &&
        property.value.type === AST_NODE_TYPES.ObjectPattern
      ) {
        recursiveCheck(property.value, typeProperty.typeAnnotation);
      }
      return;
    };

    const recursiveCheck = (
      object: TSESTree.ObjectPattern,
      type: TSESTree.TSTypeAnnotation,
    ): void => {
      //at this point, we can start the recursion

      const restElement = object.properties.find(
        property => property.type === AST_NODE_TYPES.RestElement,
      );
      if (restElement) {
        return;
      }

      //two interesting cases here : TSTypeReference and TSTypeLiteral

      // first, type reference. Goal is to find the corresponding type in the source
      // type T = { a: string, b: { c: string, d: string } };
      // function f({ a, b: {c, d}, d} : T) {}
      if (
        type.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
        type.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier
      ) {
        const typeName = type.typeAnnotation.typeName.name;
        const typeDeclaration = context
          .getSourceCode()
          .ast.body.filter(isTypeAliasDeclaration)
          .find(typeDeclaration => {
            return typeDeclaration.id.name === typeName;
          });
        if (
          !typeDeclaration ||
          typeDeclaration.typeAnnotation.type !== AST_NODE_TYPES.TSTypeLiteral
        ) {
          return;
        } //type not found

        typeDeclaration.typeAnnotation.members.map(
          checkIfPropertyIsPresent(object),
        );

        return; //WIP
        //reference to another type, time to learn the syntax or find a utility to find the type
      }

      //type definition in the function declaration
      // function f({ a, b: {c, d}, d} : {a: string}) {}
      if (type.typeAnnotation.type === AST_NODE_TYPES.TSTypeLiteral) {
        type.typeAnnotation.members.map(checkIfPropertyIsPresent(object));
      }

      //TODO: do we want to handle Omit ?

      //TODO: TSInterfaceDeclaration

      return;
    };

    const checkParameter = (
      paramObjectPattern: TSESTree.ObjectPattern,
    ): void => {
      if (!paramObjectPattern.typeAnnotation) {
        return;
      } //no type here, we can proceed
      recursiveCheck(paramObjectPattern, paramObjectPattern.typeAnnotation);
      return;
    };

    return {
      FunctionDeclaration(node): void {
        node.params.filter(isObjectPattern).forEach(checkParameter);
      },
    };
  },
});
