import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isBuiltinTypeAliasLike,
  isDefinitionFile,
} from '../util';

type MessageIds = 'unused';

type PropertyMember = TSESTree.TSMethodSignature | TSESTree.TSPropertySignature;

type PropertyName = string | ts.Type;

interface TypeAnnotationOf<T> {
  typeAnnotation: TSESTree.TSTypeAnnotation & {
    typeAnnotation: T;
  };
}

export default createRule<[], MessageIds>({
  name: 'no-unused-destructure-type-properties',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow properties of inline object and tuple types that are never destructured',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      unused:
        "This type declares {{type}} '{{key}}', but the destructuring pattern never uses it.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function checkPattern(pattern: TSESTree.Node, typeNode: TSESTree.Node) {
      if (pattern.type === AST_NODE_TYPES.AssignmentPattern) {
        pattern = pattern.left;
      }

      if (typeNode.type === AST_NODE_TYPES.TSNamedTupleMember) {
        typeNode = typeNode.elementType;
      }

      if (typeNode.type === AST_NODE_TYPES.TSOptionalType) {
        typeNode = typeNode.typeAnnotation;
      }

      if (
        typeNode.type === AST_NODE_TYPES.TSTypeOperator &&
        typeNode.operator === 'readonly' &&
        typeNode.typeAnnotation
      ) {
        typeNode = typeNode.typeAnnotation;
      }

      if (pattern.type === AST_NODE_TYPES.ArrayPattern) {
        if (typeNode.type === AST_NODE_TYPES.TSTupleType) {
          checkArrayPatternOnTuple(pattern, typeNode);
        }
        return;
      }

      if (pattern.type !== AST_NODE_TYPES.ObjectPattern) {
        return;
      }

      switch (typeNode.type) {
        case AST_NODE_TYPES.TSTupleType:
          checkObjectPatternOnTuple(pattern, typeNode);
          break;
        case AST_NODE_TYPES.TSTypeLiteral:
          checkObjectPatternOnTypeLiteral(pattern, typeNode);
          break;
        case AST_NODE_TYPES.TSTypeReference:
          checkObjectPatternOnRecord(pattern, typeNode);
          break;
      }
    }

    function checkObjectPatternOnTypeLiteral(
      pattern: TSESTree.ObjectPattern,
      typeNode: TSESTree.TSTypeLiteral,
    ) {
      const keyTypes = getDestructuredKeyTypes(pattern);
      if (!keyTypes) {
        return;
      }

      const propertyMembers = new Map<
        PropertyMember,
        { keyType: ts.Type; name: PropertyName }
      >();
      const indexSignatures = new Map<TSESTree.TSIndexSignature, ts.Type[]>();

      for (const member of typeNode.members) {
        if (member.type === AST_NODE_TYPES.TSIndexSignature) {
          indexSignatures.set(
            member,
            tsutils.unionConstituents(
              getConstrainedTypeAtLocation(services, member.parameters[0]),
            ),
          );
        } else if (
          member.type === AST_NODE_TYPES.TSMethodSignature ||
          member.type === AST_NODE_TYPES.TSPropertySignature
        ) {
          const keyType = getMemberKeyType(member);
          const name = getPropertyName(keyType);
          if (name != null) {
            propertyMembers.set(member, { name, keyType });
          }
        }
      }

      const used = new Set<TSESTree.TypeElement>();
      const nested = new Map<TSESTree.TypeNode, TSESTree.Node[]>();

      function markPropertyUsed(
        member: PropertyMember,
        property: TSESTree.Property,
      ) {
        used.add(member);
        if (
          member.type === AST_NODE_TYPES.TSPropertySignature &&
          member.typeAnnotation
        ) {
          const memberTypeNode = member.typeAnnotation.typeAnnotation;
          nested.set(memberTypeNode, [
            ...(nested.get(memberTypeNode) ?? []),
            property.value,
          ]);
        }
      }

      for (const [property, propertyKeyTypes] of keyTypes) {
        for (const keyType of propertyKeyTypes) {
          const name = getPropertyName(keyType);

          if (name == null) {
            for (const [member, memberKey] of propertyMembers) {
              if (mightBeKey(memberKey.keyType, keyType)) {
                markPropertyUsed(member, property);
              }
            }
            for (const [member, indexKeyTypes] of indexSignatures) {
              if (
                indexKeyTypes.some(indexKeyType =>
                  typesOverlap(keyType, indexKeyType),
                )
              ) {
                used.add(member);
              }
            }
            continue;
          }

          let matched = false;

          for (const [member, memberKey] of propertyMembers) {
            if (memberKey.name !== name) {
              continue;
            }

            matched = true;
            markPropertyUsed(member, property);
          }

          if (matched) {
            continue;
          }

          for (const [member, indexKeyTypes] of indexSignatures) {
            if (
              indexKeyTypes.some(
                indexKeyType =>
                  !tsutils.isIntrinsicStringType(indexKeyType) &&
                  isApplicableKey(keyType, indexKeyType),
              )
            ) {
              matched = true;
              used.add(member);
            }
          }

          if (matched || tsutils.isUniqueESSymbolType(keyType)) {
            continue;
          }

          for (const [member, indexKeyTypes] of indexSignatures) {
            if (indexKeyTypes.some(tsutils.isIntrinsicStringType)) {
              used.add(member);
            }
          }
        }
      }

      for (const [member, { name }] of propertyMembers) {
        if (!used.has(member)) {
          report(
            member,
            'property',
            typeof name === 'string'
              ? name
              : `[${context.sourceCode.getText(member.key)}]`,
          );
        }
      }

      for (const [member, indexKeyTypes] of indexSignatures) {
        if (!used.has(member)) {
          report(
            member,
            'index signature',
            `[${indexKeyTypes.map(type => checker.typeToString(type)).join(' | ')}]`,
          );
        }
      }

      for (const [nestedTypeNode, nestedPatterns] of nested) {
        if (nestedPatterns.length === 1) {
          checkPattern(nestedPatterns[0], nestedTypeNode);
        }
      }
    }

    function checkObjectPatternOnTuple(
      pattern: TSESTree.ObjectPattern,
      typeNode: TSESTree.TSTupleType,
    ) {
      const keyTypes = getDestructuredKeyTypes(pattern);
      if (!keyTypes) {
        return;
      }

      const restIndex = typeNode.elementTypes.findIndex(
        element => element.type === AST_NODE_TYPES.TSRestType,
      );
      const elements =
        restIndex === -1
          ? typeNode.elementTypes
          : typeNode.elementTypes.slice(0, restIndex);
      const used = new Map<TSESTree.TypeNode, TSESTree.Node[]>();

      for (const [property, propertyKeyTypes] of keyTypes) {
        for (const keyType of propertyKeyTypes) {
          const name = getPropertyName(keyType);
          if (typeof name !== 'string' || !isNumericName(name)) {
            return;
          }

          if (Number(name) in elements) {
            const element = elements[Number(name)];
            used.set(element, [...(used.get(element) ?? []), property.value]);
          }
        }
      }

      for (const [element, elementPatterns] of used) {
        if (elementPatterns.length === 1) {
          checkPattern(elementPatterns[0], element);
        }
      }

      for (const [index, element] of elements.entries()) {
        if (!used.has(element)) {
          report(element, 'element', String(index), null);
        }
      }
    }

    function checkObjectPatternOnRecord(
      pattern: TSESTree.ObjectPattern,
      typeNode: TSESTree.TSTypeReference,
    ) {
      const keysNode = typeNode.typeArguments?.params.at(0);
      if (
        keysNode?.type !== AST_NODE_TYPES.TSUnionType ||
        !isBuiltinTypeAliasLike(
          services.program,
          services.getTypeAtLocation(typeNode),
          type => type.aliasSymbol.getName() === 'Record',
        )
      ) {
        return;
      }

      const keyTypes = getDestructuredKeyTypes(pattern);
      if (!keyTypes) {
        return;
      }

      const names = new Set<PropertyName>();

      for (const propertyKeyTypes of keyTypes.values()) {
        for (const keyType of propertyKeyTypes) {
          const name = getPropertyName(keyType);
          if (name == null) {
            return;
          }
          names.add(name);
        }
      }

      const unused = keysNode.types.flatMap(constituent => {
        const name = getPropertyName(services.getTypeAtLocation(constituent));
        return constituent.type === AST_NODE_TYPES.TSLiteralType &&
          typeof name === 'string' &&
          !names.has(name)
          ? [{ name, constituent }]
          : [];
      });

      for (const { name, constituent } of unused) {
        report(
          constituent,
          'key',
          name,
          unused.length === keysNode.types.length
            ? null
            : fixer => removeUnionConstituent(fixer, constituent),
        );
      }
    }

    function checkArrayPatternOnTuple(
      pattern: TSESTree.ArrayPattern,
      typeNode: TSESTree.TSTupleType,
    ) {
      let restTypesCount = 0;

      for (const [index, member] of typeNode.elementTypes.entries()) {
        const patternIndex = index - restTypesCount;
        const element = pattern.elements.at(patternIndex);

        if (member.type === AST_NODE_TYPES.TSRestType) {
          restTypesCount++;
        }

        if (element == null) {
          if (
            pattern.elements
              .slice(patternIndex)
              .every(laterElement => laterElement == null)
          ) {
            report(member, 'element', String(index));
          }
          continue;
        }

        if (element.type === AST_NODE_TYPES.RestElement) {
          return;
        }

        if (restTypesCount === 0) {
          checkPattern(element, member);
        }
      }
    }

    function getDestructuredKeyTypes(pattern: TSESTree.ObjectPattern) {
      const keyTypes = new Map<TSESTree.Property, ts.Type[]>();

      for (const property of pattern.properties) {
        if (
          property.type === AST_NODE_TYPES.RestElement ||
          tsutils.isIntrinsicErrorType(
            services.getTypeAtLocation(property.value),
          )
        ) {
          return undefined;
        }

        keyTypes.set(
          property,
          property.computed
            ? tsutils.unionConstituents(
                getConstrainedTypeAtLocation(services, property.key),
              )
            : [getStaticKeyType(property.key)],
        );
      }

      return keyTypes;
    }

    function getMemberKeyType(member: PropertyMember) {
      return member.computed
        ? services.getTypeAtLocation(member.key)
        : getStaticKeyType(member.key);
    }

    function getStaticKeyType(key: TSESTree.Identifier | TSESTree.Literal) {
      if (key.type === AST_NODE_TYPES.Identifier) {
        return checker.getStringLiteralType(key.name);
      }

      return typeof key.value === 'number'
        ? checker.getNumberLiteralType(key.value)
        : checker.getStringLiteralType(String(key.value));
    }

    function isApplicableKey(source: ts.Type, target: ts.Type) {
      return (
        checker.isTypeAssignableTo(source, target) ||
        (tsutils.isStringLiteralType(source) &&
          isNumericName(source.value) &&
          checker.isTypeAssignableTo(checker.getNumberType(), target))
      );
    }

    function mightBeKey(memberKeyType: ts.Type, keyType: ts.Type) {
      if (
        tsutils.isIntrinsicAnyType(keyType) ||
        checker.isTypeAssignableTo(memberKeyType, keyType)
      ) {
        return true;
      }

      const name = getPropertyName(memberKeyType);
      if (typeof name !== 'string') {
        return false;
      }

      return (
        checker.isTypeAssignableTo(
          checker.getStringLiteralType(name),
          keyType,
        ) ||
        (isNumericName(name) &&
          checker.isTypeAssignableTo(
            checker.getNumberLiteralType(Number(name)),
            keyType,
          )) ||
        (!tsutils.isTemplateLiteralType(keyType) &&
          (checker.isTypeAssignableTo(keyType, checker.getStringType()) ||
            (isNumericName(name) &&
              checker.isTypeAssignableTo(keyType, checker.getNumberType()))))
      );
    }

    function typesOverlap(a: ts.Type, b: ts.Type) {
      return (
        tsutils.isIntrinsicAnyType(a) ||
        checker.isTypeAssignableTo(a, b) ||
        checker.isTypeAssignableTo(b, a) ||
        (tsutils.isIntrinsicStringType(b) &&
          checker.isTypeAssignableTo(a, checker.getNumberType())) ||
        (tsutils.isIntrinsicNumberType(b) &&
          checker.isTypeAssignableTo(a, checker.getStringType()))
      );
    }

    function removeUnionConstituent(
      fixer: TSESLint.RuleFixer,
      constituent: TSESTree.TypeNode,
    ) {
      const tokenAfter = context.sourceCode.getTokenAfter(constituent);
      if (tokenAfter?.value === '|') {
        return removeRange(fixer, constituent, [
          constituent.range[0],
          tokenAfter.range[1],
        ]);
      }

      const tokenBefore = context.sourceCode.getTokenBefore(constituent);
      return removeRange(fixer, constituent, [
        tokenBefore?.value === '|'
          ? tokenBefore.range[0]
          : constituent.range[0],
        constituent.range[1],
      ]);
    }

    function removeMember(fixer: TSESLint.RuleFixer, member: TSESTree.Node) {
      const { text } = context.sourceCode;
      const tokenAfter = context.sourceCode.getTokenAfter(member);
      const end =
        tokenAfter?.value === ',' ? tokenAfter.range[1] : member.range[1];
      const lineStart = text.lastIndexOf('\n', member.range[0] - 1) + 1;
      const lineEnd = text.indexOf('\n', end);

      return removeRange(
        fixer,
        member,
        lineEnd !== -1 &&
          !text.slice(lineStart, member.range[0]).trim() &&
          !text.slice(end, lineEnd).trim()
          ? [lineStart, lineEnd + 1]
          : [member.range[0], end],
      );
    }

    function removeRange(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.Node,
      range: TSESTree.Range,
    ) {
      const hasLeadingComments =
        context.sourceCode.getCommentsBefore(node).length > 0;
      const isParenthesized =
        context.sourceCode.getTokenBefore(node)?.value === '(' &&
        context.sourceCode.getTokenAfter(node)?.value === ')';
      const hasComments = context.sourceCode
        .getAllComments()
        .some(
          comment => comment.range[0] < range[1] && comment.range[1] > range[0],
        );

      return hasLeadingComments || isParenthesized || hasComments
        ? null
        : fixer.removeRange(range);
    }

    function report(
      node: TSESTree.Node,
      type: string,
      key: string,
      fix: TSESLint.ReportFixFunction | null = fixer =>
        removeMember(fixer, node),
    ) {
      context.report({
        node,
        messageId: 'unused',
        data: { type, key },
        fix,
      });
    }

    return {
      ':matches(ArrayPattern, ObjectPattern)[typeAnnotation]'(
        node: (TSESTree.ArrayPattern | TSESTree.ObjectPattern) &
          TypeAnnotationOf<TSESTree.TypeNode>,
      ) {
        if (
          !isDefinitionFile(context.filename) &&
          isImplementationPattern(node)
        ) {
          checkPattern(node, node.typeAnnotation.typeAnnotation);
        }
      },
    };
  },
});

function getPropertyName(type: ts.Type): PropertyName | undefined {
  if (tsutils.isStringLiteralType(type) || tsutils.isNumberLiteralType(type)) {
    return String(type.value);
  }

  return tsutils.isUniqueESSymbolType(type) ? type : undefined;
}

function isImplementationPattern(node: TSESTree.Node) {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    if (
      ancestor.type === AST_NODE_TYPES.TSModuleDeclaration &&
      ancestor.declare
    ) {
      return false;
    }
  }

  const parent =
    node.parent?.type === AST_NODE_TYPES.AssignmentPattern
      ? node.parent.parent
      : node.parent;

  switch (parent?.type) {
    case AST_NODE_TYPES.ArrowFunctionExpression:
    case AST_NODE_TYPES.FunctionDeclaration:
    case AST_NODE_TYPES.FunctionExpression:
      return true;
    case AST_NODE_TYPES.VariableDeclarator:
      return !parent.parent.declare;
    default:
      return false;
  }
}

function isNumericName(name: string) {
  return String(Number(name)) === name;
}
