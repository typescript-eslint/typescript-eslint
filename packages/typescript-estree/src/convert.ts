/**
 * @fileoverview Converts TypeScript AST into ESTree format.
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import ts from 'typescript';
import * as es from './typedefs';
import {
  canContainDirective,
  createError,
  findNextToken,
  fixExports,
  getBinaryExpressionType,
  getDeclarationKind,
  getLastModifier,
  getLineAndCharacterFor,
  getLocFor,
  getRange,
  getTextForTokenKind,
  getTSNodeAccessibility,
  hasModifier,
  isComma,
  isComputedProperty,
  isESTreeClassMember,
  isOptional,
  unescapeStringLiteralText
} from './node-utils';
import { AST_NODE_TYPES } from './ast-node-types';
import { TSNode } from './ts-nodes';

const SyntaxKind = ts.SyntaxKind;

interface ConverterOptions {
  errorOnUnknownASTType: boolean;
  useJSXTextNode: boolean;
  shouldProvideParserServices: boolean;
}

/**
 * Extends and formats a given error object
 * @param error the error object
 * @returns converted error object
 */
export function convertError(error: any) {
  return createError(
    error.file,
    error.start,
    error.message || error.messageText
  );
}

export class Converter {
  private readonly ast: ts.SourceFile;
  private options: ConverterOptions;
  private esTreeNodeToTSNodeMap = new WeakMap();
  private tsNodeToESTreeNodeMap = new WeakMap();

  private allowPattern: boolean = false;
  private inTypeMode: boolean = false;

  /**
   * Converts a TypeScript node into an ESTree node
   * @param ast the full TypeScript AST
   * @param options additional options for the conversion
   * @returns the converted ESTreeNode
   */
  constructor(ast: ts.SourceFile, options: ConverterOptions) {
    this.ast = ast;
    this.options = options;
  }

  getASTMaps() {
    return {
      esTreeNodeToTSNodeMap: this.esTreeNodeToTSNodeMap,
      tsNodeToESTreeNodeMap: this.tsNodeToESTreeNodeMap
    };
  }

