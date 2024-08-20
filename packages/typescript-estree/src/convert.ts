// There's lots of funny stuff due to the typing of ts.Node
/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */
import * as ts from 'typescript';

import type { TSError } from './node-utils';
import type {
  ParserWeakMap,
  ParserWeakMapESTreeToTSNode,
} from './parser-options';
import type { SemanticOrSyntacticError } from './semantic-or-syntactic-errors';
import type { TSESTree, TSESTreeToTSNode, TSNode } from './ts-estree';

import { getDecorators, getModifiers } from './getModifiers';
import {
  canContainDirective,
  createError,
  findNextToken,
  getBinaryExpressionType,
  getContainingFunction,
  getDeclarationKind,
  getLastModifier,
  getLineAndCharacterFor,
  getLocFor,
  getNamespaceModifiers,
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
  isValidAssignmentTarget,
  nodeCanBeDecorated,
  nodeHasIllegalDecorators,
  nodeIsPresent,
  unescapeStringLiteralText,
} from './node-utils';
import { AST_NODE_TYPES } from './ts-estree';

const SyntaxKind = ts.SyntaxKind;

export interface ConverterOptions {
  allowInvalidAST?: boolean;
  errorOnUnknownASTType?: boolean;
  shouldPreserveNodeMaps?: boolean;
  suppressDeprecatedPropertyWarnings?: boolean;
}

/**
 * Extends and formats a given error object
 * @param error the error object
 * @returns converted error object
 */
export function convertError(
  error: SemanticOrSyntacticError | ts.DiagnosticWithLocation,
): TSError {
  return createError(
    ('message' in error && error.message) || (error.messageText as string),
    error.file!,
    error.start!,
  );
}

export interface ASTMaps {
  esTreeNodeToTSNodeMap: ParserWeakMapESTreeToTSNode;
  tsNodeToESTreeNodeMap: ParserWeakMap<TSNode, TSESTree.Node>;
}

export class Converter {
  private allowPattern = false;
  private readonly ast: ts.SourceFile;
  private readonly esTreeNodeToTSNodeMap = new WeakMap();
  private readonly options: ConverterOptions;

  private readonly tsNodeToESTreeNodeMap = new WeakMap();

  /**
   * Converts a TypeScript node into an ESTree node
   * @param ast the full TypeScript AST
   * @param options additional options for the conversion
   * @returns the converted ESTreeNode
   */
  constructor(ast: ts.SourceFile, options?: ConverterOptions) {
    this.ast = ast;
    this.options = { ...options };
  }

  convertProgram(): TSESTree.Program {
    return this.converter(this.ast) as TSESTree.Program;
  }

  getASTMaps(): ASTMaps {
    return {
      esTreeNodeToTSNodeMap: this.esTreeNodeToTSNodeMap,
      tsNodeToESTreeNodeMap: this.tsNodeToESTreeNodeMap,
    };
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param node the child ts.Node
   * @param parent parentNode
   * @param allowPattern flag to determine if patterns are allowed
   * @returns the converted ESTree node
   */
  private converter(
    node?: ts.Node,
    parent?: ts.Node,
    allowPattern?: boolean,
  ): any {
    /**
     * Exit early for null and undefined
     */
    if (!node) {
      return null;
    }

    this.#checkModifiers(node);

    const pattern = this.allowPattern;
    if (allowPattern !== undefined) {
      this.allowPattern = allowPattern;
    }

    const result = this.convertNode(
      node as TSNode,
      (parent ?? node.parent) as TSNode,
    );

    this.registerTSNodeInNodeMap(node, result);

    this.allowPattern = pattern;
    return result;
  }

  /**
   * Fixes the exports of the given ts.Node
   * @returns the ESTreeNode with fixed exports
   */
  private fixExports<
    T extends
      | TSESTree.DefaultExportDeclarations
      | TSESTree.NamedExportDeclarations,
  >(
    node:
      | ts.ClassDeclaration
      | ts.ClassExpression
      | ts.EnumDeclaration
      | ts.FunctionDeclaration
      | ts.ImportEqualsDeclaration
      | ts.InterfaceDeclaration
      | ts.ModuleDeclaration
      | ts.TypeAliasDeclaration
      | ts.VariableStatement,
    result: T,
  ): T | TSESTree.ExportDefaultDeclaration | TSESTree.ExportNamedDeclaration {
    const isNamespaceNode =
      ts.isModuleDeclaration(node) &&
      Boolean(node.flags & ts.NodeFlags.Namespace);

    const modifiers = isNamespaceNode
      ? getNamespaceModifiers(node)
      : getModifiers(node);

    if (modifiers?.[0].kind === SyntaxKind.ExportKeyword) {
      /**
       * Make sure that original node is registered instead of export
       */
      this.registerTSNodeInNodeMap(node, result);

      const exportKeyword = modifiers[0];
      const nextModifier = modifiers[1];
      const declarationIsDefault =
        nextModifier?.kind === SyntaxKind.DefaultKeyword;

      const varToken = declarationIsDefault
        ? findNextToken(nextModifier, this.ast, this.ast)
        : findNextToken(exportKeyword, this.ast, this.ast);

      result.range[0] = varToken!.getStart(this.ast);
      result.loc = getLocFor(result.range, this.ast);

      if (declarationIsDefault) {
        return this.createNode<TSESTree.ExportDefaultDeclaration>(
          node as Exclude<typeof node, ts.ImportEqualsDeclaration>,
          {
            declaration: result as TSESTree.DefaultExportDeclarations,
            exportKind: 'value',
            range: [exportKeyword.getStart(this.ast), result.range[1]],
            type: AST_NODE_TYPES.ExportDefaultDeclaration,
          },
        );
      }
      const isType =
        result.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
        result.type === AST_NODE_TYPES.TSTypeAliasDeclaration;
      const isDeclare = 'declare' in result && result.declare;
      return this.createNode<TSESTree.ExportNamedDeclaration>(
        node,
        // @ts-expect-error - TODO, narrow the types here
        this.#withDeprecatedAliasGetter(
          {
            attributes: [],
            declaration: result,
            exportKind: isType || isDeclare ? 'type' : 'value',
            range: [exportKeyword.getStart(this.ast), result.range[1]],
            source: null,
            specifiers: [],
            type: AST_NODE_TYPES.ExportNamedDeclaration,
          },
          'assertions',
          'attributes',
          true,
        ),
      );
    }

    return result;
  }

