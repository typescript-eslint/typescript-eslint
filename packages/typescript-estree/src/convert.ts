// There's lots of funny stuff due to the typing of ts.Node
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import * as ts from 'typescript';
import { SyntaxKind } from 'typescript';

import { getDecorators, getModifiers } from './getModifiers';
import type { TSError } from './node-utils';
import {
  canContainDirective,
  createError,
  findNextToken,
  getBinaryExpressionType,
  getDeclarationKind,
  getLastModifier,
  getLineAndCharacterFor,
  getLocFor,
  getRange,
  getTextForTokenKind,
  getTSNodeAccessibility,
  hasModifier,
  isChainExpression,
  isChildUnwrappableOptionalChain,
  isComma,
  isComputedProperty,
  isESTreeClassMember,
  isOptional,
  isThisInTypeQuery,
  unescapeStringLiteralText,
} from './node-utils';
import type {
  ParserWeakMap,
  ParserWeakMapESTreeToTSNode,
} from './parser-options';
import type { SemanticOrSyntacticError } from './semantic-or-syntactic-errors';
import type { TSESTree, TSESTreeToTSNode, TSNode } from './ts-estree';
import { AST_NODE_TYPES } from './ts-estree';
import { typescriptVersionIsAtLeast } from './version-check';

interface ConverterOptions {
  errorOnUnknownASTType: boolean;
  shouldPreserveNodeMaps: boolean;
}

/**
 * Extends and formats a given error object
 * @param error the error object
 * @returns converted error object
 */
export function convertError(
  error: ts.DiagnosticWithLocation | SemanticOrSyntacticError,
): TSError {
  return createError(
    error.file!,
    error.start!,
    ('message' in error && error.message) || (error.messageText as string),
  );
}

export interface ASTMaps {
  esTreeNodeToTSNodeMap: ParserWeakMapESTreeToTSNode;
  tsNodeToESTreeNodeMap: ParserWeakMap<TSNode, TSESTree.Node>;
}

/**
 * Converts a TypeScript node into an ESTree node
 * @param ast the full TypeScript AST
 * @param options additional options for the conversion
 * @returns the converted ESTreeNode
 */
