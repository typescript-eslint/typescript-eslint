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
  isParenthesized,
} from '../util';

type MessageIds = 'unused';

type PropertyMember = TSESTree.TSMethodSignature | TSESTree.TSPropertySignature;

type PatternOwner =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.VariableDeclarator;

type PropertyName = string | ts.Type;

interface PatternRoot {
  fixable: boolean;
  inferenceReferences: TSESTree.Node[];
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

    function checkPattern(
      root: PatternRoot,
      pattern: TSESTree.Node,
      typeNode: TSESTree.Node,
    ) {
      if (pattern.type === AST_NODE_TYPES.AssignmentPattern) {
        root = {
          ...root,
          fixable: root.fixable && isFixableInitializer(pattern.right),
        };
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
          checkArrayPatternOnTuple(root, pattern, typeNode);
        }
        return;
      }

      if (pattern.type !== AST_NODE_TYPES.ObjectPattern) {
        return;
      }

      switch (typeNode.type) {
        case AST_NODE_TYPES.TSTupleType:
          checkObjectPatternOnTuple(root, pattern, typeNode);
          break;
        case AST_NODE_TYPES.TSTypeLiteral:
          checkObjectPatternOnTypeLiteral(root, pattern, typeNode);
          break;
        case AST_NODE_TYPES.TSTypeReference:
          checkObjectPatternOnRecord(root, pattern, typeNode);
          break;
      }
    }

    function checkObjectPatternOnTypeLiteral(
      root: PatternRoot,
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
          const keyType = member.computed
            ? services.getTypeAtLocation(member.key)
            : getStaticKeyType(member.key);
          const name = getPropertyName(keyType);
          if (name != null) {
            propertyMembers.set(member, { name, keyType });
          }
        }
      }

      const used = new Set<TSESTree.TypeElement>();
      const nested = new Map<TSESTree.TypeNode, Set<TSESTree.Node>>();

      function markPropertiesUsed(
        property: TSESTree.Property,
        predicate: (memberKey: {
          keyType: ts.Type;
          name: PropertyName;
        }) => boolean,
      ) {
        let matched = false;
        for (const [member, memberKey] of propertyMembers) {
          if (!predicate(memberKey)) {
            continue;
          }

          matched = true;
          used.add(member);
          if (
            member.type === AST_NODE_TYPES.TSPropertySignature &&
            member.typeAnnotation
          ) {
            addNestedPattern(
              nested,
              member.typeAnnotation.typeAnnotation,
              property.value,
            );
          }
        }
        return matched;
      }

      function markIndexSignaturesUsed(
        predicate: (indexKeyType: ts.Type) => boolean,
      ) {
        let matched = false;
        for (const [member, indexKeyTypes] of indexSignatures) {
          if (indexKeyTypes.some(predicate)) {
            matched = true;
            used.add(member);
          }
        }
        return matched;
      }

      for (const [property, propertyKeyTypes] of keyTypes) {
        for (const keyType of propertyKeyTypes) {
          const name = getPropertyName(keyType);

          if (name == null) {
            markPropertiesUsed(property, memberKey =>
              mightBeKey(memberKey.keyType, keyType),
            );
            markIndexSignaturesUsed(indexKeyType =>
              typesOverlap(keyType, indexKeyType),
            );
          } else if (
            !markPropertiesUsed(
              property,
              memberKey => memberKey.name === name,
            ) &&
            !markIndexSignaturesUsed(
              indexKeyType =>
                !tsutils.isIntrinsicStringType(indexKeyType) &&
                checker.isTypeAssignableTo(keyType, indexKeyType),
            ) &&
            !markIndexSignaturesUsed(tsutils.isIntrinsicStringType)
          ) {
            markIndexSignaturesUsed(tsutils.isIntrinsicNumberType);
          }
        }
      }

      const reported = new Set<TSESTree.TypeElement>(
        [...propertyMembers.keys(), ...indexSignatures.keys()].filter(
          member => !used.has(member),
        ),
      );
      const remaining = typeNode.members.filter(
        member => !reported.has(member),
      );
      const membersRoot =
        remaining.length > 0 &&
        remaining.every(
          member =>
            (member.type === AST_NODE_TYPES.TSMethodSignature ||
              member.type === AST_NODE_TYPES.TSPropertySignature) &&
            member.optional,
        )
          ? { ...root, fixable: false }
          : root;

      for (const [member, { name }] of propertyMembers) {
        if (reported.has(member)) {
          report(
            membersRoot,
            member,
            'property',
            typeof name === 'string'
              ? name
              : `[${context.sourceCode.getText(member.key)}]`,
          );
        }
      }

      for (const [member, indexKeyTypes] of indexSignatures) {
        if (reported.has(member)) {
          report(
            membersRoot,
            member,
            'index signature',
            `[${indexKeyTypes.map(type => checker.typeToString(type)).join(' | ')}]`,
          );
        }
      }

      checkNestedPatterns(root, nested);
    }

    function checkObjectPatternOnTuple(
      root: PatternRoot,
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
      const elementsByName = new Map(
        elements.map((element, index) => [String(index), element]),
      );
      const used = new Map<TSESTree.TypeNode, Set<TSESTree.Node>>();

      for (const [property, propertyKeyTypes] of keyTypes) {
        for (const keyType of propertyKeyTypes) {
          const name = getPropertyName(keyType);
          const element = typeof name === 'string' && elementsByName.get(name);
          if (!element) {
            return;
          }

          addNestedPattern(used, element, property.value);
        }
      }

      checkNestedPatterns(root, used);

      for (const [index, element] of elements.entries()) {
        if (!used.has(element)) {
          report(root, element, 'element', String(index), null);
        }
      }
    }

    function checkObjectPatternOnRecord(
      root: PatternRoot,
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
          root,
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
      root: PatternRoot,
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
            report(root, member, 'element', String(index), null);
          }
          continue;
        }

        if (element.type === AST_NODE_TYPES.RestElement) {
          return;
        }

        if (restTypesCount === 0) {
          checkPattern(root, element, member);
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

    function checkNestedPatterns(
      root: PatternRoot,
      nested: Map<TSESTree.TypeNode, Set<TSESTree.Node>>,
    ) {
      for (const [typeNode, patterns] of nested) {
        if (patterns.size === 1) {
          checkPattern(root, [...patterns][0], typeNode);
        }
      }
    }

    function getStaticKeyType(key: TSESTree.Identifier | TSESTree.Literal) {
      if (key.type === AST_NODE_TYPES.Identifier) {
        return checker.getStringLiteralType(key.name);
      }

      return typeof key.value === 'number'
        ? checker.getNumberLiteralType(key.value)
        : checker.getStringLiteralType(String(key.value));
    }

    function mightBeKey(memberKeyType: ts.Type, keyType: ts.Type) {
      if (checker.isTypeAssignableTo(memberKeyType, keyType)) {
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
        (!tsutils.isTemplateLiteralType(keyType) &&
          (checker.isTypeAssignableTo(keyType, checker.getStringType()) ||
            checker.isTypeAssignableTo(keyType, checker.getNumberType())))
      );
    }

    function typesOverlap(a: ts.Type, b: ts.Type) {
      return (
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
      const tokenBefore = context.sourceCode.getTokenBefore(constituent);

      return removeRange(
        fixer,
        constituent,
        tokenAfter?.value === '|'
          ? [constituent.range[0], tokenAfter.range[1]]
          : [
              tokenBefore?.value === '|'
                ? tokenBefore.range[0]
                : constituent.range[0],
              constituent.range[1],
            ],
      );
    }

    function removeMember(fixer: TSESLint.RuleFixer, member: TSESTree.Node) {
      const { text } = context.sourceCode;
      const tokenAfter = context.sourceCode.getTokenAfter(member);
      const tokenBefore = context.sourceCode.getTokenBefore(member);
      if (
        (tokenAfter?.value === '(' || tokenAfter?.value === '<') &&
        tokenBefore?.value !== '{' &&
        tokenBefore?.value !== ',' &&
        tokenBefore?.value !== ';'
      ) {
        return null;
      }

      const lineStart = text.lastIndexOf('\n', member.range[0] - 1) + 1;
      const lineEnd = text.indexOf('\n', member.range[1]);

      return removeRange(
        fixer,
        member,
        lineEnd !== -1 &&
          !text.slice(lineStart, member.range[0]).trim() &&
          !text.slice(member.range[1], lineEnd).trim()
          ? [lineStart, lineEnd + 1]
          : member.range,
      );
    }

    function removeRange(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.Node,
      range: TSESTree.Range,
    ) {
      const tokenBefore = context.sourceCode.getTokenBefore(node);
      const hasLeadingComments = context.sourceCode
        .getCommentsBefore(node)
        .some(
          comment =>
            comment.loc.start.line !== tokenBefore?.loc.end.line ||
            comment.loc.end.line === node.loc.start.line,
        );
      const hasComments = context.sourceCode
        .getAllComments()
        .some(
          comment => comment.range[0] < range[1] && comment.range[1] > range[0],
        );

      return hasLeadingComments ||
        hasComments ||
        isParenthesized(node, context.sourceCode)
        ? null
        : fixer.removeRange(range);
    }

    function isStandaloneOwner(owner: PatternOwner) {
      if (
        owner.type === AST_NODE_TYPES.FunctionDeclaration ||
        owner.type === AST_NODE_TYPES.VariableDeclarator
      ) {
        return true;
      }

      const { parent } = owner;

      switch (parent.type) {
        case AST_NODE_TYPES.MethodDefinition:
          return parent.kind === 'constructor'
            ? parent.parent.body.every(
                member =>
                  member === parent ||
                  member.type !== AST_NODE_TYPES.MethodDefinition ||
                  member.kind !== 'constructor',
              )
            : !isConstrainedClass(parent.parent.parent) &&
                services
                  .getTypeAtLocation(parent)
                  .getCallSignatures()
                  .every(
                    signature =>
                      signature.getDeclaration() ===
                      services.esTreeNodeToTSNodeMap.get(parent),
                  );
        case AST_NODE_TYPES.VariableDeclarator:
          return !parent.id.typeAnnotation;
        default:
          return false;
      }
    }

    function report(
      root: PatternRoot,
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
        fix:
          root.fixable &&
          !root.inferenceReferences.some(
            reference =>
              node.range[0] <= reference.range[0] &&
              reference.range[1] <= node.range[1],
          )
            ? fix
            : null,
      });
    }

    return {
      ':matches(ArrayPattern, ObjectPattern)[typeAnnotation]'(
        node: (TSESTree.ArrayPattern | TSESTree.ObjectPattern) & {
          typeAnnotation: TSESTree.TSTypeAnnotation;
        },
      ) {
        const owner = getImplementationOwner(node);
        if (!owner || isDefinitionFile(context.filename)) {
          return;
        }

        const initializer =
          node.parent.type === AST_NODE_TYPES.AssignmentPattern
            ? node.parent.right
            : owner.type === AST_NODE_TYPES.VariableDeclarator
              ? owner.init
              : null;

        checkPattern(
          {
            fixable:
              isFixableInitializer(initializer) && isStandaloneOwner(owner),
            inferenceReferences:
              owner.type === AST_NODE_TYPES.VariableDeclarator
                ? []
                : [
                    owner,
                    ...(owner.typeParameters?.params ?? []),
                    ...(owner.parent.type === AST_NODE_TYPES.MethodDefinition &&
                    owner.parent.kind === 'constructor'
                      ? (owner.parent.parent.parent.typeParameters?.params ??
                        [])
                      : []),
                  ].flatMap(declaration =>
                    context.sourceCode
                      .getDeclaredVariables(declaration)
                      .flatMap(variable =>
                        variable.references.map(
                          reference => reference.identifier,
                        ),
                      ),
                  ),
          },
          node,
          node.typeAnnotation.typeAnnotation,
        );
      },
    };
  },
});