  /**
   * Register specific TypeScript node into map with first ESTree node provided
   */
  private registerTSNodeInNodeMap(
    node: ts.Node,
    result: TSESTree.Node | null,
  ): void {
    if (result && this.options.shouldPreserveNodeMaps) {
      if (!this.tsNodeToESTreeNodeMap.has(node)) {
        this.tsNodeToESTreeNodeMap.set(node, result);
      }
    }
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param child the child ts.Node
   * @param parent parentNode
   * @returns the converted ESTree node
   */
  private convertPattern(child?: ts.Node, parent?: ts.Node): any {
    return this.converter(child, parent, true);
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param child the child ts.Node
   * @param parent parentNode
   * @returns the converted ESTree node
   */
  private convertBindingNameWithTypeAnnotation(
    name: ts.BindingName,
    tsType: ts.TypeNode | undefined,
    parent?: ts.Node,
  ): TSESTree.BindingName {
    const id = this.convertPattern(name) as TSESTree.BindingName;

    if (tsType) {
      id.typeAnnotation = this.convertTypeAnnotation(tsType, parent);
      this.fixParentLocation(id, id.typeAnnotation.range);
    }

    return id;
  }

  private convertChild(child?: ts.Node, parent?: ts.Node): any {
    return this.converter(child, parent, false);
  }

  private createNode<T extends TSESTree.Node = TSESTree.Node>(
    // The 'parent' property will be added later if specified
    node: Omit<TSESTreeToTSNode<T>, 'parent'>,
    data: Omit<TSESTree.OptionalRangeAndLoc<T>, 'parent'>,
  ): T {
    const result = data;
    result.range ??= getRange(node, this.ast);
    result.loc ??= getLocFor(result.range, this.ast);

    if (result && this.options.shouldPreserveNodeMaps) {
      this.esTreeNodeToTSNodeMap.set(result, node);
    }
    return result as T;
  }

  /**
   * Converts a child into a type annotation. This creates an intermediary
   * TypeAnnotation node to match what Flow does.
   * @param child The TypeScript AST node to convert.
   * @param parent parentNode
   * @returns The type annotation node.
   */
  private convertTypeAnnotation(
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
    const range: TSESTree.Range = [annotationStartCol, child.end];
    const loc = getLocFor(range, this.ast);

    return {
      loc,
      range,
      type: AST_NODE_TYPES.TSTypeAnnotation,
      typeAnnotation: this.convertChild(child),
    } as TSESTree.TSTypeAnnotation;
  }

  /**
   * Coverts body Nodes and add a directive field to StringLiterals
   * @param nodes of ts.Node
   * @param parent parentNode
   * @returns Array of body statements
   */
  private convertBodyExpressions(
    nodes: ts.NodeArray<ts.Statement>,
    parent:
      | ts.Block
      | ts.ClassStaticBlockDeclaration
      | ts.ModuleBlock
      | ts.SourceFile,
  ): TSESTree.Statement[] {
    let allowDirectives = canContainDirective(parent);

    return (
      nodes
        .map(statement => {
          const child = this.convertChild(statement);
          if (allowDirectives) {
            if (
              child?.expression &&
              ts.isExpressionStatement(statement) &&
              ts.isStringLiteral(statement.expression)
            ) {
              const raw = child.expression.raw;
              child.directive = raw.slice(1, -1);
              return child; // child can be null, but it's filtered below
            }
            allowDirectives = false;
          }
          return child; // child can be null, but it's filtered below
        })
        // filter out unknown nodes for now
        .filter(statement => statement)
    );
  }

  /**
   * Converts a ts.Node's typeArguments to TSTypeParameterInstantiation node
   * @param typeArguments ts.NodeArray typeArguments
   * @param node parent used to create this node
   * @returns TypeParameterInstantiation node
   */
  private convertTypeArgumentsToTypeParameterInstantiation(
    typeArguments: ts.NodeArray<ts.TypeNode>,
    node: TSESTreeToTSNode<TSESTree.TSTypeParameterInstantiation>,
  ): TSESTree.TSTypeParameterInstantiation {
    const greaterThanToken = findNextToken(typeArguments, this.ast, this.ast)!;

    return this.createNode<TSESTree.TSTypeParameterInstantiation>(node, {
      params: typeArguments.map(typeArgument =>
        this.convertChild(typeArgument),
      ),
      range: [typeArguments.pos - 1, greaterThanToken.end],
      type: AST_NODE_TYPES.TSTypeParameterInstantiation,
    });
  }

  /**
   * Converts a ts.Node's typeParameters to TSTypeParameterDeclaration node
   * @param typeParameters ts.Node typeParameters
   * @returns TypeParameterDeclaration node
   */
  private convertTSTypeParametersToTypeParametersDeclaration(
    typeParameters: ts.NodeArray<ts.TypeParameterDeclaration>,
  ): TSESTree.TSTypeParameterDeclaration {
    const greaterThanToken = findNextToken(typeParameters, this.ast, this.ast)!;
    const range: TSESTree.Range = [
      typeParameters.pos - 1,
      greaterThanToken.end,
    ];

    return {
      loc: getLocFor(range, this.ast),
      params: typeParameters.map(typeParameter =>
        this.convertChild(typeParameter),
      ),
      range,
      type: AST_NODE_TYPES.TSTypeParameterDeclaration,
    } as TSESTree.TSTypeParameterDeclaration;
  }

  /**
   * Converts an array of ts.Node parameters into an array of ESTreeNode params
   * @param parameters An array of ts.Node params to be converted
   * @returns an array of converted ESTreeNode params
   */
  private convertChainExpression(
    node: TSESTree.ChainElement,
    tsNode:
      | ts.CallExpression
      | ts.ElementAccessExpression
      | ts.NonNullExpression
      | ts.PropertyAccessExpression,
  ): TSESTree.ChainElement | TSESTree.ChainExpression {
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

    return this.createNode<TSESTree.ChainExpression>(tsNode, {
      expression: node,
      type: AST_NODE_TYPES.ChainExpression,
    });
  }

  private convertParameters(
    parameters: ts.NodeArray<ts.ParameterDeclaration>,
  ): TSESTree.Parameter[] {
    if (!parameters?.length) {
      return [];
    }
    return parameters.map(param => {
      const convertedParam = this.convertChild(param) as TSESTree.Parameter;

      convertedParam.decorators =
        getDecorators(param)?.map(el => this.convertChild(el)) ?? [];

      return convertedParam;
    });
  }

  /**
   * For nodes that are copied directly from the TypeScript AST into
   * ESTree mostly as-is. The only difference is the addition of a type
   * property instead of a kind property. Recursively copies all children.
   */
  private convertJSXIdentifier(
    node: ts.Identifier | ts.ThisExpression,
  ): TSESTree.JSXIdentifier {
    const result = this.createNode<TSESTree.JSXIdentifier>(node, {
      name: node.getText(),
      type: AST_NODE_TYPES.JSXIdentifier,
    });
    this.registerTSNodeInNodeMap(node, result);
    return result;
  }

  private convertJSXNamespaceOrIdentifier(
    node: ts.Identifier | ts.JsxNamespacedName | ts.ThisExpression,
  ): TSESTree.JSXIdentifier | TSESTree.JSXNamespacedName {
    // TypeScript@5.1 added in ts.JsxNamespacedName directly
    // We prefer using that if it's relevant for this node type
    if (node.kind === ts.SyntaxKind.JsxNamespacedName) {
      const result = this.createNode<TSESTree.JSXNamespacedName>(node, {
        name: this.createNode(node.name, {
          name: node.name.text,
          type: AST_NODE_TYPES.JSXIdentifier,
        }),
        namespace: this.createNode(node.namespace, {
          name: node.namespace.text,
          type: AST_NODE_TYPES.JSXIdentifier,
        }),
        type: AST_NODE_TYPES.JSXNamespacedName,
      });
      this.registerTSNodeInNodeMap(node, result);
      return result;
    }

    // TypeScript@<5.1 has to manually parse the JSX attributes
    const text = node.getText();
    const colonIndex = text.indexOf(':');
    // this is intentional we can ignore conversion if `:` is in first character
    if (colonIndex > 0) {
      const range = getRange(node, this.ast);
      // @ts-expect-error -- TypeScript@<5.1 doesn't have ts.JsxNamespacedName
      const result = this.createNode<TSESTree.JSXNamespacedName>(node, {
        name: this.createNode<TSESTree.JSXIdentifier>(node, {
          name: text.slice(colonIndex + 1),
          range: [range[0] + colonIndex + 1, range[1]],
          type: AST_NODE_TYPES.JSXIdentifier,
        }),
        namespace: this.createNode<TSESTree.JSXIdentifier>(node, {
          name: text.slice(0, colonIndex),
          range: [range[0], range[0] + colonIndex],
          type: AST_NODE_TYPES.JSXIdentifier,
        }),
        range,
        type: AST_NODE_TYPES.JSXNamespacedName,
      });
      this.registerTSNodeInNodeMap(node, result);
      return result;
    }

    return this.convertJSXIdentifier(node);
  }

  private deeplyCopy(node: TSNode): any {
    if (node.kind === ts.SyntaxKind.JSDocFunctionType) {
      this.#throwError(
        node,
        'JSDoc types can only be used inside documentation comments.',
      );
    }

    const customType = `TS${SyntaxKind[node.kind]}` as AST_NODE_TYPES;

    /**
     * If the "errorOnUnknownASTType" option is set to true, throw an error,
     * otherwise fallback to just including the unknown type as-is.
     */
    if (this.options.errorOnUnknownASTType && !AST_NODE_TYPES[customType]) {
      throw new Error(`Unknown AST_NODE_TYPE: "${customType}"`);
    }

    const result = this.createNode<any>(node, {
      type: customType,
    });

    if ('type' in node) {
      result.typeAnnotation =
        node.type && 'kind' in node.type && ts.isTypeNode(node.type)
          ? this.convertTypeAnnotation(node.type, node)
          : null;
    }
    if ('typeArguments' in node) {
      result.typeArguments =
        node.typeArguments && 'pos' in node.typeArguments
          ? this.convertTypeArgumentsToTypeParameterInstantiation(
              node.typeArguments,
              node,
            )
          : null;
    }
    if ('typeParameters' in node) {
      result.typeParameters =
        node.typeParameters && 'pos' in node.typeParameters
          ? this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            )
          : null;
    }
    const decorators = getDecorators(node);
    if (decorators?.length) {
      result.decorators = decorators.map(el => this.convertChild(el));
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
          result[key] = value.map(el => this.convertChild(el as TSNode));
        } else if (value && typeof value === 'object' && value.kind) {
          // need to check node[key].kind to ensure we don't try to convert a symbol
          result[key] = this.convertChild(value as TSNode);
        } else {
          result[key] = value;
        }
      });
    return result;
  }

  /**
   * Converts a TypeScript JSX node.tagName into an ESTree node.name
   * @param node the tagName object from a JSX ts.Node
   * @returns the converted ESTree name object
   */
  private convertImportAttributes(
    node: ts.ImportAttributes | undefined,
  ): TSESTree.ImportAttribute[] {
    return node === undefined
      ? []
      : node.elements.map(element => this.convertChild(element));
  }

  private convertJSXTagName(
    node: ts.JsxTagNameExpression,
    parent: ts.Node,
  ): TSESTree.JSXTagNameExpression {
    let result: TSESTree.JSXTagNameExpression;
    switch (node.kind) {
      case SyntaxKind.PropertyAccessExpression:
        if (node.name.kind === SyntaxKind.PrivateIdentifier) {
          // This is one of the few times where TS explicitly errors, and doesn't even gracefully handle the syntax.
          // So we shouldn't ever get into this state to begin with.
          this.#throwError(node.name, 'Non-private identifier expected.');
        }

        result = this.createNode<TSESTree.JSXMemberExpression>(node, {
          object: this.convertJSXTagName(node.expression, parent),
          property: this.convertJSXIdentifier(node.name),
          type: AST_NODE_TYPES.JSXMemberExpression,
        });
        break;

      case SyntaxKind.ThisKeyword:
      case SyntaxKind.Identifier:
      default:
        return this.convertJSXNamespaceOrIdentifier(node);
    }

    this.registerTSNodeInNodeMap(node, result);
    return result;
  }

  private convertMethodSignature(
    node:
      | ts.GetAccessorDeclaration
      | ts.MethodSignature
      | ts.SetAccessorDeclaration,
  ): TSESTree.TSMethodSignature {
    return this.createNode<TSESTree.TSMethodSignature>(node, {
      accessibility: getTSNodeAccessibility(node),
      computed: isComputedProperty(node.name),
      key: this.convertChild(node.name),
      kind: ((): 'get' | 'method' | 'set' => {
        switch (node.kind) {
          case SyntaxKind.GetAccessor:
            return 'get';

          case SyntaxKind.SetAccessor:
            return 'set';

          case SyntaxKind.MethodSignature:
            return 'method';
        }
      })(),
      optional: isOptional(node),
      params: this.convertParameters(node.parameters),
      readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node),
      returnType: node.type && this.convertTypeAnnotation(node.type, node),
      static: hasModifier(SyntaxKind.StaticKeyword, node),
      type: AST_NODE_TYPES.TSMethodSignature,
      typeParameters:
        node.typeParameters &&
        this.convertTSTypeParametersToTypeParametersDeclaration(
          node.typeParameters,
        ),
    });
  }

  /**
   * Uses the provided range location to adjust the location data of the given Node
   * @param result The node that will have its location data mutated
   * @param childRange The child node range used to expand location
   */
  private assertModuleSpecifier(
    node: ts.ExportDeclaration | ts.ImportDeclaration,
    allowNull: boolean,
  ): void {
    if (!allowNull && node.moduleSpecifier == null) {
      this.#throwUnlessAllowInvalidAST(
        node,
        'Module specifier must be a string literal.',
      );
    }

    if (
      node.moduleSpecifier &&
      node.moduleSpecifier?.kind !== SyntaxKind.StringLiteral
    ) {
      this.#throwUnlessAllowInvalidAST(
        node.moduleSpecifier,
        'Module specifier must be a string literal.',
      );
    }
  }

  private fixParentLocation(
    result: TSESTree.BaseNode,
    childRange: [number, number],
  ): void {
    if (childRange[0] < result.range[0]) {
      result.range[0] = childRange[0];
      result.loc.start = getLineAndCharacterFor(result.range[0], this.ast);
    }
    if (childRange[1] > result.range[1]) {
      result.range[1] = childRange[1];
      result.loc.end = getLineAndCharacterFor(result.range[1], this.ast);
    }
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * The core of the conversion logic:
   * Identify and convert each relevant TypeScript SyntaxKind
   * @returns the converted ESTree node
   */
  #checkModifiers(node: ts.Node): void {
    if (this.options.allowInvalidAST) {
      return;
    }

    // typescript<5.0.0
    if (nodeHasIllegalDecorators(node)) {
      this.#throwError(
        node.illegalDecorators[0],
        'Decorators are not valid here.',
      );
    }

    for (const decorator of getDecorators(
      node,
      /* includeIllegalDecorators */ true,
    ) ?? []) {
      // `checkGrammarModifiers` function in typescript
      if (!nodeCanBeDecorated(node as TSNode)) {
        if (ts.isMethodDeclaration(node) && !nodeIsPresent(node.body)) {
          this.#throwError(
            decorator,
            'A decorator can only decorate a method implementation, not an overload.',
          );
        } else {
          this.#throwError(decorator, 'Decorators are not valid here.');
        }
      }
    }

    for (const modifier of getModifiers(
      node,
      /* includeIllegalModifiers */ true,
    ) ?? []) {
      if (modifier.kind !== SyntaxKind.ReadonlyKeyword) {
        if (
          node.kind === SyntaxKind.PropertySignature ||
          node.kind === SyntaxKind.MethodSignature
        ) {
          this.#throwError(
            modifier,
            `'${ts.tokenToString(
              modifier.kind,
            )}' modifier cannot appear on a type member`,
          );
        }

        if (
          node.kind === SyntaxKind.IndexSignature &&
          (modifier.kind !== SyntaxKind.StaticKeyword ||
            !ts.isClassLike(node.parent))
        ) {
          this.#throwError(
            modifier,
            `'${ts.tokenToString(
              modifier.kind,
            )}' modifier cannot appear on an index signature`,
          );
        }
      }

      if (
        modifier.kind !== SyntaxKind.InKeyword &&
        modifier.kind !== SyntaxKind.OutKeyword &&
        modifier.kind !== SyntaxKind.ConstKeyword &&
        node.kind === SyntaxKind.TypeParameter
      ) {
        this.#throwError(
          modifier,
          `'${ts.tokenToString(
            modifier.kind,
          )}' modifier cannot appear on a type parameter`,
        );
      }

      if (
        (modifier.kind === SyntaxKind.InKeyword ||
          modifier.kind === SyntaxKind.OutKeyword) &&
        (node.kind !== SyntaxKind.TypeParameter ||
          !(
            ts.isInterfaceDeclaration(node.parent) ||
            ts.isClassLike(node.parent) ||
            ts.isTypeAliasDeclaration(node.parent)
          ))
      ) {
        this.#throwError(
          modifier,
          `'${ts.tokenToString(
            modifier.kind,
          )}' modifier can only appear on a type parameter of a class, interface or type alias`,
        );
      }

      if (
        modifier.kind === SyntaxKind.ReadonlyKeyword &&
        node.kind !== SyntaxKind.PropertyDeclaration &&
        node.kind !== SyntaxKind.PropertySignature &&
        node.kind !== SyntaxKind.IndexSignature &&
        node.kind !== SyntaxKind.Parameter
      ) {
        this.#throwError(
          modifier,
          "'readonly' modifier can only appear on a property declaration or index signature.",
        );
      }

      if (
        modifier.kind === SyntaxKind.DeclareKeyword &&
        ts.isClassLike(node.parent) &&
        !ts.isPropertyDeclaration(node)
      ) {
        this.#throwError(
          modifier,
          `'${ts.tokenToString(
            modifier.kind,
          )}' modifier cannot appear on class elements of this kind.`,
        );
      }

      if (
        modifier.kind === SyntaxKind.DeclareKeyword &&
        ts.isVariableStatement(node)
      ) {
        const declarationKind = getDeclarationKind(node.declarationList);
        if (declarationKind === 'using' || declarationKind === 'await using') {
          this.#throwError(
            modifier,
            `'declare' modifier cannot appear on a '${declarationKind}' declaration.`,
          );
        }
      }

      if (
        modifier.kind === SyntaxKind.AbstractKeyword &&
        node.kind !== SyntaxKind.ClassDeclaration &&
        node.kind !== SyntaxKind.ConstructorType &&
        node.kind !== SyntaxKind.MethodDeclaration &&
        node.kind !== SyntaxKind.PropertyDeclaration &&
        node.kind !== SyntaxKind.GetAccessor &&
        node.kind !== SyntaxKind.SetAccessor
      ) {
        this.#throwError(
          modifier,
          `'${ts.tokenToString(
            modifier.kind,
          )}' modifier can only appear on a class, method, or property declaration.`,
        );
      }

      if (
        (modifier.kind === SyntaxKind.StaticKeyword ||
          modifier.kind === SyntaxKind.PublicKeyword ||
          modifier.kind === SyntaxKind.ProtectedKeyword ||
          modifier.kind === SyntaxKind.PrivateKeyword) &&
        (node.parent.kind === SyntaxKind.ModuleBlock ||
          node.parent.kind === SyntaxKind.SourceFile)
      ) {
        this.#throwError(
          modifier,
          `'${ts.tokenToString(
            modifier.kind,
          )}' modifier cannot appear on a module or namespace element.`,
        );
      }

      if (
        modifier.kind === SyntaxKind.AccessorKeyword &&
        node.kind !== SyntaxKind.PropertyDeclaration
      ) {
        this.#throwError(
          modifier,
          "'accessor' modifier can only appear on a property declaration.",
        );
      }

      // `checkGrammarAsyncModifier` function in `typescript`
      if (
        modifier.kind === SyntaxKind.AsyncKeyword &&
        node.kind !== SyntaxKind.MethodDeclaration &&
        node.kind !== SyntaxKind.FunctionDeclaration &&
        node.kind !== SyntaxKind.FunctionExpression &&
        node.kind !== SyntaxKind.ArrowFunction
      ) {
        this.#throwError(modifier, "'async' modifier cannot be used here.");
      }

      // `checkGrammarModifiers` function in `typescript`
      if (
        node.kind === SyntaxKind.Parameter &&
        (modifier.kind === SyntaxKind.StaticKeyword ||
          modifier.kind === SyntaxKind.ExportKeyword ||
          modifier.kind === SyntaxKind.DeclareKeyword ||
          modifier.kind === SyntaxKind.AsyncKeyword)
      ) {
        this.#throwError(
          modifier,
          `'${ts.tokenToString(
            modifier.kind,
          )}' modifier cannot appear on a parameter.`,
        );
      }

      // `checkGrammarModifiers` function in `typescript`
      if (
        modifier.kind === SyntaxKind.PublicKeyword ||
        modifier.kind === SyntaxKind.ProtectedKeyword ||
        modifier.kind === SyntaxKind.PrivateKeyword
      ) {
        for (const anotherModifier of getModifiers(node) ?? []) {
          if (
            anotherModifier !== modifier &&
            (anotherModifier.kind === SyntaxKind.PublicKeyword ||
              anotherModifier.kind === SyntaxKind.ProtectedKeyword ||
              anotherModifier.kind === SyntaxKind.PrivateKeyword)
          ) {
            this.#throwError(
              anotherModifier,
              `Accessibility modifier already seen.`,
            );
          }
        }
      }

      // `checkParameter` function in `typescript`
      if (
        node.kind === SyntaxKind.Parameter &&
        // In `typescript` package, it's `ts.hasSyntacticModifier(node, ts.ModifierFlags.ParameterPropertyModifier)`
        // https://github.com/typescript-eslint/typescript-eslint/pull/6615#discussion_r1136489935
        (modifier.kind === SyntaxKind.PublicKeyword ||
          modifier.kind === SyntaxKind.PrivateKeyword ||
          modifier.kind === SyntaxKind.ProtectedKeyword ||
          modifier.kind === SyntaxKind.ReadonlyKeyword ||
          modifier.kind === SyntaxKind.OverrideKeyword)
      ) {
        const func = getContainingFunction(node)!;

        if (
          !(func.kind === SyntaxKind.Constructor && nodeIsPresent(func.body))
        ) {
          this.#throwError(
            modifier,
            'A parameter property is only allowed in a constructor implementation.',
          );
        }
      }
    }
  }

  #throwUnlessAllowInvalidAST(
    node: ts.Node | number,
    message: string,
  ): asserts node is never {
    if (!this.options.allowInvalidAST) {
      this.#throwError(node, message);
    }
  }

  private convertNode(node: TSNode, parent: TSNode): TSESTree.Node | null {
    switch (node.kind) {
      case SyntaxKind.SourceFile: {
        return this.createNode<TSESTree.Program>(node, {
          body: this.convertBodyExpressions(node.statements, node),
          comments: undefined,
          range: [node.getStart(this.ast), node.endOfFileToken.end],
          sourceType: node.externalModuleIndicator ? 'module' : 'script',
          tokens: undefined,
          type: AST_NODE_TYPES.Program,
        });
      }

      case SyntaxKind.Block: {
        return this.createNode<TSESTree.BlockStatement>(node, {
          body: this.convertBodyExpressions(node.statements, node),
          type: AST_NODE_TYPES.BlockStatement,
        });
      }

      case SyntaxKind.Identifier: {
        if (isThisInTypeQuery(node)) {
          // special case for `typeof this.foo` - TS emits an Identifier for `this`
          // but we want to treat it as a ThisExpression for consistency
          return this.createNode<TSESTree.ThisExpression>(node, {
            type: AST_NODE_TYPES.ThisExpression,
          });
        }
        return this.createNode<TSESTree.Identifier>(node, {
          decorators: [],
          name: node.text,
          optional: false,
          type: AST_NODE_TYPES.Identifier,
          typeAnnotation: undefined,
        });
      }

      case SyntaxKind.PrivateIdentifier: {
        return this.createNode<TSESTree.PrivateIdentifier>(node, {
          type: AST_NODE_TYPES.PrivateIdentifier,
          // typescript includes the `#` in the text
          name: node.text.slice(1),
        });
      }

      case SyntaxKind.WithStatement:
        return this.createNode<TSESTree.WithStatement>(node, {
          body: this.convertChild(node.statement),
          object: this.convertChild(node.expression),
          type: AST_NODE_TYPES.WithStatement,
        });

      // Control Flow

      case SyntaxKind.ReturnStatement:
        return this.createNode<TSESTree.ReturnStatement>(node, {
          argument: this.convertChild(node.expression),
          type: AST_NODE_TYPES.ReturnStatement,
        });

      case SyntaxKind.LabeledStatement:
        return this.createNode<TSESTree.LabeledStatement>(node, {
          body: this.convertChild(node.statement),
          label: this.convertChild(node.label),
          type: AST_NODE_TYPES.LabeledStatement,
        });

      case SyntaxKind.ContinueStatement:
        return this.createNode<TSESTree.ContinueStatement>(node, {
          label: this.convertChild(node.label),
          type: AST_NODE_TYPES.ContinueStatement,
        });

      case SyntaxKind.BreakStatement:
        return this.createNode<TSESTree.BreakStatement>(node, {
          label: this.convertChild(node.label),
          type: AST_NODE_TYPES.BreakStatement,
        });

      // Choice

      case SyntaxKind.IfStatement:
        return this.createNode<TSESTree.IfStatement>(node, {
          alternate: this.convertChild(node.elseStatement),
          consequent: this.convertChild(node.thenStatement),
          test: this.convertChild(node.expression),
          type: AST_NODE_TYPES.IfStatement,
        });

      case SyntaxKind.SwitchStatement:
        if (
          node.caseBlock.clauses.filter(
            switchCase => switchCase.kind === SyntaxKind.DefaultClause,
          ).length > 1
        ) {
          this.#throwError(
            node,
            "A 'default' clause cannot appear more than once in a 'switch' statement.",
          );
        }

        return this.createNode<TSESTree.SwitchStatement>(node, {
          cases: node.caseBlock.clauses.map(el => this.convertChild(el)),
          discriminant: this.convertChild(node.expression),
          type: AST_NODE_TYPES.SwitchStatement,
        });

      case SyntaxKind.CaseClause:
      case SyntaxKind.DefaultClause:
        return this.createNode<TSESTree.SwitchCase>(node, {
          type: AST_NODE_TYPES.SwitchCase,
          // expression is present in case only
          consequent: node.statements.map(el => this.convertChild(el)),
          test:
            node.kind === SyntaxKind.CaseClause
              ? this.convertChild(node.expression)
              : null,
        });

      // Exceptions

      case SyntaxKind.ThrowStatement:
        if (node.expression.end === node.expression.pos) {
          this.#throwUnlessAllowInvalidAST(
            node,
            'A throw statement must throw an expression.',
          );
        }

        return this.createNode<TSESTree.ThrowStatement>(node, {
          argument: this.convertChild(node.expression),
          type: AST_NODE_TYPES.ThrowStatement,
        });

      case SyntaxKind.TryStatement:
        return this.createNode<TSESTree.TryStatement>(node, {
          block: this.convertChild(node.tryBlock),
          finalizer: this.convertChild(node.finallyBlock),
          handler: this.convertChild(node.catchClause),
          type: AST_NODE_TYPES.TryStatement,
        });

      case SyntaxKind.CatchClause:
        if (node.variableDeclaration?.initializer) {
          this.#throwError(
            node.variableDeclaration.initializer,
            'Catch clause variable cannot have an initializer.',
          );
        }
        return this.createNode<TSESTree.CatchClause>(node, {
          body: this.convertChild(node.block),
          param: node.variableDeclaration
            ? this.convertBindingNameWithTypeAnnotation(
                node.variableDeclaration.name,
                node.variableDeclaration.type,
              )
            : null,
          type: AST_NODE_TYPES.CatchClause,
        });

      // Loops

      case SyntaxKind.WhileStatement:
        return this.createNode<TSESTree.WhileStatement>(node, {
          body: this.convertChild(node.statement),
          test: this.convertChild(node.expression),
          type: AST_NODE_TYPES.WhileStatement,
        });

      /**
       * Unlike other parsers, TypeScript calls a "DoWhileStatement"
       * a "DoStatement"
       */
      case SyntaxKind.DoStatement:
        return this.createNode<TSESTree.DoWhileStatement>(node, {
          body: this.convertChild(node.statement),
          test: this.convertChild(node.expression),
          type: AST_NODE_TYPES.DoWhileStatement,
        });

      case SyntaxKind.ForStatement:
        return this.createNode<TSESTree.ForStatement>(node, {
          body: this.convertChild(node.statement),
          init: this.convertChild(node.initializer),
          test: this.convertChild(node.condition),
          type: AST_NODE_TYPES.ForStatement,
          update: this.convertChild(node.incrementor),
        });

      case SyntaxKind.ForInStatement:
        this.#checkForStatementDeclaration(node.initializer, node.kind);
        return this.createNode<TSESTree.ForInStatement>(node, {
          body: this.convertChild(node.statement),
          left: this.convertPattern(node.initializer),
          right: this.convertChild(node.expression),
          type: AST_NODE_TYPES.ForInStatement,
        });

      case SyntaxKind.ForOfStatement: {
        this.#checkForStatementDeclaration(node.initializer, node.kind);
        return this.createNode<TSESTree.ForOfStatement>(node, {
          await: Boolean(
            node.awaitModifier &&
              node.awaitModifier.kind === SyntaxKind.AwaitKeyword,
          ),
          body: this.convertChild(node.statement),
          left: this.convertPattern(node.initializer),
          right: this.convertChild(node.expression),
          type: AST_NODE_TYPES.ForOfStatement,
        });
      }

      // Declarations

      case SyntaxKind.FunctionDeclaration: {
        const isDeclare = hasModifier(SyntaxKind.DeclareKeyword, node);
        const isAsync = hasModifier(SyntaxKind.AsyncKeyword, node);
        const isGenerator = !!node.asteriskToken;
        if (isDeclare) {
          if (node.body) {
            this.#throwError(
              node,
              'An implementation cannot be declared in ambient contexts.',
            );
          } else if (isAsync) {
            this.#throwError(
              node,
              "'async' modifier cannot be used in an ambient context.",
            );
          } else if (isGenerator) {
            this.#throwError(
              node,
              'Generators are not allowed in an ambient context.',
            );
          }
        } else if (!node.body && isGenerator) {
          this.#throwError(
            node,
            'A function signature cannot be declared as a generator.',
          );
        }

        const result = this.createNode<
          TSESTree.FunctionDeclaration | TSESTree.TSDeclareFunction
        >(node, {
          // declare implies no body due to the invariant above
          async: isAsync,
          body: this.convertChild(node.body) || undefined,
          declare: isDeclare,
          expression: false,
          generator: isGenerator,
          id: this.convertChild(node.name),
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          type: !node.body
            ? AST_NODE_TYPES.TSDeclareFunction
            : AST_NODE_TYPES.FunctionDeclaration,
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });

        return this.fixExports(node, result);
      }

      case SyntaxKind.VariableDeclaration: {
        const definite = !!node.exclamationToken;
        const init = this.convertChild(node.initializer);
        const id = this.convertBindingNameWithTypeAnnotation(
          node.name,
          node.type,
          node,
        );
        if (definite) {
          if (init) {
            this.#throwError(
              node,
              'Declarations with initializers cannot also have definite assignment assertions.',
            );
          } else if (
            id.type !== AST_NODE_TYPES.Identifier ||
            !id.typeAnnotation
          ) {
            this.#throwError(
              node,
              'Declarations with definite assignment assertions must also have type annotations.',
            );
          }
        }
        return this.createNode<TSESTree.VariableDeclarator>(node, {
          definite,
          id,
          init,
          type: AST_NODE_TYPES.VariableDeclarator,
        });
      }

      case SyntaxKind.VariableStatement: {
        const result = this.createNode<TSESTree.VariableDeclaration>(node, {
          declarations: node.declarationList.declarations.map(el =>
            this.convertChild(el),
          ),
          declare: hasModifier(SyntaxKind.DeclareKeyword, node),
          kind: getDeclarationKind(node.declarationList),
          type: AST_NODE_TYPES.VariableDeclaration,
        });

        if (!result.declarations.length) {
          this.#throwUnlessAllowInvalidAST(
            node,
            'A variable declaration list must have at least one variable declarator.',
          );
        }
        if (result.kind === 'using' || result.kind === 'await using') {
          node.declarationList.declarations.forEach((declaration, i) => {
            if (result.declarations[i].init == null) {
              this.#throwError(
                declaration,
                `'${result.kind}' declarations must be initialized.`,
              );
            }
            if (result.declarations[i].id.type !== AST_NODE_TYPES.Identifier) {
              this.#throwError(
                declaration.name,
                `'${result.kind}' declarations may not have binding patterns.`,
              );
            }
          });
        }
        // Definite assignment only allowed for non-declare let and var
        if (
          result.declare ||
          ['await using', 'const', 'using'].includes(result.kind)
        ) {
          node.declarationList.declarations.forEach((declaration, i) => {
            if (result.declarations[i].definite) {
              this.#throwError(
                declaration,
                `A definite assignment assertion '!' is not permitted in this context.`,
              );
            }
          });
        }
        if (result.declare) {
          node.declarationList.declarations.forEach((declaration, i) => {
            if (
              result.declarations[i].init &&
              (['let', 'var'].includes(result.kind) ||
                result.declarations[i].id.typeAnnotation)
            ) {
              this.#throwError(
                declaration,
                `Initializers are not permitted in ambient contexts.`,
              );
            }
          });
          // Theoretically, only certain initializers are allowed for declare const,
          // (TS1254: A 'const' initializer in an ambient context must be a string
          // or numeric literal or literal enum reference.) but we just allow
          // all expressions
        }
        // Note! No-declare does not mean the variable is not ambient, because
        // it can be further nested in other declare contexts. Therefore we cannot
        // check for const initializers.

        /**
         * Semantically, decorators are not allowed on variable declarations,
         * Pre 4.8 TS would include them in the AST, so we did as well.
         * However as of 4.8 TS no longer includes it (as it is, well, invalid).
         *
         * So for consistency across versions, we no longer include it either.
         */
        return this.fixExports(node, result);
      }

      // mostly for for-of, for-in
      case SyntaxKind.VariableDeclarationList: {
        const result = this.createNode<TSESTree.VariableDeclaration>(node, {
          declarations: node.declarations.map(el => this.convertChild(el)),
          declare: false,
          kind: getDeclarationKind(node),
          type: AST_NODE_TYPES.VariableDeclaration,
        });

        if (result.kind === 'using' || result.kind === 'await using') {
          node.declarations.forEach((declaration, i) => {
            if (result.declarations[i].init != null) {
              this.#throwError(
                declaration,
                `'${result.kind}' declarations may not be initialized in for statement.`,
              );
            }
            if (result.declarations[i].id.type !== AST_NODE_TYPES.Identifier) {
              this.#throwError(
                declaration.name,
                `'${result.kind}' declarations may not have binding patterns.`,
              );
            }
          });
        }
        return result;
      }

      // Expressions

      case SyntaxKind.ExpressionStatement:
        return this.createNode<TSESTree.ExpressionStatement>(node, {
          directive: undefined,
          expression: this.convertChild(node.expression),
          type: AST_NODE_TYPES.ExpressionStatement,
        });

      case SyntaxKind.ThisKeyword:
        return this.createNode<TSESTree.ThisExpression>(node, {
          type: AST_NODE_TYPES.ThisExpression,
        });

      case SyntaxKind.ArrayLiteralExpression: {
        // TypeScript uses ArrayLiteralExpression in destructuring assignment, too
        if (this.allowPattern) {
          return this.createNode<TSESTree.ArrayPattern>(node, {
            decorators: [],
            elements: node.elements.map(el => this.convertPattern(el)),
            optional: false,
            type: AST_NODE_TYPES.ArrayPattern,
            typeAnnotation: undefined,
          });
        }
        return this.createNode<TSESTree.ArrayExpression>(node, {
          elements: node.elements.map(el => this.convertChild(el)),
          type: AST_NODE_TYPES.ArrayExpression,
        });
      }

      case SyntaxKind.ObjectLiteralExpression: {
        // TypeScript uses ObjectLiteralExpression in destructuring assignment, too
        if (this.allowPattern) {
          return this.createNode<TSESTree.ObjectPattern>(node, {
            decorators: [],
            optional: false,
            properties: node.properties.map(el => this.convertPattern(el)),
            type: AST_NODE_TYPES.ObjectPattern,
            typeAnnotation: undefined,
          });
        }

        const properties: TSESTree.Property[] = [];
        for (const property of node.properties) {
          if (
            (property.kind === SyntaxKind.GetAccessor ||
              property.kind === SyntaxKind.SetAccessor ||
              property.kind === SyntaxKind.MethodDeclaration) &&
            !property.body
          ) {
            this.#throwUnlessAllowInvalidAST(property.end - 1, "'{' expected.");
          }

          properties.push(this.convertChild(property) as TSESTree.Property);
        }

        return this.createNode<TSESTree.ObjectExpression>(node, {
          properties,
          type: AST_NODE_TYPES.ObjectExpression,
        });
      }

      case SyntaxKind.PropertyAssignment: {
        // eslint-disable-next-line deprecation/deprecation
        const { exclamationToken, questionToken } = node;

        if (questionToken) {
          this.#throwError(
            questionToken,
            'A property assignment cannot have a question token.',
          );
        }

        if (exclamationToken) {
          this.#throwError(
            exclamationToken,
            'A property assignment cannot have an exclamation token.',
          );
        }

        return this.createNode<TSESTree.Property>(node, {
          computed: isComputedProperty(node.name),
          key: this.convertChild(node.name),
          kind: 'init',
          method: false,
          optional: false,
          shorthand: false,
          type: AST_NODE_TYPES.Property,
          value: this.converter(node.initializer, node, this.allowPattern),
        });
      }

      case SyntaxKind.ShorthandPropertyAssignment: {
        // eslint-disable-next-line deprecation/deprecation
        const { exclamationToken, modifiers, questionToken } = node;

        if (modifiers) {
          this.#throwError(
            modifiers[0],
            'A shorthand property assignment cannot have modifiers.',
          );
        }

        if (questionToken) {
          this.#throwError(
            questionToken,
            'A shorthand property assignment cannot have a question token.',
          );
        }

        if (exclamationToken) {
          this.#throwError(
            exclamationToken,
            'A shorthand property assignment cannot have an exclamation token.',
          );
        }

        if (node.objectAssignmentInitializer) {
          return this.createNode<TSESTree.Property>(node, {
            computed: false,
            key: this.convertChild(node.name),
            kind: 'init',
            method: false,
            optional: false,
            shorthand: true,
            type: AST_NODE_TYPES.Property,
            value: this.createNode<TSESTree.AssignmentPattern>(node, {
              decorators: [],
              left: this.convertPattern(node.name),
              optional: false,
              right: this.convertChild(node.objectAssignmentInitializer),
              type: AST_NODE_TYPES.AssignmentPattern,
              typeAnnotation: undefined,
            }),
          });
        }
        return this.createNode<TSESTree.Property>(node, {
          computed: false,
          key: this.convertChild(node.name),
          kind: 'init',
          method: false,
          optional: false,
          shorthand: true,
          type: AST_NODE_TYPES.Property,
          value: this.convertChild(node.name),
        });
      }

      case SyntaxKind.ComputedPropertyName:
        return this.convertChild(node.expression);

      case SyntaxKind.PropertyDeclaration: {
        const isAbstract = hasModifier(SyntaxKind.AbstractKeyword, node);

        if (isAbstract && node.initializer) {
          this.#throwError(
            node.initializer,
            `Abstract property cannot have an initializer.`,
          );
        }

        const isAccessor = hasModifier(SyntaxKind.AccessorKeyword, node);
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

        const key = this.convertChild(node.name);

        return this.createNode<
          | TSESTree.AccessorProperty
          | TSESTree.PropertyDefinition
          | TSESTree.TSAbstractAccessorProperty
          | TSESTree.TSAbstractPropertyDefinition
        >(node, {
          accessibility: getTSNodeAccessibility(node),
          computed: isComputedProperty(node.name),
          declare: hasModifier(SyntaxKind.DeclareKeyword, node),
          decorators:
            getDecorators(node)?.map(el => this.convertChild(el)) ?? [],
          definite: !!node.exclamationToken,
          key,
          optional:
            (key.type === AST_NODE_TYPES.Literal ||
              node.name.kind === SyntaxKind.Identifier ||
              node.name.kind === SyntaxKind.ComputedPropertyName ||
              node.name.kind === SyntaxKind.PrivateIdentifier) &&
            !!node.questionToken,
          override: hasModifier(SyntaxKind.OverrideKeyword, node),

          readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node),
          static: hasModifier(SyntaxKind.StaticKeyword, node),
          type,
          typeAnnotation:
            node.type && this.convertTypeAnnotation(node.type, node),
          value: isAbstract ? null : this.convertChild(node.initializer),
        });
      }

      case SyntaxKind.GetAccessor:
      case SyntaxKind.SetAccessor: {
        if (
          node.parent.kind === SyntaxKind.InterfaceDeclaration ||
          node.parent.kind === SyntaxKind.TypeLiteral
        ) {
          return this.convertMethodSignature(node);
        }
      }
      // otherwise, it is a non-type accessor - intentional fallthrough
      case SyntaxKind.MethodDeclaration: {
        const method = this.createNode<
          TSESTree.FunctionExpression | TSESTree.TSEmptyBodyFunctionExpression
        >(node, {
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          body: this.convertChild(node.body),
          declare: false,
          expression: false, // ESTreeNode as ESTreeNode here
          generator: !!node.asteriskToken,
          id: null,
          params: [],
          range: [node.parameters.pos - 1, node.end],
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          type: !node.body
            ? AST_NODE_TYPES.TSEmptyBodyFunctionExpression
            : AST_NODE_TYPES.FunctionExpression,
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });

        if (method.typeParameters) {
          this.fixParentLocation(method, method.typeParameters.range);
        }

        let result:
          | TSESTree.MethodDefinition
          | TSESTree.Property
          | TSESTree.TSAbstractMethodDefinition;

        if (parent.kind === SyntaxKind.ObjectLiteralExpression) {
          method.params = node.parameters.map(el => this.convertChild(el));

          result = this.createNode<TSESTree.Property>(node, {
            computed: isComputedProperty(node.name),
            key: this.convertChild(node.name),
            kind: 'init',
            method: node.kind === SyntaxKind.MethodDeclaration,
            optional: !!node.questionToken,
            shorthand: false,
            type: AST_NODE_TYPES.Property,
            value: method,
          });
        } else {
          // class

          /**
           * Unlike in object literal methods, class method params can have decorators
           */
          method.params = this.convertParameters(node.parameters);

          /**
           * TypeScript class methods can be defined as "abstract"
           */
          const methodDefinitionType = hasModifier(
            SyntaxKind.AbstractKeyword,
            node,
          )
            ? AST_NODE_TYPES.TSAbstractMethodDefinition
            : AST_NODE_TYPES.MethodDefinition;

          result = this.createNode<
            TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
          >(node, {
            accessibility: getTSNodeAccessibility(node),
            computed: isComputedProperty(node.name),
            decorators:
              getDecorators(node)?.map(el => this.convertChild(el)) ?? [],
            key: this.convertChild(node.name),
            kind: 'method',
            optional: !!node.questionToken,
            override: hasModifier(SyntaxKind.OverrideKeyword, node),
            static: hasModifier(SyntaxKind.StaticKeyword, node),
            type: methodDefinitionType,
            value: method,
          });
        }

        if (node.kind === SyntaxKind.GetAccessor) {
          result.kind = 'get';
        } else if (node.kind === SyntaxKind.SetAccessor) {
          result.kind = 'set';
        } else if (
          !(result as TSESTree.MethodDefinition).static &&
          node.name.kind === SyntaxKind.StringLiteral &&
          node.name.text === 'constructor' &&
          result.type !== AST_NODE_TYPES.Property
        ) {
          result.kind = 'constructor';
        }
        return result;
      }

      // TypeScript uses this even for static methods named "constructor"
      case SyntaxKind.Constructor: {
        const lastModifier = getLastModifier(node);
        const constructorToken =
          (lastModifier && findNextToken(lastModifier, node, this.ast)) ??
          node.getFirstToken()!;

        const constructor = this.createNode<
          TSESTree.FunctionExpression | TSESTree.TSEmptyBodyFunctionExpression
        >(node, {
          async: false,
          body: this.convertChild(node.body),
          declare: false,
          expression: false, // is not present in ESTreeNode
          generator: false,
          id: null,
          params: this.convertParameters(node.parameters),
          range: [node.parameters.pos - 1, node.end],
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          type: !node.body
            ? AST_NODE_TYPES.TSEmptyBodyFunctionExpression
            : AST_NODE_TYPES.FunctionExpression,
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });

        if (constructor.typeParameters) {
          this.fixParentLocation(constructor, constructor.typeParameters.range);
        }

        const constructorKey = this.createNode<TSESTree.Identifier>(node, {
          decorators: [],
          name: 'constructor',
          optional: false,
          range: [constructorToken.getStart(this.ast), constructorToken.end],
          type: AST_NODE_TYPES.Identifier,
          typeAnnotation: undefined,
        });

        const isStatic = hasModifier(SyntaxKind.StaticKeyword, node);

        return this.createNode<
          TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
        >(node, {
          accessibility: getTSNodeAccessibility(node),
          computed: false,
          decorators: [],
          key: constructorKey,
          kind: isStatic ? 'method' : 'constructor',
          optional: false,
          override: false,
          static: isStatic,
          type: hasModifier(SyntaxKind.AbstractKeyword, node)
            ? AST_NODE_TYPES.TSAbstractMethodDefinition
            : AST_NODE_TYPES.MethodDefinition,
          value: constructor,
        });
      }

      case SyntaxKind.FunctionExpression: {
        return this.createNode<TSESTree.FunctionExpression>(node, {
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          body: this.convertChild(node.body),
          declare: false,
          expression: false,
          generator: !!node.asteriskToken,
          id: this.convertChild(node.name),
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          type: AST_NODE_TYPES.FunctionExpression,
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });
      }

      case SyntaxKind.SuperKeyword:
        return this.createNode<TSESTree.Super>(node, {
          type: AST_NODE_TYPES.Super,
        });

      case SyntaxKind.ArrayBindingPattern:
        return this.createNode<TSESTree.ArrayPattern>(node, {
          decorators: [],
          elements: node.elements.map(el => this.convertPattern(el)),
          optional: false,
          type: AST_NODE_TYPES.ArrayPattern,
          typeAnnotation: undefined,
        });

      // occurs with missing array elements like [,]
      case SyntaxKind.OmittedExpression:
        return null;

      case SyntaxKind.ObjectBindingPattern:
        return this.createNode<TSESTree.ObjectPattern>(node, {
          decorators: [],
          optional: false,
          properties: node.elements.map(el => this.convertPattern(el)),
          type: AST_NODE_TYPES.ObjectPattern,
          typeAnnotation: undefined,
        });

      case SyntaxKind.BindingElement: {
        if (parent.kind === SyntaxKind.ArrayBindingPattern) {
          const arrayItem = this.convertChild(node.name, parent);

          if (node.initializer) {
            return this.createNode<TSESTree.AssignmentPattern>(node, {
              decorators: [],
              left: arrayItem,
              optional: false,
              right: this.convertChild(node.initializer),
              type: AST_NODE_TYPES.AssignmentPattern,
              typeAnnotation: undefined,
            });
          } else if (node.dotDotDotToken) {
            return this.createNode<TSESTree.RestElement>(node, {
              argument: arrayItem,
              decorators: [],
              optional: false,
              type: AST_NODE_TYPES.RestElement,
              typeAnnotation: undefined,
              value: undefined,
            });
          }
          return arrayItem;
        }
        let result: TSESTree.Property | TSESTree.RestElement;
        if (node.dotDotDotToken) {
          result = this.createNode<TSESTree.RestElement>(node, {
            argument: this.convertChild(node.propertyName ?? node.name),
            decorators: [],
            optional: false,
            type: AST_NODE_TYPES.RestElement,
            typeAnnotation: undefined,
            value: undefined,
          });
        } else {
          result = this.createNode<TSESTree.Property>(node, {
            computed: Boolean(
              node.propertyName &&
                node.propertyName.kind === SyntaxKind.ComputedPropertyName,
            ),
            key: this.convertChild(node.propertyName ?? node.name),
            kind: 'init',
            method: false,
            optional: false,
            shorthand: !node.propertyName,
            type: AST_NODE_TYPES.Property,
            value: this.convertChild(node.name),
          });
        }

        if (node.initializer) {
          result.value = this.createNode<TSESTree.AssignmentPattern>(node, {
            decorators: [],
            left: this.convertChild(node.name),
            optional: false,
            range: [node.name.getStart(this.ast), node.initializer.end],
            right: this.convertChild(node.initializer),
            type: AST_NODE_TYPES.AssignmentPattern,
            typeAnnotation: undefined,
          });
        }
        return result;
      }

      case SyntaxKind.ArrowFunction: {
        return this.createNode<TSESTree.ArrowFunctionExpression>(node, {
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          body: this.convertChild(node.body),
          expression: node.body.kind !== SyntaxKind.Block,
          generator: false,
          id: null,
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          type: AST_NODE_TYPES.ArrowFunctionExpression,
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });
      }

      case SyntaxKind.YieldExpression:
        return this.createNode<TSESTree.YieldExpression>(node, {
          argument: this.convertChild(node.expression),
          delegate: !!node.asteriskToken,
          type: AST_NODE_TYPES.YieldExpression,
        });

      case SyntaxKind.AwaitExpression:
        return this.createNode<TSESTree.AwaitExpression>(node, {
          argument: this.convertChild(node.expression),
          type: AST_NODE_TYPES.AwaitExpression,
        });

      // Template Literals

      case SyntaxKind.NoSubstitutionTemplateLiteral:
        return this.createNode<TSESTree.TemplateLiteral>(node, {
          expressions: [],
          quasis: [
            this.createNode<TSESTree.TemplateElement>(node, {
              tail: true,
              type: AST_NODE_TYPES.TemplateElement,
              value: {
                cooked: node.text,
                raw: this.ast.text.slice(
                  node.getStart(this.ast) + 1,
                  node.end - 1,
                ),
              },
            }),
          ],
          type: AST_NODE_TYPES.TemplateLiteral,
        });

      case SyntaxKind.TemplateExpression: {
        const result = this.createNode<TSESTree.TemplateLiteral>(node, {
          expressions: [],
          quasis: [this.convertChild(node.head)],
          type: AST_NODE_TYPES.TemplateLiteral,
        });

        node.templateSpans.forEach(templateSpan => {
          result.expressions.push(
            this.convertChild(templateSpan.expression) as TSESTree.Expression,
          );
          result.quasis.push(
            this.convertChild(templateSpan.literal) as TSESTree.TemplateElement,
          );
        });
        return result;
      }

      case SyntaxKind.TaggedTemplateExpression:
        return this.createNode<TSESTree.TaggedTemplateExpression>(node, {
          quasi: this.convertChild(node.template),
          tag: this.convertChild(node.tag),
          type: AST_NODE_TYPES.TaggedTemplateExpression,
          typeArguments:
            node.typeArguments &&
            this.convertTypeArgumentsToTypeParameterInstantiation(
              node.typeArguments,
              node,
            ),
        });

      case SyntaxKind.TemplateHead:
      case SyntaxKind.TemplateMiddle:
      case SyntaxKind.TemplateTail: {
        const tail = node.kind === SyntaxKind.TemplateTail;
        return this.createNode<TSESTree.TemplateElement>(node, {
          tail,
          type: AST_NODE_TYPES.TemplateElement,
          value: {
            cooked: node.text,
            raw: this.ast.text.slice(
              node.getStart(this.ast) + 1,
              node.end - (tail ? 1 : 2),
            ),
          },
        });
      }

      // Patterns

      case SyntaxKind.SpreadAssignment:
      case SyntaxKind.SpreadElement: {
        if (this.allowPattern) {
          return this.createNode<TSESTree.RestElement>(node, {
            argument: this.convertPattern(node.expression),
            decorators: [],
            optional: false,
            type: AST_NODE_TYPES.RestElement,
            typeAnnotation: undefined,
            value: undefined,
          });
        }
        return this.createNode<TSESTree.SpreadElement>(node, {
          argument: this.convertChild(node.expression),
          type: AST_NODE_TYPES.SpreadElement,
        });
      }

      case SyntaxKind.Parameter: {
        let parameter: TSESTree.BindingName | TSESTree.RestElement;
        let result: TSESTree.AssignmentPattern | TSESTree.RestElement;

        if (node.dotDotDotToken) {
          parameter = result = this.createNode<TSESTree.RestElement>(node, {
            argument: this.convertChild(node.name),
            decorators: [],
            optional: false,
            type: AST_NODE_TYPES.RestElement,
            typeAnnotation: undefined,
            value: undefined,
          });
        } else if (node.initializer) {
          parameter = this.convertChild(node.name) as TSESTree.BindingName;
          result = this.createNode<TSESTree.AssignmentPattern>(node, {
            decorators: [],
            left: parameter,
            optional: false,
            right: this.convertChild(node.initializer),
            type: AST_NODE_TYPES.AssignmentPattern,
            typeAnnotation: undefined,
          });

          const modifiers = getModifiers(node);
          if (modifiers) {
            // AssignmentPattern should not contain modifiers in range
            result.range[0] = parameter.range[0];
            result.loc = getLocFor(result.range, this.ast);
          }
        } else {
          parameter = result = this.convertChild(node.name, parent);
        }

        if (node.type) {
          parameter.typeAnnotation = this.convertTypeAnnotation(
            node.type,
            node,
          );
          this.fixParentLocation(parameter, parameter.typeAnnotation.range);
        }

        if (node.questionToken) {
          if (node.questionToken.end > parameter.range[1]) {
            parameter.range[1] = node.questionToken.end;
            parameter.loc.end = getLineAndCharacterFor(
              parameter.range[1],
              this.ast,
            );
          }
          parameter.optional = true;
        }

        const modifiers = getModifiers(node);
        if (modifiers) {
          return this.createNode<TSESTree.TSParameterProperty>(node, {
            accessibility: getTSNodeAccessibility(node),
            decorators: [],
            override: hasModifier(SyntaxKind.OverrideKeyword, node),
            parameter: result,
            readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node),
            static: hasModifier(SyntaxKind.StaticKeyword, node),
            type: AST_NODE_TYPES.TSParameterProperty,
          });
        }
        return result;
      }

      // Classes

      case SyntaxKind.ClassDeclaration:
        if (
          !node.name &&
          (!hasModifier(ts.SyntaxKind.ExportKeyword, node) ||
            !hasModifier(ts.SyntaxKind.DefaultKeyword, node))
        ) {
          this.#throwUnlessAllowInvalidAST(
            node,
            "A class declaration without the 'default' modifier must have a name.",
          );
        }
      /* intentional fallthrough */
      case SyntaxKind.ClassExpression: {
        const heritageClauses = node.heritageClauses ?? [];
        const classNodeType =
          node.kind === SyntaxKind.ClassDeclaration
            ? AST_NODE_TYPES.ClassDeclaration
            : AST_NODE_TYPES.ClassExpression;

        let extendsClause: ts.HeritageClause | undefined;
        let implementsClause: ts.HeritageClause | undefined;
        for (const heritageClause of heritageClauses) {
          const { token, types } = heritageClause;

          if (types.length === 0) {
            this.#throwUnlessAllowInvalidAST(
              heritageClause,
              `'${ts.tokenToString(token)}' list cannot be empty.`,
            );
          }

          if (token === SyntaxKind.ExtendsKeyword) {
            if (extendsClause) {
              this.#throwUnlessAllowInvalidAST(
                heritageClause,
                "'extends' clause already seen.",
              );
            }

            if (implementsClause) {
              this.#throwUnlessAllowInvalidAST(
                heritageClause,
                "'extends' clause must precede 'implements' clause.",
              );
            }

            if (types.length > 1) {
              this.#throwUnlessAllowInvalidAST(
                types[1],
                'Classes can only extend a single class.',
              );
            }

            extendsClause ??= heritageClause;
          } else if (token === SyntaxKind.ImplementsKeyword) {
            if (implementsClause) {
              this.#throwUnlessAllowInvalidAST(
                heritageClause,
                "'implements' clause already seen.",
              );
            }

            implementsClause ??= heritageClause;
          }
        }

        const result = this.createNode<
          TSESTree.ClassDeclaration | TSESTree.ClassExpression
        >(node, {
          abstract: hasModifier(SyntaxKind.AbstractKeyword, node),
          body: this.createNode<TSESTree.ClassBody>(node, {
            body: node.members
              .filter(isESTreeClassMember)
              .map(el => this.convertChild(el)),
            range: [node.members.pos - 1, node.end],
            type: AST_NODE_TYPES.ClassBody,
          }),
          declare: hasModifier(SyntaxKind.DeclareKeyword, node),
          decorators:
            getDecorators(node)?.map(el => this.convertChild(el)) ?? [],
          id: this.convertChild(node.name),
          implements:
            implementsClause?.types.map(el => this.convertChild(el)) ?? [],
          superClass: extendsClause?.types[0]
            ? this.convertChild(extendsClause.types[0].expression)
            : null,
          superTypeArguments: undefined,
          type: classNodeType,
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });

        if (extendsClause?.types[0]?.typeArguments) {
          result.superTypeArguments =
            this.convertTypeArgumentsToTypeParameterInstantiation(
              extendsClause.types[0].typeArguments,
              extendsClause.types[0],
            );
        }

        return this.fixExports(node, result);
      }

      // Modules
      case SyntaxKind.ModuleBlock:
        return this.createNode<TSESTree.TSModuleBlock>(node, {
          body: this.convertBodyExpressions(node.statements, node),
          type: AST_NODE_TYPES.TSModuleBlock,
        });

      case SyntaxKind.ImportDeclaration: {
        this.assertModuleSpecifier(node, false);

        const result = this.createNode<TSESTree.ImportDeclaration>(
          node,
          this.#withDeprecatedAliasGetter(
            {
              attributes: this.convertImportAttributes(
                // eslint-disable-next-line deprecation/deprecation -- TS <5.3
                node.attributes ?? node.assertClause,
              ),
              importKind: 'value',
              source: this.convertChild(node.moduleSpecifier),
              specifiers: [],
              type: AST_NODE_TYPES.ImportDeclaration,
            },
            'assertions',
            'attributes',
            true,
          ),
        );

        if (node.importClause) {
          if (node.importClause.isTypeOnly) {
            result.importKind = 'type';
          }

          if (node.importClause.name) {
            result.specifiers.push(
              this.convertChild(node.importClause) as TSESTree.ImportClause,
            );
          }

          if (node.importClause.namedBindings) {
            switch (node.importClause.namedBindings.kind) {
              case SyntaxKind.NamespaceImport:
                result.specifiers.push(
                  this.convertChild(
                    node.importClause.namedBindings,
                  ) as TSESTree.ImportClause,
                );
                break;
              case SyntaxKind.NamedImports:
                result.specifiers = result.specifiers.concat(
                  node.importClause.namedBindings.elements.map(el =>
                    this.convertChild(el),
                  ),
                );
                break;
            }
          }
        }
        return result;
      }

      case SyntaxKind.NamespaceImport:
        return this.createNode<TSESTree.ImportNamespaceSpecifier>(node, {
          local: this.convertChild(node.name),
          type: AST_NODE_TYPES.ImportNamespaceSpecifier,
        });

      case SyntaxKind.ImportSpecifier:
        return this.createNode<TSESTree.ImportSpecifier>(node, {
          imported: this.convertChild(node.propertyName ?? node.name),
          importKind: node.isTypeOnly ? 'type' : 'value',
          local: this.convertChild(node.name),
          type: AST_NODE_TYPES.ImportSpecifier,
        });

      case SyntaxKind.ImportClause: {
        const local = this.convertChild(node.name);
        return this.createNode<TSESTree.ImportDefaultSpecifier>(node, {
          local,
          range: local.range,
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
        });
      }

      case SyntaxKind.ExportDeclaration: {
        if (node.exportClause?.kind === SyntaxKind.NamedExports) {
          this.assertModuleSpecifier(node, true);
          return this.createNode<TSESTree.ExportNamedDeclaration>(
            node,
            this.#withDeprecatedAliasGetter(
              {
                attributes: this.convertImportAttributes(
                  // eslint-disable-next-line deprecation/deprecation -- TS <5.3
                  node.attributes ?? node.assertClause,
                ),
                declaration: null,
                exportKind: node.isTypeOnly ? 'type' : 'value',
                source: this.convertChild(node.moduleSpecifier),
                specifiers: node.exportClause.elements.map(el =>
                  this.convertChild(el),
                ),
                type: AST_NODE_TYPES.ExportNamedDeclaration,
              },
              'assertions',
              'attributes',
              true,
            ),
          );
        }
        this.assertModuleSpecifier(node, false);
        return this.createNode<TSESTree.ExportAllDeclaration>(
          node,
          this.#withDeprecatedAliasGetter(
            {
              attributes: this.convertImportAttributes(
                // eslint-disable-next-line deprecation/deprecation -- TS <5.3
                node.attributes ?? node.assertClause,
              ),
              exported:
                node.exportClause?.kind === SyntaxKind.NamespaceExport
                  ? this.convertChild(node.exportClause.name)
                  : null,
              exportKind: node.isTypeOnly ? 'type' : 'value',
              source: this.convertChild(node.moduleSpecifier),
              type: AST_NODE_TYPES.ExportAllDeclaration,
            },
            'assertions',
            'attributes',
            true,
          ),
        );
      }

      case SyntaxKind.ExportSpecifier:
        return this.createNode<TSESTree.ExportSpecifier>(node, {
          exported: this.convertChild(node.name),
          exportKind: node.isTypeOnly ? 'type' : 'value',
          local: this.convertChild(node.propertyName ?? node.name),
          type: AST_NODE_TYPES.ExportSpecifier,
        });

      case SyntaxKind.ExportAssignment:
        if (node.isExportEquals) {
          return this.createNode<TSESTree.TSExportAssignment>(node, {
            expression: this.convertChild(node.expression),
            type: AST_NODE_TYPES.TSExportAssignment,
          });
        }
        return this.createNode<TSESTree.ExportDefaultDeclaration>(node, {
          declaration: this.convertChild(node.expression),
          exportKind: 'value',
          type: AST_NODE_TYPES.ExportDefaultDeclaration,
        });

      // Unary Operations

      case SyntaxKind.PrefixUnaryExpression:
      case SyntaxKind.PostfixUnaryExpression: {
        const operator = getTextForTokenKind(node.operator);
        /**
         * ESTree uses UpdateExpression for ++/--
         */
        if (operator === '++' || operator === '--') {
          if (!isValidAssignmentTarget(node.operand)) {
            this.#throwUnlessAllowInvalidAST(
              node.operand,
              'Invalid left-hand side expression in unary operation',
            );
          }
          return this.createNode<TSESTree.UpdateExpression>(node, {
            argument: this.convertChild(node.operand),
            operator,
            prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
            type: AST_NODE_TYPES.UpdateExpression,
          });
        }
        return this.createNode<TSESTree.UnaryExpression>(node, {
          argument: this.convertChild(node.operand),
          operator,
          prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
          type: AST_NODE_TYPES.UnaryExpression,
        });
      }

      case SyntaxKind.DeleteExpression:
        return this.createNode<TSESTree.UnaryExpression>(node, {
          argument: this.convertChild(node.expression),
          operator: 'delete',
          prefix: true,
          type: AST_NODE_TYPES.UnaryExpression,
        });

      case SyntaxKind.VoidExpression:
        return this.createNode<TSESTree.UnaryExpression>(node, {
          argument: this.convertChild(node.expression),
          operator: 'void',
          prefix: true,
          type: AST_NODE_TYPES.UnaryExpression,
        });

      case SyntaxKind.TypeOfExpression:
        return this.createNode<TSESTree.UnaryExpression>(node, {
          argument: this.convertChild(node.expression),
          operator: 'typeof',
          prefix: true,
          type: AST_NODE_TYPES.UnaryExpression,
        });

      case SyntaxKind.TypeOperator:
        return this.createNode<TSESTree.TSTypeOperator>(node, {
          operator: getTextForTokenKind(node.operator),
          type: AST_NODE_TYPES.TSTypeOperator,
          typeAnnotation: this.convertChild(node.type),
        });

      // Binary Operations

      case SyntaxKind.BinaryExpression: {
        // TypeScript uses BinaryExpression for sequences as well
        if (isComma(node.operatorToken)) {
          const result = this.createNode<TSESTree.SequenceExpression>(node, {
            expressions: [],
            type: AST_NODE_TYPES.SequenceExpression,
          });

          const left = this.convertChild(node.left) as TSESTree.Expression;
          if (
            left.type === AST_NODE_TYPES.SequenceExpression &&
            node.left.kind !== SyntaxKind.ParenthesizedExpression
          ) {
            result.expressions = result.expressions.concat(left.expressions);
          } else {
            result.expressions.push(left);
          }

          result.expressions.push(
            this.convertChild(node.right) as TSESTree.Expression,
          );
          return result;
        }
        const expressionType = getBinaryExpressionType(node.operatorToken);
        if (
          this.allowPattern &&
          expressionType.type === AST_NODE_TYPES.AssignmentExpression
        ) {
          return this.createNode<TSESTree.AssignmentPattern>(node, {
            decorators: [],
            left: this.convertPattern(node.left, node),
            optional: false,
            right: this.convertChild(node.right),
            type: AST_NODE_TYPES.AssignmentPattern,
            typeAnnotation: undefined,
          });
        }
        return this.createNode<
          | TSESTree.AssignmentExpression
          | TSESTree.BinaryExpression
          | TSESTree.LogicalExpression
        >(node, {
          ...expressionType,
          left: this.converter(
            node.left,
            node,
            expressionType.type === AST_NODE_TYPES.AssignmentExpression,
          ),
          right: this.convertChild(node.right),
        });
      }

      case SyntaxKind.PropertyAccessExpression: {
        const object = this.convertChild(node.expression);
        const property = this.convertChild(node.name);
        const computed = false;

        const result = this.createNode<TSESTree.MemberExpression>(node, {
          computed,
          object,
          optional: node.questionDotToken !== undefined,
          property,
          type: AST_NODE_TYPES.MemberExpression,
        });

        return this.convertChainExpression(result, node);
      }

      case SyntaxKind.ElementAccessExpression: {
        const object = this.convertChild(node.expression);
        const property = this.convertChild(node.argumentExpression);
        const computed = true;

        const result = this.createNode<TSESTree.MemberExpression>(node, {
          computed,
          object,
          optional: node.questionDotToken !== undefined,
          property,
          type: AST_NODE_TYPES.MemberExpression,
        });

        return this.convertChainExpression(result, node);
      }

      case SyntaxKind.CallExpression: {
        if (node.expression.kind === SyntaxKind.ImportKeyword) {
          if (node.arguments.length !== 1 && node.arguments.length !== 2) {
            this.#throwUnlessAllowInvalidAST(
              node.arguments[2] ?? node,
              'Dynamic import requires exactly one or two arguments.',
            );
          }
          return this.createNode<TSESTree.ImportExpression>(node, {
            attributes: node.arguments[1]
              ? this.convertChild(node.arguments[1])
              : null,
            source: this.convertChild(node.arguments[0]),
            type: AST_NODE_TYPES.ImportExpression,
          });
        }

        const callee = this.convertChild(node.expression);
        const args = node.arguments.map(el => this.convertChild(el));
        const typeArguments =
          node.typeArguments &&
          this.convertTypeArgumentsToTypeParameterInstantiation(
            node.typeArguments,
            node,
          );

        const result = this.createNode<TSESTree.CallExpression>(node, {
          arguments: args,
          callee,
          optional: node.questionDotToken !== undefined,
          type: AST_NODE_TYPES.CallExpression,
          typeArguments,
        });

        return this.convertChainExpression(result, node);
      }

      case SyntaxKind.NewExpression: {
        const typeArguments =
          node.typeArguments &&
          this.convertTypeArgumentsToTypeParameterInstantiation(
            node.typeArguments,
            node,
          );

        // NOTE - NewExpression cannot have an optional chain in it
        return this.createNode<TSESTree.NewExpression>(node, {
          arguments: node.arguments
            ? node.arguments.map(el => this.convertChild(el))
            : [],
          callee: this.convertChild(node.expression),
          type: AST_NODE_TYPES.NewExpression,
          typeArguments,
        });
      }

      case SyntaxKind.ConditionalExpression:
        return this.createNode<TSESTree.ConditionalExpression>(node, {
          alternate: this.convertChild(node.whenFalse),
          consequent: this.convertChild(node.whenTrue),
          test: this.convertChild(node.condition),
          type: AST_NODE_TYPES.ConditionalExpression,
        });

      case SyntaxKind.MetaProperty: {
        return this.createNode<TSESTree.MetaProperty>(node, {
          meta: this.createNode<TSESTree.Identifier>(
            // TODO: do we really want to convert it to Token?
            node.getFirstToken()! as ts.Token<typeof node.keywordToken>,
            {
              decorators: [],
              name: getTextForTokenKind(node.keywordToken),
              optional: false,
              type: AST_NODE_TYPES.Identifier,
              typeAnnotation: undefined,
            },
          ),
          property: this.convertChild(node.name),
          type: AST_NODE_TYPES.MetaProperty,
        });
      }

      case SyntaxKind.Decorator: {
        return this.createNode<TSESTree.Decorator>(node, {
          expression: this.convertChild(node.expression),
          type: AST_NODE_TYPES.Decorator,
        });
      }

      // Literals

      case SyntaxKind.StringLiteral: {
        return this.createNode<TSESTree.StringLiteral>(node, {
          raw: node.getText(),
          type: AST_NODE_TYPES.Literal,
          value:
            parent.kind === SyntaxKind.JsxAttribute
              ? unescapeStringLiteralText(node.text)
              : node.text,
        });
      }

      case SyntaxKind.NumericLiteral: {
        return this.createNode<TSESTree.NumberLiteral>(node, {
          raw: node.getText(),
          type: AST_NODE_TYPES.Literal,
          value: Number(node.text),
        });
      }

      case SyntaxKind.BigIntLiteral: {
        const range = getRange(node, this.ast);
        const rawValue = this.ast.text.slice(range[0], range[1]);
        const bigint = rawValue
          // remove suffix `n`
          .slice(0, -1)
          // `BigInt` doesn't accept numeric separator
          // and `bigint` property should not include numeric separator
          .replaceAll('_', '');
        const value = typeof BigInt !== 'undefined' ? BigInt(bigint) : null;
        return this.createNode<TSESTree.BigIntLiteral>(node, {
          bigint: value == null ? bigint : String(value),
          range,
          raw: rawValue,
          type: AST_NODE_TYPES.Literal,
          value,
        });
      }

      case SyntaxKind.RegularExpressionLiteral: {
        const pattern = node.text.slice(1, node.text.lastIndexOf('/'));
        const flags = node.text.slice(node.text.lastIndexOf('/') + 1);

        let regex = null;
        try {
          regex = new RegExp(pattern, flags);
        } catch {
          // Intentionally blank, so regex stays null
        }

        return this.createNode<TSESTree.RegExpLiteral>(node, {
          raw: node.text,
          regex: {
            flags,
            pattern,
          },
          type: AST_NODE_TYPES.Literal,
          value: regex,
        });
      }

      case SyntaxKind.TrueKeyword:
        return this.createNode<TSESTree.BooleanLiteral>(node, {
          raw: 'true',
          type: AST_NODE_TYPES.Literal,
          value: true,
        });

      case SyntaxKind.FalseKeyword:
        return this.createNode<TSESTree.BooleanLiteral>(node, {
          raw: 'false',
          type: AST_NODE_TYPES.Literal,
          value: false,
        });

      case SyntaxKind.NullKeyword: {
        return this.createNode<TSESTree.NullLiteral>(node, {
          raw: 'null',
          type: AST_NODE_TYPES.Literal,
          value: null,
        });
      }

      case SyntaxKind.EmptyStatement:
        return this.createNode<TSESTree.EmptyStatement>(node, {
          type: AST_NODE_TYPES.EmptyStatement,
        });

      case SyntaxKind.DebuggerStatement:
        return this.createNode<TSESTree.DebuggerStatement>(node, {
          type: AST_NODE_TYPES.DebuggerStatement,
        });

      // JSX

      case SyntaxKind.JsxElement:
        return this.createNode<TSESTree.JSXElement>(node, {
          children: node.children.map(el => this.convertChild(el)),
          closingElement: this.convertChild(node.closingElement),
          openingElement: this.convertChild(node.openingElement),
          type: AST_NODE_TYPES.JSXElement,
        });

      case SyntaxKind.JsxFragment:
        return this.createNode<TSESTree.JSXFragment>(node, {
          children: node.children.map(el => this.convertChild(el)),
          closingFragment: this.convertChild(node.closingFragment),
          openingFragment: this.convertChild(node.openingFragment),
          type: AST_NODE_TYPES.JSXFragment,
        });

      case SyntaxKind.JsxSelfClosingElement: {
        return this.createNode<TSESTree.JSXElement>(node, {
          type: AST_NODE_TYPES.JSXElement,
          /**
           * Convert SyntaxKind.JsxSelfClosingElement to SyntaxKind.JsxOpeningElement,
           * TypeScript does not seem to have the idea of openingElement when tag is self-closing
           */
          children: [],
          closingElement: null,
          openingElement: this.createNode<TSESTree.JSXOpeningElement>(node, {
            attributes: node.attributes.properties.map(el =>
              this.convertChild(el),
            ),
            name: this.convertJSXTagName(node.tagName, node),
            range: getRange(node, this.ast),
            selfClosing: true,
            type: AST_NODE_TYPES.JSXOpeningElement,
            typeArguments: node.typeArguments
              ? this.convertTypeArgumentsToTypeParameterInstantiation(
                  node.typeArguments,
                  node,
                )
              : undefined,
          }),
        });
      }

      case SyntaxKind.JsxOpeningElement: {
        return this.createNode<TSESTree.JSXOpeningElement>(node, {
          attributes: node.attributes.properties.map(el =>
            this.convertChild(el),
          ),
          name: this.convertJSXTagName(node.tagName, node),
          selfClosing: false,
          type: AST_NODE_TYPES.JSXOpeningElement,
          typeArguments:
            node.typeArguments &&
            this.convertTypeArgumentsToTypeParameterInstantiation(
              node.typeArguments,
              node,
            ),
        });
      }

      case SyntaxKind.JsxClosingElement:
        return this.createNode<TSESTree.JSXClosingElement>(node, {
          name: this.convertJSXTagName(node.tagName, node),
          type: AST_NODE_TYPES.JSXClosingElement,
        });

      case SyntaxKind.JsxOpeningFragment:
        return this.createNode<TSESTree.JSXOpeningFragment>(node, {
          type: AST_NODE_TYPES.JSXOpeningFragment,
        });

      case SyntaxKind.JsxClosingFragment:
        return this.createNode<TSESTree.JSXClosingFragment>(node, {
          type: AST_NODE_TYPES.JSXClosingFragment,
        });

      case SyntaxKind.JsxExpression: {
        const expression = node.expression
          ? this.convertChild(node.expression)
          : this.createNode<TSESTree.JSXEmptyExpression>(node, {
              range: [node.getStart(this.ast) + 1, node.getEnd() - 1],
              type: AST_NODE_TYPES.JSXEmptyExpression,
            });

        if (node.dotDotDotToken) {
          return this.createNode<TSESTree.JSXSpreadChild>(node, {
            expression,
            type: AST_NODE_TYPES.JSXSpreadChild,
          });
        }
        return this.createNode<TSESTree.JSXExpressionContainer>(node, {
          expression,
          type: AST_NODE_TYPES.JSXExpressionContainer,
        });
      }

      case SyntaxKind.JsxAttribute: {
        return this.createNode<TSESTree.JSXAttribute>(node, {
          name: this.convertJSXNamespaceOrIdentifier(node.name),
          type: AST_NODE_TYPES.JSXAttribute,
          value: this.convertChild(node.initializer),
        });
      }

      case SyntaxKind.JsxText: {
        const start = node.getFullStart();
        const end = node.getEnd();
        const text = this.ast.text.slice(start, end);

        return this.createNode<TSESTree.JSXText>(node, {
          range: [start, end],
          raw: text,
          type: AST_NODE_TYPES.JSXText,
          value: unescapeStringLiteralText(text),
        });
      }

      case SyntaxKind.JsxSpreadAttribute:
        return this.createNode<TSESTree.JSXSpreadAttribute>(node, {
          argument: this.convertChild(node.expression),
          type: AST_NODE_TYPES.JSXSpreadAttribute,
        });

      case SyntaxKind.QualifiedName: {
        return this.createNode<TSESTree.TSQualifiedName>(node, {
          left: this.convertChild(node.left),
          right: this.convertChild(node.right),
          type: AST_NODE_TYPES.TSQualifiedName,
        });
      }

      // TypeScript specific

      case SyntaxKind.TypeReference:
        return this.createNode<TSESTree.TSTypeReference>(node, {
          type: AST_NODE_TYPES.TSTypeReference,
          typeArguments:
            node.typeArguments &&
            this.convertTypeArgumentsToTypeParameterInstantiation(
              node.typeArguments,
              node,
            ),
          typeName: this.convertChild(node.typeName),
        });

      case SyntaxKind.TypeParameter: {
        return this.createNode<TSESTree.TSTypeParameter>(node, {
          const: hasModifier(SyntaxKind.ConstKeyword, node),
          constraint: node.constraint && this.convertChild(node.constraint),
          default: node.default ? this.convertChild(node.default) : undefined,
          in: hasModifier(SyntaxKind.InKeyword, node),
          name: this.convertChild(node.name),
          out: hasModifier(SyntaxKind.OutKeyword, node),
          type: AST_NODE_TYPES.TSTypeParameter,
        });
      }

      case SyntaxKind.ThisType:
        return this.createNode<TSESTree.TSThisType>(node, {
          type: AST_NODE_TYPES.TSThisType,
        });

      case SyntaxKind.AnyKeyword:
      case SyntaxKind.BigIntKeyword:
      case SyntaxKind.BooleanKeyword:
      case SyntaxKind.NeverKeyword:
      case SyntaxKind.NumberKeyword:
      case SyntaxKind.ObjectKeyword:
      case SyntaxKind.StringKeyword:
      case SyntaxKind.SymbolKeyword:
      case SyntaxKind.UnknownKeyword:
      case SyntaxKind.VoidKeyword:
      case SyntaxKind.UndefinedKeyword:
      case SyntaxKind.IntrinsicKeyword: {
        return this.createNode<any>(node, {
          type: AST_NODE_TYPES[`TS${SyntaxKind[node.kind]}` as AST_NODE_TYPES],
        });
      }

      case SyntaxKind.NonNullExpression: {
        const nnExpr = this.createNode<TSESTree.TSNonNullExpression>(node, {
          expression: this.convertChild(node.expression),
          type: AST_NODE_TYPES.TSNonNullExpression,
        });

        return this.convertChainExpression(nnExpr, node);
      }

      case SyntaxKind.TypeLiteral: {
        return this.createNode<TSESTree.TSTypeLiteral>(node, {
          members: node.members.map(el => this.convertChild(el)),
          type: AST_NODE_TYPES.TSTypeLiteral,
        });
      }

      case SyntaxKind.ArrayType: {
        return this.createNode<TSESTree.TSArrayType>(node, {
          elementType: this.convertChild(node.elementType),
          type: AST_NODE_TYPES.TSArrayType,
        });
      }

      case SyntaxKind.IndexedAccessType: {
        return this.createNode<TSESTree.TSIndexedAccessType>(node, {
          indexType: this.convertChild(node.indexType),
          objectType: this.convertChild(node.objectType),
          type: AST_NODE_TYPES.TSIndexedAccessType,
        });
      }

      case SyntaxKind.ConditionalType: {
        return this.createNode<TSESTree.TSConditionalType>(node, {
          checkType: this.convertChild(node.checkType),
          extendsType: this.convertChild(node.extendsType),
          falseType: this.convertChild(node.falseType),
          trueType: this.convertChild(node.trueType),
          type: AST_NODE_TYPES.TSConditionalType,
        });
      }

      case SyntaxKind.TypeQuery:
        return this.createNode<TSESTree.TSTypeQuery>(node, {
          exprName: this.convertChild(node.exprName),
          type: AST_NODE_TYPES.TSTypeQuery,
          typeArguments:
            node.typeArguments &&
            this.convertTypeArgumentsToTypeParameterInstantiation(
              node.typeArguments,
              node,
            ),
        });

      case SyntaxKind.MappedType: {
        if (node.members && node.members.length > 0) {
          this.#throwUnlessAllowInvalidAST(
            node.members[0],
            'A mapped type may not declare properties or methods.',
          );
        }

        return this.createNode<TSESTree.TSMappedType>(
          node,
          this.#withDeprecatedGetter(
            {
              constraint: this.convertChild(node.typeParameter.constraint),
              key: this.convertChild(node.typeParameter.name),
              nameType: this.convertChild(node.nameType) ?? null,
              optional:
                node.questionToken &&
                (node.questionToken.kind === SyntaxKind.QuestionToken ||
                  getTextForTokenKind(node.questionToken.kind)),
              readonly:
                node.readonlyToken &&
                (node.readonlyToken.kind === SyntaxKind.ReadonlyKeyword ||
                  getTextForTokenKind(node.readonlyToken.kind)),
              type: AST_NODE_TYPES.TSMappedType,
              typeAnnotation: node.type && this.convertChild(node.type),
            },
            'typeParameter',
            "'constraint' and 'key'",
            this.convertChild(node.typeParameter),
          ),
        );
      }

      case SyntaxKind.ParenthesizedExpression:
        return this.convertChild(node.expression, parent);

      case SyntaxKind.TypeAliasDeclaration: {
        const result = this.createNode<TSESTree.TSTypeAliasDeclaration>(node, {
          declare: hasModifier(SyntaxKind.DeclareKeyword, node),
          id: this.convertChild(node.name),
          type: AST_NODE_TYPES.TSTypeAliasDeclaration,
          typeAnnotation: this.convertChild(node.type),
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });

        return this.fixExports(node, result);
      }

      case SyntaxKind.MethodSignature: {
        return this.convertMethodSignature(node);
      }

      case SyntaxKind.PropertySignature: {
        // eslint-disable-next-line deprecation/deprecation
        const { initializer } = node;
        if (initializer) {
          this.#throwError(
            initializer,
            'A property signature cannot have an initializer.',
          );
        }

        return this.createNode<TSESTree.TSPropertySignature>(node, {
          accessibility: getTSNodeAccessibility(node),
          computed: isComputedProperty(node.name),
          key: this.convertChild(node.name),
          optional: isOptional(node),
          readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node),
          static: hasModifier(SyntaxKind.StaticKeyword, node),
          type: AST_NODE_TYPES.TSPropertySignature,
          typeAnnotation:
            node.type && this.convertTypeAnnotation(node.type, node),
        });
      }

      case SyntaxKind.IndexSignature: {
        return this.createNode<TSESTree.TSIndexSignature>(node, {
          accessibility: getTSNodeAccessibility(node),
          parameters: node.parameters.map(el => this.convertChild(el)),
          readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node),
          static: hasModifier(SyntaxKind.StaticKeyword, node),
          type: AST_NODE_TYPES.TSIndexSignature,
          typeAnnotation:
            node.type && this.convertTypeAnnotation(node.type, node),
        });
      }

      case SyntaxKind.ConstructorType: {
        return this.createNode<TSESTree.TSConstructorType>(node, {
          abstract: hasModifier(SyntaxKind.AbstractKeyword, node),
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          type: AST_NODE_TYPES.TSConstructorType,
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });
      }

      case SyntaxKind.FunctionType: {
        // eslint-disable-next-line deprecation/deprecation
        const { modifiers } = node;
        if (modifiers) {
          this.#throwError(
            modifiers[0],
            'A function type cannot have modifiers.',
          );
        }
      }
      // intentional fallthrough
      case SyntaxKind.ConstructSignature:
      case SyntaxKind.CallSignature: {
        const type =
          node.kind === SyntaxKind.ConstructSignature
            ? AST_NODE_TYPES.TSConstructSignatureDeclaration
            : node.kind === SyntaxKind.CallSignature
              ? AST_NODE_TYPES.TSCallSignatureDeclaration
              : AST_NODE_TYPES.TSFunctionType;

        return this.createNode<
          | TSESTree.TSCallSignatureDeclaration
          | TSESTree.TSConstructSignatureDeclaration
          | TSESTree.TSFunctionType
        >(node, {
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          type,
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });
      }

      case SyntaxKind.ExpressionWithTypeArguments: {
        const parentKind = parent.kind;
        const type =
          parentKind === SyntaxKind.InterfaceDeclaration
            ? AST_NODE_TYPES.TSInterfaceHeritage
            : parentKind === SyntaxKind.HeritageClause
              ? AST_NODE_TYPES.TSClassImplements
              : AST_NODE_TYPES.TSInstantiationExpression;

        return this.createNode<
          | TSESTree.TSClassImplements
          | TSESTree.TSInstantiationExpression
          | TSESTree.TSInterfaceHeritage
        >(node, {
          expression: this.convertChild(node.expression),
          type,
          typeArguments:
            node.typeArguments &&
            this.convertTypeArgumentsToTypeParameterInstantiation(
              node.typeArguments,
              node,
            ),
        });
      }

      case SyntaxKind.InterfaceDeclaration: {
        const interfaceHeritageClauses = node.heritageClauses ?? [];
        const interfaceExtends: TSESTree.TSInterfaceHeritage[] = [];

        for (const heritageClause of interfaceHeritageClauses) {
          if (heritageClause.token !== SyntaxKind.ExtendsKeyword) {
            this.#throwError(
              heritageClause,
              heritageClause.token === SyntaxKind.ImplementsKeyword
                ? "Interface declaration cannot have 'implements' clause."
                : 'Unexpected token.',
            );
          }

          for (const heritageType of heritageClause.types) {
            interfaceExtends.push(
              this.convertChild(
                heritageType,
                node,
              ) as TSESTree.TSInterfaceHeritage,
            );
          }
        }

        const result = this.createNode<TSESTree.TSInterfaceDeclaration>(node, {
          body: this.createNode<TSESTree.TSInterfaceBody>(node, {
            body: node.members.map(member => this.convertChild(member)),
            range: [node.members.pos - 1, node.end],
            type: AST_NODE_TYPES.TSInterfaceBody,
          }),
          declare: hasModifier(SyntaxKind.DeclareKeyword, node),
          extends: interfaceExtends,
          id: this.convertChild(node.name),
          type: AST_NODE_TYPES.TSInterfaceDeclaration,
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });

        return this.fixExports(node, result);
      }

      case SyntaxKind.TypePredicate: {
        const result = this.createNode<TSESTree.TSTypePredicate>(node, {
          asserts: node.assertsModifier !== undefined,
          parameterName: this.convertChild(node.parameterName),
          type: AST_NODE_TYPES.TSTypePredicate,
          typeAnnotation: null,
        });
        /**
         * Specific fix for type-guard location data
         */
        if (node.type) {
          result.typeAnnotation = this.convertTypeAnnotation(node.type, node);
          result.typeAnnotation.loc = result.typeAnnotation.typeAnnotation.loc;
          result.typeAnnotation.range =
            result.typeAnnotation.typeAnnotation.range;
        }
        return result;
      }

      case SyntaxKind.ImportType: {
        const range = getRange(node, this.ast);
        if (node.isTypeOf) {
          const token = findNextToken(node.getFirstToken()!, node, this.ast)!;
          range[0] = token.getStart(this.ast);
        }
        const result = this.createNode<TSESTree.TSImportType>(node, {
          argument: this.convertChild(node.argument),
          qualifier: this.convertChild(node.qualifier),
          range,
          type: AST_NODE_TYPES.TSImportType,
          typeArguments: node.typeArguments
            ? this.convertTypeArgumentsToTypeParameterInstantiation(
                node.typeArguments,
                node,
              )
            : null,
        });

        if (node.isTypeOf) {
          return this.createNode<TSESTree.TSTypeQuery>(node, {
            exprName: result,
            type: AST_NODE_TYPES.TSTypeQuery,
            typeArguments: undefined,
          });
        }
        return result;
      }

      case SyntaxKind.EnumDeclaration: {
        const members = node.members.map(el => this.convertChild(el));
        const result = this.createNode<TSESTree.TSEnumDeclaration>(
          node,
          this.#withDeprecatedGetter(
            {
              body: this.createNode<TSESTree.TSEnumBody>(node, {
                members,
                range: [node.members.pos - 1, node.end],
                type: AST_NODE_TYPES.TSEnumBody,
              }),
              const: hasModifier(SyntaxKind.ConstKeyword, node),
              declare: hasModifier(SyntaxKind.DeclareKeyword, node),
              id: this.convertChild(node.name),
              type: AST_NODE_TYPES.TSEnumDeclaration,
            },
            'members',
            `'body.members'`,
            node.members.map(el => this.convertChild(el)),
          ),
        );

        return this.fixExports(node, result);
      }

      case SyntaxKind.EnumMember: {
        return this.createNode<TSESTree.TSEnumMember>(node, {
          computed: node.name.kind === ts.SyntaxKind.ComputedPropertyName,
          id: this.convertChild(node.name),
          initializer: node.initializer && this.convertChild(node.initializer),
          type: AST_NODE_TYPES.TSEnumMember,
        });
      }

      case SyntaxKind.ModuleDeclaration: {
        let isDeclare = hasModifier(SyntaxKind.DeclareKeyword, node);

        const result = this.createNode<TSESTree.TSModuleDeclaration>(node, {
          type: AST_NODE_TYPES.TSModuleDeclaration,
          ...((): TSESTree.OptionalRangeAndLoc<
            Omit<TSESTree.TSModuleDeclaration, 'parent' | 'type'>
          > => {
            // the constraints checked by this function are syntactically enforced by TS
            // the checks mostly exist for type's sake

            if (node.flags & ts.NodeFlags.GlobalAugmentation) {
              const id: TSESTree.Identifier | TSESTree.StringLiteral =
                this.convertChild(node.name);
              const body:
                | TSESTree.TSModuleBlock
                | TSESTree.TSModuleDeclaration
                | null = this.convertChild(node.body);

              if (
                body == null ||
                body.type === AST_NODE_TYPES.TSModuleDeclaration
              ) {
                this.#throwUnlessAllowInvalidAST(
                  node.body ?? node,
                  'Expected a valid module body',
                );
              }
              if (id.type !== AST_NODE_TYPES.Identifier) {
                this.#throwUnlessAllowInvalidAST(
                  node.name,
                  'global module augmentation must have an Identifier id',
                );
              }
              return {
                body: body as TSESTree.TSModuleBlock,
                declare: false,
                global: false,
                id,
                kind: 'global',
              };
            }

            if (!(node.flags & ts.NodeFlags.Namespace)) {
              const body: TSESTree.TSModuleBlock | null = this.convertChild(
                node.body,
              );
              return {
                kind: 'module',
                ...(body != null ? { body } : {}),
                declare: false,
                global: false,
                id: this.convertChild(node.name),
              };
            }

            // Nested module declarations are stored in TypeScript as nested tree nodes.
            // We "unravel" them here by making our own nested TSQualifiedName,
            // with the innermost node's body as the actual node body.

            if (node.body == null) {
              this.#throwUnlessAllowInvalidAST(node, 'Expected a module body');
            }
            if (node.name.kind !== ts.SyntaxKind.Identifier) {
              this.#throwUnlessAllowInvalidAST(
                node.name,
                '`namespace`s must have an Identifier id',
              );
            }

            let name: TSESTree.Identifier | TSESTree.TSQualifiedName =
              this.createNode<TSESTree.Identifier>(node.name, {
                decorators: [],
                name: node.name.text,
                optional: false,
                range: [node.name.getStart(this.ast), node.name.getEnd()],
                type: AST_NODE_TYPES.Identifier,
                typeAnnotation: undefined,
              });

            while (
              node.body &&
              ts.isModuleDeclaration(node.body) &&
              node.body.name
            ) {
              node = node.body;
              isDeclare ||= hasModifier(SyntaxKind.DeclareKeyword, node);

              const nextName = node.name as ts.Identifier;

              const right = this.createNode<TSESTree.Identifier>(nextName, {
                decorators: [],
                name: nextName.text,
                optional: false,
                range: [nextName.getStart(this.ast), nextName.getEnd()],
                type: AST_NODE_TYPES.Identifier,
                typeAnnotation: undefined,
              });

              name = this.createNode<TSESTree.TSQualifiedName>(nextName, {
                left: name,
                range: [name.range[0], right.range[1]],
                right,
                type: AST_NODE_TYPES.TSQualifiedName,
              });
            }

            return {
              body: this.convertChild(node.body),
              declare: false,
              global: false,
              id: name,
              kind: 'namespace',
            };
          })(),
        });

        result.declare = isDeclare;

        if (node.flags & ts.NodeFlags.GlobalAugmentation) {
          // eslint-disable-next-line deprecation/deprecation
          result.global = true;
        }

        return this.fixExports(node, result);
      }

      // TypeScript specific types
      case SyntaxKind.ParenthesizedType: {
        return this.convertChild(node.type);
      }
      case SyntaxKind.UnionType: {
        return this.createNode<TSESTree.TSUnionType>(node, {
          type: AST_NODE_TYPES.TSUnionType,
          types: node.types.map(el => this.convertChild(el)),
        });
      }
      case SyntaxKind.IntersectionType: {
        return this.createNode<TSESTree.TSIntersectionType>(node, {
          type: AST_NODE_TYPES.TSIntersectionType,
          types: node.types.map(el => this.convertChild(el)),
        });
      }
      case SyntaxKind.AsExpression: {
        return this.createNode<TSESTree.TSAsExpression>(node, {
          expression: this.convertChild(node.expression),
          type: AST_NODE_TYPES.TSAsExpression,
          typeAnnotation: this.convertChild(node.type),
        });
      }
      case SyntaxKind.InferType: {
        return this.createNode<TSESTree.TSInferType>(node, {
          type: AST_NODE_TYPES.TSInferType,
          typeParameter: this.convertChild(node.typeParameter),
        });
      }
      case SyntaxKind.LiteralType: {
        if (node.literal.kind === SyntaxKind.NullKeyword) {
          // 4.0 started nesting null types inside a LiteralType node
          // but our AST is designed around the old way of null being a keyword
          return this.createNode<TSESTree.TSNullKeyword>(
            node.literal as ts.NullLiteral,
            {
              type: AST_NODE_TYPES.TSNullKeyword,
            },
          );
        }

        return this.createNode<TSESTree.TSLiteralType>(node, {
          literal: this.convertChild(node.literal),
          type: AST_NODE_TYPES.TSLiteralType,
        });
      }
      case SyntaxKind.TypeAssertionExpression: {
        return this.createNode<TSESTree.TSTypeAssertion>(node, {
          expression: this.convertChild(node.expression),
          type: AST_NODE_TYPES.TSTypeAssertion,
          typeAnnotation: this.convertChild(node.type),
        });
      }
      case SyntaxKind.ImportEqualsDeclaration: {
        return this.fixExports(
          node,
          this.createNode<TSESTree.TSImportEqualsDeclaration>(node, {
            id: this.convertChild(node.name),
            importKind: node.isTypeOnly ? 'type' : 'value',
            moduleReference: this.convertChild(node.moduleReference),
            type: AST_NODE_TYPES.TSImportEqualsDeclaration,
          }),
        );
      }
      case SyntaxKind.ExternalModuleReference: {
        if (node.expression.kind !== SyntaxKind.StringLiteral) {
          this.#throwError(node.expression, 'String literal expected.');
        }
        return this.createNode<TSESTree.TSExternalModuleReference>(node, {
          expression: this.convertChild(node.expression),
          type: AST_NODE_TYPES.TSExternalModuleReference,
        });
      }
      case SyntaxKind.NamespaceExportDeclaration: {
        return this.createNode<TSESTree.TSNamespaceExportDeclaration>(node, {
          id: this.convertChild(node.name),
          type: AST_NODE_TYPES.TSNamespaceExportDeclaration,
        });
      }
      case SyntaxKind.AbstractKeyword: {
        return this.createNode<TSESTree.TSAbstractKeyword>(node, {
          type: AST_NODE_TYPES.TSAbstractKeyword,
        });
      }

      // Tuple
      case SyntaxKind.TupleType: {
        const elementTypes = node.elements.map(el => this.convertChild(el));

        return this.createNode<TSESTree.TSTupleType>(node, {
          elementTypes,
          type: AST_NODE_TYPES.TSTupleType,
        });
      }
      case SyntaxKind.NamedTupleMember: {
        const member = this.createNode<TSESTree.TSNamedTupleMember>(node, {
          elementType: this.convertChild(node.type, node),
          label: this.convertChild(node.name, node),
          optional: node.questionToken != null,
          type: AST_NODE_TYPES.TSNamedTupleMember,
        });

        if (node.dotDotDotToken) {
          // adjust the start to account for the "..."
          member.range[0] = member.label.range[0];
          member.loc.start = member.label.loc.start;
          return this.createNode<TSESTree.TSRestType>(node, {
            type: AST_NODE_TYPES.TSRestType,
            typeAnnotation: member,
          });
        }

        return member;
      }
      case SyntaxKind.OptionalType: {
        return this.createNode<TSESTree.TSOptionalType>(node, {
          type: AST_NODE_TYPES.TSOptionalType,
          typeAnnotation: this.convertChild(node.type),
        });
      }
      case SyntaxKind.RestType: {
        return this.createNode<TSESTree.TSRestType>(node, {
          type: AST_NODE_TYPES.TSRestType,
          typeAnnotation: this.convertChild(node.type),
        });
      }

      // Template Literal Types
      case SyntaxKind.TemplateLiteralType: {
        const result = this.createNode<TSESTree.TSTemplateLiteralType>(node, {
          quasis: [this.convertChild(node.head)],
          type: AST_NODE_TYPES.TSTemplateLiteralType,
          types: [],
        });

        node.templateSpans.forEach(templateSpan => {
          result.types.push(
            this.convertChild(templateSpan.type) as TSESTree.TypeNode,
          );
          result.quasis.push(
            this.convertChild(templateSpan.literal) as TSESTree.TemplateElement,
          );
        });
        return result;
      }

      case SyntaxKind.ClassStaticBlockDeclaration: {
        return this.createNode<TSESTree.StaticBlock>(node, {
          body: this.convertBodyExpressions(node.body.statements, node),
          type: AST_NODE_TYPES.StaticBlock,
        });
      }

      // eslint-disable-next-line deprecation/deprecation -- required for backwards-compatibility
      case SyntaxKind.AssertEntry:
      case SyntaxKind.ImportAttribute: {
        return this.createNode<TSESTree.ImportAttribute>(node, {
          key: this.convertChild(node.name),
          type: AST_NODE_TYPES.ImportAttribute,
          value: this.convertChild(node.value),
        });
      }

      case SyntaxKind.SatisfiesExpression: {
        return this.createNode<TSESTree.TSSatisfiesExpression>(node, {
          expression: this.convertChild(node.expression),
          type: AST_NODE_TYPES.TSSatisfiesExpression,
          typeAnnotation: this.convertChild(node.type),
        });
      }

      default:
        return this.deeplyCopy(node);
    }
  }

  /**
   * Creates a getter for a property under aliasKey that returns the value under
   * valueKey. If suppressDeprecatedPropertyWarnings is not enabled, the
   * getter also console warns about the deprecation.
   *
   * @see https://github.com/typescript-eslint/typescript-eslint/issues/6469
   */
  #checkForStatementDeclaration(
    initializer: ts.ForInitializer,
    kind: ts.SyntaxKind.ForInStatement | ts.SyntaxKind.ForOfStatement,
  ): void {
    const loop =
      kind === ts.SyntaxKind.ForInStatement ? 'for...in' : 'for...of';
    if (ts.isVariableDeclarationList(initializer)) {
      if (initializer.declarations.length !== 1) {
        this.#throwError(
          initializer,
          `Only a single variable declaration is allowed in a '${loop}' statement.`,
        );
      }
      const declaration = initializer.declarations[0];
      if (declaration.initializer) {
        this.#throwError(
          declaration,
          `The variable declaration of a '${loop}' statement cannot have an initializer.`,
        );
      } else if (declaration.type) {
        this.#throwError(
          declaration,
          `The variable declaration of a '${loop}' statement cannot have a type annotation.`,
        );
      }
      if (
        kind === ts.SyntaxKind.ForInStatement &&
        initializer.flags & ts.NodeFlags.Using
      ) {
        this.#throwError(
          initializer,
          "The left-hand side of a 'for...in' statement cannot be a 'using' declaration.",
        );
      }
    } else if (
      !isValidAssignmentTarget(initializer) &&
      initializer.kind !== ts.SyntaxKind.ObjectLiteralExpression &&
      initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression
    ) {
      this.#throwError(
        initializer,
        `The left-hand side of a '${loop}' statement must be a variable or a property access.`,
      );
    }
  }

  #throwError(node: ts.Node | number, message: string): asserts node is never {
    let start;
    let end;
    if (typeof node === 'number') {
      start = end = node;
    } else {
      start = node.getStart(this.ast);
      end = node.getEnd();
    }

    throw createError(message, this.ast, start, end);
  }

  #withDeprecatedAliasGetter<
    Properties extends { type: string },
    AliasKey extends string,
    ValueKey extends keyof Properties & string,
  >(
    node: Properties,
    aliasKey: AliasKey,
    valueKey: ValueKey,
    suppressWarnings = false,
  ): Properties & Record<AliasKey, Properties[ValueKey]> {
    let warned = suppressWarnings;

    Object.defineProperty(node, aliasKey, {
      configurable: true,
      get: this.options.suppressDeprecatedPropertyWarnings
        ? (): Properties[typeof valueKey] => node[valueKey]
        : (): Properties[typeof valueKey] => {
            if (!warned) {
              process.emitWarning(
                `The '${aliasKey}' property is deprecated on ${node.type} nodes. Use '${valueKey}' instead. See https://typescript-eslint.io/troubleshooting/faqs/general#the-key-property-is-deprecated-on-type-nodes-use-key-instead-warnings.`,
                'DeprecationWarning',
              );
              warned = true;
            }

            return node[valueKey];
          },
      set(value): void {
        Object.defineProperty(node, aliasKey, {
          enumerable: true,
          value,
          writable: true,
        });
      },
    });

    return node as Properties & Record<AliasKey, Properties[ValueKey]>;
  }
  #withDeprecatedGetter<
    Properties extends { type: string },
    Key extends string,
    Value,
  >(
    node: Properties,
    deprecatedKey: Key,
    preferredKey: string,
    value: Value,
  ): Properties & Record<Key, Value> {
    let warned = false;

    Object.defineProperty(node, deprecatedKey, {
      configurable: true,
      get: this.options.suppressDeprecatedPropertyWarnings
        ? (): Value => value
        : (): Value => {
            if (!warned) {
              process.emitWarning(
                `The '${deprecatedKey}' property is deprecated on ${node.type} nodes. Use ${preferredKey} instead. See https://typescript-eslint.io/troubleshooting/faqs/general#the-key-property-is-deprecated-on-type-nodes-use-key-instead-warnings.`,
                'DeprecationWarning',
              );
              warned = true;
            }

            return value;
          },
      set(value): void {
        Object.defineProperty(node, deprecatedKey, {
          enumerable: true,
          value,
          writable: true,
        });
      },
    });

    return node as Properties & Record<Key, Value>;
  }
}
