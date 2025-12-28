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

import { checkModifiers } from './check-modifiers';
import { getDecorators, getModifiers } from './getModifiers';
import {
  canContainDirective,
  createError,
  declarationNameToString,
  findNextToken,
  getBinaryExpressionType,
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
    error.start!,
    ('message' in error && error.message) || (error.messageText as string),
    error.file!,
  );
}

export interface ASTMaps {
  esTreeNodeToTSNodeMap: ParserWeakMapESTreeToTSNode;
  tsNodeToESTreeNodeMap: ParserWeakMap<TSNode, TSESTree.Node>;
}

function isPropertyAccessEntityNameExpression(
  node: ts.Node,
): node is ts.PropertyAccessEntityNameExpression {
  return (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.name) &&
    isEntityNameExpression(node.expression)
  );
}

function isEntityNameExpression(
  node: ts.Node,
): node is ts.EntityNameExpression {
  return (
    node.kind === SyntaxKind.Identifier ||
    isPropertyAccessEntityNameExpression(node)
  );
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

  #checkModifiers(node: ts.Node): void {
    if (this.options.allowInvalidAST) {
      return;
    }

    checkModifiers(node);
  }

  #throwError(
    node: number | ts.Node | TSESTree.Range,
    message: string,
  ): asserts node is never {
    if (this.options.allowInvalidAST) {
      return;
    }

    throw createError(node, message, this.ast);
  }

  /**
   * Creates a getter for a property under aliasKey that returns the value under
   * valueKey. If suppressDeprecatedPropertyWarnings is not enabled, the
   * getter also console warns about the deprecation.
   *
   * @see https://github.com/typescript-eslint/typescript-eslint/issues/6469
   */
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
    preferredKey: string | undefined,
    value: Value,
  ): Properties & Record<Key, Value> {
    let warned = false;

    Object.defineProperty(node, deprecatedKey, {
      configurable: true,
      get: this.options.suppressDeprecatedPropertyWarnings
        ? (): Value => value
        : (): Value => {
            if (!warned) {
              let message = `The '${deprecatedKey}' property is deprecated on ${node.type} nodes.`;
              if (preferredKey) {
                message += ` Use ${preferredKey} instead.`;
              }
              message +=
                ' See https://typescript-eslint.io/troubleshooting/faqs/general#the-key-property-is-deprecated-on-type-nodes-use-key-instead-warnings.';
              process.emitWarning(message, 'DeprecationWarning');
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

  private assertModuleSpecifier(
    node: ts.ExportDeclaration | ts.ImportDeclaration,
    allowNull: boolean,
  ): void {
    if (!allowNull && node.moduleSpecifier == null) {
      this.#throwError(node, 'Module specifier must be a string literal.');
    }

    if (
      node.moduleSpecifier &&
      node.moduleSpecifier?.kind !== SyntaxKind.StringLiteral
    ) {
      this.#throwError(
        node.moduleSpecifier,
        'Module specifier must be a string literal.',
      );
    }
  }

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
      type: AST_NODE_TYPES.ChainExpression,
      expression: node,
    });
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param child the child ts.Node
   * @param parent parentNode
   * @returns the converted ESTree node
   */
  private convertChild(child?: ts.Node, parent?: ts.Node): any {
    return this.converter(child, parent, false);
  }

  /**
   * Converts TypeScript node array into an ESTree node list.
   * @param children the child `ts.NodeArray` or `ts.Node[]`
   * @param parent parentNode
   * @returns the converted ESTree node list
   */
  private convertChildren(
    children: ts.Node[] | ts.NodeArray<ts.Node>,
    parent?: ts.Node,
  ): any[] {
    return children.map(child => this.converter(child, parent, false));
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
      type: AST_NODE_TYPES.TSTypeAnnotation,
      loc,
      range,
      typeAnnotation: this.convertChild(child),
    } as TSESTree.TSTypeAnnotation;
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
    const range: TSESTree.Range = [typeArguments.pos - 1, greaterThanToken.end];

    if (typeArguments.length === 0) {
      this.#throwError(range, 'Type argument list cannot be empty.');
    }

    return this.createNode<TSESTree.TSTypeParameterInstantiation>(node, {
      type: AST_NODE_TYPES.TSTypeParameterInstantiation,
      range,
      params: this.convertChildren(typeArguments),
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

    if (typeParameters.length === 0) {
      this.#throwError(range, 'Type parameter list cannot be empty.');
    }

    return {
      type: AST_NODE_TYPES.TSTypeParameterDeclaration,
      loc: getLocFor(range, this.ast),
      range,
      params: this.convertChildren(typeParameters),
    } as TSESTree.TSTypeParameterDeclaration;
  }

  /**
   * Converts an array of ts.Node parameters into an array of ESTreeNode params
   * @param parameters An array of ts.Node params to be converted
   * @returns an array of converted ESTreeNode params
   */
  private convertParameters(
    parameters: ts.NodeArray<ts.ParameterDeclaration>,
  ): TSESTree.Parameter[] {
    if (!parameters?.length) {
      return [];
    }
    return parameters.map(param => {
      const convertedParam = this.convertChild(param) as TSESTree.Parameter;

      convertedParam.decorators = this.convertChildren(
        getDecorators(param) ?? [],
      );

      return convertedParam;
    });
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
    if (allowPattern != null) {
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

  private convertImportAttributes(
    node: ts.ExportDeclaration | ts.ImportDeclaration,
  ): TSESTree.ImportAttribute[] {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const attributes = node.attributes ?? node.assertClause;
    return this.convertChildren(attributes?.elements ?? []);
  }

  private convertJSXIdentifier(
    node: ts.Identifier | ts.ThisExpression,
  ): TSESTree.JSXIdentifier {
    const result = this.createNode<TSESTree.JSXIdentifier>(node, {
      type: AST_NODE_TYPES.JSXIdentifier,
      name: node.getText(),
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
        type: AST_NODE_TYPES.JSXNamespacedName,
        name: this.createNode(node.name, {
          type: AST_NODE_TYPES.JSXIdentifier,
          name: node.name.text,
        }),
        namespace: this.createNode(node.namespace, {
          type: AST_NODE_TYPES.JSXIdentifier,
          name: node.namespace.text,
        }),
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
      const result = this.createNode<TSESTree.JSXNamespacedName>(node, {
        type: AST_NODE_TYPES.JSXNamespacedName,
        range,
        name: this.createNode<TSESTree.JSXIdentifier>(node, {
          type: AST_NODE_TYPES.JSXIdentifier,
          range: [range[0] + colonIndex + 1, range[1]],
          name: text.slice(colonIndex + 1),
        }),
        namespace: this.createNode<TSESTree.JSXIdentifier>(node, {
          type: AST_NODE_TYPES.JSXIdentifier,
          range: [range[0], range[0] + colonIndex],
          name: text.slice(0, colonIndex),
        }),
      });
      this.registerTSNodeInNodeMap(node, result);
      return result;
    }

    return this.convertJSXIdentifier(node);
  }

  /**
   * Converts a TypeScript JSX node.tagName into an ESTree node.name
   * @param node the tagName object from a JSX ts.Node
   * @returns the converted ESTree name object
   */
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
          type: AST_NODE_TYPES.JSXMemberExpression,
          object: this.convertJSXTagName(node.expression, parent),
          property: this.convertJSXIdentifier(node.name),
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
      type: AST_NODE_TYPES.TSMethodSignature,
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
  private convertNode(node: TSNode, parent: TSNode): TSESTree.Node | null {
    switch (node.kind) {
      case SyntaxKind.SourceFile: {
        return this.createNode<TSESTree.Program>(node, {
          type: AST_NODE_TYPES.Program,
          range: [node.getStart(this.ast), node.endOfFileToken.end],
          body: this.convertBodyExpressions(node.statements, node),
          comments: undefined,
          sourceType: node.externalModuleIndicator ? 'module' : 'script',
          tokens: undefined,
        });
      }

      case SyntaxKind.Block: {
        return this.createNode<TSESTree.BlockStatement>(node, {
          type: AST_NODE_TYPES.BlockStatement,
          body: this.convertBodyExpressions(node.statements, node),
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
          type: AST_NODE_TYPES.Identifier,
          decorators: [],
          name: node.text,
          optional: false,
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
          type: AST_NODE_TYPES.WithStatement,
          body: this.convertChild(node.statement),
          object: this.convertChild(node.expression),
        });

      // Control Flow

      case SyntaxKind.ReturnStatement:
        return this.createNode<TSESTree.ReturnStatement>(node, {
          type: AST_NODE_TYPES.ReturnStatement,
          argument: this.convertChild(node.expression),
        });

      case SyntaxKind.LabeledStatement:
        return this.createNode<TSESTree.LabeledStatement>(node, {
          type: AST_NODE_TYPES.LabeledStatement,
          body: this.convertChild(node.statement),
          label: this.convertChild(node.label),
        });

      case SyntaxKind.ContinueStatement:
        return this.createNode<TSESTree.ContinueStatement>(node, {
          type: AST_NODE_TYPES.ContinueStatement,
          label: this.convertChild(node.label),
        });

      case SyntaxKind.BreakStatement:
        return this.createNode<TSESTree.BreakStatement>(node, {
          type: AST_NODE_TYPES.BreakStatement,
          label: this.convertChild(node.label),
        });

      // Choice

      case SyntaxKind.IfStatement:
        return this.createNode<TSESTree.IfStatement>(node, {
          type: AST_NODE_TYPES.IfStatement,
          alternate: this.convertChild(node.elseStatement),
          consequent: this.convertChild(node.thenStatement),
          test: this.convertChild(node.expression),
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
          type: AST_NODE_TYPES.SwitchStatement,
          cases: this.convertChildren(node.caseBlock.clauses),
          discriminant: this.convertChild(node.expression),
        });

      case SyntaxKind.CaseClause:
      case SyntaxKind.DefaultClause:
        return this.createNode<TSESTree.SwitchCase>(node, {
          type: AST_NODE_TYPES.SwitchCase,
          // expression is present in case only
          consequent: this.convertChildren(node.statements),
          test:
            node.kind === SyntaxKind.CaseClause
              ? this.convertChild(node.expression)
              : null,
        });

      // Exceptions

      case SyntaxKind.ThrowStatement:
        if (node.expression.end === node.expression.pos) {
          this.#throwError(node, 'A throw statement must throw an expression.');
        }

        return this.createNode<TSESTree.ThrowStatement>(node, {
          type: AST_NODE_TYPES.ThrowStatement,
          argument: this.convertChild(node.expression),
        });

      case SyntaxKind.TryStatement:
        return this.createNode<TSESTree.TryStatement>(node, {
          type: AST_NODE_TYPES.TryStatement,
          block: this.convertChild(node.tryBlock),
          finalizer: this.convertChild(node.finallyBlock),
          handler: this.convertChild(node.catchClause),
        });

      case SyntaxKind.CatchClause:
        if (node.variableDeclaration?.initializer) {
          this.#throwError(
            node.variableDeclaration.initializer,
            'Catch clause variable cannot have an initializer.',
          );
        }
        return this.createNode<TSESTree.CatchClause>(node, {
          type: AST_NODE_TYPES.CatchClause,
          body: this.convertChild(node.block),
          param: node.variableDeclaration
            ? this.convertBindingNameWithTypeAnnotation(
                node.variableDeclaration.name,
                node.variableDeclaration.type,
              )
            : null,
        });

      // Loops

      case SyntaxKind.WhileStatement:
        return this.createNode<TSESTree.WhileStatement>(node, {
          type: AST_NODE_TYPES.WhileStatement,
          body: this.convertChild(node.statement),
          test: this.convertChild(node.expression),
        });

      /**
       * Unlike other parsers, TypeScript calls a "DoWhileStatement"
       * a "DoStatement"
       */
      case SyntaxKind.DoStatement:
        return this.createNode<TSESTree.DoWhileStatement>(node, {
          type: AST_NODE_TYPES.DoWhileStatement,
          body: this.convertChild(node.statement),
          test: this.convertChild(node.expression),
        });

      case SyntaxKind.ForStatement:
        return this.createNode<TSESTree.ForStatement>(node, {
          type: AST_NODE_TYPES.ForStatement,
          body: this.convertChild(node.statement),
          init: this.convertChild(node.initializer),
          test: this.convertChild(node.condition),
          update: this.convertChild(node.incrementor),
        });

      case SyntaxKind.ForInStatement:
        this.#checkForStatementDeclaration(node.initializer, node.kind);
        return this.createNode<TSESTree.ForInStatement>(node, {
          type: AST_NODE_TYPES.ForInStatement,
          body: this.convertChild(node.statement),
          left: this.convertPattern(node.initializer),
          right: this.convertChild(node.expression),
        });

      case SyntaxKind.ForOfStatement: {
        this.#checkForStatementDeclaration(node.initializer, node.kind);
        return this.createNode<TSESTree.ForOfStatement>(node, {
          type: AST_NODE_TYPES.ForOfStatement,
          await: node.awaitModifier?.kind === SyntaxKind.AwaitKeyword,
          body: this.convertChild(node.statement),
          left: this.convertPattern(node.initializer),
          right: this.convertChild(node.expression),
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
          type: !node.body
            ? AST_NODE_TYPES.TSDeclareFunction
            : AST_NODE_TYPES.FunctionDeclaration,
          async: isAsync,
          body: this.convertChild(node.body) || undefined,
          declare: isDeclare,
          expression: false,
          generator: isGenerator,
          id: this.convertChild(node.name),
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });

        return this.fixExports(node, result);
      }

      case SyntaxKind.VariableDeclaration: {
        const hasExclamationToken = !!node.exclamationToken;

        if (hasExclamationToken) {
          if (node.initializer) {
            this.#throwError(
              node,
              'Declarations with initializers cannot also have definite assignment assertions.',
            );
          } else if (node.name.kind !== SyntaxKind.Identifier || !node.type) {
            this.#throwError(
              node,
              'Declarations with definite assignment assertions must also have type annotations.',
            );
          }
        }

        if (node.parent.kind === SyntaxKind.VariableDeclarationList) {
          const variableDeclarationList = node.parent;
          const kind = getDeclarationKind(variableDeclarationList);

          if (
            (variableDeclarationList.parent.kind ===
              SyntaxKind.ForInStatement ||
              variableDeclarationList.parent.kind ===
                SyntaxKind.ForStatement) &&
            (kind === 'using' || kind === 'await using')
          ) {
            if (!node.initializer) {
              this.#throwError(
                node,
                `'${kind}' declarations may not be initialized in for statement.`,
              );
            }

            if (node.name.kind !== SyntaxKind.Identifier) {
              this.#throwError(
                node.name,
                `'${kind}' declarations may not have binding patterns.`,
              );
            }
          }

          if (
            variableDeclarationList.parent.kind === SyntaxKind.VariableStatement
          ) {
            const variableStatement = variableDeclarationList.parent;

            if (kind === 'using' || kind === 'await using') {
              if (!node.initializer) {
                this.#throwError(
                  node,
                  `'${kind}' declarations must be initialized.`,
                );
              }
              if (node.name.kind !== SyntaxKind.Identifier) {
                this.#throwError(
                  node.name,
                  `'${kind}' declarations may not have binding patterns.`,
                );
              }
            }

            const hasDeclareKeyword = hasModifier(
              SyntaxKind.DeclareKeyword,
              variableStatement,
            );

            // Definite assignment only allowed for non-declare let and var
            if (
              (hasDeclareKeyword ||
                ['await using', 'const', 'using'].includes(kind)) &&
              hasExclamationToken
            ) {
              this.#throwError(
                node,
                `A definite assignment assertion '!' is not permitted in this context.`,
              );
            }

            if (
              hasDeclareKeyword &&
              node.initializer &&
              (['let', 'var'].includes(kind) || node.type)
            ) {
              this.#throwError(
                node,
                `Initializers are not permitted in ambient contexts.`,
              );
            }
            // Theoretically, only certain initializers are allowed for declare const,
            // (TS1254: A 'const' initializer in an ambient context must be a string
            // or numeric literal or literal enum reference.) but we just allow
            // all expressions

            // Note! No-declare does not mean the variable is not ambient, because
            // it can be further nested in other declare contexts. Therefore we cannot
            // check for const initializers.
          }
        }

        const init = this.convertChild(node.initializer);
        const id = this.convertBindingNameWithTypeAnnotation(
          node.name,
          node.type,
          node,
        );
        return this.createNode<TSESTree.VariableDeclarator>(node, {
          type: AST_NODE_TYPES.VariableDeclarator,
          definite: hasExclamationToken,
          id,
          init,
        });
      }

      case SyntaxKind.VariableStatement: {
        const declarations = node.declarationList.declarations;

        if (!declarations.length) {
          this.#throwError(
            node,
            'A variable declaration list must have at least one variable declarator.',
          );
        }

        const result = this.createNode<TSESTree.VariableDeclaration>(node, {
          type: AST_NODE_TYPES.VariableDeclaration,
          declarations: this.convertChildren(declarations),
          declare: hasModifier(SyntaxKind.DeclareKeyword, node),
          kind: getDeclarationKind(node.declarationList),
        });

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
        return this.createNode<TSESTree.VariableDeclaration>(node, {
          type: AST_NODE_TYPES.VariableDeclaration,
          declarations: this.convertChildren(node.declarations),
          declare: false,
          kind: getDeclarationKind(node),
        });
      }

      // Expressions

      case SyntaxKind.ExpressionStatement:
        return this.createNode<TSESTree.ExpressionStatement>(node, {
          type: AST_NODE_TYPES.ExpressionStatement,
          directive: undefined,
          expression: this.convertChild(node.expression),
        });

      case SyntaxKind.ThisKeyword:
        return this.createNode<TSESTree.ThisExpression>(node, {
          type: AST_NODE_TYPES.ThisExpression,
        });

      case SyntaxKind.ArrayLiteralExpression: {
        // TypeScript uses ArrayLiteralExpression in destructuring assignment, too
        if (this.allowPattern) {
          return this.createNode<TSESTree.ArrayPattern>(node, {
            type: AST_NODE_TYPES.ArrayPattern,
            decorators: [],
            elements: node.elements.map(el => this.convertPattern(el)),
            optional: false,
            typeAnnotation: undefined,
          });
        }
        return this.createNode<TSESTree.ArrayExpression>(node, {
          type: AST_NODE_TYPES.ArrayExpression,
          elements: this.convertChildren(node.elements),
        });
      }

      case SyntaxKind.ObjectLiteralExpression: {
        // TypeScript uses ObjectLiteralExpression in destructuring assignment, too
        if (this.allowPattern) {
          return this.createNode<TSESTree.ObjectPattern>(node, {
            type: AST_NODE_TYPES.ObjectPattern,
            decorators: [],
            optional: false,
            properties: node.properties.map(el => this.convertPattern(el)),
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
            this.#throwError(property.end - 1, "'{' expected.");
          }

          properties.push(this.convertChild(property) as TSESTree.Property);
        }

        return this.createNode<TSESTree.ObjectExpression>(node, {
          type: AST_NODE_TYPES.ObjectExpression,
          properties,
        });
      }

      case SyntaxKind.PropertyAssignment: {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
          type: AST_NODE_TYPES.Property,
          computed: isComputedProperty(node.name),
          key: this.convertChild(node.name),
          kind: 'init',
          method: false,
          optional: false,
          shorthand: false,
          value: this.converter(node.initializer, node, this.allowPattern),
        });
      }

      case SyntaxKind.ShorthandPropertyAssignment: {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            type: AST_NODE_TYPES.Property,
            computed: false,
            key: this.convertChild(node.name),
            kind: 'init',
            method: false,
            optional: false,
            shorthand: true,
            value: this.createNode<TSESTree.AssignmentPattern>(node, {
              type: AST_NODE_TYPES.AssignmentPattern,
              decorators: [],
              left: this.convertPattern(node.name),
              optional: false,
              right: this.convertChild(node.objectAssignmentInitializer),
              typeAnnotation: undefined,
            }),
          });
        }
        return this.createNode<TSESTree.Property>(node, {
          type: AST_NODE_TYPES.Property,
          computed: false,
          key: this.convertChild(node.name),
          kind: 'init',
          method: false,
          optional: false,
          shorthand: true,
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

        if (
          node.name.kind === SyntaxKind.StringLiteral &&
          node.name.text === 'constructor'
        ) {
          this.#throwError(
            node.name,
            "Classes may not have a field named 'constructor'.",
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
          type,
          accessibility: getTSNodeAccessibility(node),
          computed: isComputedProperty(node.name),
          declare: hasModifier(SyntaxKind.DeclareKeyword, node),
          decorators: this.convertChildren(getDecorators(node) ?? []),
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
        const isAbstract = hasModifier(SyntaxKind.AbstractKeyword, node);

        if (isAbstract && node.body) {
          this.#throwError(
            node.name,
            node.kind === SyntaxKind.GetAccessor ||
              node.kind === SyntaxKind.SetAccessor
              ? 'An abstract accessor cannot have an implementation.'
              : `Method '${declarationNameToString(node.name, this.ast)}' cannot have an implementation because it is marked abstract.`,
          );
        }

        const method = this.createNode<
          TSESTree.FunctionExpression | TSESTree.TSEmptyBodyFunctionExpression
        >(node, {
          type: !node.body
            ? AST_NODE_TYPES.TSEmptyBodyFunctionExpression
            : AST_NODE_TYPES.FunctionExpression,
          range: [node.parameters.pos - 1, node.end],
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          body: this.convertChild(node.body),
          declare: false,
          expression: false, // ESTreeNode as ESTreeNode here
          generator: !!node.asteriskToken,
          id: null,
          params: [],
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
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
          method.params = this.convertChildren(node.parameters);

          result = this.createNode<TSESTree.Property>(node, {
            type: AST_NODE_TYPES.Property,
            computed: isComputedProperty(node.name),
            key: this.convertChild(node.name),
            kind: 'init',
            method: node.kind === SyntaxKind.MethodDeclaration,
            optional: !!node.questionToken,
            shorthand: false,
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
          const methodDefinitionType = isAbstract
            ? AST_NODE_TYPES.TSAbstractMethodDefinition
            : AST_NODE_TYPES.MethodDefinition;

          result = this.createNode<
            TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
          >(node, {
            type: methodDefinitionType,
            accessibility: getTSNodeAccessibility(node),
            computed: isComputedProperty(node.name),
            decorators: this.convertChildren(getDecorators(node) ?? []),
            key: this.convertChild(node.name),
            kind: 'method',
            optional: !!node.questionToken,
            override: hasModifier(SyntaxKind.OverrideKeyword, node),
            static: hasModifier(SyntaxKind.StaticKeyword, node),
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
          type: !node.body
            ? AST_NODE_TYPES.TSEmptyBodyFunctionExpression
            : AST_NODE_TYPES.FunctionExpression,
          range: [node.parameters.pos - 1, node.end],
          async: false,
          body: this.convertChild(node.body),
          declare: false,
          expression: false, // is not present in ESTreeNode
          generator: false,
          id: null,
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });

        if (constructor.typeParameters) {
          this.fixParentLocation(constructor, constructor.typeParameters.range);
        }

        const constructorKey =
          constructorToken.kind === SyntaxKind.StringLiteral
            ? this.createNode<TSESTree.StringLiteral>(constructorToken, {
                type: AST_NODE_TYPES.Literal,
                raw: constructorToken.getText(),
                value: 'constructor',
              })
            : this.createNode<TSESTree.Identifier>(node, {
                type: AST_NODE_TYPES.Identifier,
                range: [
                  constructorToken.getStart(this.ast),
                  constructorToken.end,
                ],
                decorators: [],
                name: 'constructor',
                optional: false,
                typeAnnotation: undefined,
              });

        const isStatic = hasModifier(SyntaxKind.StaticKeyword, node);

        return this.createNode<
          TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
        >(node, {
          type: hasModifier(SyntaxKind.AbstractKeyword, node)
            ? AST_NODE_TYPES.TSAbstractMethodDefinition
            : AST_NODE_TYPES.MethodDefinition,
          accessibility: getTSNodeAccessibility(node),
          computed: false,
          decorators: [],
          key: constructorKey,
          kind: isStatic ? 'method' : 'constructor',
          optional: false,
          override: false,
          static: isStatic,
          value: constructor,
        });
      }

      case SyntaxKind.FunctionExpression: {
        return this.createNode<TSESTree.FunctionExpression>(node, {
          type: AST_NODE_TYPES.FunctionExpression,
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          body: this.convertChild(node.body),
          declare: false,
          expression: false,
          generator: !!node.asteriskToken,
          id: this.convertChild(node.name),
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
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
          type: AST_NODE_TYPES.ArrayPattern,
          decorators: [],
          elements: node.elements.map(el => this.convertPattern(el)),
          optional: false,
          typeAnnotation: undefined,
        });

      // occurs with missing array elements like [,]
      case SyntaxKind.OmittedExpression:
        return null;

      case SyntaxKind.ObjectBindingPattern:
        return this.createNode<TSESTree.ObjectPattern>(node, {
          type: AST_NODE_TYPES.ObjectPattern,
          decorators: [],
          optional: false,
          properties: node.elements.map(el => this.convertPattern(el)),
          typeAnnotation: undefined,
        });

      case SyntaxKind.BindingElement: {
        if (parent.kind === SyntaxKind.ArrayBindingPattern) {
          const arrayItem = this.convertChild(node.name, parent);

          if (node.initializer) {
            return this.createNode<TSESTree.AssignmentPattern>(node, {
              type: AST_NODE_TYPES.AssignmentPattern,
              decorators: [],
              left: arrayItem,
              optional: false,
              right: this.convertChild(node.initializer),
              typeAnnotation: undefined,
            });
          }

          if (node.dotDotDotToken) {
            return this.createNode<TSESTree.RestElement>(node, {
              type: AST_NODE_TYPES.RestElement,
              argument: arrayItem,
              decorators: [],
              optional: false,
              typeAnnotation: undefined,
              value: undefined,
            });
          }
          return arrayItem;
        }
        let result: TSESTree.Property | TSESTree.RestElement;
        if (node.dotDotDotToken) {
          result = this.createNode<TSESTree.RestElement>(node, {
            type: AST_NODE_TYPES.RestElement,
            argument: this.convertChild(node.propertyName ?? node.name),
            decorators: [],
            optional: false,
            typeAnnotation: undefined,
            value: undefined,
          });
        } else {
          result = this.createNode<TSESTree.Property>(node, {
            type: AST_NODE_TYPES.Property,
            computed:
              node.propertyName?.kind === SyntaxKind.ComputedPropertyName,
            key: this.convertChild(node.propertyName ?? node.name),
            kind: 'init',
            method: false,
            optional: false,
            shorthand: !node.propertyName,
            value: this.convertChild(node.name),
          });
        }

        if (node.initializer) {
          result.value = this.createNode<TSESTree.AssignmentPattern>(node, {
            type: AST_NODE_TYPES.AssignmentPattern,
            range: [node.name.getStart(this.ast), node.initializer.end],
            decorators: [],
            left: this.convertChild(node.name),
            optional: false,
            right: this.convertChild(node.initializer),
            typeAnnotation: undefined,
          });
        }
        return result;
      }

      case SyntaxKind.ArrowFunction: {
        return this.createNode<TSESTree.ArrowFunctionExpression>(node, {
          type: AST_NODE_TYPES.ArrowFunctionExpression,
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          body: this.convertChild(node.body),
          expression: node.body.kind !== SyntaxKind.Block,
          generator: false,
          id: null,
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });
      }

      case SyntaxKind.YieldExpression:
        return this.createNode<TSESTree.YieldExpression>(node, {
          type: AST_NODE_TYPES.YieldExpression,
          argument: this.convertChild(node.expression),
          delegate: !!node.asteriskToken,
        });

      case SyntaxKind.AwaitExpression:
        return this.createNode<TSESTree.AwaitExpression>(node, {
          type: AST_NODE_TYPES.AwaitExpression,
          argument: this.convertChild(node.expression),
        });

      // Template Literals

      case SyntaxKind.NoSubstitutionTemplateLiteral:
        return this.createNode<TSESTree.TemplateLiteral>(node, {
          type: AST_NODE_TYPES.TemplateLiteral,
          expressions: [],
          quasis: [
            this.createNode<TSESTree.TemplateElement>(node, {
              type: AST_NODE_TYPES.TemplateElement,
              tail: true,
              value: {
                cooked: node.text,
                raw: this.ast.text.slice(
                  node.getStart(this.ast) + 1,
                  node.end - 1,
                ),
              },
            }),
          ],
        });

      case SyntaxKind.TemplateExpression: {
        const result = this.createNode<TSESTree.TemplateLiteral>(node, {
          type: AST_NODE_TYPES.TemplateLiteral,
          expressions: [],
          quasis: [this.convertChild(node.head)],
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

      case SyntaxKind.TaggedTemplateExpression: {
        if (node.tag.flags & ts.NodeFlags.OptionalChain) {
          this.#throwError(
            node,
            'Tagged template expressions are not permitted in an optional chain.',
          );
        }
        return this.createNode<TSESTree.TaggedTemplateExpression>(node, {
          type: AST_NODE_TYPES.TaggedTemplateExpression,
          quasi: this.convertChild(node.template),
          tag: this.convertChild(node.tag),
          typeArguments:
            node.typeArguments &&
            this.convertTypeArgumentsToTypeParameterInstantiation(
              node.typeArguments,
              node,
            ),
        });
      }

      case SyntaxKind.TemplateHead:
      case SyntaxKind.TemplateMiddle:
      case SyntaxKind.TemplateTail: {
        const tail = node.kind === SyntaxKind.TemplateTail;
        return this.createNode<TSESTree.TemplateElement>(node, {
          type: AST_NODE_TYPES.TemplateElement,
          tail,
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
            type: AST_NODE_TYPES.RestElement,
            argument: this.convertPattern(node.expression),
            decorators: [],
            optional: false,
            typeAnnotation: undefined,
            value: undefined,
          });
        }
        return this.createNode<TSESTree.SpreadElement>(node, {
          type: AST_NODE_TYPES.SpreadElement,
          argument: this.convertChild(node.expression),
        });
      }

      case SyntaxKind.Parameter: {
        let parameter: TSESTree.BindingName | TSESTree.RestElement;
        let result: TSESTree.AssignmentPattern | TSESTree.RestElement;

        if (node.dotDotDotToken) {
          parameter = result = this.createNode<TSESTree.RestElement>(node, {
            type: AST_NODE_TYPES.RestElement,
            argument: this.convertChild(node.name),
            decorators: [],
            optional: false,
            typeAnnotation: undefined,
            value: undefined,
          });
        } else if (node.initializer) {
          parameter = this.convertChild(node.name) as TSESTree.BindingName;
          result = this.createNode<TSESTree.AssignmentPattern>(node, {
            type: AST_NODE_TYPES.AssignmentPattern,
            range: [node.name.getStart(this.ast), node.initializer.end],
            decorators: [],
            left: parameter,
            optional: false,
            right: this.convertChild(node.initializer),
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
            type: AST_NODE_TYPES.TSParameterProperty,
            accessibility: getTSNodeAccessibility(node),
            decorators: [],
            override: hasModifier(SyntaxKind.OverrideKeyword, node),
            parameter: result as TSESTree.TSParameterProperty['parameter'],
            readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node),
            static: hasModifier(SyntaxKind.StaticKeyword, node),
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
          this.#throwError(
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
            this.#throwError(
              heritageClause,
              `'${ts.tokenToString(token)}' list cannot be empty.`,
            );
          }

          if (token === SyntaxKind.ExtendsKeyword) {
            if (extendsClause) {
              this.#throwError(
                heritageClause,
                "'extends' clause already seen.",
              );
            }

            if (implementsClause) {
              this.#throwError(
                heritageClause,
                "'extends' clause must precede 'implements' clause.",
              );
            }

            if (types.length > 1) {
              this.#throwError(
                types[1],
                'Classes can only extend a single class.',
              );
            }

            extendsClause ??= heritageClause;
          } else if (token === SyntaxKind.ImplementsKeyword) {
            if (implementsClause) {
              this.#throwError(
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
          type: classNodeType,
          abstract: hasModifier(SyntaxKind.AbstractKeyword, node),
          body: this.createNode<TSESTree.ClassBody>(node, {
            type: AST_NODE_TYPES.ClassBody,
            range: [node.members.pos - 1, node.end],
            body: this.convertChildren(
              node.members.filter(isESTreeClassMember),
            ),
          }),
          declare: hasModifier(SyntaxKind.DeclareKeyword, node),
          decorators: this.convertChildren(getDecorators(node) ?? []),
          id: this.convertChild(node.name),
          implements: this.convertChildren(implementsClause?.types ?? []),
          superClass: extendsClause?.types[0]
            ? this.convertChild(extendsClause.types[0].expression)
            : null,
          superTypeArguments: undefined,
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
          type: AST_NODE_TYPES.TSModuleBlock,
          body: this.convertBodyExpressions(node.statements, node),
        });

      case SyntaxKind.ImportDeclaration: {
        this.assertModuleSpecifier(node, false);

        const result = this.createNode<TSESTree.ImportDeclaration>(
          node,
          this.#withDeprecatedAliasGetter(
            {
              type: AST_NODE_TYPES.ImportDeclaration,
              attributes: this.convertImportAttributes(node),
              importKind: 'value',
              source: this.convertChild(node.moduleSpecifier),
              specifiers: [],
            },
            'assertions',
            'attributes',
            true,
          ),
        );

        if (node.importClause) {
          // TODO(bradzacher) swap to `phaseModifier` once we add support for `import defer`
          // https://github.com/estree/estree/issues/328
          // eslint-disable-next-line @typescript-eslint/no-deprecated
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
                result.specifiers.push(
                  ...(this.convertChildren(
                    node.importClause.namedBindings.elements,
                  ) as TSESTree.ImportClause[]),
                );
                break;
            }
          }
        }
        return result;
      }

      case SyntaxKind.NamespaceImport:
        return this.createNode<TSESTree.ImportNamespaceSpecifier>(node, {
          type: AST_NODE_TYPES.ImportNamespaceSpecifier,
          local: this.convertChild(node.name),
        });

      case SyntaxKind.ImportSpecifier:
        return this.createNode<TSESTree.ImportSpecifier>(node, {
          type: AST_NODE_TYPES.ImportSpecifier,
          imported: this.convertChild(node.propertyName ?? node.name),
          importKind: node.isTypeOnly ? 'type' : 'value',
          local: this.convertChild(node.name),
        });

      case SyntaxKind.ImportClause: {
        const local = this.convertChild(node.name);
        return this.createNode<TSESTree.ImportDefaultSpecifier>(node, {
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          range: local.range,
          local,
        });
      }

      case SyntaxKind.ExportDeclaration: {
        if (node.exportClause?.kind === SyntaxKind.NamedExports) {
          this.assertModuleSpecifier(node, true);
          return this.createNode<TSESTree.ExportNamedDeclaration>(
            node,
            this.#withDeprecatedAliasGetter(
              {
                type: AST_NODE_TYPES.ExportNamedDeclaration,
                attributes: this.convertImportAttributes(node),
                declaration: null,
                exportKind: node.isTypeOnly ? 'type' : 'value',
                source: this.convertChild(node.moduleSpecifier),
                specifiers: this.convertChildren(
                  node.exportClause.elements,
                  node,
                ),
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
              type: AST_NODE_TYPES.ExportAllDeclaration,
              attributes: this.convertImportAttributes(node),
              exported:
                node.exportClause?.kind === SyntaxKind.NamespaceExport
                  ? this.convertChild(node.exportClause.name)
                  : null,
              exportKind: node.isTypeOnly ? 'type' : 'value',
              source: this.convertChild(node.moduleSpecifier),
            },
            'assertions',
            'attributes',
            true,
          ),
        );
      }

      case SyntaxKind.ExportSpecifier: {
        const local = node.propertyName ?? node.name;
        if (
          local.kind === SyntaxKind.StringLiteral &&
          parent.kind === SyntaxKind.ExportDeclaration &&
          parent.moduleSpecifier?.kind !== SyntaxKind.StringLiteral
        ) {
          this.#throwError(
            local,
            'A string literal cannot be used as a local exported binding without `from`.',
          );
        }
        return this.createNode<TSESTree.ExportSpecifier>(node, {
          type: AST_NODE_TYPES.ExportSpecifier,
          exported: this.convertChild(node.name),
          exportKind: node.isTypeOnly ? 'type' : 'value',
          local: this.convertChild(local),
        });
      }

      case SyntaxKind.ExportAssignment:
        if (node.isExportEquals) {
          return this.createNode<TSESTree.TSExportAssignment>(node, {
            type: AST_NODE_TYPES.TSExportAssignment,
            expression: this.convertChild(node.expression),
          });
        }
        return this.createNode<TSESTree.ExportDefaultDeclaration>(node, {
          type: AST_NODE_TYPES.ExportDefaultDeclaration,
          declaration: this.convertChild(node.expression),
          exportKind: 'value',
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
            this.#throwError(
              node.operand,
              'Invalid left-hand side expression in unary operation',
            );
          }
          return this.createNode<TSESTree.UpdateExpression>(node, {
            type: AST_NODE_TYPES.UpdateExpression,
            argument: this.convertChild(node.operand),
            operator,
            prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
          });
        }
        return this.createNode<TSESTree.UnaryExpression>(node, {
          type: AST_NODE_TYPES.UnaryExpression,
          argument: this.convertChild(node.operand),
          operator,
          prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
        });
      }

      case SyntaxKind.DeleteExpression:
        return this.createNode<TSESTree.UnaryExpression>(node, {
          type: AST_NODE_TYPES.UnaryExpression,
          argument: this.convertChild(node.expression),
          operator: 'delete',
          prefix: true,
        });

      case SyntaxKind.VoidExpression:
        return this.createNode<TSESTree.UnaryExpression>(node, {
          type: AST_NODE_TYPES.UnaryExpression,
          argument: this.convertChild(node.expression),
          operator: 'void',
          prefix: true,
        });

      case SyntaxKind.TypeOfExpression:
        return this.createNode<TSESTree.UnaryExpression>(node, {
          type: AST_NODE_TYPES.UnaryExpression,
          argument: this.convertChild(node.expression),
          operator: 'typeof',
          prefix: true,
        });

      case SyntaxKind.TypeOperator:
        return this.createNode<TSESTree.TSTypeOperator>(node, {
          type: AST_NODE_TYPES.TSTypeOperator,
          operator: getTextForTokenKind(node.operator),
          typeAnnotation: this.convertChild(node.type),
        });

      // Binary Operations

      case SyntaxKind.BinaryExpression: {
        if (
          node.operatorToken.kind !== SyntaxKind.InKeyword &&
          node.left.kind === SyntaxKind.PrivateIdentifier
        ) {
          this.#throwError(
            node.left,
            "Private identifiers cannot appear on the right-hand-side of an 'in' expression.",
          );
        } else if (node.right.kind === SyntaxKind.PrivateIdentifier) {
          this.#throwError(
            node.right,
            "Private identifiers are only allowed on the left-hand-side of an 'in' expression.",
          );
        }

        // TypeScript uses BinaryExpression for sequences as well
        if (isComma(node.operatorToken)) {
          const result = this.createNode<TSESTree.SequenceExpression>(node, {
            type: AST_NODE_TYPES.SequenceExpression,
            expressions: [],
          });

          const left = this.convertChild(node.left) as TSESTree.Expression;
          if (
            left.type === AST_NODE_TYPES.SequenceExpression &&
            node.left.kind !== SyntaxKind.ParenthesizedExpression
          ) {
            result.expressions.push(...left.expressions);
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
            type: AST_NODE_TYPES.AssignmentPattern,
            decorators: [],
            left: this.convertPattern(node.left, node),
            optional: false,
            right: this.convertChild(node.right),
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
          type: AST_NODE_TYPES.MemberExpression,
          computed,
          object,
          optional: node.questionDotToken != null,
          property,
        });

        return this.convertChainExpression(result, node);
      }

      case SyntaxKind.ElementAccessExpression: {
        const object = this.convertChild(node.expression);
        const property = this.convertChild(node.argumentExpression);
        const computed = true;

        const result = this.createNode<TSESTree.MemberExpression>(node, {
          type: AST_NODE_TYPES.MemberExpression,
          computed,
          object,
          optional: node.questionDotToken != null,
          property,
        });

        return this.convertChainExpression(result, node);
      }

      case SyntaxKind.CallExpression: {
        if (node.expression.kind === SyntaxKind.ImportKeyword) {
          if (node.arguments.length !== 1 && node.arguments.length !== 2) {
            this.#throwError(
              node.arguments[2] ?? node,
              'Dynamic import requires exactly one or two arguments.',
            );
          }
          return this.createNode<TSESTree.ImportExpression>(
            node,
            this.#withDeprecatedAliasGetter(
              {
                type: AST_NODE_TYPES.ImportExpression,
                options: node.arguments[1]
                  ? this.convertChild(node.arguments[1])
                  : null,
                source: this.convertChild(node.arguments[0]),
              },
              'attributes',
              'options',
              true,
            ),
          );
        }

        const callee = this.convertChild(node.expression);
        const args = this.convertChildren(node.arguments);
        const typeArguments =
          node.typeArguments &&
          this.convertTypeArgumentsToTypeParameterInstantiation(
            node.typeArguments,
            node,
          );

        const result = this.createNode<TSESTree.CallExpression>(node, {
          type: AST_NODE_TYPES.CallExpression,
          arguments: args,
          callee,
          optional: node.questionDotToken != null,
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
          type: AST_NODE_TYPES.NewExpression,
          arguments: this.convertChildren(node.arguments ?? []),
          callee: this.convertChild(node.expression),
          typeArguments,
        });
      }

      case SyntaxKind.ConditionalExpression:
        return this.createNode<TSESTree.ConditionalExpression>(node, {
          type: AST_NODE_TYPES.ConditionalExpression,
          alternate: this.convertChild(node.whenFalse),
          consequent: this.convertChild(node.whenTrue),
          test: this.convertChild(node.condition),
        });

      case SyntaxKind.MetaProperty: {
        return this.createNode<TSESTree.MetaProperty>(node, {
          type: AST_NODE_TYPES.MetaProperty,
          meta: this.createNode<TSESTree.Identifier>(
            // TODO: do we really want to convert it to Token?
            node.getFirstToken()!,
            {
              type: AST_NODE_TYPES.Identifier,
              decorators: [],
              name: getTextForTokenKind(node.keywordToken),
              optional: false,
              typeAnnotation: undefined,
            },
          ),
          property: this.convertChild(node.name),
        });
      }

      case SyntaxKind.Decorator: {
        return this.createNode<TSESTree.Decorator>(node, {
          type: AST_NODE_TYPES.Decorator,
          expression: this.convertChild(node.expression),
        });
      }

      // Literals

      case SyntaxKind.StringLiteral: {
        return this.createNode<TSESTree.StringLiteral>(node, {
          type: AST_NODE_TYPES.Literal,
          raw: node.getText(),
          value:
            parent.kind === SyntaxKind.JsxAttribute
              ? unescapeStringLiteralText(node.text)
              : node.text,
        });
      }

      case SyntaxKind.NumericLiteral: {
        return this.createNode<TSESTree.NumberLiteral>(node, {
          type: AST_NODE_TYPES.Literal,
          raw: node.getText(),
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
          type: AST_NODE_TYPES.Literal,
          range,
          bigint: value == null ? bigint : String(value),
          raw: rawValue,
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
          type: AST_NODE_TYPES.Literal,
          raw: node.text,
          regex: {
            flags,
            pattern,
          },
          value: regex,
        });
      }

      case SyntaxKind.TrueKeyword:
        return this.createNode<TSESTree.BooleanLiteral>(node, {
          type: AST_NODE_TYPES.Literal,
          raw: 'true',
          value: true,
        });

      case SyntaxKind.FalseKeyword:
        return this.createNode<TSESTree.BooleanLiteral>(node, {
          type: AST_NODE_TYPES.Literal,
          raw: 'false',
          value: false,
        });

      case SyntaxKind.NullKeyword: {
        return this.createNode<TSESTree.NullLiteral>(node, {
          type: AST_NODE_TYPES.Literal,
          raw: 'null',
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
          type: AST_NODE_TYPES.JSXElement,
          children: this.convertChildren(node.children),
          closingElement: this.convertChild(node.closingElement),
          openingElement: this.convertChild(node.openingElement),
        });

      case SyntaxKind.JsxFragment:
        return this.createNode<TSESTree.JSXFragment>(node, {
          type: AST_NODE_TYPES.JSXFragment,
          children: this.convertChildren(node.children),
          closingFragment: this.convertChild(node.closingFragment),
          openingFragment: this.convertChild(node.openingFragment),
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
            type: AST_NODE_TYPES.JSXOpeningElement,
            range: getRange(node, this.ast),
            attributes: this.convertChildren(node.attributes.properties),
            name: this.convertJSXTagName(node.tagName, node),
            selfClosing: true,
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
          type: AST_NODE_TYPES.JSXOpeningElement,
          attributes: this.convertChildren(node.attributes.properties),
          name: this.convertJSXTagName(node.tagName, node),
          selfClosing: false,
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
          type: AST_NODE_TYPES.JSXClosingElement,
          name: this.convertJSXTagName(node.tagName, node),
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
              type: AST_NODE_TYPES.JSXEmptyExpression,
              range: [node.getStart(this.ast) + 1, node.getEnd() - 1],
            });

        if (node.dotDotDotToken) {
          return this.createNode<TSESTree.JSXSpreadChild>(node, {
            type: AST_NODE_TYPES.JSXSpreadChild,
            expression,
          });
        }
        return this.createNode<TSESTree.JSXExpressionContainer>(node, {
          type: AST_NODE_TYPES.JSXExpressionContainer,
          expression,
        });
      }

      case SyntaxKind.JsxAttribute: {
        return this.createNode<TSESTree.JSXAttribute>(node, {
          type: AST_NODE_TYPES.JSXAttribute,
          name: this.convertJSXNamespaceOrIdentifier(node.name),
          value: this.convertChild(node.initializer),
        });
      }

      case SyntaxKind.JsxText: {
        const start = node.getFullStart();
        const end = node.getEnd();
        const text = this.ast.text.slice(start, end);

        return this.createNode<TSESTree.JSXText>(node, {
          type: AST_NODE_TYPES.JSXText,
          range: [start, end],
          raw: text,
          value: unescapeStringLiteralText(text),
        });
      }

      case SyntaxKind.JsxSpreadAttribute:
        return this.createNode<TSESTree.JSXSpreadAttribute>(node, {
          type: AST_NODE_TYPES.JSXSpreadAttribute,
          argument: this.convertChild(node.expression),
        });

      case SyntaxKind.QualifiedName: {
        return this.createNode<TSESTree.TSQualifiedName>(node, {
          type: AST_NODE_TYPES.TSQualifiedName,
          left: this.convertChild(node.left),
          right: this.convertChild(node.right),
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
          type: AST_NODE_TYPES.TSTypeParameter,
          const: hasModifier(SyntaxKind.ConstKeyword, node),
          constraint: node.constraint && this.convertChild(node.constraint),
          default: node.default ? this.convertChild(node.default) : undefined,
          in: hasModifier(SyntaxKind.InKeyword, node),
          name: this.convertChild(node.name),
          out: hasModifier(SyntaxKind.OutKeyword, node),
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
          type: AST_NODE_TYPES.TSNonNullExpression,
          expression: this.convertChild(node.expression),
        });

        return this.convertChainExpression(nnExpr, node);
      }

      case SyntaxKind.TypeLiteral: {
        return this.createNode<TSESTree.TSTypeLiteral>(node, {
          type: AST_NODE_TYPES.TSTypeLiteral,
          members: this.convertChildren(node.members),
        });
      }

      case SyntaxKind.ArrayType: {
        return this.createNode<TSESTree.TSArrayType>(node, {
          type: AST_NODE_TYPES.TSArrayType,
          elementType: this.convertChild(node.elementType),
        });
      }

      case SyntaxKind.IndexedAccessType: {
        return this.createNode<TSESTree.TSIndexedAccessType>(node, {
          type: AST_NODE_TYPES.TSIndexedAccessType,
          indexType: this.convertChild(node.indexType),
          objectType: this.convertChild(node.objectType),
        });
      }

      case SyntaxKind.ConditionalType: {
        return this.createNode<TSESTree.TSConditionalType>(node, {
          type: AST_NODE_TYPES.TSConditionalType,
          checkType: this.convertChild(node.checkType),
          extendsType: this.convertChild(node.extendsType),
          falseType: this.convertChild(node.falseType),
          trueType: this.convertChild(node.trueType),
        });
      }

      case SyntaxKind.TypeQuery:
        return this.createNode<TSESTree.TSTypeQuery>(node, {
          type: AST_NODE_TYPES.TSTypeQuery,
          exprName: this.convertChild(node.exprName),
          typeArguments:
            node.typeArguments &&
            this.convertTypeArgumentsToTypeParameterInstantiation(
              node.typeArguments,
              node,
            ),
        });

      case SyntaxKind.MappedType: {
        if (node.members && node.members.length > 0) {
          this.#throwError(
            node.members[0],
            'A mapped type may not declare properties or methods.',
          );
        }

        return this.createNode<TSESTree.TSMappedType>(
          node,
          this.#withDeprecatedGetter(
            {
              type: AST_NODE_TYPES.TSMappedType,
              constraint: this.convertChild(node.typeParameter.constraint),
              key: this.convertChild(node.typeParameter.name),
              nameType: this.convertChild(node.nameType) ?? null,
              optional: node.questionToken
                ? node.questionToken.kind === SyntaxKind.QuestionToken ||
                  getTextForTokenKind(node.questionToken.kind)
                : false,
              readonly: node.readonlyToken
                ? node.readonlyToken.kind === SyntaxKind.ReadonlyKeyword ||
                  getTextForTokenKind(node.readonlyToken.kind)
                : undefined,
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
          type: AST_NODE_TYPES.TSTypeAliasDeclaration,
          declare: hasModifier(SyntaxKind.DeclareKeyword, node),
          id: this.convertChild(node.name),
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const { initializer } = node;
        if (initializer) {
          this.#throwError(
            initializer,
            'A property signature cannot have an initializer.',
          );
        }

        return this.createNode<TSESTree.TSPropertySignature>(node, {
          type: AST_NODE_TYPES.TSPropertySignature,
          accessibility: getTSNodeAccessibility(node),
          computed: isComputedProperty(node.name),
          key: this.convertChild(node.name),
          optional: isOptional(node),
          readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node),
          static: hasModifier(SyntaxKind.StaticKeyword, node),
          typeAnnotation:
            node.type && this.convertTypeAnnotation(node.type, node),
        });
      }

      case SyntaxKind.IndexSignature: {
        return this.createNode<TSESTree.TSIndexSignature>(node, {
          type: AST_NODE_TYPES.TSIndexSignature,
          accessibility: getTSNodeAccessibility(node),
          parameters: this.convertChildren(node.parameters),
          readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node),
          static: hasModifier(SyntaxKind.StaticKeyword, node),
          typeAnnotation:
            node.type && this.convertTypeAnnotation(node.type, node),
        });
      }

      case SyntaxKind.ConstructorType: {
        return this.createNode<TSESTree.TSConstructorType>(node, {
          type: AST_NODE_TYPES.TSConstructorType,
          abstract: hasModifier(SyntaxKind.AbstractKeyword, node),
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
          typeParameters:
            node.typeParameters &&
            this.convertTSTypeParametersToTypeParametersDeclaration(
              node.typeParameters,
            ),
        });
      }

      case SyntaxKind.FunctionType: {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
          type,
          params: this.convertParameters(node.parameters),
          returnType: node.type && this.convertTypeAnnotation(node.type, node),
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
          type,
          expression: this.convertChild(node.expression),
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

        let seenExtendsClause = false;
        for (const heritageClause of interfaceHeritageClauses) {
          if (heritageClause.token !== SyntaxKind.ExtendsKeyword) {
            this.#throwError(
              heritageClause,
              heritageClause.token === SyntaxKind.ImplementsKeyword
                ? "Interface declaration cannot have 'implements' clause."
                : 'Unexpected token.',
            );
          }
          if (seenExtendsClause) {
            this.#throwError(heritageClause, "'extends' clause already seen.");
          }
          seenExtendsClause = true;

          for (const heritageType of heritageClause.types) {
            if (
              !isEntityNameExpression(heritageType.expression) ||
              ts.isOptionalChain(heritageType.expression)
            ) {
              this.#throwError(
                heritageType,
                'Interface declaration can only extend an identifier/qualified name with optional type arguments.',
              );
            }
            interfaceExtends.push(
              this.convertChild(
                heritageType,
                node,
              ) as TSESTree.TSInterfaceHeritage,
            );
          }
        }

        const result = this.createNode<TSESTree.TSInterfaceDeclaration>(node, {
          type: AST_NODE_TYPES.TSInterfaceDeclaration,
          body: this.createNode<TSESTree.TSInterfaceBody>(node, {
            type: AST_NODE_TYPES.TSInterfaceBody,
            range: [node.members.pos - 1, node.end],
            body: this.convertChildren(node.members),
          }),
          declare: hasModifier(SyntaxKind.DeclareKeyword, node),
          extends: interfaceExtends,
          id: this.convertChild(node.name),
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
          type: AST_NODE_TYPES.TSTypePredicate,
          asserts: node.assertsModifier != null,
          parameterName: this.convertChild(node.parameterName),
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

        let options = null;
        if (node.attributes) {
          const value = this.createNode<TSESTree.ObjectExpression>(
            node.attributes,
            {
              type: AST_NODE_TYPES.ObjectExpression,
              properties: node.attributes.elements.map(importAttribute =>
                this.createNode<TSESTree.Property>(importAttribute, {
                  type: AST_NODE_TYPES.Property,
                  computed: false,
                  key: this.convertChild(importAttribute.name),
                  kind: 'init',
                  method: false,
                  optional: false,
                  shorthand: false,
                  value: this.convertChild(importAttribute.value),
                }),
              ),
            },
          );

          const commaToken = findNextToken(node.argument, node, this.ast)!;
          const openBraceToken = findNextToken(commaToken, node, this.ast)!;
          const tokenAfterAttributes = findNextToken(
            node.attributes,
            node,
            this.ast,
          )!;
          // Since TS 5.9, there could be a trailing comma, i.e. `{ with: { ... }, }`
          const closeBraceToken =
            tokenAfterAttributes.kind === ts.SyntaxKind.CommaToken
              ? findNextToken(tokenAfterAttributes, node, this.ast)!
              : tokenAfterAttributes;
          const withOrAssertToken = findNextToken(
            openBraceToken,
            node,
            this.ast,
          )!;
          const withOrAssertTokenRange = getRange(withOrAssertToken, this.ast);
          const withOrAssertName =
            withOrAssertToken.kind === ts.SyntaxKind.AssertKeyword
              ? 'assert'
              : 'with';

          options = this.createNode<TSESTree.ObjectExpression>(node, {
            type: AST_NODE_TYPES.ObjectExpression,
            range: [openBraceToken.getStart(this.ast), closeBraceToken.end],
            properties: [
              this.createNode<TSESTree.Property>(node, {
                type: AST_NODE_TYPES.Property,
                range: [withOrAssertTokenRange[0], node.attributes.end],
                computed: false,
                key: this.createNode<TSESTree.Identifier>(node, {
                  type: AST_NODE_TYPES.Identifier,
                  range: withOrAssertTokenRange,
                  decorators: [],
                  name: withOrAssertName,
                  optional: false,
                  typeAnnotation: undefined,
                }),
                kind: 'init',
                method: false,
                optional: false,
                shorthand: false,
                value,
              }),
            ],
          });
        }

        const argument = this.convertChild(node.argument);
        const source = argument.literal;

        const result = this.createNode<TSESTree.TSImportType>(
          node,
          this.#withDeprecatedGetter(
            {
              type: AST_NODE_TYPES.TSImportType,
              range,
              options,
              qualifier: this.convertChild(node.qualifier),
              source,
              typeArguments: node.typeArguments
                ? this.convertTypeArgumentsToTypeParameterInstantiation(
                    node.typeArguments,
                    node,
                  )
                : null,
            },
            'argument',
            'source',
            argument,
          ),
        );

        if (node.isTypeOf) {
          return this.createNode<TSESTree.TSTypeQuery>(node, {
            type: AST_NODE_TYPES.TSTypeQuery,
            exprName: result,
            typeArguments: undefined,
          });
        }
        return result;
      }

      case SyntaxKind.EnumDeclaration: {
        const members = this.convertChildren(node.members);
        const result = this.createNode<TSESTree.TSEnumDeclaration>(
          node,
          this.#withDeprecatedGetter(
            {
              type: AST_NODE_TYPES.TSEnumDeclaration,
              body: this.createNode<TSESTree.TSEnumBody>(node, {
                type: AST_NODE_TYPES.TSEnumBody,
                range: [node.members.pos - 1, node.end],
                members,
              }),
              const: hasModifier(SyntaxKind.ConstKeyword, node),
              declare: hasModifier(SyntaxKind.DeclareKeyword, node),
              id: this.convertChild(node.name),
            },
            'members',
            `'body.members'`,
            this.convertChildren(node.members),
          ),
        );

        return this.fixExports(node, result);
      }

      case SyntaxKind.EnumMember: {
        const computed = node.name.kind === ts.SyntaxKind.ComputedPropertyName;
        if (computed) {
          this.#throwError(
            node.name,
            'Computed property names are not allowed in enums.',
          );
        }

        if (
          node.name.kind === SyntaxKind.NumericLiteral ||
          node.name.kind === SyntaxKind.BigIntLiteral
        ) {
          this.#throwError(
            node.name,
            'An enum member cannot have a numeric name.',
          );
        }

        return this.createNode<TSESTree.TSEnumMember>(
          node,
          this.#withDeprecatedGetter(
            {
              type: AST_NODE_TYPES.TSEnumMember,
              id: this.convertChild(node.name),
              initializer:
                node.initializer && this.convertChild(node.initializer),
            },
            'computed',
            undefined,
            computed,
          ),
        );
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
                this.#throwError(
                  node.body ?? node,
                  'Expected a valid module body',
                );
              }
              if (id.type !== AST_NODE_TYPES.Identifier) {
                this.#throwError(
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

            if (ts.isStringLiteral(node.name)) {
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
              this.#throwError(node, 'Expected a module body');
            }
            if (node.name.kind !== ts.SyntaxKind.Identifier) {
              this.#throwError(
                node.name,
                '`namespace`s must have an Identifier id',
              );
            }

            let name: TSESTree.Identifier | TSESTree.TSQualifiedName =
              this.createNode<TSESTree.Identifier>(node.name, {
                type: AST_NODE_TYPES.Identifier,
                range: [node.name.getStart(this.ast), node.name.getEnd()],
                decorators: [],
                name: node.name.text,
                optional: false,
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
                type: AST_NODE_TYPES.Identifier,
                range: [nextName.getStart(this.ast), nextName.getEnd()],
                decorators: [],
                name: nextName.text,
                optional: false,
                typeAnnotation: undefined,
              });

              name = this.createNode<TSESTree.TSQualifiedName>(nextName, {
                type: AST_NODE_TYPES.TSQualifiedName,
                range: [name.range[0], right.range[1]],
                left: name,
                right,
              });
            }

            return {
              body: this.convertChild(node.body),
              declare: false,
              global: false,
              id: name,
              kind:
                node.flags & ts.NodeFlags.Namespace ? 'namespace' : 'module',
            };
          })(),
        });

        result.declare = isDeclare;

        if (node.flags & ts.NodeFlags.GlobalAugmentation) {
          // eslint-disable-next-line @typescript-eslint/no-deprecated
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
          types: this.convertChildren(node.types),
        });
      }
      case SyntaxKind.IntersectionType: {
        return this.createNode<TSESTree.TSIntersectionType>(node, {
          type: AST_NODE_TYPES.TSIntersectionType,
          types: this.convertChildren(node.types),
        });
      }
      case SyntaxKind.AsExpression: {
        return this.createNode<TSESTree.TSAsExpression>(node, {
          type: AST_NODE_TYPES.TSAsExpression,
          expression: this.convertChild(node.expression),
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
          return this.createNode<TSESTree.TSNullKeyword>(node.literal, {
            type: AST_NODE_TYPES.TSNullKeyword,
          });
        }

        return this.createNode<TSESTree.TSLiteralType>(node, {
          type: AST_NODE_TYPES.TSLiteralType,
          literal: this.convertChild(node.literal),
        });
      }
      case SyntaxKind.TypeAssertionExpression: {
        return this.createNode<TSESTree.TSTypeAssertion>(node, {
          type: AST_NODE_TYPES.TSTypeAssertion,
          expression: this.convertChild(node.expression),
          typeAnnotation: this.convertChild(node.type),
        });
      }
      case SyntaxKind.ImportEqualsDeclaration: {
        return this.fixExports(
          node,
          this.createNode<TSESTree.TSImportEqualsDeclaration>(node, {
            type: AST_NODE_TYPES.TSImportEqualsDeclaration,
            id: this.convertChild(node.name),
            importKind: node.isTypeOnly ? 'type' : 'value',
            moduleReference: this.convertChild(node.moduleReference),
          }),
        );
      }
      case SyntaxKind.ExternalModuleReference: {
        if (node.expression.kind !== SyntaxKind.StringLiteral) {
          this.#throwError(node.expression, 'String literal expected.');
        }
        return this.createNode<TSESTree.TSExternalModuleReference>(node, {
          type: AST_NODE_TYPES.TSExternalModuleReference,
          expression: this.convertChild(node.expression),
        });
      }
      case SyntaxKind.NamespaceExportDeclaration: {
        return this.createNode<TSESTree.TSNamespaceExportDeclaration>(node, {
          type: AST_NODE_TYPES.TSNamespaceExportDeclaration,
          id: this.convertChild(node.name),
        });
      }
      case SyntaxKind.AbstractKeyword: {
        return this.createNode<TSESTree.TSAbstractKeyword>(node, {
          type: AST_NODE_TYPES.TSAbstractKeyword,
        });
      }

      // Tuple
      case SyntaxKind.TupleType: {
        const elementTypes = this.convertChildren(node.elements);

        return this.createNode<TSESTree.TSTupleType>(node, {
          type: AST_NODE_TYPES.TSTupleType,
          elementTypes,
        });
      }
      case SyntaxKind.NamedTupleMember: {
        const member = this.createNode<TSESTree.TSNamedTupleMember>(node, {
          type: AST_NODE_TYPES.TSNamedTupleMember,
          elementType: this.convertChild(node.type, node),
          label: this.convertChild(node.name, node),
          optional: node.questionToken != null,
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
          type: AST_NODE_TYPES.TSTemplateLiteralType,
          quasis: [this.convertChild(node.head)],
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
          type: AST_NODE_TYPES.StaticBlock,
          body: this.convertBodyExpressions(node.body.statements, node),
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      case SyntaxKind.AssertEntry:
      case SyntaxKind.ImportAttribute: {
        return this.createNode<TSESTree.ImportAttribute>(node, {
          type: AST_NODE_TYPES.ImportAttribute,
          key: this.convertChild(node.name),
          value: this.convertChild(node.value),
        });
      }

      case SyntaxKind.SatisfiesExpression: {
        return this.createNode<TSESTree.TSSatisfiesExpression>(node, {
          type: AST_NODE_TYPES.TSSatisfiesExpression,
          expression: this.convertChild(node.expression),
          typeAnnotation: this.convertChild(node.type),
        });
      }

      default:
        return this.deeplyCopy(node);
    }
  }

  private createNode<T extends TSESTree.Node = TSESTree.Node>(
    node: ts.Node,
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

  convertProgram(): TSESTree.Program {
    return this.converter(this.ast) as TSESTree.Program;
  }

  /**
   * For nodes that are copied directly from the TypeScript AST into
   * ESTree mostly as-is. The only difference is the addition of a type
   * property instead of a kind property. Recursively copies all children.
   */
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
      result.decorators = this.convertChildren(decorators);
    }

    // keys we never want to clone from the base typescript node as they
    // introduce garbage into our AST
    const KEYS_TO_NOT_COPY = new Set([
      '_children',
      'decorators',
      'end',
      'flags',
      'heritageClauses',
      'illegalDecorators',
      'jsDoc',
      'kind',
      'locals',
      'localSymbol',
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
          result[key] = this.convertChildren(value);
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
      ts.isModuleDeclaration(node) && !ts.isStringLiteral(node.name);

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
        return this.createNode<TSESTree.ExportDefaultDeclaration>(node, {
          type: AST_NODE_TYPES.ExportDefaultDeclaration,
          range: [exportKeyword.getStart(this.ast), result.range[1]],
          declaration: result as TSESTree.DefaultExportDeclarations,
          exportKind: 'value',
        });
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
            type: AST_NODE_TYPES.ExportNamedDeclaration,
            range: [exportKeyword.getStart(this.ast), result.range[1]],
            attributes: [],
            declaration: result,
            exportKind: isType || isDeclare ? 'type' : 'value',
            source: null,
            specifiers: [],
          },
          'assertions',
          'attributes',
          true,
        ),
      );
    }

    return result;
  }

  getASTMaps(): ASTMaps {
    return {
      esTreeNodeToTSNodeMap: this.esTreeNodeToTSNodeMap,
      tsNodeToESTreeNodeMap: this.tsNodeToESTreeNodeMap,
    };
  }

  /**
   * Register specific TypeScript node into map with first ESTree node provided
   */
  private registerTSNodeInNodeMap(
    node: ts.Node,
    result: TSESTree.Node | null,
  ): void {
    if (
      result &&
      this.options.shouldPreserveNodeMaps &&
      !this.tsNodeToESTreeNodeMap.has(node)
    ) {
      this.tsNodeToESTreeNodeMap.set(node, result);
    }
  }
}