function addNestedPattern(
  nested: Map<TSESTree.TypeNode, Set<TSESTree.Node>>,
  typeNode: TSESTree.TypeNode,
  pattern: TSESTree.Node,
) {
  nested.set(typeNode, new Set(nested.get(typeNode)).add(pattern));
}

function isFixableInitializer(node: TSESTree.Expression | null) {
  switch (node?.type) {
    case undefined:
    case AST_NODE_TYPES.Identifier:
    case AST_NODE_TYPES.MemberExpression:
      return true;
    case AST_NODE_TYPES.ObjectExpression:
      return node.properties.length === 0;
    default:
      return false;
  }
}

function isConstrainedClass(
  node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
) {
  return (
    node.superClass != null ||
    node.implements.length > 0 ||
    node.body.body.some(
      member => member.type === AST_NODE_TYPES.TSIndexSignature,
    )
  );
}

function getPropertyName(type: ts.Type): PropertyName | undefined {
  if (tsutils.isStringLiteralType(type) || tsutils.isNumberLiteralType(type)) {
    return String(type.value);
  }

  return tsutils.isUniqueESSymbolType(type) ? type : undefined;
}

function getImplementationOwner(node: TSESTree.Node) {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    if (
      ancestor.type === AST_NODE_TYPES.TSModuleDeclaration &&
      ancestor.declare
    ) {
      return undefined;
    }
  }

  const parent =
    node.parent?.type === AST_NODE_TYPES.AssignmentPattern
      ? node.parent.parent
      : node.parent;

  switch (parent?.type) {
    case AST_NODE_TYPES.ArrowFunctionExpression:
    case AST_NODE_TYPES.FunctionDeclaration:
      return parent;
    case AST_NODE_TYPES.FunctionExpression:
      return (parent.parent.type === AST_NODE_TYPES.MethodDefinition ||
        parent.parent.type === AST_NODE_TYPES.Property) &&
        parent.parent.kind === 'set'
        ? undefined
        : parent;
    case AST_NODE_TYPES.VariableDeclarator:
      return parent.parent.declare ? undefined : parent;
    default:
      return undefined;
  }
}