  convertProgram(): es.Program {
    return this.converter(this.ast) as es.Program;
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param node the child ts.Node
   * @param parent parentNode
   * @param inTypeMode flag to determine if we are in typeMode
   * @param allowPattern flag to determine if patterns are allowed
   * @returns the converted ESTree node
   */
  private converter(
    node?: ts.Node,
    parent?: ts.Node,
    inTypeMode?: boolean,
    allowPattern?: boolean
  ): any {
    /**
     * Exit early for null and undefined
     */
    if (!node) {
      return null;
    }

    const typeMode = this.inTypeMode;
    const pattern = this.allowPattern;
    if (inTypeMode !== undefined) {
      this.inTypeMode = inTypeMode;
    }
    if (allowPattern !== undefined) {
      this.allowPattern = allowPattern;
    }

    let result: es.BaseNode | null = this.convertNode(
      node as TSNode,
      parent || node.parent
    );

    if (result && this.options.shouldProvideParserServices) {
      this.tsNodeToESTreeNodeMap.set(node, result);
      this.esTreeNodeToTSNodeMap.set(result, node);
    }

    this.inTypeMode = typeMode;
    this.allowPattern = pattern;
    return result;
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param child the child ts.Node
   * @param parent parentNode
   * @returns the converted ESTree node
   */
  private convertPattern(child?: ts.Node, parent?: ts.Node): any | null {
    return this.converter(child, parent, this.inTypeMode, true);
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param child the child ts.Node
   * @param parent parentNode
   * @returns the converted ESTree node
   */
  private convertChild(child?: ts.Node, parent?: ts.Node): any | null {
    return this.converter(child, parent, this.inTypeMode, false);
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param child the child ts.Node
   * @param parent parentNode
   * @returns the converted ESTree node
   */
  private convertType(child?: ts.Node, parent?: ts.Node): any | null {
    return this.converter(child, parent, true, false);
  }

  private createNode<T extends es.BaseNode = es.BaseNode>(
    node: ts.Node,
    data: es.OptionalRangeAndLoc<T>
  ): T {
    const result = data;
    if (!result.range) {
      result.range = getRange(node, this.ast);
    }
    if (!result.loc) {
      result.loc = getLocFor(result.range[0], result.range[1], this.ast);
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
    parent: ts.Node
  ): es.TSTypeAnnotation {
    // in FunctionType and ConstructorType typeAnnotation has 2 characters `=>` and in other places is just colon
    const offset =
      parent.kind === SyntaxKind.FunctionType ||
      parent.kind === SyntaxKind.ConstructorType
        ? 2
        : 1;
    const annotationStartCol = child.getFullStart() - offset;

    const loc = getLocFor(annotationStartCol, child.end, this.ast);
    return {
      type: AST_NODE_TYPES.TSTypeAnnotation,
      loc,
      range: [annotationStartCol, child.end],
      typeAnnotation: this.convertType(child)
    };
  }

  /**
   * Coverts body Nodes and add directive field to StringLiterals
   * @param nodes of ts.Node
   * @param parent parentNode
   * @returns Array of body statements
   */
  private convertBodyExpressions(
    nodes: ts.NodeArray<ts.Statement>,
    parent: ts.Node
  ): any[] {
    let allowDirectives = canContainDirective(parent);

    return (
      nodes
        .map(statement => {
          const child = this.convertChild(statement);
          if (allowDirectives) {
            if (
              child &&
              child.expression &&
              ts.isExpressionStatement(statement) &&
              ts.isStringLiteral(statement.expression)
            ) {
              const raw = child.expression.raw;
              child.directive = raw.slice(1, -1);
              return child; // child can be null but it's filtered below
            } else {
              allowDirectives = false;
            }
          }
          return child; // child can be null but it's filtered below
        })
        // filter out unknown nodes for now
        .filter(statement => statement)
    );
  }

  /**
   * Converts a ts.Node's typeArguments to TSTypeParameterInstantiation node
   * @param typeArguments ts.Node typeArguments
   * @returns TypeParameterInstantiation node
   */
  private convertTypeArgumentsToTypeParameters(
    typeArguments: ts.NodeArray<ts.TypeNode>
  ): es.TSTypeParameterInstantiation {
    const greaterThanToken = findNextToken(typeArguments, this.ast, this.ast)!;

    return {
      type: AST_NODE_TYPES.TSTypeParameterInstantiation,
      range: [typeArguments.pos - 1, greaterThanToken.end],
      loc: getLocFor(typeArguments.pos - 1, greaterThanToken.end, this.ast),
      params: typeArguments.map(typeArgument => this.convertType(typeArgument))
    };
  }

  /**
   * Converts a ts.Node's typeParameters to TSTypeParameterDeclaration node
   * @param typeParameters ts.Node typeParameters
   * @returns TypeParameterDeclaration node
   */
  private convertTSTypeParametersToTypeParametersDeclaration(
    typeParameters: ts.NodeArray<ts.TypeParameterDeclaration>
  ): es.TSTypeParameterDeclaration {
    const greaterThanToken = findNextToken(typeParameters, this.ast, this.ast)!;

    return {
      type: AST_NODE_TYPES.TSTypeParameterDeclaration,
      range: [typeParameters.pos - 1, greaterThanToken.end],
      loc: getLocFor(typeParameters.pos - 1, greaterThanToken.end, this.ast),
      params: typeParameters.map(typeParameter =>
        this.convertType(typeParameter)
      )
    };
  }

  /**
   * Converts an array of ts.Node parameters into an array of ESTreeNode params
   * @param parameters An array of ts.Node params to be converted
   * @returns an array of converted ESTreeNode params
   */
  private convertParameters(
    parameters: ts.NodeArray<ts.ParameterDeclaration>
  ): (es.TSParameterProperty | es.RestElement | es.AssignmentPattern)[] {
    if (!parameters || !parameters.length) {
      return [];
    }
    return parameters.map(param => {
      const convertedParam = this.convertChild(param);
      if (!param.decorators || !param.decorators.length) {
        return convertedParam;
      }
      return Object.assign(convertedParam, {
        decorators: param.decorators.map(el => this.convertChild(el))
      });
    });
  }

  /**
   * For nodes that are copied directly from the TypeScript AST into
   * ESTree mostly as-is. The only difference is the addition of a type
   * property instead of a kind property. Recursively copies all children.
   */
  private deeplyCopy(node: ts.Node): any {
    const customType = `TS${SyntaxKind[node.kind]}` as AST_NODE_TYPES;
    /**
     * If the "errorOnUnknownASTType" option is set to true, throw an error,
     * otherwise fallback to just including the unknown type as-is.
     */
    if (this.options.errorOnUnknownASTType && !AST_NODE_TYPES[customType]) {
      throw new Error(`Unknown AST_NODE_TYPE: "${customType}"`);
    }
    const result = this.createNode<any>(node, {
      type: customType
    });

    Object.keys(node)
      .filter(
        key =>
          !/^(?:_children|kind|parent|pos|end|flags|modifierFlagsCache|jsDoc)$/.test(
            key
          )
      )
      .forEach(key => {
        if (key === 'type') {
          result.typeAnnotation = (node as any).type
            ? this.convertTypeAnnotation((node as any).type, node)
            : null;
        } else if (key === 'typeArguments') {
          result.typeParameters = (node as any).typeArguments
            ? this.convertTypeArgumentsToTypeParameters(
                (node as any).typeArguments
              )
            : null;
        } else if (key === 'typeParameters') {
          result.typeParameters = (node as any).typeParameters
            ? this.convertTSTypeParametersToTypeParametersDeclaration(
                (node as any).typeParameters
              )
            : null;
        } else if (key === 'decorators') {
          if (node.decorators && node.decorators.length) {
            result.decorators = node.decorators.map((el: any) =>
              this.convertChild(el)
            );
          }
        } else {
          if (Array.isArray((node as any)[key])) {
            result[key] = (node as any)[key].map((el: any) =>
              this.convertChild(el)
            );
          } else if (
            (node as any)[key] &&
            typeof (node as any)[key] === 'object' &&
            (node as any)[key].kind
          ) {
            // need to check node[key].kind to ensure we don't try to convert a symbol
            result[key] = this.convertChild((node as any)[key]);
          } else {
            result[key] = (node as any)[key];
          }
        }
      });
    return result;
  }

  /**
   * Converts a TypeScript JSX node.tagName into an ESTree node.name
   * @param node the tagName object from a JSX ts.Node
   * @param parent
   * @returns the converted ESTree name object
   */
  private convertJSXTagName(
    node: ts.JsxTagNameExpression,
    parent: ts.Node
  ): es.JSXMemberExpression | es.JSXIdentifier {
    let result: es.JSXMemberExpression | es.JSXIdentifier;
    switch (node.kind) {
      case SyntaxKind.PropertyAccessExpression:
        result = this.createNode<es.JSXMemberExpression>(node, {
          type: AST_NODE_TYPES.JSXMemberExpression,
          object: this.convertJSXTagName(node.expression, parent),
          property: this.convertJSXTagName(
            node.name,
            parent
          ) as es.JSXIdentifier
        });
        break;
      case SyntaxKind.ThisKeyword:
        result = this.createNode<es.JSXIdentifier>(node, {
          type: AST_NODE_TYPES.JSXIdentifier,
          name: 'this'
        });
        break;
      case SyntaxKind.Identifier:
      default:
        result = this.createNode<es.JSXIdentifier>(node, {
          type: AST_NODE_TYPES.JSXIdentifier,
          name: node.text
        });
        break;
    }

    if (result && this.options.shouldProvideParserServices) {
      this.tsNodeToESTreeNodeMap.set(node, result);
      this.esTreeNodeToTSNodeMap.set(result, node);
    }

    return result;
  }

  /**
   * Applies the given TS modifiers to the given result object.
   * @param result
   * @param modifiers original ts.Nodes from the node.modifiers array
   * @returns the current result object will be mutated
   * @deprecated This method adds not standardized `modifiers` property in nodes
   */
  private applyModifiersToResult(
    result: es.TSEnumDeclaration | es.TSModuleDeclaration,
    modifiers?: ts.ModifiersArray
  ): void {
    if (!modifiers || !modifiers.length) {
      return;
    }
    /**
     * Some modifiers are explicitly handled by applying them as
     * boolean values on the result node. As well as adding them
     * to the result, we remove them from the array, so that they
     * are not handled twice.
     */
    const handledModifierIndices: { [key: number]: boolean } = {};
    for (let i = 0; i < modifiers.length; i++) {
      const modifier = modifiers[i];
      switch (modifier.kind) {
        /**
         * Ignore ExportKeyword and DefaultKeyword, they are handled
         * via the fixExports utility function
         */
        case SyntaxKind.ExportKeyword:
        case SyntaxKind.DefaultKeyword:
          handledModifierIndices[i] = true;
          break;
        case SyntaxKind.ConstKeyword:
          (result as any).const = true;
          handledModifierIndices[i] = true;
          break;
        case SyntaxKind.DeclareKeyword:
          result.declare = true;
          handledModifierIndices[i] = true;
          break;
        default:
      }
    }
    /**
     * If there are still valid modifiers available which have
     * not been explicitly handled above, we just convert and
     * add the modifiers array to the result node.
     */
    const remainingModifiers = modifiers.filter(
      (_, i) => !handledModifierIndices[i]
    );
    if (!remainingModifiers || !remainingModifiers.length) {
      return;
    }
    result.modifiers = remainingModifiers.map(el => this.convertChild(el));
  }

  /**
   * Uses the provided range location to adjust the location data of the given Node
   * @param result The node that will have its location data mutated
   * @param childRange The child node range used to expand location
   */
  private fixParentLocation(
    result: es.BaseNode,
    childRange: [number, number]
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
   * @param node the child ts.Node
   * @param parent parentNode
   * @returns the converted ESTree node
   */
  private convertNode(node: TSNode, parent: ts.Node): es.Node | null {
    switch (node.kind) {
      case SyntaxKind.SourceFile: {
        return this.createNode<es.Program>(node, {
          type: AST_NODE_TYPES.Program,
          body: this.convertBodyExpressions(node.statements, node),
          // externalModuleIndicator is internal field in TSC
          sourceType: (node as any).externalModuleIndicator
            ? 'module'
            : 'script',
          range: [node.getStart(this.ast), node.endOfFileToken.end]
        });
      }

      case SyntaxKind.Block: {
        return this.createNode<es.BlockStatement>(node, {
          type: AST_NODE_TYPES.BlockStatement,
          body: this.convertBodyExpressions(node.statements, node)
        });
      }

      case SyntaxKind.Identifier: {
        return this.createNode<es.Identifier>(node, {
          type: AST_NODE_TYPES.Identifier,
          name: node.text
        });
      }

      case SyntaxKind.WithStatement:
        return this.createNode<es.WithStatement>(node, {
          type: AST_NODE_TYPES.WithStatement,
          object: this.convertChild(node.expression),
          body: this.convertChild(node.statement)
        });

      // Control Flow

      case SyntaxKind.ReturnStatement:
        return this.createNode<es.ReturnStatement>(node, {
          type: AST_NODE_TYPES.ReturnStatement,
          argument: this.convertChild(node.expression)
        });

      case SyntaxKind.LabeledStatement:
        return this.createNode<es.LabeledStatement>(node, {
          type: AST_NODE_TYPES.LabeledStatement,
          label: this.convertChild(node.label),
          body: this.convertChild(node.statement)
        });

      case SyntaxKind.ContinueStatement:
        return this.createNode<es.ContinueStatement>(node, {
          type: AST_NODE_TYPES.ContinueStatement,
          label: this.convertChild(node.label)
        });

      case SyntaxKind.BreakStatement:
        return this.createNode<es.BreakStatement>(node, {
          type: AST_NODE_TYPES.BreakStatement,
          label: this.convertChild(node.label)
        });

      // Choice

      case SyntaxKind.IfStatement:
        return this.createNode<es.IfStatement>(node, {
          type: AST_NODE_TYPES.IfStatement,
          test: this.convertChild(node.expression),
          consequent: this.convertChild(node.thenStatement),
          alternate: this.convertChild(node.elseStatement)
        });

      case SyntaxKind.SwitchStatement:
        return this.createNode<es.SwitchStatement>(node, {
          type: AST_NODE_TYPES.SwitchStatement,
          discriminant: this.convertChild(node.expression),
          cases: node.caseBlock.clauses.map(el => this.convertChild(el))
        });

      case SyntaxKind.CaseClause:
      case SyntaxKind.DefaultClause:
        return this.createNode<es.SwitchCase>(node, {
          type: AST_NODE_TYPES.SwitchCase,
          // expression is present in case only
          test:
            node.kind === SyntaxKind.CaseClause
              ? this.convertChild(node.expression)
              : null,
          consequent: node.statements.map(el => this.convertChild(el))
        });

      // Exceptions

      case SyntaxKind.ThrowStatement:
        return this.createNode<es.ThrowStatement>(node, {
          type: AST_NODE_TYPES.ThrowStatement,
          argument: this.convertChild(node.expression)
        });

      case SyntaxKind.TryStatement:
        return this.createNode<es.TryStatement>(node, {
          type: AST_NODE_TYPES.TryStatement,
          block: this.convertChild(node.tryBlock),
          handler: this.convertChild(node.catchClause),
          finalizer: this.convertChild(node.finallyBlock)
        });

      case SyntaxKind.CatchClause:
        return this.createNode<es.CatchClause>(node, {
          type: AST_NODE_TYPES.CatchClause,
          param: node.variableDeclaration
            ? this.convertChild(node.variableDeclaration.name)
            : null,
          body: this.convertChild(node.block)
        });

      // Loops

      case SyntaxKind.WhileStatement:
        return this.createNode<es.WhileStatement>(node, {
          type: AST_NODE_TYPES.WhileStatement,
          test: this.convertChild(node.expression),
          body: this.convertChild(node.statement)
        });

      /**
       * Unlike other parsers, TypeScript calls a "DoWhileStatement"
       * a "DoStatement"
       */
      case SyntaxKind.DoStatement:
        return this.createNode<es.DoWhileStatement>(node, {
          type: AST_NODE_TYPES.DoWhileStatement,
          test: this.convertChild(node.expression),
          body: this.convertChild(node.statement)
        });

      case SyntaxKind.ForStatement:
        return this.createNode<es.ForStatement>(node, {
          type: AST_NODE_TYPES.ForStatement,
          init: this.convertChild(node.initializer),
          test: this.convertChild(node.condition),
          update: this.convertChild(node.incrementor),
          body: this.convertChild(node.statement)
        });

      case SyntaxKind.ForInStatement:
        return this.createNode<es.ForInStatement>(node, {
          type: AST_NODE_TYPES.ForInStatement,
          left: this.convertPattern(node.initializer),
          right: this.convertChild(node.expression),
          body: this.convertChild(node.statement)
        });

      case SyntaxKind.ForOfStatement:
        return this.createNode<es.ForOfStatement>(node, {
          type: AST_NODE_TYPES.ForOfStatement,
          left: this.convertPattern(node.initializer),
          right: this.convertChild(node.expression),
          body: this.convertChild(node.statement),
          await: Boolean(
            node.awaitModifier &&
              node.awaitModifier.kind === SyntaxKind.AwaitKeyword
          )
        });

      // Declarations

      case SyntaxKind.FunctionDeclaration: {
        const isDeclare = hasModifier(SyntaxKind.DeclareKeyword, node);

        const result = this.createNode<
          es.TSDeclareFunction | es.FunctionDeclaration
        >(node, {
          type:
            isDeclare || !node.body
              ? AST_NODE_TYPES.TSDeclareFunction
              : AST_NODE_TYPES.FunctionDeclaration,
          id: this.convertChild(node.name),
          generator: !!node.asteriskToken,
          expression: false,
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          params: this.convertParameters(node.parameters),
          body: this.convertChild(node.body) || undefined
        });

        // Process returnType
        if (node.type) {
          result.returnType = this.convertTypeAnnotation(node.type, node);
        }

        if (isDeclare) {
          result.declare = true;
        }

        // Process typeParameters
        if (node.typeParameters && node.typeParameters.length) {
          result.typeParameters = this.convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
        }

        // check for exports
        return fixExports(node, result, this.ast);
      }

      case SyntaxKind.VariableDeclaration: {
        const result = this.createNode<es.VariableDeclarator>(node, {
          type: AST_NODE_TYPES.VariableDeclarator,
          id: this.convertPattern(node.name),
          init: this.convertChild(node.initializer)
        });

        if (node.exclamationToken) {
          result.definite = true;
        }

        if (node.type) {
          result.id.typeAnnotation = this.convertTypeAnnotation(
            node.type,
            node
          );
          this.fixParentLocation(result.id, result.id.typeAnnotation.range);
        }
        return result;
      }

      case SyntaxKind.VariableStatement: {
        const result = this.createNode<es.VariableDeclaration>(node, {
          type: AST_NODE_TYPES.VariableDeclaration,
          declarations: node.declarationList.declarations.map(el =>
            this.convertChild(el)
          ),
          kind: getDeclarationKind(node.declarationList)
        });

        if (hasModifier(SyntaxKind.DeclareKeyword, node)) {
          result.declare = true;
        }

        // check for exports
        return fixExports(node, result, this.ast);
      }

      // mostly for for-of, for-in
      case SyntaxKind.VariableDeclarationList:
        return this.createNode<es.VariableDeclaration>(node, {
          type: AST_NODE_TYPES.VariableDeclaration,
          declarations: node.declarations.map(el => this.convertChild(el)),
          kind: getDeclarationKind(node)
        });

      // Expressions

      case SyntaxKind.ExpressionStatement:
        return this.createNode<es.ExpressionStatement>(node, {
          type: AST_NODE_TYPES.ExpressionStatement,
          expression: this.convertChild(node.expression)
        });

      case SyntaxKind.ThisKeyword:
        return this.createNode<es.ThisExpression>(node, {
          type: AST_NODE_TYPES.ThisExpression
        });

      case SyntaxKind.ArrayLiteralExpression: {
        // TypeScript uses ArrayLiteralExpression in destructuring assignment, too
        if (this.allowPattern) {
          return this.createNode<es.ArrayPattern>(node, {
            type: AST_NODE_TYPES.ArrayPattern,
            elements: node.elements.map(el => this.convertPattern(el))
          });
        } else {
          return this.createNode<es.ArrayExpression>(node, {
            type: AST_NODE_TYPES.ArrayExpression,
            elements: node.elements.map(el => this.convertChild(el))
          });
        }
      }

      case SyntaxKind.ObjectLiteralExpression: {
        // TypeScript uses ObjectLiteralExpression in destructuring assignment, too
        if (this.allowPattern) {
          return this.createNode<es.ObjectPattern>(node, {
            type: AST_NODE_TYPES.ObjectPattern,
            properties: node.properties.map(el => this.convertPattern(el))
          });
        } else {
          return this.createNode<es.ObjectExpression>(node, {
            type: AST_NODE_TYPES.ObjectExpression,
            properties: node.properties.map(el => this.convertChild(el))
          });
        }
      }

      case SyntaxKind.PropertyAssignment:
        return this.createNode<es.Property>(node, {
          type: AST_NODE_TYPES.Property,
          key: this.convertChild(node.name),
          value: this.converter(
            node.initializer,
            node,
            this.inTypeMode,
            this.allowPattern
          ),
          computed: isComputedProperty(node.name),
          method: false,
          shorthand: false,
          kind: 'init'
        });

      case SyntaxKind.ShorthandPropertyAssignment: {
        if (node.objectAssignmentInitializer) {
          return this.createNode<es.Property>(node, {
            type: AST_NODE_TYPES.Property,
            key: this.convertChild(node.name),
            value: this.createNode<es.AssignmentPattern>(node, {
              type: AST_NODE_TYPES.AssignmentPattern,
              left: this.convertPattern(node.name),
              right: this.convertChild(node.objectAssignmentInitializer)
            }),
            computed: false,
            method: false,
            shorthand: true,
            kind: 'init'
          });
        } else {
          return this.createNode<es.Property>(node, {
            type: AST_NODE_TYPES.Property,
            key: this.convertChild(node.name),
            value: this.convertChild(node.name),
            computed: false,
            method: false,
            shorthand: true,
            kind: 'init'
          });
        }
      }

      case SyntaxKind.ComputedPropertyName:
        return this.convertChild(node.expression);

      case SyntaxKind.PropertyDeclaration: {
        const isAbstract = hasModifier(SyntaxKind.AbstractKeyword, node);
        const result = this.createNode<
          es.TSAbstractClassProperty | es.ClassProperty
        >(node, {
          type: isAbstract
            ? AST_NODE_TYPES.TSAbstractClassProperty
            : AST_NODE_TYPES.ClassProperty,
          key: this.convertChild(node.name),
          value: this.convertChild(node.initializer),
          computed: isComputedProperty(node.name),
          static: hasModifier(SyntaxKind.StaticKeyword, node),
          readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined
        });

        if (node.type) {
          result.typeAnnotation = this.convertTypeAnnotation(node.type, node);
        }

        if (node.decorators) {
          result.decorators = node.decorators.map(el => this.convertChild(el));
        }

        const accessibility = getTSNodeAccessibility(node);
        if (accessibility) {
          result.accessibility = accessibility;
        }

        if (node.name.kind === SyntaxKind.Identifier && node.questionToken) {
          result.optional = true;
        }

        if (node.exclamationToken) {
          result.definite = true;
        }

        if (result.key.type === AST_NODE_TYPES.Literal && node.questionToken) {
          result.optional = true;
        }
        return result;
      }

      case SyntaxKind.GetAccessor:
      case SyntaxKind.SetAccessor:
      case SyntaxKind.MethodDeclaration: {
        const method = this.createNode<es.FunctionExpression>(node, {
          type: AST_NODE_TYPES.FunctionExpression,
          id: null,
          generator: !!node.asteriskToken,
          expression: false, // ESTreeNode as ESTreeNode here
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          body: this.convertChild(node.body),
          range: [node.parameters.pos - 1, node.end],
          params: []
        });

        if (node.type) {
          method.returnType = this.convertTypeAnnotation(node.type, node);
        }

        // Process typeParameters
        if (node.typeParameters && node.typeParameters.length) {
          method.typeParameters = this.convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
          this.fixParentLocation(method, method.typeParameters.range);
        }

        let result:
          | es.Property
          | es.TSAbstractMethodDefinition
          | es.MethodDefinition;

        if (parent.kind === SyntaxKind.ObjectLiteralExpression) {
          method.params = node.parameters.map(el => this.convertChild(el));

          result = this.createNode<es.Property>(node, {
            type: AST_NODE_TYPES.Property,
            key: this.convertChild(node.name),
            value: method,
            computed: isComputedProperty(node.name),
            method: node.kind === SyntaxKind.MethodDeclaration,
            shorthand: false,
            kind: 'init'
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
            node
          )
            ? AST_NODE_TYPES.TSAbstractMethodDefinition
            : AST_NODE_TYPES.MethodDefinition;

          result = this.createNode<
            es.TSAbstractMethodDefinition | es.MethodDefinition
          >(node, {
            type: methodDefinitionType,
            key: this.convertChild(node.name),
            value: method,
            computed: isComputedProperty(node.name),
            static: hasModifier(SyntaxKind.StaticKeyword, node),
            kind: 'method'
          });

          if (node.decorators) {
            result.decorators = node.decorators.map(el =>
              this.convertChild(el)
            );
          }

          const accessibility = getTSNodeAccessibility(node);
          if (accessibility) {
            result.accessibility = accessibility;
          }
        }

        if (
          result.key.type === AST_NODE_TYPES.Identifier &&
          node.questionToken
        ) {
          result.key.optional = true;
        }

        if (node.kind === SyntaxKind.GetAccessor) {
          result.kind = 'get';
        } else if (node.kind === SyntaxKind.SetAccessor) {
          result.kind = 'set';
        } else if (
          !(result as es.MethodDefinition).static &&
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
          (lastModifier && findNextToken(lastModifier, node, this.ast)) ||
          node.getFirstToken()!;

        const constructor = this.createNode<es.FunctionExpression>(node, {
          type: AST_NODE_TYPES.FunctionExpression,
          id: null,
          params: this.convertParameters(node.parameters),
          generator: false,
          expression: false, // is not present in ESTreeNode
          async: false,
          body: this.convertChild(node.body),
          range: [node.parameters.pos - 1, node.end]
        });

        // Process typeParameters
        if (node.typeParameters && node.typeParameters.length) {
          constructor.typeParameters = this.convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
          this.fixParentLocation(constructor, constructor.typeParameters.range);
        }

        // Process returnType
        if (node.type) {
          constructor.returnType = this.convertTypeAnnotation(node.type, node);
        }

        const constructorKey = this.createNode<es.Identifier>(node, {
          type: AST_NODE_TYPES.Identifier,
          name: 'constructor',
          range: [constructorToken.getStart(this.ast), constructorToken.end]
        });

        const isStatic = hasModifier(SyntaxKind.StaticKeyword, node);
        const result = this.createNode<
          es.TSAbstractMethodDefinition | es.MethodDefinition
        >(node, {
          type: hasModifier(SyntaxKind.AbstractKeyword, node)
            ? AST_NODE_TYPES.TSAbstractMethodDefinition
            : AST_NODE_TYPES.MethodDefinition,
          key: constructorKey,
          value: constructor,
          computed: false,
          static: isStatic,
          kind: isStatic ? 'method' : 'constructor'
        });

        const accessibility = getTSNodeAccessibility(node);
        if (accessibility) {
          result.accessibility = accessibility;
        }

        return result;
      }

      case SyntaxKind.FunctionExpression: {
        const result = this.createNode<es.FunctionExpression>(node, {
          type: AST_NODE_TYPES.FunctionExpression,
          id: this.convertChild(node.name),
          generator: !!node.asteriskToken,
          params: this.convertParameters(node.parameters),
          body: this.convertChild(node.body),
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          expression: false
        });

        // Process returnType
        if (node.type) {
          result.returnType = this.convertTypeAnnotation(node.type, node);
        }

        // Process typeParameters
        if (node.typeParameters && node.typeParameters.length) {
          result.typeParameters = this.convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
        }
        return result;
      }

      case SyntaxKind.SuperKeyword:
        return this.createNode<es.Super>(node, {
          type: AST_NODE_TYPES.Super
        });

      case SyntaxKind.ArrayBindingPattern:
        return this.createNode<es.ArrayPattern>(node, {
          type: AST_NODE_TYPES.ArrayPattern,
          elements: node.elements.map(el => this.convertPattern(el))
        });

      // occurs with missing array elements like [,]
      case SyntaxKind.OmittedExpression:
        return null;

      case SyntaxKind.ObjectBindingPattern:
        return this.createNode<es.ObjectPattern>(node, {
          type: AST_NODE_TYPES.ObjectPattern,
          properties: node.elements.map(el => this.convertPattern(el))
        });

      case SyntaxKind.BindingElement: {
        if (parent.kind === SyntaxKind.ArrayBindingPattern) {
          const arrayItem = this.convertChild(node.name, parent);

          if (node.initializer) {
            return this.createNode<es.AssignmentPattern>(node, {
              type: AST_NODE_TYPES.AssignmentPattern,
              left: arrayItem,
              right: this.convertChild(node.initializer)
            });
          } else if (node.dotDotDotToken) {
            return this.createNode<es.RestElement>(node, {
              type: AST_NODE_TYPES.RestElement,
              argument: arrayItem
            });
          } else {
            return arrayItem;
          }
        } else if (parent.kind === SyntaxKind.ObjectBindingPattern) {
          let result: es.RestElement | es.Property;
          if (node.dotDotDotToken) {
            result = this.createNode<es.RestElement>(node, {
              type: AST_NODE_TYPES.RestElement,
              argument: this.convertChild(node.propertyName || node.name)
            });
          } else {
            result = this.createNode<es.Property>(node, {
              type: AST_NODE_TYPES.Property,
              key: this.convertChild(node.propertyName || node.name),
              value: this.convertChild(node.name),
              computed: Boolean(
                node.propertyName &&
                  node.propertyName.kind === SyntaxKind.ComputedPropertyName
              ),
              method: false,
              shorthand: !node.propertyName,
              kind: 'init'
            });
          }

          if (node.initializer) {
            result.value = this.createNode<es.AssignmentPattern>(node, {
              type: AST_NODE_TYPES.AssignmentPattern,
              left: this.convertChild(node.name),
              right: this.convertChild(node.initializer),
              range: [node.name.getStart(this.ast), node.initializer.end]
            });
          }
          return result;
        }
        return null;
      }

      case SyntaxKind.ArrowFunction: {
        const result = this.createNode<es.ArrowFunctionExpression>(node, {
          type: AST_NODE_TYPES.ArrowFunctionExpression,
          generator: false,
          id: null,
          params: this.convertParameters(node.parameters),
          body: this.convertChild(node.body),
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          expression: node.body.kind !== SyntaxKind.Block
        });

        // Process returnType
        if (node.type) {
          result.returnType = this.convertTypeAnnotation(node.type, node);
        }

        // Process typeParameters
        if (node.typeParameters && node.typeParameters.length) {
          result.typeParameters = this.convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
        }
        return result;
      }

      case SyntaxKind.YieldExpression:
        return this.createNode<es.YieldExpression>(node, {
          type: AST_NODE_TYPES.YieldExpression,
          delegate: !!node.asteriskToken,
          argument: this.convertChild(node.expression)
        });

      case SyntaxKind.AwaitExpression:
        return this.createNode<es.AwaitExpression>(node, {
          type: AST_NODE_TYPES.AwaitExpression,
          argument: this.convertChild(node.expression)
        });

      // Template Literals

      case SyntaxKind.NoSubstitutionTemplateLiteral:
        return this.createNode<es.TemplateLiteral>(node, {
          type: AST_NODE_TYPES.TemplateLiteral,
          quasis: [
            this.createNode<es.TemplateElement>(node, {
              type: AST_NODE_TYPES.TemplateElement,
              value: {
                raw: this.ast.text.slice(
                  node.getStart(this.ast) + 1,
                  node.end - 1
                ),
                cooked: node.text
              },
              tail: true
            })
          ],
          expressions: []
        });

      case SyntaxKind.TemplateExpression: {
        const result = this.createNode<es.TemplateLiteral>(node, {
          type: AST_NODE_TYPES.TemplateLiteral,
          quasis: [this.convertChild(node.head)],
          expressions: []
        });

        node.templateSpans.forEach(templateSpan => {
          result.expressions.push(this.convertChild(templateSpan.expression));
          result.quasis.push(this.convertChild(templateSpan.literal));
        });
        return result;
      }

      case SyntaxKind.TaggedTemplateExpression:
        return this.createNode<es.TaggedTemplateExpression>(node, {
          type: AST_NODE_TYPES.TaggedTemplateExpression,
          typeParameters: node.typeArguments
            ? this.convertTypeArgumentsToTypeParameters(node.typeArguments)
            : undefined,
          tag: this.convertChild(node.tag),
          quasi: this.convertChild(node.template)
        });

      case SyntaxKind.TemplateHead:
      case SyntaxKind.TemplateMiddle:
      case SyntaxKind.TemplateTail: {
        const tail = node.kind === SyntaxKind.TemplateTail;
        return this.createNode<es.TemplateElement>(node, {
          type: AST_NODE_TYPES.TemplateElement,
          value: {
            raw: this.ast.text.slice(
              node.getStart(this.ast) + 1,
              node.end - (tail ? 1 : 2)
            ),
            cooked: node.text
          },
          tail
        });
      }

      // Patterns

      case SyntaxKind.SpreadAssignment:
      case SyntaxKind.SpreadElement: {
        if (this.allowPattern) {
          return this.createNode<es.RestElement>(node, {
            type: AST_NODE_TYPES.RestElement,
            argument: this.convertPattern(node.expression)
          });
        } else {
          return this.createNode<es.SpreadElement>(node, {
            type: AST_NODE_TYPES.SpreadElement,
            argument: this.convertChild(node.expression)
          });
        }
      }

      case SyntaxKind.Parameter: {
        let parameter: any;
        let result: es.RestElement | es.AssignmentPattern;

        if (node.dotDotDotToken) {
          parameter = result = this.createNode<es.RestElement>(node, {
            type: AST_NODE_TYPES.RestElement,
            argument: this.convertChild(node.name)
          });
        } else if (node.initializer) {
          parameter = this.convertChild(node.name);
          result = this.createNode<es.AssignmentPattern>(node, {
            type: AST_NODE_TYPES.AssignmentPattern,
            left: parameter,
            right: this.convertChild(node.initializer)
          });

          if (node.modifiers) {
            // AssignmentPattern should not contain modifiers in range
            result.range[0] = parameter.range[0];
            result.loc = getLocFor(result.range[0], result.range[1], this.ast);
          }
        } else {
          parameter = result = this.convertChild(node.name, parent);
        }

        if (node.type) {
          parameter.typeAnnotation = this.convertTypeAnnotation(
            node.type,
            node
          );
          this.fixParentLocation(parameter, parameter.typeAnnotation.range);
        }

        if (node.questionToken) {
          if (node.questionToken.end > parameter.range[1]) {
            parameter.range[1] = node.questionToken.end;
            parameter.loc.end = getLineAndCharacterFor(
              parameter.range[1],
              this.ast
            );
          }
          parameter.optional = true;
        }

        if (node.modifiers) {
          return this.createNode<es.TSParameterProperty>(node, {
            type: AST_NODE_TYPES.TSParameterProperty,
            accessibility: getTSNodeAccessibility(node) || undefined,
            readonly:
              hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
            static: hasModifier(SyntaxKind.StaticKeyword, node) || undefined,
            export: hasModifier(SyntaxKind.ExportKeyword, node) || undefined,
            parameter: result
          });
        }
        return result;
      }

      // Classes

      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression: {
        const heritageClauses = node.heritageClauses || [];
        let classNodeType =
          node.kind === SyntaxKind.ClassDeclaration
            ? AST_NODE_TYPES.ClassDeclaration
            : AST_NODE_TYPES.ClassExpression;

        const superClass = heritageClauses.find(
          clause => clause.token === SyntaxKind.ExtendsKeyword
        );

        const implementsClause = heritageClauses.find(
          clause => clause.token === SyntaxKind.ImplementsKeyword
        );

        const result = this.createNode<
          es.ClassDeclaration | es.ClassExpression
        >(node, {
          type: classNodeType,
          id: this.convertChild(node.name),
          body: this.createNode<es.ClassBody>(node, {
            type: AST_NODE_TYPES.ClassBody,
            body: [],
            range: [node.members.pos - 1, node.end]
          }),
          superClass:
            superClass && superClass.types[0]
              ? this.convertChild(superClass.types[0].expression)
              : null
        });

        if (superClass) {
          if (superClass.types.length > 1) {
            throw createError(
              this.ast,
              superClass.types[1].pos,
              'Classes can only extend a single class.'
            );
          }

          if (superClass.types[0] && superClass.types[0].typeArguments) {
            result.superTypeParameters = this.convertTypeArgumentsToTypeParameters(
              superClass.types[0].typeArguments
            );
          }
        }

        if (node.typeParameters && node.typeParameters.length) {
          result.typeParameters = this.convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
        }

        if (implementsClause) {
          result.implements = implementsClause.types.map(el =>
            this.convertChild(el)
          );
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

        if (node.decorators) {
          result.decorators = node.decorators.map(el => this.convertChild(el));
        }

        const filteredMembers = node.members.filter(isESTreeClassMember);

        if (filteredMembers.length) {
          result.body.body = filteredMembers.map(el => this.convertChild(el));
        }

        // check for exports
        return fixExports(node, result, this.ast);
      }

      // Modules
      case SyntaxKind.ModuleBlock:
        return this.createNode<es.TSModuleBlock>(node, {
          type: AST_NODE_TYPES.TSModuleBlock,
          body: this.convertBodyExpressions(node.statements, node)
        });

      case SyntaxKind.ImportDeclaration: {
        const result = this.createNode<es.ImportDeclaration>(node, {
          type: AST_NODE_TYPES.ImportDeclaration,
          source: this.convertChild(node.moduleSpecifier),
          specifiers: []
        });

        if (node.importClause) {
          if (node.importClause.name) {
            result.specifiers.push(this.convertChild(node.importClause));
          }

          if (node.importClause.namedBindings) {
            switch (node.importClause.namedBindings.kind) {
              case SyntaxKind.NamespaceImport:
                result.specifiers.push(
                  this.convertChild(node.importClause.namedBindings)
                );
                break;
              case SyntaxKind.NamedImports:
                result.specifiers = result.specifiers.concat(
                  node.importClause.namedBindings.elements.map(el =>
                    this.convertChild(el)
                  )
                );
                break;
            }
          }
        }
        return result;
      }

      case SyntaxKind.NamespaceImport:
        return this.createNode<es.ImportNamespaceSpecifier>(node, {
          type: AST_NODE_TYPES.ImportNamespaceSpecifier,
          local: this.convertChild(node.name)
        });

      case SyntaxKind.ImportSpecifier:
        return this.createNode<es.ImportSpecifier>(node, {
          type: AST_NODE_TYPES.ImportSpecifier,
          local: this.convertChild(node.name),
          imported: this.convertChild(node.propertyName || node.name)
        });

      case SyntaxKind.ImportClause:
        return this.createNode<es.ImportDefaultSpecifier>(node, {
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          local: this.convertChild(node.name),
          range: [node.getStart(this.ast), node.name!.end]
        });

      case SyntaxKind.ExportDeclaration:
        if (node.exportClause) {
          return this.createNode<es.ExportNamedDeclaration>(node, {
            type: AST_NODE_TYPES.ExportNamedDeclaration,
            source: this.convertChild(node.moduleSpecifier),
            specifiers: node.exportClause.elements.map(el =>
              this.convertChild(el)
            ),
            declaration: null
          });
        } else {
          return this.createNode<es.ExportAllDeclaration>(node, {
            type: AST_NODE_TYPES.ExportAllDeclaration,
            source: this.convertChild(node.moduleSpecifier)
          });
        }

      case SyntaxKind.ExportSpecifier:
        return this.createNode<es.ExportSpecifier>(node, {
          type: AST_NODE_TYPES.ExportSpecifier,
          local: this.convertChild(node.propertyName || node.name),
          exported: this.convertChild(node.name)
        });

      case SyntaxKind.ExportAssignment:
        if (node.isExportEquals) {
          return this.createNode<es.TSExportAssignment>(node, {
            type: AST_NODE_TYPES.TSExportAssignment,
            expression: this.convertChild(node.expression)
          });
        } else {
          return this.createNode<es.ExportDefaultDeclaration>(node, {
            type: AST_NODE_TYPES.ExportDefaultDeclaration,
            declaration: this.convertChild(node.expression)
          });
        }

      // Unary Operations

      case SyntaxKind.PrefixUnaryExpression:
      case SyntaxKind.PostfixUnaryExpression: {
        const operator = (getTextForTokenKind(node.operator) || '') as any;
        /**
         * ESTree uses UpdateExpression for ++/--
         */
        if (/^(?:\+\+|--)$/.test(operator)) {
          return this.createNode<es.UpdateExpression>(node, {
            type: AST_NODE_TYPES.UpdateExpression,
            operator,
            prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
            argument: this.convertChild(node.operand)
          });
        } else {
          return this.createNode<es.UnaryExpression>(node, {
            type: AST_NODE_TYPES.UnaryExpression,
            operator,
            prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
            argument: this.convertChild(node.operand)
          });
        }
      }

      case SyntaxKind.DeleteExpression:
        return this.createNode<es.UnaryExpression>(node, {
          type: AST_NODE_TYPES.UnaryExpression,
          operator: 'delete',
          prefix: true,
          argument: this.convertChild(node.expression)
        });

      case SyntaxKind.VoidExpression:
        return this.createNode<es.UnaryExpression>(node, {
          type: AST_NODE_TYPES.UnaryExpression,
          operator: 'void',
          prefix: true,
          argument: this.convertChild(node.expression)
        });

      case SyntaxKind.TypeOfExpression:
        return this.createNode<es.UnaryExpression>(node, {
          type: AST_NODE_TYPES.UnaryExpression,
          operator: 'typeof',
          prefix: true,
          argument: this.convertChild(node.expression)
        });

      case SyntaxKind.TypeOperator:
        return this.createNode<es.TSTypeOperator>(node, {
          type: AST_NODE_TYPES.TSTypeOperator,
          operator: getTextForTokenKind(node.operator) as any,
          typeAnnotation: this.convertChild(node.type)
        });

      // Binary Operations

      case SyntaxKind.BinaryExpression: {
        // TypeScript uses BinaryExpression for sequences as well
        if (isComma(node.operatorToken)) {
          const result = this.createNode<es.SequenceExpression>(node, {
            type: AST_NODE_TYPES.SequenceExpression,
            expressions: []
          });

          const left = this.convertChild(node.left),
            right = this.convertChild(node.right);

          if (left.type === AST_NODE_TYPES.SequenceExpression) {
            result.expressions = result.expressions.concat(left.expressions);
          } else {
            result.expressions.push(left);
          }

          if (right.type === AST_NODE_TYPES.SequenceExpression) {
            result.expressions = result.expressions.concat(right.expressions);
          } else {
            result.expressions.push(right);
          }
          return result;
        } else {
          const type = getBinaryExpressionType(node.operatorToken);
          if (
            this.allowPattern &&
            type === AST_NODE_TYPES.AssignmentExpression
          ) {
            return this.createNode<es.AssignmentPattern>(node, {
              type: AST_NODE_TYPES.AssignmentPattern,
              left: this.convertPattern(node.left, node),
              right: this.convertChild(node.right)
            });
          }
          return this.createNode<
            es.AssignmentExpression | es.LogicalExpression | es.BinaryExpression
          >(node, {
            type: type,
            operator: getTextForTokenKind(node.operatorToken.kind)!,
            left: this.converter(
              node.left,
              node,
              this.inTypeMode,
              type === AST_NODE_TYPES.AssignmentExpression
            ),
            right: this.convertChild(node.right)
          });
        }
      }

      case SyntaxKind.PropertyAccessExpression:
        return this.createNode<es.MemberExpression>(node, {
          type: AST_NODE_TYPES.MemberExpression,
          object: this.convertChild(node.expression),
          property: this.convertChild(node.name),
          computed: false
        });

      case SyntaxKind.ElementAccessExpression:
        return this.createNode<es.MemberExpression>(node, {
          type: AST_NODE_TYPES.MemberExpression,
          object: this.convertChild(node.expression),
          property: this.convertChild(node.argumentExpression),
          computed: true
        });

      case SyntaxKind.ConditionalExpression:
        return this.createNode<es.ConditionalExpression>(node, {
          type: AST_NODE_TYPES.ConditionalExpression,
          test: this.convertChild(node.condition),
          consequent: this.convertChild(node.whenTrue),
          alternate: this.convertChild(node.whenFalse)
        });

      case SyntaxKind.CallExpression: {
        const result = this.createNode<es.CallExpression>(node, {
          type: AST_NODE_TYPES.CallExpression,
          callee: this.convertChild(node.expression),
          arguments: node.arguments.map(el => this.convertChild(el))
        });
        if (node.typeArguments && node.typeArguments.length) {
          result.typeParameters = this.convertTypeArgumentsToTypeParameters(
            node.typeArguments
          );
        }
        return result;
      }

      case SyntaxKind.NewExpression: {
        const result = this.createNode<es.NewExpression>(node, {
          type: AST_NODE_TYPES.NewExpression,
          callee: this.convertChild(node.expression),
          arguments: node.arguments
            ? node.arguments.map(el => this.convertChild(el))
            : []
        });
        if (node.typeArguments && node.typeArguments.length) {
          result.typeParameters = this.convertTypeArgumentsToTypeParameters(
            node.typeArguments
          );
        }
        return result;
      }

      case SyntaxKind.MetaProperty: {
        return this.createNode<es.MetaProperty>(node, {
          type: AST_NODE_TYPES.MetaProperty,
          meta: this.createNode<es.Identifier>(node.getFirstToken()!, {
            type: AST_NODE_TYPES.Identifier,
            name: getTextForTokenKind(node.keywordToken)!
          }),
          property: this.convertChild(node.name)
        });
      }

      case SyntaxKind.Decorator: {
        return this.createNode<es.Decorator>(node, {
          type: AST_NODE_TYPES.Decorator,
          expression: this.convertChild(node.expression)
        });
      }

      // Literals

      case SyntaxKind.StringLiteral: {
        const result = this.createNode<es.Literal>(node, {
          type: AST_NODE_TYPES.Literal,
          raw: '',
          value: ''
        });
        result.raw = this.ast.text.slice(result.range[0], result.range[1]);
        if ((parent as any).name && (parent as any).name === node) {
          result.value = node.text;
        } else {
          result.value = unescapeStringLiteralText(node.text);
        }
        return result;
      }

      case SyntaxKind.NumericLiteral: {
        return this.createNode<es.Literal>(node, {
          type: AST_NODE_TYPES.Literal,
          value: Number(node.text),
          raw: node.getText()
        });
      }

      case SyntaxKind.BigIntLiteral: {
        const result = this.createNode<es.BigIntLiteral>(node, {
          type: AST_NODE_TYPES.BigIntLiteral,
          raw: '',
          value: ''
        });
        result.raw = this.ast.text.slice(result.range[0], result.range[1]);
        result.value = result.raw.slice(0, -1); // remove suffix `n`
        return result;
      }

      case SyntaxKind.RegularExpressionLiteral: {
        const pattern = node.text.slice(1, node.text.lastIndexOf('/'));
        const flags = node.text.slice(node.text.lastIndexOf('/') + 1);

        let regex = null;
        try {
          regex = new RegExp(pattern, flags);
        } catch (exception) {
          regex = null;
        }

        return this.createNode<es.Literal>(node, {
          type: AST_NODE_TYPES.Literal,
          value: regex,
          raw: node.text,
          regex: {
            pattern,
            flags
          }
        });
      }

      case SyntaxKind.TrueKeyword:
        return this.createNode<es.Literal>(node, {
          type: AST_NODE_TYPES.Literal,
          value: true,
          raw: 'true'
        });

      case SyntaxKind.FalseKeyword:
        return this.createNode<es.Literal>(node, {
          type: AST_NODE_TYPES.Literal,
          value: false,
          raw: 'false'
        });

      case SyntaxKind.NullKeyword: {
        if (this.inTypeMode) {
          return this.createNode<es.TSNullKeyword>(node, {
            type: AST_NODE_TYPES.TSNullKeyword
          });
        } else {
          return this.createNode<es.Literal>(node, {
            type: AST_NODE_TYPES.Literal,
            value: null,
            raw: 'null'
          });
        }
      }

      case SyntaxKind.ImportKeyword:
        return this.createNode<es.Import>(node, {
          type: AST_NODE_TYPES.Import
        });

      case SyntaxKind.EmptyStatement:
        return this.createNode<es.EmptyStatement>(node, {
          type: AST_NODE_TYPES.EmptyStatement
        });

      case SyntaxKind.DebuggerStatement:
        return this.createNode<es.DebuggerStatement>(node, {
          type: AST_NODE_TYPES.DebuggerStatement
        });

      // JSX

      case SyntaxKind.JsxElement:
        return this.createNode<es.JSXElement>(node, {
          type: AST_NODE_TYPES.JSXElement,
          openingElement: this.convertChild(node.openingElement),
          closingElement: this.convertChild(node.closingElement),
          children: node.children.map(el => this.convertChild(el))
        });

      case SyntaxKind.JsxFragment:
        return this.createNode<es.JSXFragment>(node, {
          type: AST_NODE_TYPES.JSXFragment,
          openingFragment: this.convertChild(node.openingFragment),
          closingFragment: this.convertChild(node.closingFragment),
          children: node.children.map(el => this.convertChild(el))
        });

      case SyntaxKind.JsxSelfClosingElement: {
        return this.createNode<es.JSXElement>(node, {
          type: AST_NODE_TYPES.JSXElement,
          /**
           * Convert SyntaxKind.JsxSelfClosingElement to SyntaxKind.JsxOpeningElement,
           * TypeScript does not seem to have the idea of openingElement when tag is self-closing
           */
          openingElement: this.createNode<es.JSXOpeningElement>(node, {
            type: AST_NODE_TYPES.JSXOpeningElement,
            typeParameters: node.typeArguments
              ? this.convertTypeArgumentsToTypeParameters(node.typeArguments)
              : undefined,
            selfClosing: true,
            name: this.convertJSXTagName(node.tagName, node),
            attributes: node.attributes.properties.map(el =>
              this.convertChild(el)
            ),
            range: getRange(node, this.ast)
          }),
          closingElement: null,
          children: []
        });
      }

      case SyntaxKind.JsxOpeningElement:
        return this.createNode<es.JSXOpeningElement>(node, {
          type: AST_NODE_TYPES.JSXOpeningElement,
          typeParameters: node.typeArguments
            ? this.convertTypeArgumentsToTypeParameters(node.typeArguments)
            : undefined,
          selfClosing: false,
          name: this.convertJSXTagName(node.tagName, node),
          attributes: node.attributes.properties.map(el =>
            this.convertChild(el)
          )
        });

      case SyntaxKind.JsxClosingElement:
        return this.createNode<es.JSXClosingElement>(node, {
          type: AST_NODE_TYPES.JSXClosingElement,
          name: this.convertJSXTagName(node.tagName, node)
        });

      case SyntaxKind.JsxOpeningFragment:
        return this.createNode<es.JSXOpeningFragment>(node, {
          type: AST_NODE_TYPES.JSXOpeningFragment
        });

      case SyntaxKind.JsxClosingFragment:
        return this.createNode<es.JSXClosingFragment>(node, {
          type: AST_NODE_TYPES.JSXClosingFragment
        });

      case SyntaxKind.JsxExpression: {
        const expression = node.expression
          ? this.convertChild(node.expression)
          : this.createNode<es.JSXEmptyExpression>(node, {
              type: AST_NODE_TYPES.JSXEmptyExpression,
              range: [node.getStart(this.ast) + 1, node.getEnd() - 1]
            });

        if (node.dotDotDotToken) {
          return this.createNode<es.JSXSpreadChild>(node, {
            type: AST_NODE_TYPES.JSXSpreadChild,
            expression
          });
        } else {
          return this.createNode<es.JSXExpressionContainer>(node, {
            type: AST_NODE_TYPES.JSXExpressionContainer,
            expression
          });
        }
      }

      case SyntaxKind.JsxAttribute: {
        const attributeName = this.convertChild(node.name);
        attributeName.type = AST_NODE_TYPES.JSXIdentifier;

        return this.createNode<es.JSXAttribute>(node, {
          type: AST_NODE_TYPES.JSXAttribute,
          name: attributeName,
          value: this.convertChild(node.initializer)
        });
      }

      /**
       * The JSX AST changed the node type for string literals
       * inside a JSX Element from `Literal` to `JSXText`. We
       * provide a flag to support both types until `Literal`
       * node type is deprecated in ESLint v5.
       */
      case SyntaxKind.JsxText: {
        const start = node.getFullStart();
        const end = node.getEnd();

        if (this.options.useJSXTextNode) {
          return this.createNode<es.JSXText>(node, {
            type: AST_NODE_TYPES.JSXText,
            value: this.ast.text.slice(start, end),
            raw: this.ast.text.slice(start, end),
            range: [start, end]
          });
        } else {
          return this.createNode<es.Literal>(node, {
            type: AST_NODE_TYPES.Literal,
            value: this.ast.text.slice(start, end),
            raw: this.ast.text.slice(start, end),
            range: [start, end]
          });
        }
      }

      case SyntaxKind.JsxSpreadAttribute:
        return this.createNode<es.JSXSpreadAttribute>(node, {
          type: AST_NODE_TYPES.JSXSpreadAttribute,
          argument: this.convertChild(node.expression)
        });

      case SyntaxKind.QualifiedName: {
        return this.createNode<es.TSQualifiedName>(node, {
          type: AST_NODE_TYPES.TSQualifiedName,
          left: this.convertChild(node.left),
          right: this.convertChild(node.right)
        });
      }

      // TypeScript specific

      case SyntaxKind.TypeReference: {
        return this.createNode<es.TSTypeReference>(node, {
          type: AST_NODE_TYPES.TSTypeReference,
          typeName: this.convertType(node.typeName),
          typeParameters: node.typeArguments
            ? this.convertTypeArgumentsToTypeParameters(node.typeArguments)
            : undefined
        });
      }

      case SyntaxKind.TypeParameter: {
        return this.createNode<es.TSTypeParameter>(node, {
          type: AST_NODE_TYPES.TSTypeParameter,
          name: this.convertType(node.name),
          constraint: node.constraint
            ? this.convertType(node.constraint)
            : undefined,
          default: node.default ? this.convertType(node.default) : undefined
        });
      }

      case SyntaxKind.ThisType:
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
      case SyntaxKind.UndefinedKeyword: {
        return this.createNode<any>(node, {
          type: AST_NODE_TYPES[`TS${SyntaxKind[node.kind]}` as AST_NODE_TYPES]
        });
      }

      case SyntaxKind.NonNullExpression: {
        return this.createNode<es.TSNonNullExpression>(node, {
          type: AST_NODE_TYPES.TSNonNullExpression,
          expression: this.convertChild(node.expression)
        });
      }

      case SyntaxKind.TypeLiteral: {
        return this.createNode<es.TSTypeLiteral>(node, {
          type: AST_NODE_TYPES.TSTypeLiteral,
          members: node.members.map(el => this.convertChild(el))
        });
      }

      case SyntaxKind.ArrayType: {
        return this.createNode<es.TSArrayType>(node, {
          type: AST_NODE_TYPES.TSArrayType,
          elementType: this.convertType(node.elementType)
        });
      }

      case SyntaxKind.IndexedAccessType: {
        return this.createNode<es.TSIndexedAccessType>(node, {
          type: AST_NODE_TYPES.TSIndexedAccessType,
          objectType: this.convertType(node.objectType),
          indexType: this.convertType(node.indexType)
        });
      }

      case SyntaxKind.ConditionalType: {
        return this.createNode<es.TSConditionalType>(node, {
          type: AST_NODE_TYPES.TSConditionalType,
          checkType: this.convertType(node.checkType),
          extendsType: this.convertType(node.extendsType),
          trueType: this.convertType(node.trueType),
          falseType: this.convertType(node.falseType)
        });
      }

      case SyntaxKind.TypeQuery: {
        return this.createNode<es.TSTypeQuery>(node, {
          type: AST_NODE_TYPES.TSTypeQuery,
          exprName: this.convertType(node.exprName)
        });
      }

      case SyntaxKind.MappedType: {
        const result = this.createNode<es.TSMappedType>(node, {
          type: AST_NODE_TYPES.TSMappedType,
          typeParameter: this.convertType(node.typeParameter)
        });

        if (node.readonlyToken) {
          if (node.readonlyToken.kind === SyntaxKind.ReadonlyKeyword) {
            result.readonly = true;
          } else {
            result.readonly = getTextForTokenKind(node.readonlyToken.kind) as
              | '+'
              | '-';
          }
        }

        if (node.questionToken) {
          if (node.questionToken.kind === SyntaxKind.QuestionToken) {
            result.optional = true;
          } else {
            result.optional = getTextForTokenKind(node.questionToken.kind) as
              | '+'
              | '-';
          }
        }

        if (node.type) {
          result.typeAnnotation = this.convertType(node.type);
        }
        return result;
      }

      case SyntaxKind.ParenthesizedExpression:
        return this.convertChild(node.expression, parent);

      case SyntaxKind.TypeAliasDeclaration: {
        const result = this.createNode<es.TSTypeAliasDeclaration>(node, {
          type: AST_NODE_TYPES.TSTypeAliasDeclaration,
          id: this.convertChild(node.name),
          typeAnnotation: this.convertType(node.type)
        });

        if (hasModifier(SyntaxKind.DeclareKeyword, node)) {
          result.declare = true;
        }

        // Process typeParameters
        if (node.typeParameters && node.typeParameters.length) {
          result.typeParameters = this.convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
        }

        // check for exports
        return fixExports(node, result, this.ast);
      }

      case SyntaxKind.MethodSignature: {
        const result = this.createNode<es.TSMethodSignature>(node, {
          type: AST_NODE_TYPES.TSMethodSignature,
          computed: isComputedProperty(node.name),
          key: this.convertChild(node.name),
          params: this.convertParameters(node.parameters)
        });

        if (isOptional(node)) {
          result.optional = true;
        }

        if (node.type) {
          result.returnType = this.convertTypeAnnotation(node.type, node);
        }

        if (hasModifier(SyntaxKind.ReadonlyKeyword, node)) {
          result.readonly = true;
        }

        if (node.typeParameters) {
          result.typeParameters = this.convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
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

      case SyntaxKind.PropertySignature: {
        const result = this.createNode<es.TSPropertySignature>(node, {
          type: AST_NODE_TYPES.TSPropertySignature,
          optional: isOptional(node) || undefined,
          computed: isComputedProperty(node.name),
          key: this.convertChild(node.name),
          typeAnnotation: node.type
            ? this.convertTypeAnnotation(node.type, node)
            : undefined,
          initializer: this.convertChild(node.initializer) || undefined,
          readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
          static: hasModifier(SyntaxKind.StaticKeyword, node) || undefined,
          export: hasModifier(SyntaxKind.ExportKeyword, node) || undefined
        });

        const accessibility = getTSNodeAccessibility(node);
        if (accessibility) {
          result.accessibility = accessibility;
        }

        return result;
      }

      case SyntaxKind.IndexSignature: {
        const result = this.createNode<es.TSIndexSignature>(node, {
          type: AST_NODE_TYPES.TSIndexSignature,
          parameters: node.parameters.map(el => this.convertChild(el))
        });

        if (node.type) {
          result.typeAnnotation = this.convertTypeAnnotation(node.type, node);
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
      }
      case SyntaxKind.ConstructorType:
      case SyntaxKind.FunctionType:
      case SyntaxKind.ConstructSignature:
      case SyntaxKind.CallSignature: {
        let type: AST_NODE_TYPES;
        switch (node.kind) {
          case SyntaxKind.ConstructSignature:
            type = AST_NODE_TYPES.TSConstructSignatureDeclaration;
            break;
          case SyntaxKind.CallSignature:
            type = AST_NODE_TYPES.TSCallSignatureDeclaration;
            break;
          case SyntaxKind.FunctionType:
            type = AST_NODE_TYPES.TSFunctionType;
            break;
          case SyntaxKind.ConstructorType:
          default:
            type = AST_NODE_TYPES.TSConstructorType;
            break;
        }
        const result = this.createNode<
          | es.TSConstructSignatureDeclaration
          | es.TSCallSignatureDeclaration
          | es.TSFunctionType
          | es.TSConstructorType
        >(node, {
          type: type,
          params: this.convertParameters(node.parameters)
        });

        if (node.type) {
          result.returnType = this.convertTypeAnnotation(node.type, node);
        }

        if (node.typeParameters) {
          result.typeParameters = this.convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
        }

        return result;
      }

      case SyntaxKind.ExpressionWithTypeArguments: {
        const result = this.createNode<
          es.TSInterfaceHeritage | es.TSClassImplements
        >(node, {
          type:
            parent && parent.kind === SyntaxKind.InterfaceDeclaration
              ? AST_NODE_TYPES.TSInterfaceHeritage
              : AST_NODE_TYPES.TSClassImplements,
          expression: this.convertChild(node.expression)
        });

        if (node.typeArguments && node.typeArguments.length) {
          result.typeParameters = this.convertTypeArgumentsToTypeParameters(
            node.typeArguments
          );
        }
        return result;
      }

      case SyntaxKind.InterfaceDeclaration: {
        const interfaceHeritageClauses = node.heritageClauses || [];
        const result = this.createNode<es.TSInterfaceDeclaration>(node, {
          type: AST_NODE_TYPES.TSInterfaceDeclaration,
          body: this.createNode<es.TSInterfaceBody>(node, {
            type: AST_NODE_TYPES.TSInterfaceBody,
            body: node.members.map(member => this.convertChild(member)),
            range: [node.members.pos - 1, node.end]
          }),
          id: this.convertChild(node.name)
        });

        if (node.typeParameters && node.typeParameters.length) {
          result.typeParameters = this.convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
        }

        if (interfaceHeritageClauses.length > 0) {
          const interfaceExtends = [];
          const interfaceImplements = [];

          for (const heritageClause of interfaceHeritageClauses) {
            if (heritageClause.token === SyntaxKind.ExtendsKeyword) {
              for (const n of heritageClause.types) {
                interfaceExtends.push(this.convertChild(n, node));
              }
            } else if (heritageClause.token === SyntaxKind.ImplementsKeyword) {
              for (const n of heritageClause.types) {
                interfaceImplements.push(this.convertChild(n, node));
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

        /**
         * Semantically, decorators are not allowed on interface declarations,
         * but the TypeScript compiler will parse them and produce a valid AST,
         * so we handle them here too.
         */
        if (node.decorators) {
          result.decorators = node.decorators.map(el => this.convertChild(el));
        }
        if (hasModifier(SyntaxKind.AbstractKeyword, node)) {
          result.abstract = true;
        }
        if (hasModifier(SyntaxKind.DeclareKeyword, node)) {
          result.declare = true;
        }
        // check for exports
        return fixExports(node, result, this.ast);
      }

      case SyntaxKind.FirstTypeNode: {
        const result = this.createNode<es.TSTypePredicate>(node, {
          type: AST_NODE_TYPES.TSTypePredicate,
          parameterName: this.convertChild(node.parameterName),
          typeAnnotation: this.convertTypeAnnotation(node.type, node)
        });
        /**
         * Specific fix for type-guard location data
         */
        result.typeAnnotation.loc = result.typeAnnotation.typeAnnotation.loc;
        result.typeAnnotation.range =
          result.typeAnnotation.typeAnnotation.range;
        return result;
      }

      case SyntaxKind.ImportType:
        return this.createNode<es.TSImportType>(node, {
          type: AST_NODE_TYPES.TSImportType,
          isTypeOf: !!node.isTypeOf,
          parameter: this.convertChild(node.argument),
          qualifier: this.convertChild(node.qualifier),
          typeParameters: node.typeArguments
            ? this.convertTypeArgumentsToTypeParameters(node.typeArguments)
            : null
        });

      case SyntaxKind.EnumDeclaration: {
        const result = this.createNode<es.TSEnumDeclaration>(node, {
          type: AST_NODE_TYPES.TSEnumDeclaration,
          id: this.convertChild(node.name),
          members: node.members.map(el => this.convertChild(el))
        });
        // apply modifiers first...
        this.applyModifiersToResult(result, node.modifiers);
        /**
         * Semantically, decorators are not allowed on enum declarations,
         * but the TypeScript compiler will parse them and produce a valid AST,
         * so we handle them here too.
         */
        if (node.decorators) {
          result.decorators = node.decorators.map(el => this.convertChild(el));
        }
        // ...then check for exports
        return fixExports(node, result, this.ast);
      }

      case SyntaxKind.EnumMember: {
        const result = this.createNode<es.TSEnumMember>(node, {
          type: AST_NODE_TYPES.TSEnumMember,
          id: this.convertChild(node.name)
        });
        if (node.initializer) {
          result.initializer = this.convertChild(node.initializer);
        }
        return result;
      }

      case SyntaxKind.ModuleDeclaration: {
        const result = this.createNode<es.TSModuleDeclaration>(node, {
          type: AST_NODE_TYPES.TSModuleDeclaration,
          id: this.convertChild(node.name)
        });
        if (node.body) {
          result.body = this.convertChild(node.body);
        }
        // apply modifiers first...
        this.applyModifiersToResult(result, node.modifiers);
        if (node.flags & ts.NodeFlags.GlobalAugmentation) {
          result.global = true;
        }
        // ...then check for exports
        return fixExports(node, result, this.ast);
      }

      // TypeScript specific types
      case SyntaxKind.OptionalType: {
        return this.createNode<es.TSOptionalType>(node, {
          type: AST_NODE_TYPES.TSOptionalType,
          typeAnnotation: this.convertType(node.type)
        });
      }
      case SyntaxKind.ParenthesizedType: {
        return this.createNode<es.TSParenthesizedType>(node, {
          type: AST_NODE_TYPES.TSParenthesizedType,
          typeAnnotation: this.convertType(node.type)
        });
      }
      case SyntaxKind.TupleType: {
        return this.createNode<es.TSTupleType>(node, {
          type: AST_NODE_TYPES.TSTupleType,
          elementTypes: node.elementTypes.map(el => this.convertType(el))
        });
      }
      case SyntaxKind.UnionType: {
        return this.createNode<es.TSUnionType>(node, {
          type: AST_NODE_TYPES.TSUnionType,
          types: node.types.map(el => this.convertType(el))
        });
      }
      case SyntaxKind.IntersectionType: {
        return this.createNode<es.TSIntersectionType>(node, {
          type: AST_NODE_TYPES.TSIntersectionType,
          types: node.types.map(el => this.convertType(el))
        });
      }
      case SyntaxKind.RestType: {
        return this.createNode<es.TSRestType>(node, {
          type: AST_NODE_TYPES.TSRestType,
          typeAnnotation: this.convertType(node.type)
        });
      }
      case SyntaxKind.AsExpression: {
        return this.createNode<es.TSAsExpression>(node, {
          type: AST_NODE_TYPES.TSAsExpression,
          expression: this.convertChild(node.expression),
          typeAnnotation: this.convertType(node.type)
        });
      }
      case SyntaxKind.InferType: {
        return this.createNode<es.TSInferType>(node, {
          type: AST_NODE_TYPES.TSInferType,
          typeParameter: this.convertType(node.typeParameter)
        });
      }
      case SyntaxKind.LiteralType: {
        return this.createNode<es.TSLiteralType>(node, {
          type: AST_NODE_TYPES.TSLiteralType,
          literal: this.convertType(node.literal)
        });
      }
      case SyntaxKind.TypeAssertionExpression: {
        return this.createNode<es.TSTypeAssertion>(node, {
          type: AST_NODE_TYPES.TSTypeAssertion,
          typeAnnotation: this.convertType(node.type),
          expression: this.convertChild(node.expression)
        });
      }
      case SyntaxKind.ImportEqualsDeclaration: {
        return this.createNode<es.TSImportEqualsDeclaration>(node, {
          type: AST_NODE_TYPES.TSImportEqualsDeclaration,
          id: this.convertChild(node.name),
          moduleReference: this.convertChild(node.moduleReference),
          isExport: hasModifier(SyntaxKind.ExportKeyword, node)
        });
      }
      case SyntaxKind.ExternalModuleReference: {
        return this.createNode<es.TSExternalModuleReference>(node, {
          type: AST_NODE_TYPES.TSExternalModuleReference,
          expression: this.convertChild(node.expression)
        });
      }
      case SyntaxKind.NamespaceExportDeclaration: {
        return this.createNode<es.TSNamespaceExportDeclaration>(node, {
          type: AST_NODE_TYPES.TSNamespaceExportDeclaration,
          id: this.convertChild(node.name)
        });
      }
      case SyntaxKind.AbstractKeyword: {
        return this.createNode<any>(node, {
          type: AST_NODE_TYPES.TSAbstractKeyword
        });
      }
      default:
        return this.deeplyCopy(node);
    }
  }
}