export function converter(
  ast: ts.SourceFile,
  options: ConverterOptions,
): ASTMaps & {
  program: TSESTree.Program;
} {
  const esTreeNodeToTSNodeMap = new WeakMap();
  const tsNodeToESTreeNodeMap = new WeakMap();

  let allowPattern = false;
  let inTypeMode = false;

  function convertProgram(): TSESTree.Program {
    return converter(ast) as TSESTree.Program;
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param node the child ts.Node
   * @param parent parentNode
   * @param inTypeMode flag to determine if we are in typeMode
   * @param allowPattern flag to determine if patterns are allowed
   * @returns the converted ESTree node
   */
  function converter(
    node?: ts.Node,
    parent?: ts.Node,
    inputInTypeMode?: boolean,
    inputAllowPattern?: boolean,
  ): any {
    /**
     * Exit early for null and undefined
     */
    if (!node) {
      return null;
    }

    const oldTypeMode = inTypeMode;
    const oldPattern = allowPattern;
    if (inputInTypeMode !== undefined) {
      inTypeMode = inputInTypeMode;
    }
    if (inputAllowPattern !== undefined) {
      allowPattern = inputAllowPattern;
    }

    const result = convertNode(
      node as TSNode,
      (parent ?? node.parent) as TSNode,
    );

    registerTSNodeInNodeMap(node, result);

    inTypeMode = oldTypeMode;
    allowPattern = oldPattern;
    return result;
  }

  /**
   * Fixes the exports of the given ts.Node
   * @param node the ts.Node
   * @param result result
   * @returns the ESTreeNode with fixed exports
   */
  function fixExports<
    T extends
      | TSESTree.DefaultExportDeclarations
      | TSESTree.NamedExportDeclarations,
  >(
    node:
      | ts.FunctionDeclaration
      | ts.VariableStatement
      | ts.ClassDeclaration
      | ts.ClassExpression
      | ts.TypeAliasDeclaration
      | ts.InterfaceDeclaration
      | ts.EnumDeclaration
      | ts.ModuleDeclaration,
    result: T,
  ): TSESTree.ExportDefaultDeclaration | TSESTree.ExportNamedDeclaration | T {
    // check for exports
    const modifiers = getModifiers(node);
    if (modifiers?.[0].kind === SyntaxKind.ExportKeyword) {
      /**
       * Make sure that original node is registered instead of export
       */
      registerTSNodeInNodeMap(node, result);

      const exportKeyword = modifiers[0];
      const nextModifier = modifiers[1];
      const declarationIsDefault =
        nextModifier && nextModifier.kind === SyntaxKind.DefaultKeyword;

      const varToken = declarationIsDefault
        ? findNextToken(nextModifier, ast, ast)
        : findNextToken(exportKeyword, ast, ast);

      result.range[0] = varToken!.getStart(ast);
      result.loc = getLocFor(result.range[0], result.range[1], ast);

      if (declarationIsDefault) {
        return createNode<TSESTree.ExportDefaultDeclaration>(node, {
          type: AST_NODE_TYPES.ExportDefaultDeclaration,
          declaration: result,
          range: [exportKeyword.getStart(ast), result.range[1]],
          exportKind: 'value',
        });
      } else {
        const isType =
          result.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
          result.type === AST_NODE_TYPES.TSTypeAliasDeclaration;
        const isDeclare = 'declare' in result && result.declare === true;
        return createNode<TSESTree.ExportNamedDeclaration>(node, {
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          // @ts-expect-error - TODO, narrow the types here
          declaration: result,
          specifiers: [],
          source: null,
          exportKind: isType || isDeclare ? 'type' : 'value',
          range: [exportKeyword.getStart(ast), result.range[1]],
          assertions: [],
        });
      }
    }

    return result;
  }

  /**
   * Register specific TypeScript node into map with first ESTree node provided
   */
  function registerTSNodeInNodeMap(
    node: ts.Node,
    result: TSESTree.Node | null,
  ): void {
    if (result && options.shouldPreserveNodeMaps) {
      if (!tsNodeToESTreeNodeMap.has(node)) {
        tsNodeToESTreeNodeMap.set(node, result);
      }
    }
  }

  function createNode<T extends TSESTree.Node = TSESTree.Node>(
    node: TSESTreeToTSNode<T>,
    data: TSESTree.OptionalRangeAndLoc<T>,
  ): T {
    const result = data;
    if (!result.range) {
      result.range = getRange(
        // this is completely valid, but TS hates it
        node as never,
        ast,
      );
    }
    if (!result.loc) {
      result.loc = getLocFor(result.range[0], result.range[1], ast);
    }

    if (result && options.shouldPreserveNodeMaps) {
      esTreeNodeToTSNodeMap.set(result, node);
    }
    return result as T;
  }

  /**
   * For nodes that are copied directly from the TypeScript AST into
   * ESTree mostly as-is. The only difference is the addition of a type
   * property instead of a kind property. Recursively copies all children.
   */
  function deeplyCopy(node: TSNode): TSESTree.Node {
    if (node.kind === SyntaxKind.JSDocFunctionType) {
      throw createError(
        ast,
        node.pos,
        'JSDoc types can only be used inside documentation comments.',
      );
    }

    const customType = `TS${SyntaxKind[node.kind]}` as AST_NODE_TYPES;

    /**
     * If the "errorOnUnknownASTType" option is set to true, throw an error,
     * otherwise fallback to just including the unknown type as-is.
     */
    if (options.errorOnUnknownASTType && !AST_NODE_TYPES[customType]) {
      throw new Error(`Unknown AST_NODE_TYPE: "${customType}"`);
    }

    const result = createNode<any>(node, {
      type: customType,
    });

    if ('type' in node) {
      result.typeAnnotation =
        node.type && 'kind' in node.type && ts.isTypeNode(node.type)
          ? convertTypeAnnotation(node.type, node)
          : null;
    }
    if ('typeArguments' in node) {
      result.typeParameters =
        node.typeArguments && 'pos' in node.typeArguments
          ? convertTypeArgumentsToTypeParameters(node.typeArguments, node)
          : null;
    }
    if ('typeParameters' in node) {
      result.typeParameters =
        node.typeParameters && 'pos' in node.typeParameters
          ? convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            )
          : null;
    }
    const decorators = getDecorators(node);
    if (decorators?.length) {
      result.decorators = decorators.map(el => convertChild(el));
    }

    // keys we never want to clone from the base typescript node as they
    // introduce garbage into our AST
    const KEYS_TO_NOT_COPY = new Set([
      '_children',
      'decorators',
      'end',
      'flags',
      'illegalDecorators',
      'heritageClauses',
      'locals',
      'localSymbol',
      'jsDoc',
      'kind',
      'modifierFlagsCache',
      'modifiers',
      'nextContainer',
      'parent',
      'pos',
      'symbol',
      'transformFlags',
      'type',
      'typeArguments',
      'typeParameters',
    ]);

    Object.entries<any>(node)
      .filter(([key]) => !KEYS_TO_NOT_COPY.has(key))
      .forEach(([key, value]) => {
        if (Array.isArray(value)) {
          result[key] = value.map(el => convertChild(el as TSNode));
        } else if (value && typeof value === 'object' && value.kind) {
          // need to check node[key].kind to ensure we don't try to convert a symbol
          result[key] = convertChild(value as TSNode);
        } else {
          result[key] = value;
        }
      });
    return result;
  }

  /**
   * Applies the given TS modifiers to the given result object.
   *
   * This method adds not standardized `modifiers` property in nodes
   *
   * @param result
   * @param modifiers original ts.Nodes from the node.modifiers array
   * @returns the current result object will be mutated
   */
  function applyModifiersToResult(
    result: TSESTree.TSEnumDeclaration | TSESTree.TSModuleDeclaration,
    modifiers: Iterable<ts.Modifier> | undefined,
  ): void {
    if (!modifiers) {
      return;
    }

    const remainingModifiers: TSESTree.Modifier[] = [];
    /**
     * Some modifiers are explicitly handled by applying them as
     * boolean values on the result node. As well as adding them
     * to the result, we remove them from the array, so that they
     * are not handled twice.
     */
    for (const modifier of modifiers) {
      switch (modifier.kind) {
        /**
         * Ignore ExportKeyword and DefaultKeyword, they are handled
         * via the fixExports utility function
         */
        case SyntaxKind.ExportKeyword:
        case SyntaxKind.DefaultKeyword:
          break;
        case SyntaxKind.ConstKeyword:
          (result as any).const = true;
          break;
        case SyntaxKind.DeclareKeyword:
          result.declare = true;
          break;
        default:
          remainingModifiers.push(convertChild(modifier) as TSESTree.Modifier);
          break;
      }
    }
    /**
     * If there are still valid modifiers available which have
     * not been explicitly handled above, we just convert and
     * add the modifiers array to the result node.
     */
    if (remainingModifiers.length > 0) {
      result.modifiers = remainingModifiers;
    }
  }

  /**
   * Uses the provided range location to adjust the location data of the given Node
   * @param result The node that will have its location data mutated
   * @param childRange The child node range used to expand location
   */
  function fixParentLocation(
    result: TSESTree.BaseNode,
    childRange: [number, number],
  ): void {
    if (childRange[0] < result.range[0]) {
      result.range[0] = childRange[0];
      result.loc.start = getLineAndCharacterFor(result.range[0], ast);
    }
    if (childRange[1] > result.range[1]) {
      result.range[1] = childRange[1];
      result.loc.end = getLineAndCharacterFor(result.range[1], ast);
    }
  }

  function assertModuleSpecifier(
    node: ts.ExportDeclaration | ts.ImportDeclaration,
    allowNull: boolean,
  ): void {
    if (!allowNull && node.moduleSpecifier == null) {
      throw createError(
        ast,
        node.pos,
        'Module specifier must be a string literal.',
      );
    }

    if (
      node.moduleSpecifier &&
      node.moduleSpecifier?.kind !== SyntaxKind.StringLiteral
    ) {
      throw createError(
        ast,
        node.moduleSpecifier.pos,
        'Module specifier must be a string literal.',
      );
    }
  }

  function convertPattern(child?: ts.Node, parent?: ts.Node): any | null {
    return converter(child, parent, inTypeMode, true);
  }

  function convertChild(child?: ts.Node, parent?: ts.Node): any | null {
    return converter(child, parent, inTypeMode, false);
  }

  function convertType(child?: ts.Node, parent?: ts.Node): any | null {
    return converter(child, parent, true, false);
  }

  function convertBindingNameWithTypeAnnotation(
    name: ts.BindingName,
    tsType: ts.TypeNode | undefined,
    parent?: ts.Node,
  ): TSESTree.BindingName {
    const id: TSESTree.BindingName = convertPattern(name);

    if (tsType) {
      id.typeAnnotation = convertTypeAnnotation(tsType, parent);
      fixParentLocation(id, id.typeAnnotation.range);
    }

    return id;
  }

  /**
   * Converts a child into a type annotation. This creates an intermediary
   * TypeAnnotation node to match what Flow does.
   * @param child The TypeScript AST node to convert.
   * @param parent parentNode
   * @returns The type annotation node.
   */
  function convertTypeAnnotation(
    child: ts.TypeNode,
    parent: ts.Node | undefined,
  ): TSESTree.TSTypeAnnotation {
    // in FunctionType and ConstructorType typeAnnotation has 2 characters `=>` and in other places is just colon
    const offset =
      parent?.kind === SyntaxKind.FunctionType ||
      parent?.kind === SyntaxKind.ConstructorType
        ? 2
        : 1;
    const annotationStartCol = child.getFullStart() - offset;

    const loc = getLocFor(annotationStartCol, child.end, ast);
    return {
      type: AST_NODE_TYPES.TSTypeAnnotation,
      loc,
      range: [annotationStartCol, child.end],
      typeAnnotation: convertType(child),
    };
  }

  function convertBodyExpressions(
    nodes: ts.NodeArray<ts.Statement>,
    parent:
      | ts.SourceFile
      | ts.Block
      | ts.ModuleBlock
      | ts.ClassStaticBlockDeclaration,
  ): TSESTree.Statement[] {
    let allowDirectives = canContainDirective(parent);

    return (
      nodes
        .map(statement => {
          const child = convertChild(statement);
          if (allowDirectives) {
            if (
              child?.expression &&
              ts.isExpressionStatement(statement) &&
              ts.isStringLiteral(statement.expression)
            ) {
              const raw = child.expression.raw;
              child.directive = raw.slice(1, -1);
              return child; // child can be null, but it's filtered below
            } else {
              allowDirectives = false;
            }
          }
          return child; // child can be null, but it's filtered below
        })
        // filter out unknown nodes for now
        .filter(statement => statement)
    );
  }

  function convertTypeArgumentsToTypeParameters(
    typeArguments: ts.NodeArray<ts.TypeNode>,
    node: TSESTreeToTSNode<TSESTree.TSTypeParameterInstantiation>,
  ): TSESTree.TSTypeParameterInstantiation {
    const greaterThanToken = findNextToken(typeArguments, ast, ast)!;

    return createNode<TSESTree.TSTypeParameterInstantiation>(node, {
      type: AST_NODE_TYPES.TSTypeParameterInstantiation,
      range: [typeArguments.pos - 1, greaterThanToken.end],
      params: typeArguments.map(typeArgument => convertType(typeArgument)),
    });
  }

  function convertTSTypeParametersToTypeParametersDeclaration(
    typeParameters: ts.NodeArray<ts.TypeParameterDeclaration>,
  ): TSESTree.TSTypeParameterDeclaration {
    const greaterThanToken = findNextToken(typeParameters, ast, ast)!;

    return {
      type: AST_NODE_TYPES.TSTypeParameterDeclaration,
      range: [typeParameters.pos - 1, greaterThanToken.end],
      loc: getLocFor(typeParameters.pos - 1, greaterThanToken.end, ast),
      params: typeParameters.map(typeParameter => convertType(typeParameter)),
    };
  }

  function convertParameters(
    parameters: ts.NodeArray<ts.ParameterDeclaration>,
  ): TSESTree.Parameter[] {
    if (!parameters?.length) {
      return [];
    }
    return parameters.map(param => {
      const convertedParam: TSESTree.Parameter = convertChild(param);

      const decorators = getDecorators(param);
      if (decorators?.length) {
        convertedParam.decorators = decorators.map(el => convertChild(el));
      }
      return convertedParam;
    });
  }

  function convertChainExpression(
    node: TSESTree.ChainElement,
    tsNode:
      | ts.PropertyAccessExpression
      | ts.ElementAccessExpression
      | ts.CallExpression
      | ts.NonNullExpression,
  ): TSESTree.ChainExpression | TSESTree.ChainElement {
    const { child, isOptional } = ((): {
      child: TSESTree.Node;
      isOptional: boolean;
    } => {
      if (node.type === AST_NODE_TYPES.MemberExpression) {
        return { child: node.object, isOptional: node.optional };
      }
      if (node.type === AST_NODE_TYPES.CallExpression) {
        return { child: node.callee, isOptional: node.optional };
      }
      return { child: node.expression, isOptional: false };
    })();
    const isChildUnwrappable = isChildUnwrappableOptionalChain(tsNode, child);

    if (!isChildUnwrappable && !isOptional) {
      return node;
    }

    if (isChildUnwrappable && isChainExpression(child)) {
      // unwrap the chain expression child
      const newChild = child.expression;
      if (node.type === AST_NODE_TYPES.MemberExpression) {
        node.object = newChild;
      } else if (node.type === AST_NODE_TYPES.CallExpression) {
        node.callee = newChild;
      } else {
        node.expression = newChild;
      }
    }

    return createNode<TSESTree.ChainExpression>(tsNode, {
      type: AST_NODE_TYPES.ChainExpression,
      expression: node,
    });
  }

  function convertMethodSignature(
    node:
      | ts.MethodSignature
      | ts.GetAccessorDeclaration
      | ts.SetAccessorDeclaration,
  ): TSESTree.TSMethodSignature {
    const result = createNode<TSESTree.TSMethodSignature>(node, {
      type: AST_NODE_TYPES.TSMethodSignature,
      computed: isComputedProperty(node.name),
      key: convertChild(node.name),
      params: convertParameters(node.parameters),
      kind: ((): 'get' | 'set' | 'method' => {
        switch (node.kind) {
          case SyntaxKind.GetAccessor:
            return 'get';

          case SyntaxKind.SetAccessor:
            return 'set';

          case SyntaxKind.MethodSignature:
            return 'method';
        }
      })(),
    });

    if (isOptional(node)) {
      result.optional = true;
    }

    if (node.type) {
      result.returnType = convertTypeAnnotation(node.type, node);
    }

    if (hasModifier(SyntaxKind.ReadonlyKeyword, node)) {
      result.readonly = true;
    }

    if (node.typeParameters) {
      result.typeParameters =
        convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
    }

    const accessibility = getTSNodeAccessibility(node);
    if (accessibility) {
      result.accessibility = accessibility;
    }

    if (hasModifier(SyntaxKind.ExportKeyword, node)) {
      result.export = true;
    }

    if (hasModifier(SyntaxKind.StaticKeyword, node)) {
      result.static = true;
    }

    return result;
  }

  function convertAssertClasue(
    node: ts.AssertClause | undefined,
  ): TSESTree.ImportAttribute[] {
    return node === undefined
      ? []
      : node.elements.map(element => convertChild(element));
  }

  function convertJSXIdentifier(
    node: ts.Identifier | ts.ThisExpression,
  ): TSESTree.JSXIdentifier {
    const result = createNode<TSESTree.JSXIdentifier>(node, {
      type: AST_NODE_TYPES.JSXIdentifier,
      name: node.getText(),
    });
    registerTSNodeInNodeMap(node, result);
    return result;
  }

  function convertJSXNamespaceOrIdentifier(
    node: ts.Identifier | ts.ThisExpression,
  ): TSESTree.JSXIdentifier | TSESTree.JSXNamespacedName {
    const text = node.getText();
    const colonIndex = text.indexOf(':');
    // this is intentional we can ignore conversion if `:` is in first character
    if (colonIndex > 0) {
      const range = getRange(node, ast);
      const result = createNode<TSESTree.JSXNamespacedName>(node, {
        type: AST_NODE_TYPES.JSXNamespacedName,
        namespace: createNode<TSESTree.JSXIdentifier>(node, {
          type: AST_NODE_TYPES.JSXIdentifier,
          name: text.slice(0, colonIndex),
          range: [range[0], range[0] + colonIndex],
        }),
        name: createNode<TSESTree.JSXIdentifier>(node, {
          type: AST_NODE_TYPES.JSXIdentifier,
          name: text.slice(colonIndex + 1),
          range: [range[0] + colonIndex + 1, range[1]],
        }),
        range,
      });
      registerTSNodeInNodeMap(node, result);
      return result;
    }

    return convertJSXIdentifier(node);
  }

  function convertJSXTagName(
    node: ts.JsxTagNameExpression,
    parent: ts.Node,
  ): TSESTree.JSXTagNameExpression {
    let result: TSESTree.JSXTagNameExpression;
    switch (node.kind) {
      case SyntaxKind.PropertyAccessExpression:
        if (node.name.kind === SyntaxKind.PrivateIdentifier) {
          // This is one of the few times where TS explicitly errors, and doesn't even gracefully handle the syntax.
          // So we shouldn't ever get into this state to begin with.
          throw new Error('Non-private identifier expected.');
        }

        result = createNode<TSESTree.JSXMemberExpression>(node, {
          type: AST_NODE_TYPES.JSXMemberExpression,
          object: convertJSXTagName(node.expression, parent),
          property: convertJSXIdentifier(node.name),
        });
        break;

      case SyntaxKind.ThisKeyword:
      case SyntaxKind.Identifier:
      default:
        return convertJSXNamespaceOrIdentifier(node);
    }

    registerTSNodeInNodeMap(node, result);
    return result;
  }

  function convertSwitchClause(
    node: ts.DefaultClause | ts.CaseClause,
  ): TSESTree.Node {
    return createNode<TSESTree.SwitchCase>(node, {
      type: AST_NODE_TYPES.SwitchCase,
      // expression is present in case only
      test:
        node.kind === SyntaxKind.CaseClause
          ? convertChild(node.expression)
          : null,
      consequent: node.statements.map(el => convertChild(el)),
    });
  }

  function convertAccessor(
    node: ts.GetAccessorDeclaration | ts.SetAccessorDeclaration,
    parent: TSNode,
  ): TSESTree.Node {
    if (
      parent.kind === SyntaxKind.InterfaceDeclaration ||
      parent.kind === SyntaxKind.TypeLiteral
    ) {
      return convertMethodSignature(node);
    }

    return convertMethod(node, parent);
  }

  function convertMethod(
    node:
      | ts.GetAccessorDeclaration
      | ts.SetAccessorDeclaration
      | ts.MethodDeclaration,
    parent: TSNode,
  ): TSESTree.Node {
    const method = createNode<
      TSESTree.TSEmptyBodyFunctionExpression | TSESTree.FunctionExpression
    >(node, {
      type: !node.body
        ? AST_NODE_TYPES.TSEmptyBodyFunctionExpression
        : AST_NODE_TYPES.FunctionExpression,
      id: null,
      generator: !!node.asteriskToken,
      expression: false, // ESTreeNode as ESTreeNode here
      async: hasModifier(SyntaxKind.AsyncKeyword, node),
      body: convertChild(node.body),
      range: [node.parameters.pos - 1, node.end],
      params: [],
    });

    if (node.type) {
      method.returnType = convertTypeAnnotation(node.type, node);
    }

    // Process typeParameters
    if (node.typeParameters) {
      method.typeParameters =
        convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
      fixParentLocation(method, method.typeParameters.range);
    }

    let result:
      | TSESTree.Property
      | TSESTree.TSAbstractMethodDefinition
      | TSESTree.MethodDefinition;

    if (parent.kind === SyntaxKind.ObjectLiteralExpression) {
      method.params = node.parameters.map(el => convertChild(el));

      result = createNode<TSESTree.Property>(node, {
        type: AST_NODE_TYPES.Property,
        key: convertChild(node.name),
        value: method,
        computed: isComputedProperty(node.name),
        method: node.kind === SyntaxKind.MethodDeclaration,
        shorthand: false,
        kind: 'init',
      });
    } else {
      // class

      /**
       * Unlike in object literal methods, class method params can have decorators
       */
      method.params = convertParameters(node.parameters);

      /**
       * TypeScript class methods can be defined as "abstract"
       */
      const methodDefinitionType = hasModifier(SyntaxKind.AbstractKeyword, node)
        ? AST_NODE_TYPES.TSAbstractMethodDefinition
        : AST_NODE_TYPES.MethodDefinition;

      result = createNode<
        TSESTree.TSAbstractMethodDefinition | TSESTree.MethodDefinition
      >(node, {
        type: methodDefinitionType,
        key: convertChild(node.name),
        value: method,
        computed: isComputedProperty(node.name),
        static: hasModifier(SyntaxKind.StaticKeyword, node),
        kind: 'method',
        override: hasModifier(SyntaxKind.OverrideKeyword, node),
      });

      const decorators = getDecorators(node);
      if (decorators) {
        result.decorators = decorators.map(el => convertChild(el));
      }

      const accessibility = getTSNodeAccessibility(node);
      if (accessibility) {
        result.accessibility = accessibility;
      }
    }

    if (node.questionToken) {
      result.optional = true;
    }

    if (node.kind === SyntaxKind.GetAccessor) {
      result.kind = 'get';
    } else if (node.kind === SyntaxKind.SetAccessor) {
      result.kind = 'set';
    } else if (
      result.type !== AST_NODE_TYPES.Property &&
      !result.static &&
      node.name.kind === SyntaxKind.StringLiteral &&
      node.name.text === 'constructor'
    ) {
      result.kind = 'constructor';
    }
    return result;
  }

  function convertTemplateElement(
    node: ts.TemplateHead | ts.TemplateMiddle | ts.TemplateTail,
  ): TSESTree.Node {
    const tail = node.kind === SyntaxKind.TemplateTail;
    return createNode<TSESTree.TemplateElement>(node, {
      type: AST_NODE_TYPES.TemplateElement,
      value: {
        raw: ast.text.slice(node.getStart(ast) + 1, node.end - (tail ? 1 : 2)),
        cooked: node.text,
      },
      tail,
    });
  }

  function convertSpread(
    node: ts.SpreadAssignment | ts.SpreadElement,
  ): TSESTree.Node {
    if (allowPattern) {
      return createNode<TSESTree.RestElement>(node, {
        type: AST_NODE_TYPES.RestElement,
        argument: convertPattern(node.expression),
      });
    } else {
      return createNode<TSESTree.SpreadElement>(node, {
        type: AST_NODE_TYPES.SpreadElement,
        argument: convertChild(node.expression),
      });
    }
  }

  function convertClass(
    node: ts.ClassDeclaration | ts.ClassExpression,
  ): TSESTree.Node {
    const heritageClauses = node.heritageClauses ?? [];
    const classNodeType =
      node.kind === SyntaxKind.ClassDeclaration
        ? AST_NODE_TYPES.ClassDeclaration
        : AST_NODE_TYPES.ClassExpression;

    const superClass = heritageClauses.find(
      clause => clause.token === SyntaxKind.ExtendsKeyword,
    );

    const implementsClause = heritageClauses.find(
      clause => clause.token === SyntaxKind.ImplementsKeyword,
    );

    const result = createNode<
      TSESTree.ClassDeclaration | TSESTree.ClassExpression
    >(node, {
      type: classNodeType,
      id: convertChild(node.name),
      body: createNode<TSESTree.ClassBody>(node, {
        type: AST_NODE_TYPES.ClassBody,
        body: [],
        range: [node.members.pos - 1, node.end],
      }),
      superClass: superClass?.types[0]
        ? convertChild(superClass.types[0].expression)
        : null,
    });

    if (superClass) {
      if (superClass.types.length > 1) {
        throw createError(
          ast,
          superClass.types[1].pos,
          'Classes can only extend a single class.',
        );
      }

      if (superClass.types[0]?.typeArguments) {
        result.superTypeParameters = convertTypeArgumentsToTypeParameters(
          superClass.types[0].typeArguments,
          superClass.types[0],
        );
      }
    }

    if (node.typeParameters) {
      result.typeParameters =
        convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
    }

    if (implementsClause) {
      result.implements = implementsClause.types.map(el => convertChild(el));
    }

    /**
     * TypeScript class declarations can be defined as "abstract"
     */
    if (hasModifier(SyntaxKind.AbstractKeyword, node)) {
      result.abstract = true;
    }

    if (hasModifier(SyntaxKind.DeclareKeyword, node)) {
      result.declare = true;
    }

    const decorators = getDecorators(node);
    if (decorators) {
      result.decorators = decorators.map(el => convertChild(el));
    }

    const filteredMembers = node.members.filter(isESTreeClassMember);

    if (filteredMembers.length) {
      result.body.body = filteredMembers.map(el => convertChild(el));
    }

    // check for exports
    return fixExports(node, result);
  }

  function convertUnaryExpression(
    node: ts.PrefixUnaryExpression | ts.PostfixUnaryExpression,
  ): TSESTree.Node {
    const operator = getTextForTokenKind(node.operator);
    /**
     * ESTree uses UpdateExpression for ++/--
     */
    if (operator === '++' || operator === '--') {
      return createNode<TSESTree.UpdateExpression>(node, {
        type: AST_NODE_TYPES.UpdateExpression,
        operator,
        prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
        argument: convertChild(node.operand),
      });
    } else {
      return createNode<TSESTree.UnaryExpression>(node, {
        type: AST_NODE_TYPES.UnaryExpression,
        operator,
        prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
        argument: convertChild(node.operand),
      });
    }
  }

  function convertFunctionSignature(
    node:
      | ts.FunctionTypeNode
      | ts.ConstructSignatureDeclaration
      | ts.CallSignatureDeclaration,
  ): TSESTree.Node {
    const type =
      node.kind === SyntaxKind.ConstructSignature
        ? AST_NODE_TYPES.TSConstructSignatureDeclaration
        : node.kind === SyntaxKind.CallSignature
        ? AST_NODE_TYPES.TSCallSignatureDeclaration
        : AST_NODE_TYPES.TSFunctionType;
    const result = createNode<
      | TSESTree.TSFunctionType
      | TSESTree.TSCallSignatureDeclaration
      | TSESTree.TSConstructSignatureDeclaration
    >(node, {
      type: type,
      params: convertParameters(node.parameters),
    });
    if (node.type) {
      result.returnType = convertTypeAnnotation(node.type, node);
    }

    if (node.typeParameters) {
      result.typeParameters =
        convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
    }
    return result;
  }

  const selectors: {
    readonly [K in SyntaxKind]?: (
      node: Extract<TSNode, { kind: K }>,
      parent: TSNode,
    ) => TSESTree.Node | null;
  } = {
    [SyntaxKind.SourceFile]: function CONVERT_SourceFile(node) {
      return createNode<TSESTree.Program>(node, {
        type: AST_NODE_TYPES.Program,
        body: convertBodyExpressions(node.statements, node),
        sourceType: node.externalModuleIndicator ? 'module' : 'script',
        range: [node.getStart(ast), node.endOfFileToken.end],
      });
    },

    [SyntaxKind.Block]: function CONVERT_Block(node) {
      return createNode<TSESTree.BlockStatement>(node, {
        type: AST_NODE_TYPES.BlockStatement,
        body: convertBodyExpressions(node.statements, node),
      });
    },

    [SyntaxKind.Identifier]: function CONVERT_Identifier(node) {
      if (isThisInTypeQuery(node)) {
        // special case for `typeof foo` - TS emits an Identifier for `this`
        // but we want to treat it as a ThisExpression for consistency
        return createNode<TSESTree.ThisExpression>(node, {
          type: AST_NODE_TYPES.ThisExpression,
        });
      }
      return createNode<TSESTree.Identifier>(node, {
        type: AST_NODE_TYPES.Identifier,
        name: node.text,
      });
    },

    [SyntaxKind.PrivateIdentifier]: function CONVERT_PrivateIdentifier(node) {
      return createNode<TSESTree.PrivateIdentifier>(node, {
        type: AST_NODE_TYPES.PrivateIdentifier,
        // typescript includes the `#` in the text
        name: node.text.slice(1),
      });
    },

    [SyntaxKind.WithStatement]: function CONVERT_WithStatement(node) {
      return createNode<TSESTree.WithStatement>(node, {
        type: AST_NODE_TYPES.WithStatement,
        object: convertChild(node.expression),
        body: convertChild(node.statement),
      });
    },

    // Control Flow

    [SyntaxKind.ReturnStatement]: function CONVERT_ReturnStatement(node) {
      return createNode<TSESTree.ReturnStatement>(node, {
        type: AST_NODE_TYPES.ReturnStatement,
        argument: convertChild(node.expression),
      });
    },

    [SyntaxKind.LabeledStatement]: function CONVERT_LabeledStatement(node) {
      return createNode<TSESTree.LabeledStatement>(node, {
        type: AST_NODE_TYPES.LabeledStatement,
        label: convertChild(node.label),
        body: convertChild(node.statement),
      });
    },

    [SyntaxKind.ContinueStatement]: function CONVERT_ContinueStatement(node) {
      return createNode<TSESTree.ContinueStatement>(node, {
        type: AST_NODE_TYPES.ContinueStatement,
        label: convertChild(node.label),
      });
    },

    [SyntaxKind.BreakStatement]: function CONVERT_BreakStatement(node) {
      return createNode<TSESTree.BreakStatement>(node, {
        type: AST_NODE_TYPES.BreakStatement,
        label: convertChild(node.label),
      });
    },

    // Choice

    [SyntaxKind.IfStatement]: function CONVERT_IfStatement(node) {
      return createNode<TSESTree.IfStatement>(node, {
        type: AST_NODE_TYPES.IfStatement,
        test: convertChild(node.expression),
        consequent: convertChild(node.thenStatement),
        alternate: convertChild(node.elseStatement),
      });
    },

    [SyntaxKind.SwitchStatement]: function CONVERT_SwitchStatement(node) {
      return createNode<TSESTree.SwitchStatement>(node, {
        type: AST_NODE_TYPES.SwitchStatement,
        discriminant: convertChild(node.expression),
        cases: node.caseBlock.clauses.map(el => convertChild(el)),
      });
    },

    [SyntaxKind.CaseClause]: function CONVERT_CaseClause(node) {
      return convertSwitchClause(node);
    },
    [SyntaxKind.DefaultClause]: function CONVERT_DefaultClause(node) {
      return convertSwitchClause(node);
    },

    // Exceptions

    [SyntaxKind.ThrowStatement]: function CONVERT_ThrowStatement(node) {
      return createNode<TSESTree.ThrowStatement>(node, {
        type: AST_NODE_TYPES.ThrowStatement,
        argument: convertChild(node.expression),
      });
    },

    [SyntaxKind.TryStatement]: function CONVERT_TryStatement(node) {
      return createNode<TSESTree.TryStatement>(node, {
        type: AST_NODE_TYPES.TryStatement,
        block: convertChild(node.tryBlock),
        handler: convertChild(node.catchClause),
        finalizer: convertChild(node.finallyBlock),
      });
    },

    [SyntaxKind.CatchClause]: function CONVERT_CatchClause(node) {
      return createNode<TSESTree.CatchClause>(node, {
        type: AST_NODE_TYPES.CatchClause,
        param: node.variableDeclaration
          ? convertBindingNameWithTypeAnnotation(
              node.variableDeclaration.name,
              node.variableDeclaration.type,
            )
          : null,
        body: convertChild(node.block),
      });
    },

    // Loops

    [SyntaxKind.WhileStatement]: function CONVERT_WhileStatement(node) {
      return createNode<TSESTree.WhileStatement>(node, {
        type: AST_NODE_TYPES.WhileStatement,
        test: convertChild(node.expression),
        body: convertChild(node.statement),
      });
    },

    /**
     * Unlike other parsers, TypeScript calls a "DoWhileStatement"
     * a "DoStatement"
     */
    [SyntaxKind.DoStatement]: function CONVERT_DoStatement(node) {
      return createNode<TSESTree.DoWhileStatement>(node, {
        type: AST_NODE_TYPES.DoWhileStatement,
        test: convertChild(node.expression),
        body: convertChild(node.statement),
      });
    },

    [SyntaxKind.ForStatement]: function CONVERT_ForStatement(node) {
      return createNode<TSESTree.ForStatement>(node, {
        type: AST_NODE_TYPES.ForStatement,
        init: convertChild(node.initializer),
        test: convertChild(node.condition),
        update: convertChild(node.incrementor),
        body: convertChild(node.statement),
      });
    },

    [SyntaxKind.ForInStatement]: function CONVERT_ForInStatement(node) {
      return createNode<TSESTree.ForInStatement>(node, {
        type: AST_NODE_TYPES.ForInStatement,
        left: convertPattern(node.initializer),
        right: convertChild(node.expression),
        body: convertChild(node.statement),
      });
    },

    [SyntaxKind.ForOfStatement]: function CONVERT_ForOfStatement(node) {
      return createNode<TSESTree.ForOfStatement>(node, {
        type: AST_NODE_TYPES.ForOfStatement,
        left: convertPattern(node.initializer),
        right: convertChild(node.expression),
        body: convertChild(node.statement),
        await: Boolean(
          node.awaitModifier &&
            node.awaitModifier.kind === SyntaxKind.AwaitKeyword,
        ),
      });
    },

    // Declarations

    [SyntaxKind.FunctionDeclaration]: function CONVERT_FunctionDeclaration(
      node,
    ) {
      const isDeclare = hasModifier(SyntaxKind.DeclareKeyword, node);

      const result = createNode<
        TSESTree.TSDeclareFunction | TSESTree.FunctionDeclaration
      >(node, {
        type:
          isDeclare || !node.body
            ? AST_NODE_TYPES.TSDeclareFunction
            : AST_NODE_TYPES.FunctionDeclaration,
        id: convertChild(node.name),
        generator: !!node.asteriskToken,
        expression: false,
        async: hasModifier(SyntaxKind.AsyncKeyword, node),
        params: convertParameters(node.parameters),
        body: convertChild(node.body) || undefined,
      });

      // Process returnType
      if (node.type) {
        result.returnType = convertTypeAnnotation(node.type, node);
      }

      // Process typeParameters
      if (node.typeParameters) {
        result.typeParameters =
          convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters,
          );
      }

      if (isDeclare) {
        result.declare = true;
      }

      // check for exports
      return fixExports(node, result);
    },

    [SyntaxKind.VariableDeclaration]: function CONVERT_VariableDeclaration(
      node,
    ) {
      const result = createNode<TSESTree.VariableDeclarator>(node, {
        type: AST_NODE_TYPES.VariableDeclarator,
        id: convertBindingNameWithTypeAnnotation(node.name, node.type, node),
        init: convertChild(node.initializer),
      });

      if (node.exclamationToken) {
        result.definite = true;
      }

      return result;
    },

    [SyntaxKind.VariableStatement]: function CONVERT_VariableStatement(node) {
      const result = createNode<TSESTree.VariableDeclaration>(node, {
        type: AST_NODE_TYPES.VariableDeclaration,
        declarations: node.declarationList.declarations.map(el =>
          convertChild(el),
        ),
        kind: getDeclarationKind(node.declarationList),
      });

      /**
       * Semantically, decorators are not allowed on variable declarations,
       * Pre 4.8 TS would include them in the AST, so we did as well.
       * However as of 4.8 TS no longer includes it (as it is, well, invalid).
       *
       * So for consistency across versions, we no longer include it either.
       */

      if (hasModifier(SyntaxKind.DeclareKeyword, node)) {
        result.declare = true;
      }

      // check for exports
      return fixExports(node, result);
    },

    // mostly for for-of, for-in
    [SyntaxKind.VariableDeclarationList]:
      function CONVERT_VariableDeclarationList(node) {
        return createNode<TSESTree.VariableDeclaration>(node, {
          type: AST_NODE_TYPES.VariableDeclaration,
          declarations: node.declarations.map(el => convertChild(el)),
          kind: getDeclarationKind(node),
        });
      },

    // Expressions

    [SyntaxKind.ExpressionStatement]: function CONVERT_ExpressionStatement(
      node,
    ) {
      return createNode<TSESTree.ExpressionStatement>(node, {
        type: AST_NODE_TYPES.ExpressionStatement,
        expression: convertChild(node.expression),
      });
    },

    [SyntaxKind.ThisKeyword]: function CONVERT_ThisKeyword(node) {
      return createNode<TSESTree.ThisExpression>(node, {
        type: AST_NODE_TYPES.ThisExpression,
      });
    },

    [SyntaxKind.ArrayLiteralExpression]:
      function CONVERT_ArrayLiteralExpression(node) {
        // TypeScript uses ArrayLiteralExpression in destructuring assignment, too
        if (allowPattern) {
          return createNode<TSESTree.ArrayPattern>(node, {
            type: AST_NODE_TYPES.ArrayPattern,
            elements: node.elements.map(el => convertPattern(el)),
          });
        } else {
          return createNode<TSESTree.ArrayExpression>(node, {
            type: AST_NODE_TYPES.ArrayExpression,
            elements: node.elements.map(el => convertChild(el)),
          });
        }
      },

    [SyntaxKind.ObjectLiteralExpression]:
      function CONVERT_ObjectLiteralExpression(node) {
        // TypeScript uses ObjectLiteralExpression in destructuring assignment, too
        if (allowPattern) {
          return createNode<TSESTree.ObjectPattern>(node, {
            type: AST_NODE_TYPES.ObjectPattern,
            properties: node.properties.map(el => convertPattern(el)),
          });
        } else {
          return createNode<TSESTree.ObjectExpression>(node, {
            type: AST_NODE_TYPES.ObjectExpression,
            properties: node.properties.map(el => convertChild(el)),
          });
        }
      },

    [SyntaxKind.PropertyAssignment]: function CONVERT_PropertyAssignment(node) {
      return createNode<TSESTree.Property>(node, {
        type: AST_NODE_TYPES.Property,
        key: convertChild(node.name),
        value: converter(node.initializer, node, inTypeMode, allowPattern),
        computed: isComputedProperty(node.name),
        method: false,
        shorthand: false,
        kind: 'init',
      });
    },

    [SyntaxKind.ShorthandPropertyAssignment]:
      function ShorthandPropertyAssignment(node) {
        if (node.objectAssignmentInitializer) {
          return createNode<TSESTree.Property>(node, {
            type: AST_NODE_TYPES.Property,
            key: convertChild(node.name),
            value: createNode<TSESTree.AssignmentPattern>(node, {
              type: AST_NODE_TYPES.AssignmentPattern,
              left: convertPattern(node.name),
              right: convertChild(node.objectAssignmentInitializer),
            }),
            computed: false,
            method: false,
            shorthand: true,
            kind: 'init',
          });
        } else {
          return createNode<TSESTree.Property>(node, {
            type: AST_NODE_TYPES.Property,
            key: convertChild(node.name),
            value: convertChild(node.name),
            computed: false,
            method: false,
            shorthand: true,
            kind: 'init',
          });
        }
      },

    [SyntaxKind.ComputedPropertyName]: function CONVERT_ComputedPropertyName(
      node,
    ) {
      return convertChild(node.expression);
    },

    [SyntaxKind.PropertyDeclaration]: function CONVERT_PropertyDeclaration(
      node,
    ) {
      const isAbstract = hasModifier(SyntaxKind.AbstractKeyword, node);
      const isAccessor = hasModifier(SyntaxKind.AccessorKeyword, node);

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- TODO - add ignore IIFE option
      const type = (() => {
        if (isAccessor) {
          if (isAbstract) {
            return AST_NODE_TYPES.TSAbstractAccessorProperty;
          }
          return AST_NODE_TYPES.AccessorProperty;
        }

        if (isAbstract) {
          return AST_NODE_TYPES.TSAbstractPropertyDefinition;
        }
        return AST_NODE_TYPES.PropertyDefinition;
      })();

      const result = createNode<
        | TSESTree.TSAbstractAccessorProperty
        | TSESTree.TSAbstractPropertyDefinition
        | TSESTree.PropertyDefinition
        | TSESTree.AccessorProperty
      >(node, {
        type,
        key: convertChild(node.name),
        value: isAbstract ? null : convertChild(node.initializer),
        computed: isComputedProperty(node.name),
        static: hasModifier(SyntaxKind.StaticKeyword, node),
        readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
        declare: hasModifier(SyntaxKind.DeclareKeyword, node),
        override: hasModifier(SyntaxKind.OverrideKeyword, node),
      });

      if (node.type) {
        result.typeAnnotation = convertTypeAnnotation(node.type, node);
      }

      const decorators = getDecorators(node);
      if (decorators) {
        result.decorators = decorators.map(el => convertChild(el));
      }

      const accessibility = getTSNodeAccessibility(node);
      if (accessibility) {
        result.accessibility = accessibility;
      }

      if (
        (node.name.kind === SyntaxKind.Identifier ||
          node.name.kind === SyntaxKind.ComputedPropertyName ||
          node.name.kind === SyntaxKind.PrivateIdentifier) &&
        node.questionToken
      ) {
        result.optional = true;
      }

      if (node.exclamationToken) {
        result.definite = true;
      }

      if (result.key.type === AST_NODE_TYPES.Literal && node.questionToken) {
        result.optional = true;
      }
      return result;
    },

    [SyntaxKind.GetAccessor]: function CONVERT_GetAccessor(node, parent) {
      return convertAccessor(node, parent);
    },
    [SyntaxKind.SetAccessor]: function CONVERT_SetAccessor(node, parent) {
      return convertAccessor(node, parent);
    },
    [SyntaxKind.MethodDeclaration]: function CONVERT_MethodDeclaration(
      node,
      parent,
    ) {
      return convertMethod(node, parent);
    },

    // TypeScript uses this even for static methods named "constructor"
    [SyntaxKind.Constructor]: function CONVERT_Constructor(node) {
      const lastModifier = getLastModifier(node);
      const constructorToken =
        (lastModifier && findNextToken(lastModifier, node, ast)) ||
        node.getFirstToken()!;

      const constructor = createNode<
        TSESTree.TSEmptyBodyFunctionExpression | TSESTree.FunctionExpression
      >(node, {
        type: !node.body
          ? AST_NODE_TYPES.TSEmptyBodyFunctionExpression
          : AST_NODE_TYPES.FunctionExpression,
        id: null,
        params: convertParameters(node.parameters),
        generator: false,
        expression: false, // is not present in ESTreeNode
        async: false,
        body: convertChild(node.body),
        range: [node.parameters.pos - 1, node.end],
      });

      // Process typeParameters
      if (node.typeParameters) {
        constructor.typeParameters =
          convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters,
          );
        fixParentLocation(constructor, constructor.typeParameters.range);
      }

      // Process returnType
      if (node.type) {
        constructor.returnType = convertTypeAnnotation(node.type, node);
      }

      const constructorKey = createNode<TSESTree.Identifier>(node, {
        type: AST_NODE_TYPES.Identifier,
        name: 'constructor',
        range: [constructorToken.getStart(ast), constructorToken.end],
      });

      const isStatic = hasModifier(SyntaxKind.StaticKeyword, node);
      const result = createNode<
        TSESTree.TSAbstractMethodDefinition | TSESTree.MethodDefinition
      >(node, {
        type: hasModifier(SyntaxKind.AbstractKeyword, node)
          ? AST_NODE_TYPES.TSAbstractMethodDefinition
          : AST_NODE_TYPES.MethodDefinition,
        key: constructorKey,
        value: constructor,
        computed: false,
        static: isStatic,
        kind: isStatic ? 'method' : 'constructor',
        override: false,
      });

      const accessibility = getTSNodeAccessibility(node);
      if (accessibility) {
        result.accessibility = accessibility;
      }

      return result;
    },

    [SyntaxKind.FunctionExpression]: function CONVERT_FunctionExpression(node) {
      const result = createNode<TSESTree.FunctionExpression>(node, {
        type: AST_NODE_TYPES.FunctionExpression,
        id: convertChild(node.name),
        generator: !!node.asteriskToken,
        params: convertParameters(node.parameters),
        body: convertChild(node.body),
        async: hasModifier(SyntaxKind.AsyncKeyword, node),
        expression: false,
      });

      // Process returnType
      if (node.type) {
        result.returnType = convertTypeAnnotation(node.type, node);
      }

      // Process typeParameters
      if (node.typeParameters) {
        result.typeParameters =
          convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters,
          );
      }
      return result;
    },

    [SyntaxKind.SuperKeyword]: function CONVERT_SuperKeyword(node) {
      return createNode<TSESTree.Super>(node, {
        type: AST_NODE_TYPES.Super,
      });
    },

    [SyntaxKind.ArrayBindingPattern]: function CONVERT_ArrayBindingPattern(
      node,
    ) {
      return createNode<TSESTree.ArrayPattern>(node, {
        type: AST_NODE_TYPES.ArrayPattern,
        elements: node.elements.map(el => convertPattern(el)),
      });
    },

    // occurs with missing array elements like [,]
    [SyntaxKind.OmittedExpression]: function CONVERT_OmittedExpression() {
      return null;
    },

    [SyntaxKind.ObjectBindingPattern]: function CONVERT_ObjectBindingPattern(
      node,
    ) {
      return createNode<TSESTree.ObjectPattern>(node, {
        type: AST_NODE_TYPES.ObjectPattern,
        properties: node.elements.map(el => convertPattern(el)),
      });
    },

    [SyntaxKind.BindingElement]: function CONVERT_BindingElement(node, parent) {
      if (parent.kind === SyntaxKind.ArrayBindingPattern) {
        const arrayItem = convertChild(node.name, parent);

        if (node.initializer) {
          return createNode<TSESTree.AssignmentPattern>(node, {
            type: AST_NODE_TYPES.AssignmentPattern,
            left: arrayItem,
            right: convertChild(node.initializer),
          });
        } else if (node.dotDotDotToken) {
          return createNode<TSESTree.RestElement>(node, {
            type: AST_NODE_TYPES.RestElement,
            argument: arrayItem,
          });
        } else {
          return arrayItem;
        }
      } else {
        let result: TSESTree.RestElement | TSESTree.Property;
        if (node.dotDotDotToken) {
          result = createNode<TSESTree.RestElement>(node, {
            type: AST_NODE_TYPES.RestElement,
            argument: convertChild(node.propertyName ?? node.name),
          });
        } else {
          result = createNode<TSESTree.Property>(node, {
            type: AST_NODE_TYPES.Property,
            key: convertChild(node.propertyName ?? node.name),
            value: convertChild(node.name),
            computed: Boolean(
              node.propertyName &&
                node.propertyName.kind === SyntaxKind.ComputedPropertyName,
            ),
            method: false,
            shorthand: !node.propertyName,
            kind: 'init',
          });
        }

        if (node.initializer) {
          result.value = createNode<TSESTree.AssignmentPattern>(node, {
            type: AST_NODE_TYPES.AssignmentPattern,
            left: convertChild(node.name),
            right: convertChild(node.initializer),
            range: [node.name.getStart(ast), node.initializer.end],
          });
        }
        return result;
      }
    },

    [SyntaxKind.ArrowFunction]: function CONVERT_ArrowFunction(node) {
      const result = createNode<TSESTree.ArrowFunctionExpression>(node, {
        type: AST_NODE_TYPES.ArrowFunctionExpression,
        generator: false,
        id: null,
        params: convertParameters(node.parameters),
        body: convertChild(node.body),
        async: hasModifier(SyntaxKind.AsyncKeyword, node),
        expression: node.body.kind !== SyntaxKind.Block,
      });

      // Process returnType
      if (node.type) {
        result.returnType = convertTypeAnnotation(node.type, node);
      }

      // Process typeParameters
      if (node.typeParameters) {
        result.typeParameters =
          convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters,
          );
      }
      return result;
    },

    [SyntaxKind.YieldExpression]: function CONVERT_YieldExpression(node) {
      return createNode<TSESTree.YieldExpression>(node, {
        type: AST_NODE_TYPES.YieldExpression,
        delegate: !!node.asteriskToken,
        argument: convertChild(node.expression),
      });
    },

    [SyntaxKind.AwaitExpression]: function CONVERT_AwaitExpression(node) {
      return createNode<TSESTree.AwaitExpression>(node, {
        type: AST_NODE_TYPES.AwaitExpression,
        argument: convertChild(node.expression),
      });
    },

    // Template Literals

    [SyntaxKind.NoSubstitutionTemplateLiteral]:
      function NoSubstitutionTemplateLiteral(node) {
        return createNode<TSESTree.TemplateLiteral>(node, {
          type: AST_NODE_TYPES.TemplateLiteral,
          quasis: [
            createNode<TSESTree.TemplateElement>(node, {
              type: AST_NODE_TYPES.TemplateElement,
              value: {
                raw: ast.text.slice(node.getStart(ast) + 1, node.end - 1),
                cooked: node.text,
              },
              tail: true,
            }),
          ],
          expressions: [],
        });
      },

    [SyntaxKind.TemplateExpression]: function CONVERT_TemplateExpression(node) {
      const result = createNode<TSESTree.TemplateLiteral>(node, {
        type: AST_NODE_TYPES.TemplateLiteral,
        quasis: [convertChild(node.head)],
        expressions: [],
      });

      node.templateSpans.forEach(templateSpan => {
        result.expressions.push(convertChild(templateSpan.expression));
        result.quasis.push(convertChild(templateSpan.literal));
      });
      return result;
    },

    [SyntaxKind.TaggedTemplateExpression]:
      function CONVERT_TaggedTemplateExpression(node) {
        return createNode<TSESTree.TaggedTemplateExpression>(node, {
          type: AST_NODE_TYPES.TaggedTemplateExpression,
          typeParameters: node.typeArguments
            ? convertTypeArgumentsToTypeParameters(node.typeArguments, node)
            : undefined,
          tag: convertChild(node.tag),
          quasi: convertChild(node.template),
        });
      },

    [SyntaxKind.TemplateHead]: function CONVERT_TemplateHead(node) {
      return convertTemplateElement(node);
    },
    [SyntaxKind.TemplateMiddle]: function CONVERT_TemplateMiddle(node) {
      return convertTemplateElement(node);
    },
    [SyntaxKind.TemplateTail]: function CONVERT_TemplateTail(node) {
      return convertTemplateElement(node);
    },

    // Patterns

    [SyntaxKind.SpreadAssignment]: function CONVERT_SpreadAssignment(node) {
      return convertSpread(node);
    },
    [SyntaxKind.SpreadElement]: function CONVERT_SpreadElement(node) {
      return convertSpread(node);
    },

    [SyntaxKind.Parameter]: function CONVERT_Parameter(node, parent) {
      let parameter: TSESTree.RestElement | TSESTree.BindingName;
      let result: TSESTree.RestElement | TSESTree.AssignmentPattern;

      if (node.dotDotDotToken) {
        parameter = result = createNode<TSESTree.RestElement>(node, {
          type: AST_NODE_TYPES.RestElement,
          argument: convertChild(node.name),
        });
      } else if (node.initializer) {
        parameter = convertChild(node.name);
        if (parameter.type === AST_NODE_TYPES.RestElement) {
          throw new Error('Unexpected Rest Element');
        }

        result = createNode<TSESTree.AssignmentPattern>(node, {
          type: AST_NODE_TYPES.AssignmentPattern,
          left: parameter,
          right: convertChild(node.initializer),
        });

        const modifiers = getModifiers(node);
        if (modifiers) {
          // AssignmentPattern should not contain modifiers in range
          result.range[0] = parameter.range[0];
          result.loc = getLocFor(result.range[0], result.range[1], ast);
        }
      } else {
        parameter = result = convertChild(node.name, parent);
      }

      if (node.type) {
        parameter.typeAnnotation = convertTypeAnnotation(node.type, node);
        fixParentLocation(parameter, parameter.typeAnnotation.range);
      }

      if (node.questionToken) {
        if (node.questionToken.end > parameter.range[1]) {
          parameter.range[1] = node.questionToken.end;
          parameter.loc.end = getLineAndCharacterFor(parameter.range[1], ast);
        }
        parameter.optional = true;
      }

      const modifiers = getModifiers(node);
      if (modifiers) {
        return createNode<TSESTree.TSParameterProperty>(node, {
          type: AST_NODE_TYPES.TSParameterProperty,
          accessibility: getTSNodeAccessibility(node) ?? undefined,
          readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
          static: hasModifier(SyntaxKind.StaticKeyword, node) || undefined,
          export: hasModifier(SyntaxKind.ExportKeyword, node) || undefined,
          override: hasModifier(SyntaxKind.OverrideKeyword, node) || undefined,
          parameter: result,
        });
      }
      return result;
    },

    // Classes

    [SyntaxKind.ClassDeclaration]: function CONVERT_ClassDeclaration(node) {
      return convertClass(node);
    },
    [SyntaxKind.ClassExpression]: function CONVERT_ClassExpression(node) {
      return convertClass(node);
    },

    // Modules

    [SyntaxKind.ModuleBlock]: function CONVERT_ModuleBlock(node) {
      return createNode<TSESTree.TSModuleBlock>(node, {
        type: AST_NODE_TYPES.TSModuleBlock,
        body: convertBodyExpressions(node.statements, node),
      });
    },

    [SyntaxKind.ImportDeclaration]: function CONVERT_ImportDeclaration(node) {
      assertModuleSpecifier(node, false);

      const result = createNode<TSESTree.ImportDeclaration>(node, {
        type: AST_NODE_TYPES.ImportDeclaration,
        source: convertChild(node.moduleSpecifier),
        specifiers: [],
        importKind: 'value',
        assertions: convertAssertClasue(node.assertClause),
      });

      if (node.importClause) {
        if (node.importClause.isTypeOnly) {
          result.importKind = 'type';
        }

        if (node.importClause.name) {
          result.specifiers.push(convertChild(node.importClause));
        }

        if (node.importClause.namedBindings) {
          switch (node.importClause.namedBindings.kind) {
            case SyntaxKind.NamespaceImport:
              result.specifiers.push(
                convertChild(node.importClause.namedBindings),
              );
              break;
            case SyntaxKind.NamedImports:
              result.specifiers = result.specifiers.concat(
                node.importClause.namedBindings.elements.map(el =>
                  convertChild(el),
                ),
              );
              break;
          }
        }
      }
      return result;
    },

    [SyntaxKind.NamespaceImport]: function CONVERT_NamespaceImport(node) {
      return createNode<TSESTree.ImportNamespaceSpecifier>(node, {
        type: AST_NODE_TYPES.ImportNamespaceSpecifier,
        local: convertChild(node.name),
      });
    },

    [SyntaxKind.ImportSpecifier]: function CONVERT_ImportSpecifier(node) {
      return createNode<TSESTree.ImportSpecifier>(node, {
        type: AST_NODE_TYPES.ImportSpecifier,
        local: convertChild(node.name),
        imported: convertChild(node.propertyName ?? node.name),
        importKind: node.isTypeOnly ? 'type' : 'value',
      });
    },

    [SyntaxKind.ImportClause]: function CONVERT_ImportClause(node) {
      const local = convertChild(node.name);
      return createNode<TSESTree.ImportDefaultSpecifier>(node, {
        type: AST_NODE_TYPES.ImportDefaultSpecifier,
        local,
        range: local.range,
      });
    },

    [SyntaxKind.ExportDeclaration]: function CONVERT_ExportDeclaration(node) {
      if (node.exportClause?.kind === SyntaxKind.NamedExports) {
        assertModuleSpecifier(node, true);
        return createNode<TSESTree.ExportNamedDeclaration>(node, {
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          source: convertChild(node.moduleSpecifier),
          specifiers: node.exportClause.elements.map(el => convertChild(el)),
          exportKind: node.isTypeOnly ? 'type' : 'value',
          declaration: null,
          assertions: convertAssertClasue(node.assertClause),
        });
      } else {
        assertModuleSpecifier(node, false);
        return createNode<TSESTree.ExportAllDeclaration>(node, {
          type: AST_NODE_TYPES.ExportAllDeclaration,
          source: convertChild(node.moduleSpecifier),
          exportKind: node.isTypeOnly ? 'type' : 'value',
          exported:
            // note - for compat with 3.7.x, where node.exportClause is always undefined and
            //        SyntaxKind.NamespaceExport does not exist yet (i.e. is undefined), this
            //        cannot be shortened to an optional chain, or else you end up with
            //        undefined === undefined, and the true path will hard error at runtime
            node.exportClause &&
            node.exportClause.kind === SyntaxKind.NamespaceExport
              ? convertChild(node.exportClause.name)
              : null,
          assertions: convertAssertClasue(node.assertClause),
        });
      }
    },

    [SyntaxKind.ExportSpecifier]: function CONVERT_ExportSpecifier(node) {
      return createNode<TSESTree.ExportSpecifier>(node, {
        type: AST_NODE_TYPES.ExportSpecifier,
        local: convertChild(node.propertyName ?? node.name),
        exported: convertChild(node.name),
        exportKind: node.isTypeOnly ? 'type' : 'value',
      });
    },

    [SyntaxKind.ExportAssignment]: function CONVERT_ExportAssignment(node) {
      if (node.isExportEquals) {
        return createNode<TSESTree.TSExportAssignment>(node, {
          type: AST_NODE_TYPES.TSExportAssignment,
          expression: convertChild(node.expression),
        });
      } else {
        return createNode<TSESTree.ExportDefaultDeclaration>(node, {
          type: AST_NODE_TYPES.ExportDefaultDeclaration,
          declaration: convertChild(node.expression),
          exportKind: 'value',
        });
      }
    },

    // Unary Operations

    [SyntaxKind.PrefixUnaryExpression]: function CONVERT_PrefixUnaryExpression(
      node,
    ) {
      return convertUnaryExpression(node);
    },
    [SyntaxKind.PostfixUnaryExpression]:
      function CONVERT_PostfixUnaryExpression(node) {
        return convertUnaryExpression(node);
      },

    [SyntaxKind.DeleteExpression]: function CONVERT_DeleteExpression(node) {
      return createNode<TSESTree.UnaryExpression>(node, {
        type: AST_NODE_TYPES.UnaryExpression,
        operator: 'delete',
        prefix: true,
        argument: convertChild(node.expression),
      });
    },

    [SyntaxKind.VoidExpression]: function CONVERT_VoidExpression(node) {
      return createNode<TSESTree.UnaryExpression>(node, {
        type: AST_NODE_TYPES.UnaryExpression,
        operator: 'void',
        prefix: true,
        argument: convertChild(node.expression),
      });
    },

    [SyntaxKind.TypeOfExpression]: function CONVERT_TypeOfExpression(node) {
      return createNode<TSESTree.UnaryExpression>(node, {
        type: AST_NODE_TYPES.UnaryExpression,
        operator: 'typeof',
        prefix: true,
        argument: convertChild(node.expression),
      });
    },

    [SyntaxKind.TypeOperator]: function CONVERT_TypeOperator(node) {
      return createNode<TSESTree.TSTypeOperator>(node, {
        type: AST_NODE_TYPES.TSTypeOperator,
        operator: getTextForTokenKind(node.operator),
        typeAnnotation: convertChild(node.type),
      });
    },

    // Binary Operations

    [SyntaxKind.BinaryExpression]: function CONVERT_BinaryExpression(node) {
      // TypeScript uses BinaryExpression for sequences as well
      if (isComma(node.operatorToken)) {
        const result = createNode<TSESTree.SequenceExpression>(node, {
          type: AST_NODE_TYPES.SequenceExpression,
          expressions: [],
        });

        const left: TSESTree.Expression = convertChild(node.left);
        if (
          left.type === AST_NODE_TYPES.SequenceExpression &&
          node.left.kind !== SyntaxKind.ParenthesizedExpression
        ) {
          result.expressions = result.expressions.concat(left.expressions);
        } else {
          result.expressions.push(left);
        }

        result.expressions.push(convertChild(node.right));
        return result;
      } else {
        const type = getBinaryExpressionType(node.operatorToken);
        if (allowPattern && type === AST_NODE_TYPES.AssignmentExpression) {
          return createNode<TSESTree.AssignmentPattern>(node, {
            type: AST_NODE_TYPES.AssignmentPattern,
            left: convertPattern(node.left, node),
            right: convertChild(node.right),
          });
        }
        return createNode<
          | TSESTree.AssignmentExpression
          | TSESTree.LogicalExpression
          | TSESTree.BinaryExpression
        >(node, {
          type,
          operator: getTextForTokenKind(node.operatorToken.kind),
          left: converter(
            node.left,
            node,
            inTypeMode,
            type === AST_NODE_TYPES.AssignmentExpression,
          ),
          right: convertChild(node.right),
        });
      }
    },

    [SyntaxKind.PropertyAccessExpression]:
      function CONVERT_PropertyAccessExpression(node) {
        const object = convertChild(node.expression);
        const property = convertChild(node.name);
        const computed = false;

        const result = createNode<TSESTree.MemberExpression>(node, {
          type: AST_NODE_TYPES.MemberExpression,
          object,
          property,
          computed,
          optional: node.questionDotToken !== undefined,
        });

        return convertChainExpression(result, node);
      },

    [SyntaxKind.ElementAccessExpression]:
      function CONVERT_ElementAccessExpression(node) {
        const object = convertChild(node.expression);
        const property = convertChild(node.argumentExpression);
        const computed = true;

        const result = createNode<TSESTree.MemberExpression>(node, {
          type: AST_NODE_TYPES.MemberExpression,
          object,
          property,
          computed,
          optional: node.questionDotToken !== undefined,
        });

        return convertChainExpression(result, node);
      },

    [SyntaxKind.CallExpression]: function CONVERT_CallExpression(node) {
      if (node.expression.kind === SyntaxKind.ImportKeyword) {
        if (node.arguments.length !== 1 && node.arguments.length !== 2) {
          throw createError(
            ast,
            node.arguments.pos,
            'Dynamic import requires exactly one or two arguments.',
          );
        }
        return createNode<TSESTree.ImportExpression>(node, {
          type: AST_NODE_TYPES.ImportExpression,
          source: convertChild(node.arguments[0]),
          attributes: node.arguments[1]
            ? convertChild(node.arguments[1])
            : null,
        });
      }

      const callee = convertChild(node.expression);
      const args = node.arguments.map(el => convertChild(el));

      const result = createNode<TSESTree.CallExpression>(node, {
        type: AST_NODE_TYPES.CallExpression,
        callee,
        arguments: args,
        optional: node.questionDotToken !== undefined,
      });

      if (node.typeArguments) {
        result.typeParameters = convertTypeArgumentsToTypeParameters(
          node.typeArguments,
          node,
        );
      }

      return convertChainExpression(result, node);
    },

    [SyntaxKind.NewExpression]: function CONVERT_NewExpression(node) {
      // NOTE - NewExpression cannot have an optional chain in it
      const result = createNode<TSESTree.NewExpression>(node, {
        type: AST_NODE_TYPES.NewExpression,
        callee: convertChild(node.expression),
        arguments: node.arguments
          ? node.arguments.map(el => convertChild(el))
          : [],
      });
      if (node.typeArguments) {
        result.typeParameters = convertTypeArgumentsToTypeParameters(
          node.typeArguments,
          node,
        );
      }
      return result;
    },

    [SyntaxKind.ConditionalExpression]: function CONVERT_ConditionalExpression(
      node,
    ) {
      return createNode<TSESTree.ConditionalExpression>(node, {
        type: AST_NODE_TYPES.ConditionalExpression,
        test: convertChild(node.condition),
        consequent: convertChild(node.whenTrue),
        alternate: convertChild(node.whenFalse),
      });
    },

    [SyntaxKind.MetaProperty]: function CONVERT_MetaProperty(node) {
      return createNode<TSESTree.MetaProperty>(node, {
        type: AST_NODE_TYPES.MetaProperty,
        meta: createNode<TSESTree.Identifier>(
          // TODO: do we really want to convert it to Token?
          node.getFirstToken() as ts.Token<typeof node.keywordToken>,
          {
            type: AST_NODE_TYPES.Identifier,
            name: getTextForTokenKind(node.keywordToken),
          },
        ),
        property: convertChild(node.name),
      });
    },

    [SyntaxKind.Decorator]: function CONVERT_Decorator(node) {
      return createNode<TSESTree.Decorator>(node, {
        type: AST_NODE_TYPES.Decorator,
        expression: convertChild(node.expression),
      });
    },

    // Literals

    [SyntaxKind.StringLiteral]: function CONVERT_StringLiteral(node, parent) {
      return createNode<TSESTree.StringLiteral>(node, {
        type: AST_NODE_TYPES.Literal,
        value:
          parent.kind === SyntaxKind.JsxAttribute
            ? unescapeStringLiteralText(node.text)
            : node.text,
        raw: node.getText(),
      });
    },

    [SyntaxKind.NumericLiteral]: function CONVERT_NumericLiteral(node) {
      return createNode<TSESTree.NumberLiteral>(node, {
        type: AST_NODE_TYPES.Literal,
        value: Number(node.text),
        raw: node.getText(),
      });
    },

    [SyntaxKind.BigIntLiteral]: function CONVERT_BigIntLiteral(node) {
      const range = getRange(node, ast);
      const rawValue = ast.text.slice(range[0], range[1]);
      const bigint = rawValue
        // remove suffix `n`
        .slice(0, -1)
        // `BigInt` doesn't accept numeric separator
        // and `bigint` property should not include numeric separator
        .replace(/_/g, '');
      const value = typeof BigInt !== 'undefined' ? BigInt(bigint) : null;
      return createNode<TSESTree.BigIntLiteral>(node, {
        type: AST_NODE_TYPES.Literal,
        raw: rawValue,
        value: value,
        bigint: value === null ? bigint : String(value),
        range,
      });
    },

    [SyntaxKind.RegularExpressionLiteral]:
      function CONVERT_RegularExpressionLiteral(node) {
        const pattern = node.text.slice(1, node.text.lastIndexOf('/'));
        const flags = node.text.slice(node.text.lastIndexOf('/') + 1);

        let regex = null;
        try {
          regex = new RegExp(pattern, flags);
        } catch (exception: unknown) {
          regex = null;
        }

        return createNode<TSESTree.RegExpLiteral>(node, {
          type: AST_NODE_TYPES.Literal,
          value: regex,
          raw: node.text,
          regex: {
            pattern,
            flags,
          },
        });
      },

    [SyntaxKind.TrueKeyword]: function CONVERT_TrueKeyword(node) {
      return createNode<TSESTree.BooleanLiteral>(node, {
        type: AST_NODE_TYPES.Literal,
        value: true,
        raw: 'true',
      });
    },

    [SyntaxKind.FalseKeyword]: function CONVERT_FalseKeyword(node) {
      return createNode<TSESTree.BooleanLiteral>(node, {
        type: AST_NODE_TYPES.Literal,
        value: false,
        raw: 'false',
      });
    },

    [SyntaxKind.NullKeyword]: function CONVERT_NullKeyword(node) {
      if (!typescriptVersionIsAtLeast['4.0'] && inTypeMode) {
        // 4.0 started nesting null types inside a LiteralType node, but we still need to support pre-4.0
        return createNode<TSESTree.TSNullKeyword>(node, {
          type: AST_NODE_TYPES.TSNullKeyword,
        });
      }

      return createNode<TSESTree.NullLiteral>(node, {
        type: AST_NODE_TYPES.Literal,
        value: null,
        raw: 'null',
      });
    },

    [SyntaxKind.EmptyStatement]: function CONVERT_EmptyStatement(node) {
      return createNode<TSESTree.EmptyStatement>(node, {
        type: AST_NODE_TYPES.EmptyStatement,
      });
    },

    [SyntaxKind.DebuggerStatement]: function CONVERT_DebuggerStatement(node) {
      return createNode<TSESTree.DebuggerStatement>(node, {
        type: AST_NODE_TYPES.DebuggerStatement,
      });
    },

    // JSX

    [SyntaxKind.JsxElement]: function CONVERT_JsxElement(node) {
      return createNode<TSESTree.JSXElement>(node, {
        type: AST_NODE_TYPES.JSXElement,
        openingElement: convertChild(node.openingElement),
        closingElement: convertChild(node.closingElement),
        children: node.children.map(el => convertChild(el)),
      });
    },

    [SyntaxKind.JsxFragment]: function CONVERT_JsxFragment(node) {
      return createNode<TSESTree.JSXFragment>(node, {
        type: AST_NODE_TYPES.JSXFragment,
        openingFragment: convertChild(node.openingFragment),
        closingFragment: convertChild(node.closingFragment),
        children: node.children.map(el => convertChild(el)),
      });
    },

    [SyntaxKind.JsxSelfClosingElement]: function CONVERT_JsxSelfClosingElement(
      node,
    ) {
      return createNode<TSESTree.JSXElement>(node, {
        type: AST_NODE_TYPES.JSXElement,
        /**
         * Convert SyntaxKind.JsxSelfClosingElement to SyntaxKind.JsxOpeningElement,
         * TypeScript does not seem to have the idea of openingElement when tag is self-closing
         */
        openingElement: createNode<TSESTree.JSXOpeningElement>(node, {
          type: AST_NODE_TYPES.JSXOpeningElement,
          typeParameters: node.typeArguments
            ? convertTypeArgumentsToTypeParameters(node.typeArguments, node)
            : undefined,
          selfClosing: true,
          name: convertJSXTagName(node.tagName, node),
          attributes: node.attributes.properties.map(el => convertChild(el)),
          range: getRange(node, ast),
        }),
        closingElement: null,
        children: [],
      });
    },

    [SyntaxKind.JsxOpeningElement]: function CONVERT_JsxOpeningElement(node) {
      return createNode<TSESTree.JSXOpeningElement>(node, {
        type: AST_NODE_TYPES.JSXOpeningElement,
        typeParameters: node.typeArguments
          ? convertTypeArgumentsToTypeParameters(node.typeArguments, node)
          : undefined,
        selfClosing: false,
        name: convertJSXTagName(node.tagName, node),
        attributes: node.attributes.properties.map(el => convertChild(el)),
      });
    },

    [SyntaxKind.JsxClosingElement]: function CONVERT_JsxClosingElement(node) {
      return createNode<TSESTree.JSXClosingElement>(node, {
        type: AST_NODE_TYPES.JSXClosingElement,
        name: convertJSXTagName(node.tagName, node),
      });
    },

    [SyntaxKind.JsxOpeningFragment]: function CONVERT_JsxOpeningFragment(node) {
      return createNode<TSESTree.JSXOpeningFragment>(node, {
        type: AST_NODE_TYPES.JSXOpeningFragment,
      });
    },

    [SyntaxKind.JsxClosingFragment]: function CONVERT_JsxClosingFragment(node) {
      return createNode<TSESTree.JSXClosingFragment>(node, {
        type: AST_NODE_TYPES.JSXClosingFragment,
      });
    },

    [SyntaxKind.JsxExpression]: function CONVERT_JsxExpression(node) {
      const expression = node.expression
        ? convertChild(node.expression)
        : createNode<TSESTree.JSXEmptyExpression>(node, {
            type: AST_NODE_TYPES.JSXEmptyExpression,
            range: [node.getStart(ast) + 1, node.getEnd() - 1],
          });

      if (node.dotDotDotToken) {
        return createNode<TSESTree.JSXSpreadChild>(node, {
          type: AST_NODE_TYPES.JSXSpreadChild,
          expression,
        });
      } else {
        return createNode<TSESTree.JSXExpressionContainer>(node, {
          type: AST_NODE_TYPES.JSXExpressionContainer,
          expression,
        });
      }
    },

    [SyntaxKind.JsxAttribute]: function CONVERT_JsxAttribute(node) {
      return createNode<TSESTree.JSXAttribute>(node, {
        type: AST_NODE_TYPES.JSXAttribute,
        name: convertJSXNamespaceOrIdentifier(node.name),
        value: convertChild(node.initializer),
      });
    },

    [SyntaxKind.JsxText]: function CONVERT_JsxText(node) {
      const start = node.getFullStart();
      const end = node.getEnd();
      const text = ast.text.slice(start, end);

      return createNode<TSESTree.JSXText>(node, {
        type: AST_NODE_TYPES.JSXText,
        value: unescapeStringLiteralText(text),
        raw: text,
        range: [start, end],
      });
    },

    [SyntaxKind.JsxSpreadAttribute]: function CONVERT_JsxSpreadAttribute(node) {
      return createNode<TSESTree.JSXSpreadAttribute>(node, {
        type: AST_NODE_TYPES.JSXSpreadAttribute,
        argument: convertChild(node.expression),
      });
    },

    [SyntaxKind.QualifiedName]: function CONVERT_QualifiedName(node) {
      return createNode<TSESTree.TSQualifiedName>(node, {
        type: AST_NODE_TYPES.TSQualifiedName,
        left: convertChild(node.left),
        right: convertChild(node.right),
      });
    },

    // TypeScript specific

    [SyntaxKind.TypeReference]: function CONVERT_TypeReference(node) {
      return createNode<TSESTree.TSTypeReference>(node, {
        type: AST_NODE_TYPES.TSTypeReference,
        typeName: convertType(node.typeName),
        typeParameters: node.typeArguments
          ? convertTypeArgumentsToTypeParameters(node.typeArguments, node)
          : undefined,
      });
    },

    [SyntaxKind.TypeParameter]: function CONVERT_TypeParameter(node) {
      return createNode<TSESTree.TSTypeParameter>(node, {
        type: AST_NODE_TYPES.TSTypeParameter,
        name: convertType(node.name),
        constraint: node.constraint ? convertType(node.constraint) : undefined,
        default: node.default ? convertType(node.default) : undefined,
        in: hasModifier(SyntaxKind.InKeyword, node),
        out: hasModifier(SyntaxKind.OutKeyword, node),
      });
    },

    [SyntaxKind.ThisType]: function CONVERT_ThisType(node) {
      return createNode<TSESTree.TSThisType>(node, {
        type: AST_NODE_TYPES.TSThisType,
      });
    },

    [SyntaxKind.AnyKeyword]: function CONVERT_AnyKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSAnyKeyword,
      });
    },
    [SyntaxKind.BigIntKeyword]: function CONVERT_BigIntKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSBigIntKeyword,
      });
    },
    [SyntaxKind.BooleanKeyword]: function CONVERT_BooleanKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSBooleanKeyword,
      });
    },
    [SyntaxKind.NeverKeyword]: function CONVERT_NeverKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSNeverKeyword,
      });
    },
    [SyntaxKind.NumberKeyword]: function CONVERT_NumberKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSNumberKeyword,
      });
    },
    [SyntaxKind.ObjectKeyword]: function CONVERT_ObjectKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSObjectKeyword,
      });
    },
    [SyntaxKind.StringKeyword]: function CONVERT_StringKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSStringKeyword,
      });
    },
    [SyntaxKind.SymbolKeyword]: function CONVERT_SymbolKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSSymbolKeyword,
      });
    },
    [SyntaxKind.UnknownKeyword]: function CONVERT_UnknownKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      });
    },
    [SyntaxKind.VoidKeyword]: function CONVERT_VoidKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSVoidKeyword,
      });
    },
    [SyntaxKind.UndefinedKeyword]: function CONVERT_UndefinedKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSUndefinedKeyword,
      });
    },
    [SyntaxKind.IntrinsicKeyword]: function CONVERT_IntrinsicKeyword(node) {
      return createNode<any>(node, {
        type: AST_NODE_TYPES.TSIntrinsicKeyword,
      });
    },
    [SyntaxKind.AbstractKeyword]: function CONVERT_AbstractKeyword(node) {
      return createNode<TSESTree.TSAbstractKeyword>(node, {
        type: AST_NODE_TYPES.TSAbstractKeyword,
      });
    },

    [SyntaxKind.NonNullExpression]: function CONVERT_NonNullExpression(node) {
      const nnExpr = createNode<TSESTree.TSNonNullExpression>(node, {
        type: AST_NODE_TYPES.TSNonNullExpression,
        expression: convertChild(node.expression),
      });

      return convertChainExpression(nnExpr, node);
    },

    [SyntaxKind.TypeLiteral]: function CONVERT_TypeLiteral(node) {
      return createNode<TSESTree.TSTypeLiteral>(node, {
        type: AST_NODE_TYPES.TSTypeLiteral,
        members: node.members.map(el => convertChild(el)),
      });
    },

    [SyntaxKind.ArrayType]: function CONVERT_ArrayType(node) {
      return createNode<TSESTree.TSArrayType>(node, {
        type: AST_NODE_TYPES.TSArrayType,
        elementType: convertType(node.elementType),
      });
    },

    [SyntaxKind.IndexedAccessType]: function CONVERT_IndexedAccessType(node) {
      return createNode<TSESTree.TSIndexedAccessType>(node, {
        type: AST_NODE_TYPES.TSIndexedAccessType,
        objectType: convertType(node.objectType),
        indexType: convertType(node.indexType),
      });
    },

    [SyntaxKind.ConditionalType]: function CONVERT_ConditionalType(node) {
      return createNode<TSESTree.TSConditionalType>(node, {
        type: AST_NODE_TYPES.TSConditionalType,
        checkType: convertType(node.checkType),
        extendsType: convertType(node.extendsType),
        trueType: convertType(node.trueType),
        falseType: convertType(node.falseType),
      });
    },

    [SyntaxKind.TypeQuery]: function CONVERT_TypeQuery(node) {
      return createNode<TSESTree.TSTypeQuery>(node, {
        type: AST_NODE_TYPES.TSTypeQuery,
        exprName: convertType(node.exprName),
        typeParameters:
          node.typeArguments &&
          convertTypeArgumentsToTypeParameters(node.typeArguments, node),
      });
    },

    [SyntaxKind.MappedType]: function CONVERT_MappedType(node) {
      const result = createNode<TSESTree.TSMappedType>(node, {
        type: AST_NODE_TYPES.TSMappedType,
        typeParameter: convertType(node.typeParameter),
        nameType: convertType(node.nameType) ?? null,
      });

      if (node.readonlyToken) {
        if (node.readonlyToken.kind === SyntaxKind.ReadonlyKeyword) {
          result.readonly = true;
        } else {
          result.readonly = getTextForTokenKind(node.readonlyToken.kind);
        }
      }

      if (node.questionToken) {
        if (node.questionToken.kind === SyntaxKind.QuestionToken) {
          result.optional = true;
        } else {
          result.optional = getTextForTokenKind(node.questionToken.kind);
        }
      }

      if (node.type) {
        result.typeAnnotation = convertType(node.type);
      }
      return result;
    },

    [SyntaxKind.ParenthesizedExpression]:
      function CONVERT_ParenthesizedExpression(node, parent) {
        return convertChild(node.expression, parent);
      },

    [SyntaxKind.TypeAliasDeclaration]: function CONVERT_TypeAliasDeclaration(
      node,
    ) {
      const result = createNode<TSESTree.TSTypeAliasDeclaration>(node, {
        type: AST_NODE_TYPES.TSTypeAliasDeclaration,
        id: convertChild(node.name),
        typeAnnotation: convertType(node.type),
      });

      if (hasModifier(SyntaxKind.DeclareKeyword, node)) {
        result.declare = true;
      }

      // Process typeParameters
      if (node.typeParameters) {
        result.typeParameters =
          convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters,
          );
      }

      // check for exports
      return fixExports(node, result);
    },

    [SyntaxKind.MethodSignature]: function CONVERT_MethodSignature(node) {
      return convertMethodSignature(node);
    },

    [SyntaxKind.PropertySignature]: function CONVERT_PropertySignature(node) {
      const result = createNode<TSESTree.TSPropertySignature>(node, {
        type: AST_NODE_TYPES.TSPropertySignature,
        optional: isOptional(node) || undefined,
        computed: isComputedProperty(node.name),
        key: convertChild(node.name),
        typeAnnotation: node.type
          ? convertTypeAnnotation(node.type, node)
          : undefined,
        initializer:
          convertChild(
            // eslint-disable-next-line deprecation/deprecation -- TODO breaking change remove this from the AST
            node.initializer,
          ) || undefined,
        readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
        static: hasModifier(SyntaxKind.StaticKeyword, node) || undefined,
        export: hasModifier(SyntaxKind.ExportKeyword, node) || undefined,
      });

      const accessibility = getTSNodeAccessibility(node);
      if (accessibility) {
        result.accessibility = accessibility;
      }

      return result;
    },

    [SyntaxKind.IndexSignature]: function CONVERT_IndexSignature(node) {
      const result = createNode<TSESTree.TSIndexSignature>(node, {
        type: AST_NODE_TYPES.TSIndexSignature,
        parameters: node.parameters.map(el => convertChild(el)),
      });

      if (node.type) {
        result.typeAnnotation = convertTypeAnnotation(node.type, node);
      }

      if (hasModifier(SyntaxKind.ReadonlyKeyword, node)) {
        result.readonly = true;
      }

      const accessibility = getTSNodeAccessibility(node);
      if (accessibility) {
        result.accessibility = accessibility;
      }

      if (hasModifier(SyntaxKind.ExportKeyword, node)) {
        result.export = true;
      }

      if (hasModifier(SyntaxKind.StaticKeyword, node)) {
        result.static = true;
      }
      return result;
    },

    [SyntaxKind.ConstructorType]: function CONVERT_ConstructorType(node) {
      const result = createNode<TSESTree.TSConstructorType>(node, {
        type: AST_NODE_TYPES.TSConstructorType,
        params: convertParameters(node.parameters),
        abstract: hasModifier(SyntaxKind.AbstractKeyword, node),
      });
      if (node.type) {
        result.returnType = convertTypeAnnotation(node.type, node);
      }
      if (node.typeParameters) {
        result.typeParameters =
          convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters,
          );
      }
      return result;
    },

    [SyntaxKind.FunctionType]: function CONVERT_FunctionType(node) {
      return convertFunctionSignature(node);
    },
    [SyntaxKind.ConstructSignature]: function CONVERT_ConstructSignature(node) {
      return convertFunctionSignature(node);
    },
    [SyntaxKind.CallSignature]: function CONVERT_CallSignature(node) {
      return convertFunctionSignature(node);
    },

    [SyntaxKind.ExpressionWithTypeArguments]:
      function ExpressionWithTypeArguments(node, parent) {
        const type =
          parent.kind === SyntaxKind.InterfaceDeclaration
            ? AST_NODE_TYPES.TSInterfaceHeritage
            : parent.kind === SyntaxKind.HeritageClause
            ? AST_NODE_TYPES.TSClassImplements
            : AST_NODE_TYPES.TSInstantiationExpression;
        const result = createNode<
          | TSESTree.TSInterfaceHeritage
          | TSESTree.TSClassImplements
          | TSESTree.TSInstantiationExpression
        >(node, {
          type,
          expression: convertChild(node.expression),
        });

        if (node.typeArguments) {
          result.typeParameters = convertTypeArgumentsToTypeParameters(
            node.typeArguments,
            node,
          );
        }
        return result;
      },

    [SyntaxKind.InterfaceDeclaration]: function CONVERT_InterfaceDeclaration(
      node,
    ) {
      const interfaceHeritageClauses = node.heritageClauses ?? [];
      const result = createNode<TSESTree.TSInterfaceDeclaration>(node, {
        type: AST_NODE_TYPES.TSInterfaceDeclaration,
        body: createNode<TSESTree.TSInterfaceBody>(node, {
          type: AST_NODE_TYPES.TSInterfaceBody,
          body: node.members.map(member => convertChild(member)),
          range: [node.members.pos - 1, node.end],
        }),
        id: convertChild(node.name),
      });

      if (node.typeParameters) {
        result.typeParameters =
          convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters,
          );
      }

      if (interfaceHeritageClauses.length > 0) {
        const interfaceExtends: TSESTree.TSInterfaceHeritage[] = [];
        const interfaceImplements: TSESTree.TSInterfaceHeritage[] = [];

        for (const heritageClause of interfaceHeritageClauses) {
          if (heritageClause.token === SyntaxKind.ExtendsKeyword) {
            for (const n of heritageClause.types) {
              interfaceExtends.push(convertChild(n, node));
            }
          } else {
            for (const n of heritageClause.types) {
              interfaceImplements.push(convertChild(n, node));
            }
          }
        }

        if (interfaceExtends.length) {
          result.extends = interfaceExtends;
        }

        if (interfaceImplements.length) {
          result.implements = interfaceImplements;
        }
      }

      if (hasModifier(SyntaxKind.AbstractKeyword, node)) {
        result.abstract = true;
      }
      if (hasModifier(SyntaxKind.DeclareKeyword, node)) {
        result.declare = true;
      }
      // check for exports
      return fixExports(node, result);
    },

    [SyntaxKind.TypePredicate]: function CONVERT_TypePredicate(node) {
      const result = createNode<TSESTree.TSTypePredicate>(node, {
        type: AST_NODE_TYPES.TSTypePredicate,
        asserts: node.assertsModifier !== undefined,
        parameterName: convertChild(node.parameterName),
        typeAnnotation: null,
      });
      /**
       * Specific fix for type-guard location data
       */
      if (node.type) {
        result.typeAnnotation = convertTypeAnnotation(node.type, node);
        result.typeAnnotation.loc = result.typeAnnotation.typeAnnotation.loc;
        result.typeAnnotation.range =
          result.typeAnnotation.typeAnnotation.range;
      }
      return result;
    },

    [SyntaxKind.ImportType]: function CONVERT_ImportType(node) {
      return createNode<TSESTree.TSImportType>(node, {
        type: AST_NODE_TYPES.TSImportType,
        isTypeOf: !!node.isTypeOf,
        parameter: convertChild(node.argument),
        qualifier: convertChild(node.qualifier),
        typeParameters: node.typeArguments
          ? convertTypeArgumentsToTypeParameters(node.typeArguments, node)
          : null,
      });
    },

    [SyntaxKind.EnumDeclaration]: function CONVERT_EnumDeclaration(node) {
      const result = createNode<TSESTree.TSEnumDeclaration>(node, {
        type: AST_NODE_TYPES.TSEnumDeclaration,
        id: convertChild(node.name),
        members: node.members.map(el => convertChild(el)),
      });
      // apply modifiers first...
      applyModifiersToResult(result, getModifiers(node));
      // ...then check for exports
      return fixExports(node, result);
    },

    [SyntaxKind.EnumMember]: function CONVERT_EnumMember(node) {
      const result = createNode<TSESTree.TSEnumMember>(node, {
        type: AST_NODE_TYPES.TSEnumMember,
        id: convertChild(node.name),
      });
      if (node.initializer) {
        result.initializer = convertChild(node.initializer);
      }
      if (node.name.kind === SyntaxKind.ComputedPropertyName) {
        result.computed = true;
      }
      return result;
    },

    [SyntaxKind.ModuleDeclaration]: function CONVERT_ModuleDeclaration(node) {
      const result = createNode<TSESTree.TSModuleDeclaration>(node, {
        type: AST_NODE_TYPES.TSModuleDeclaration,
        id: convertChild(node.name),
      });
      if (node.body) {
        result.body = convertChild(node.body);
      }
      // apply modifiers first...
      applyModifiersToResult(result, getModifiers(node));
      if (node.flags & ts.NodeFlags.GlobalAugmentation) {
        result.global = true;
      }
      // ...then check for exports
      return fixExports(node, result);
    },

    // TypeScript specific types
    [SyntaxKind.ParenthesizedType]: function CONVERT_ParenthesizedType(node) {
      return convertType(node.type);
    },

    [SyntaxKind.UnionType]: function CONVERT_UnionType(node) {
      return createNode<TSESTree.TSUnionType>(node, {
        type: AST_NODE_TYPES.TSUnionType,
        types: node.types.map(el => convertType(el)),
      });
    },

    [SyntaxKind.IntersectionType]: function CONVERT_IntersectionType(node) {
      return createNode<TSESTree.TSIntersectionType>(node, {
        type: AST_NODE_TYPES.TSIntersectionType,
        types: node.types.map(el => convertType(el)),
      });
    },

    [SyntaxKind.AsExpression]: function CONVERT_AsExpression(node) {
      return createNode<TSESTree.TSAsExpression>(node, {
        type: AST_NODE_TYPES.TSAsExpression,
        expression: convertChild(node.expression),
        typeAnnotation: convertType(node.type),
      });
    },

    [SyntaxKind.InferType]: function CONVERT_InferType(node) {
      return createNode<TSESTree.TSInferType>(node, {
        type: AST_NODE_TYPES.TSInferType,
        typeParameter: convertType(node.typeParameter),
      });
    },

    [SyntaxKind.LiteralType]: function CONVERT_LiteralType(node) {
      if (
        typescriptVersionIsAtLeast['4.0'] &&
        node.literal.kind === SyntaxKind.NullKeyword
      ) {
        // 4.0 started nesting null types inside a LiteralType node
        // but our AST is designed around the old way of null being a keyword
        return createNode<TSESTree.TSNullKeyword>(
          node.literal as ts.NullLiteral,
          {
            type: AST_NODE_TYPES.TSNullKeyword,
          },
        );
      } else {
        return createNode<TSESTree.TSLiteralType>(node, {
          type: AST_NODE_TYPES.TSLiteralType,
          literal: convertType(node.literal),
        });
      }
    },

    [SyntaxKind.TypeAssertionExpression]:
      function CONVERT_TypeAssertionExpression(node) {
        return createNode<TSESTree.TSTypeAssertion>(node, {
          type: AST_NODE_TYPES.TSTypeAssertion,
          typeAnnotation: convertType(node.type),
          expression: convertChild(node.expression),
        });
      },

    [SyntaxKind.ImportEqualsDeclaration]:
      function CONVERT_ImportEqualsDeclaration(node) {
        return createNode<TSESTree.TSImportEqualsDeclaration>(node, {
          type: AST_NODE_TYPES.TSImportEqualsDeclaration,
          id: convertChild(node.name),
          moduleReference: convertChild(node.moduleReference),
          importKind: node.isTypeOnly ? 'type' : 'value',
          isExport: hasModifier(SyntaxKind.ExportKeyword, node),
        });
      },

    [SyntaxKind.ExternalModuleReference]:
      function CONVERT_ExternalModuleReference(node) {
        return createNode<TSESTree.TSExternalModuleReference>(node, {
          type: AST_NODE_TYPES.TSExternalModuleReference,
          expression: convertChild(node.expression),
        });
      },

    [SyntaxKind.NamespaceExportDeclaration]:
      function NamespaceExportDeclaration(node) {
        return createNode<TSESTree.TSNamespaceExportDeclaration>(node, {
          type: AST_NODE_TYPES.TSNamespaceExportDeclaration,
          id: convertChild(node.name),
        });
      },

    // Tuple
    [SyntaxKind.TupleType]: function CONVERT_TupleType(node) {
      // In TS 4.0, the `elementTypes` property was changed to `elements`.
      // To support both at compile time, we cast to access the newer version
      // if the former does not exist.
      const elementTypes =
        'elementTypes' in node
          ? (node.elementTypes as ts.Node[]).map(el => convertType(el))
          : node.elements.map(el => convertType(el));

      return createNode<TSESTree.TSTupleType>(node, {
        type: AST_NODE_TYPES.TSTupleType,
        elementTypes,
      });
    },

    [SyntaxKind.NamedTupleMember]: function CONVERT_NamedTupleMember(node) {
      const member = createNode<TSESTree.TSNamedTupleMember>(node, {
        type: AST_NODE_TYPES.TSNamedTupleMember,
        elementType: convertType(node.type, node),
        label: convertChild(node.name, node),
        optional: node.questionToken != null,
      });

      if (node.dotDotDotToken) {
        // adjust the start to account for the "..."
        member.range[0] = member.label.range[0];
        member.loc.start = member.label.loc.start;
        return createNode<TSESTree.TSRestType>(node, {
          type: AST_NODE_TYPES.TSRestType,
          typeAnnotation: member,
        });
      }

      return member;
    },

    [SyntaxKind.OptionalType]: function CONVERT_OptionalType(node) {
      return createNode<TSESTree.TSOptionalType>(node, {
        type: AST_NODE_TYPES.TSOptionalType,
        typeAnnotation: convertType(node.type),
      });
    },

    [SyntaxKind.RestType]: function CONVERT_RestType(node) {
      return createNode<TSESTree.TSRestType>(node, {
        type: AST_NODE_TYPES.TSRestType,
        typeAnnotation: convertType(node.type),
      });
    },

    // Template Literal Types
    [SyntaxKind.TemplateLiteralType]: function CONVERT_TemplateLiteralType(
      node,
    ) {
      const result = createNode<TSESTree.TSTemplateLiteralType>(node, {
        type: AST_NODE_TYPES.TSTemplateLiteralType,
        quasis: [convertChild(node.head)],
        types: [],
      });

      node.templateSpans.forEach(templateSpan => {
        result.types.push(convertChild(templateSpan.type));
        result.quasis.push(convertChild(templateSpan.literal));
      });
      return result;
    },

    [SyntaxKind.ClassStaticBlockDeclaration]:
      function ClassStaticBlockDeclaration(node) {
        return createNode<TSESTree.StaticBlock>(node, {
          type: AST_NODE_TYPES.StaticBlock,
          body: convertBodyExpressions(node.body.statements, node),
        });
      },

    [SyntaxKind.AssertEntry]: function CONVERT_AssertEntry(node) {
      return createNode<TSESTree.ImportAttribute>(node, {
        type: AST_NODE_TYPES.ImportAttribute,
        key: convertChild(node.name),
        value: convertChild(node.value),
      });
    },

    [SyntaxKind.SatisfiesExpression]: function CONVERT_SatisfiesExpression(
      node,
    ) {
      return createNode<TSESTree.TSSatisfiesExpression>(node, {
        type: AST_NODE_TYPES.TSSatisfiesExpression,
        expression: convertChild(node.expression),
        typeAnnotation: convertChild(node.type),
      });
    },
  };

  /**
   * Converts a TypeScript node into an ESTree node.
   * The core of the conversion logic:
   * Identify and convert each relevant TypeScript SyntaxKind
   * @param node the child ts.Node
   * @param parent parentNode
   * @returns the converted ESTree node
   */
  function convertNode(node: TSNode, parent: TSNode): TSESTree.Node | null {
    const conversionFn = selectors[node.kind];
    if (conversionFn) {
      return conversionFn(
        // @ts-expect-error -- TS isn't able to understand this relationship is valid
        node,
        parent,
      );
    }

    return deeplyCopy(node);
  }

  return {
    program: convertProgram(),
    esTreeNodeToTSNodeMap,
    tsNodeToESTreeNodeMap,
  };
}
