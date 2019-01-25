/**
 * @fileoverview Converts TypeScript AST into ESTree format.
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import ts from 'typescript';
import {
  canContainDirective,
  createError,
  getLoc,
  getLocFor,
  findNextToken,
  convertToken,
  hasModifier,
  fixExports,
  getTSNodeAccessibility,
  getTextForTokenKind,
  isJSXToken,
  isComputedProperty,
  isESTreeClassMember,
  isComma,
  getBinaryExpressionType,
  isOptional,
  findFirstMatchingToken,
  unescapeStringLiteralText,
  getDeclarationKind,
  getLastModifier
} from './node-utils';
import { AST_NODE_TYPES } from './ast-node-types';
import { ESTreeNode } from './temp-types-based-on-js-source';
import { TSNode } from './ts-nodes';

const SyntaxKind = ts.SyntaxKind;

let esTreeNodeToTSNodeMap = new WeakMap();
let tsNodeToESTreeNodeMap = new WeakMap();

export function resetASTMaps() {
  esTreeNodeToTSNodeMap = new WeakMap();
  tsNodeToESTreeNodeMap = new WeakMap();
}

export function getASTMaps() {
  return { esTreeNodeToTSNodeMap, tsNodeToESTreeNodeMap };
}

interface ConvertAdditionalOptions {
  errorOnUnknownASTType: boolean;
  useJSXTextNode: boolean;
  shouldProvideParserServices: boolean;
}

interface ConvertConfig {
  node: ts.Node;
  parent?: ts.Node | null;
  inTypeMode?: boolean;
  allowPattern?: boolean;
  ast: ts.SourceFile;
  additionalOptions: ConvertAdditionalOptions;
}

/**
 * Extends and formats a given error object
 * @param  {Object} error the error object
 * @returns {Object}       converted error object
 */
export function convertError(error: any) {
  return createError(
    error.file,
    error.start,
    error.message || error.messageText
  );
}

/**
 * Converts a TypeScript node into an ESTree node
 * @param  {Object} config configuration options for the conversion
 * @param  {TSNode} config.node   the ts.Node
 * @param  {ts.Node} config.parent the parent ts.Node
 * @param  {ts.SourceFile} config.ast the full TypeScript AST
 * @param  {Object} config.additionalOptions additional options for the conversion
 * @returns {ESTreeNode|null}        the converted ESTreeNode
 */
export default function convert(config: ConvertConfig): ESTreeNode | null {
  const node: TSNode = config.node as TSNode;
  const parent = config.parent;
  const ast = config.ast;
  const additionalOptions = config.additionalOptions || {};

  /**
   * Exit early for null and undefined
   */
  if (!node) {
    return null;
  }

  /**
   * Create a new ESTree node
   */
  let result: ESTreeNode = {
    type: '' as AST_NODE_TYPES,
    range: [node.getStart(ast), node.end],
    loc: getLoc(node, ast)
  };

  function converter(
    child?: ts.Node,
    inTypeMode?: boolean,
    allowPattern?: boolean
  ): ESTreeNode | null {
    if (!child) {
      return null;
    }
    return convert({
      node: child,
      parent: node,
      inTypeMode,
      allowPattern,
      ast,
      additionalOptions
    });
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param  {ts.Node} child the child ts.Node
   * @returns {ESTreeNode|null}       the converted ESTree node
   */
  function convertPattern(child?: ts.Node): ESTreeNode | null {
    return converter(child, config.inTypeMode, true);
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param  {ts.Node} child the child ts.Node
   * @returns {ESTreeNode|null}       the converted ESTree node
   */
  function convertChild(child?: ts.Node): ESTreeNode | null {
    return converter(child, config.inTypeMode, false);
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param {ts.Node} child the child ts.Node
   * @returns {ESTreeNode|null}       the converted ESTree node
   */
  function convertChildType(child?: ts.Node): ESTreeNode | null {
    return converter(child, true, false);
  }

  /**
   * Converts a child into a type annotation. This creates an intermediary
   * TypeAnnotation node to match what Flow does.
   * @param {ts.TypeNode} child The TypeScript AST node to convert.
   * @returns {ESTreeNode} The type annotation node.
   */
  function convertTypeAnnotation(child: ts.TypeNode): ESTreeNode {
    const annotation = convertChildType(child);
    // in FunctionType and ConstructorType typeAnnotation has 2 characters `=>` and in other places is just colon
    const offset =
      node.kind === SyntaxKind.FunctionType ||
      node.kind === SyntaxKind.ConstructorType
        ? 2
        : 1;
    const annotationStartCol = child.getFullStart() - offset;

    const loc = getLocFor(annotationStartCol, child.end, ast);
    return {
      type: AST_NODE_TYPES.TSTypeAnnotation,
      loc,
      range: [annotationStartCol, child.end],
      typeAnnotation: annotation
    };
  }

  /**
   * Coverts body Nodes and add directive field to StringLiterals
   * @param {ts.NodeArray<ts.Statement>} nodes of ts.Node
   * @returns {ESTreeNode[]} Array of body statements
   */
  function convertBodyExpressions(
    nodes: ts.NodeArray<ts.Statement>
  ): ESTreeNode[] {
    let allowDirectives = canContainDirective(node);

    return (
      nodes
        .map(statement => {
          const child = convertChild(statement);
          if (allowDirectives) {
            if (
              child &&
              child.expression &&
              ts.isExpressionStatement(statement) &&
              ts.isStringLiteral(statement.expression)
            ) {
              const raw = child.expression.raw!;
              child.directive = raw.slice(1, -1);
              return child!; // child can be null but it's filtered below
            } else {
              allowDirectives = false;
            }
          }
          return child!; // child can be null but it's filtered below
        })
        // filter out unknown nodes for now
        .filter(statement => statement)
    );
  }

  /**
   * Converts a ts.Node's typeArguments to TSTypeParameterInstantiation node
   * @param {ts.NodeArray<any>} typeArguments ts.Node typeArguments
   * @returns {ESTreeNode} TypeParameterInstantiation node
   */
  function convertTypeArgumentsToTypeParameters(
    typeArguments: ts.NodeArray<any>
  ): ESTreeNode {
    const greaterThanToken = findNextToken(typeArguments, ast, ast)!;

    return {
      type: AST_NODE_TYPES.TSTypeParameterInstantiation,
      range: [typeArguments.pos - 1, greaterThanToken.end],
      loc: getLocFor(typeArguments.pos - 1, greaterThanToken.end, ast),
      params: typeArguments.map(typeArgument => convertChildType(typeArgument))
    };
  }

  /**
   * Converts a ts.Node's typeParameters to TSTypeParameterDeclaration node
   * @param {ts.NodeArray} typeParameters ts.Node typeParameters
   * @returns {ESTreeNode} TypeParameterDeclaration node
   */
  function convertTSTypeParametersToTypeParametersDeclaration(
    typeParameters: ts.NodeArray<any>
  ): ESTreeNode {
    const greaterThanToken = findNextToken(typeParameters, ast, ast)!;

    return {
      type: AST_NODE_TYPES.TSTypeParameterDeclaration,
      range: [typeParameters.pos - 1, greaterThanToken.end],
      loc: getLocFor(typeParameters.pos - 1, greaterThanToken.end, ast),
      params: typeParameters.map(typeParameter =>
        convertChildType(typeParameter)
      )
    };
  }

  /**
   * Converts an array of ts.Node parameters into an array of ESTreeNode params
   * @param  {ts.Node[]} parameters An array of ts.Node params to be converted
   * @returns {ESTreeNode[]}       an array of converted ESTreeNode params
   */
  function convertParameters(parameters: ts.NodeArray<ts.Node>): ESTreeNode[] {
    if (!parameters || !parameters.length) {
      return [];
    }
    return parameters.map(param => {
      const convertedParam = convertChild(param)!;
      if (!param.decorators || !param.decorators.length) {
        return convertedParam;
      }
      return Object.assign(convertedParam, {
        decorators: param.decorators.map(convertChild)
      });
    });
  }

  /**
   * For nodes that are copied directly from the TypeScript AST into
   * ESTree mostly as-is. The only difference is the addition of a type
   * property instead of a kind property. Recursively copies all children.
   * @returns {void}
   */
  function deeplyCopy(): void {
    const customType = `TS${SyntaxKind[node.kind]}` as AST_NODE_TYPES;
    /**
     * If the "errorOnUnknownASTType" option is set to true, throw an error,
     * otherwise fallback to just including the unknown type as-is.
     */
    if (
      additionalOptions.errorOnUnknownASTType &&
      !AST_NODE_TYPES[customType]
    ) {
      throw new Error(`Unknown AST_NODE_TYPE: "${customType}"`);
    }
    result.type = customType;
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
            ? convertTypeAnnotation((node as any).type)
            : null;
        } else if (key === 'typeArguments') {
          result.typeParameters = (node as any).typeArguments
            ? convertTypeArgumentsToTypeParameters((node as any).typeArguments)
            : null;
        } else if (key === 'typeParameters') {
          result.typeParameters = (node as any).typeParameters
            ? convertTSTypeParametersToTypeParametersDeclaration(
                (node as any).typeParameters
              )
            : null;
        } else if (key === 'decorators') {
          if (node.decorators && node.decorators.length) {
            result.decorators = node.decorators.map(convertChild);
          }
        } else {
          if (Array.isArray((node as any)[key])) {
            (result as any)[key] = (node as any)[key].map(convertChild);
          } else if (
            (node as any)[key] &&
            typeof (node as any)[key] === 'object' &&
            (node as any)[key].kind
          ) {
            // need to check node[key].kind to ensure we don't try to convert a symbol
            (result as any)[key] = convertChild((node as any)[key]);
          } else {
            (result as any)[key] = (node as any)[key];
          }
        }
      });
  }

  /**
   * Converts a TypeScript JSX node.tagName into an ESTree node.name
   * @param {ts.JsxTagNameExpression} tagName  the tagName object from a JSX ts.Node
   * @returns {Object}    the converted ESTree name object
   */
  function convertTypeScriptJSXTagNameToESTreeName(
    tagName: ts.JsxTagNameExpression
  ): ESTreeNode {
    const tagNameToken = convertToken(tagName, ast);

    if (tagNameToken.type === AST_NODE_TYPES.JSXMemberExpression) {
      const isNestedMemberExpression =
        (node as any).tagName.expression.kind ===
        SyntaxKind.PropertyAccessExpression;

      // Convert TSNode left and right objects into ESTreeNode object
      // and property objects
      tagNameToken.object = convertChild((node as any).tagName.expression);
      tagNameToken.property = convertChild((node as any).tagName.name);

      // Assign the appropriate types
      tagNameToken.object.type = isNestedMemberExpression
        ? AST_NODE_TYPES.JSXMemberExpression
        : AST_NODE_TYPES.JSXIdentifier;
      tagNameToken.property.type = AST_NODE_TYPES.JSXIdentifier;
      if ((tagName as any).expression.kind === SyntaxKind.ThisKeyword) {
        tagNameToken.object.name = 'this';
      }
    } else {
      tagNameToken.type = AST_NODE_TYPES.JSXIdentifier;
      tagNameToken.name = tagNameToken.value;
    }

    delete tagNameToken.value;

    return tagNameToken;
  }

  /**
   * Applies the given TS modifiers to the given result object.
   * @param {ts.ModifiersArray} modifiers original ts.Nodes from the node.modifiers array
   * @returns {void} (the current result object will be mutated)
   */
  function applyModifiersToResult(modifiers?: ts.ModifiersArray): void {
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
          result.const = true;
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
    result.modifiers = remainingModifiers.map(convertChild);
  }

  /**
   * Uses the current TSNode's end location for its `type` to adjust the location data of the given
   * ESTreeNode, which should be the parent of the final typeAnnotation node
   * @param {ESTreeNode} typeAnnotationParent The node that will have its location data mutated
   * @returns {void}
   */
  function fixTypeAnnotationParentLocation(
    typeAnnotationParent: ESTreeNode
  ): void {
    typeAnnotationParent.range[1] = (node as any).type.getEnd();
    typeAnnotationParent.loc = getLocFor(
      typeAnnotationParent.range[0],
      typeAnnotationParent.range[1],
      ast
    );
  }

  /**
   * The core of the conversion logic:
   * Identify and convert each relevant TypeScript SyntaxKind
   */
  switch (node.kind) {
    case SyntaxKind.SourceFile:
      Object.assign(result, {
        type: AST_NODE_TYPES.Program,
        body: convertBodyExpressions(node.statements),
        // externalModuleIndicator is internal field in TSC
        sourceType: (node as any).externalModuleIndicator ? 'module' : 'script'
      });

      result.range[1] = node.endOfFileToken.end;
      result.loc = getLocFor(node.getStart(ast), result.range[1], ast);
      break;

    case SyntaxKind.Block:
      Object.assign(result, {
        type: AST_NODE_TYPES.BlockStatement,
        body: convertBodyExpressions(node.statements)
      });
      break;

    case SyntaxKind.Identifier:
      Object.assign(result, {
        type: AST_NODE_TYPES.Identifier,
        name: node.text
      });
      break;

    case SyntaxKind.WithStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.WithStatement,
        object: convertChild(node.expression),
        body: convertChild(node.statement)
      });
      break;

    // Control Flow

    case SyntaxKind.ReturnStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.ReturnStatement,
        argument: convertChild(node.expression)
      });
      break;

    case SyntaxKind.LabeledStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.LabeledStatement,
        label: convertChild(node.label),
        body: convertChild(node.statement)
      });
      break;

    case SyntaxKind.BreakStatement:
    case SyntaxKind.ContinueStatement:
      Object.assign(result, {
        type: SyntaxKind[node.kind],
        label: convertChild(node.label)
      });
      break;

    // Choice

    case SyntaxKind.IfStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.IfStatement,
        test: convertChild(node.expression),
        consequent: convertChild(node.thenStatement),
        alternate: convertChild(node.elseStatement)
      });
      break;

    case SyntaxKind.SwitchStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.SwitchStatement,
        discriminant: convertChild(node.expression),
        cases: node.caseBlock.clauses.map(convertChild)
      });
      break;

    case SyntaxKind.CaseClause:
    case SyntaxKind.DefaultClause:
      Object.assign(result, {
        type: AST_NODE_TYPES.SwitchCase,
        // expression is present in case only
        test:
          node.kind === SyntaxKind.CaseClause
            ? convertChild(node.expression)
            : null,
        consequent: node.statements.map(convertChild)
      });
      break;

    // Exceptions

    case SyntaxKind.ThrowStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.ThrowStatement,
        argument: convertChild(node.expression)
      });
      break;

    case SyntaxKind.TryStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.TryStatement,
        block: convert({
          node: node.tryBlock,
          parent: null,
          ast,
          additionalOptions
        }),
        handler: convertChild(node.catchClause),
        finalizer: convertChild(node.finallyBlock)
      });
      break;

    case SyntaxKind.CatchClause:
      Object.assign(result, {
        type: AST_NODE_TYPES.CatchClause,
        param: node.variableDeclaration
          ? convertChild(node.variableDeclaration.name)
          : null,
        body: convertChild(node.block)
      });
      break;

    // Loops

    case SyntaxKind.WhileStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.WhileStatement,
        test: convertChild(node.expression),
        body: convertChild(node.statement)
      });
      break;

    /**
     * Unlike other parsers, TypeScript calls a "DoWhileStatement"
     * a "DoStatement"
     */
    case SyntaxKind.DoStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.DoWhileStatement,
        test: convertChild(node.expression),
        body: convertChild(node.statement)
      });
      break;

    case SyntaxKind.ForStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.ForStatement,
        init: convertChild(node.initializer),
        test: convertChild(node.condition),
        update: convertChild(node.incrementor),
        body: convertChild(node.statement)
      });
      break;

    case SyntaxKind.ForInStatement:
    case SyntaxKind.ForOfStatement: {
      Object.assign(result, {
        type: SyntaxKind[node.kind],
        left: convertPattern(node.initializer),
        right: convertChild(node.expression),
        body: convertChild(node.statement)
      });

      // await is only available in for of statement
      if (node.kind === SyntaxKind.ForOfStatement) {
        (result as any).await = Boolean(
          node.awaitModifier &&
            node.awaitModifier.kind === SyntaxKind.AwaitKeyword
        );
      }
      break;
    }

    // Declarations

    case SyntaxKind.FunctionDeclaration: {
      const isDeclare = hasModifier(SyntaxKind.DeclareKeyword, node);
      let functionDeclarationType = AST_NODE_TYPES.FunctionDeclaration;
      if (isDeclare || !node.body) {
        functionDeclarationType = AST_NODE_TYPES.TSDeclareFunction;
      }

      Object.assign(result, {
        type: functionDeclarationType,
        id: convertChild(node.name),
        generator: !!node.asteriskToken,
        expression: false,
        async: hasModifier(SyntaxKind.AsyncKeyword, node),
        params: convertParameters(node.parameters),
        body: convertChild(node.body) || undefined
      });

      // Process returnType
      if (node.type) {
        result.returnType = convertTypeAnnotation(node.type);
      }

      if (isDeclare) {
        result.declare = true;
      }

      // Process typeParameters
      if (node.typeParameters && node.typeParameters.length) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          node.typeParameters
        );
      }

      // check for exports
      result = fixExports(node, result, ast);

      break;
    }

    case SyntaxKind.VariableDeclaration: {
      Object.assign(result, {
        type: AST_NODE_TYPES.VariableDeclarator,
        id: convertPattern(node.name),
        init: convertChild(node.initializer)
      });

      if (node.exclamationToken) {
        (result as any).definite = true;
      }

      if (node.type) {
        result.id!.typeAnnotation = convertTypeAnnotation(node.type);
        fixTypeAnnotationParentLocation(result.id!);
      }
      break;
    }

    case SyntaxKind.VariableStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.VariableDeclaration,
        declarations: node.declarationList.declarations.map(convertChild),
        kind: getDeclarationKind(node.declarationList)
      });

      if (hasModifier(SyntaxKind.DeclareKeyword, node)) {
        result.declare = true;
      }

      // check for exports
      result = fixExports(node, result, ast);
      break;

    // mostly for for-of, for-in
    case SyntaxKind.VariableDeclarationList:
      Object.assign(result, {
        type: AST_NODE_TYPES.VariableDeclaration,
        declarations: node.declarations.map(convertChild),
        kind: getDeclarationKind(node)
      });
      break;

    // Expressions

    case SyntaxKind.ExpressionStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.ExpressionStatement,
        expression: convertChild(node.expression)
      });
      break;

    case SyntaxKind.ThisKeyword:
      Object.assign(result, {
        type: AST_NODE_TYPES.ThisExpression
      });
      break;

    case SyntaxKind.ArrayLiteralExpression: {
      // TypeScript uses ArrayLiteralExpression in destructuring assignment, too
      if (config.allowPattern) {
        Object.assign(result, {
          type: AST_NODE_TYPES.ArrayPattern,
          elements: node.elements.map(convertPattern)
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.ArrayExpression,
          elements: node.elements.map(convertChild)
        });
      }
      break;
    }

    case SyntaxKind.ObjectLiteralExpression: {
      // TypeScript uses ObjectLiteralExpression in destructuring assignment, too
      if (config.allowPattern) {
        Object.assign(result, {
          type: AST_NODE_TYPES.ObjectPattern,
          properties: node.properties.map(convertPattern)
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.ObjectExpression,
          properties: node.properties.map(convertChild)
        });
      }
      break;
    }

    case SyntaxKind.PropertyAssignment:
      Object.assign(result, {
        type: AST_NODE_TYPES.Property,
        key: convertChild(node.name),
        value: converter(
          node.initializer,
          config.inTypeMode,
          config.allowPattern
        ),
        computed: isComputedProperty(node.name),
        method: false,
        shorthand: false,
        kind: 'init'
      });
      break;

    case SyntaxKind.ShorthandPropertyAssignment: {
      if (node.objectAssignmentInitializer) {
        Object.assign(result, {
          type: AST_NODE_TYPES.Property,
          key: convertChild(node.name),
          value: {
            type: AST_NODE_TYPES.AssignmentPattern,
            left: convertPattern(node.name),
            right: convertChild(node.objectAssignmentInitializer),
            loc: result.loc,
            range: result.range
          },
          computed: false,
          method: false,
          shorthand: true,
          kind: 'init'
        });
      } else {
        // TODO: this node has no initializer field
        Object.assign(result, {
          type: AST_NODE_TYPES.Property,
          key: convertChild(node.name),
          value: convertChild((node as any).initializer || node.name),
          computed: false,
          method: false,
          shorthand: true,
          kind: 'init'
        });
      }
      break;
    }

    case SyntaxKind.ComputedPropertyName:
      if (parent!.kind === SyntaxKind.ObjectLiteralExpression) {
        // TODO: ComputedPropertyName has no name field
        Object.assign(result, {
          type: AST_NODE_TYPES.Property,
          key: convertChild((node as any).name),
          value: convertChild((node as any).name),
          computed: false,
          method: false,
          shorthand: true,
          kind: 'init'
        });
      } else {
        return convertChild(node.expression);
      }
      break;

    case SyntaxKind.PropertyDeclaration: {
      const isAbstract = hasModifier(SyntaxKind.AbstractKeyword, node);
      Object.assign(result, {
        type: isAbstract
          ? AST_NODE_TYPES.TSAbstractClassProperty
          : AST_NODE_TYPES.ClassProperty,
        key: convertChild(node.name),
        value: convertChild(node.initializer),
        computed: isComputedProperty(node.name),
        static: hasModifier(SyntaxKind.StaticKeyword, node),
        readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined
      });

      if (node.type) {
        result.typeAnnotation = convertTypeAnnotation(node.type);
      }

      if (node.decorators) {
        result.decorators = node.decorators.map(convertChild);
      }

      const accessibility = getTSNodeAccessibility(node);
      if (accessibility) {
        result.accessibility = accessibility;
      }

      if (node.name.kind === SyntaxKind.Identifier && node.questionToken) {
        result.optional = true;
      }

      if (node.exclamationToken) {
        (result as any).definite = true;
      }

      if (
        (result as any).key.type === AST_NODE_TYPES.Literal &&
        node.questionToken
      ) {
        result.optional = true;
      }
      break;
    }

    case SyntaxKind.GetAccessor:
    case SyntaxKind.SetAccessor:
    case SyntaxKind.MethodDeclaration: {
      const openingParen = findFirstMatchingToken(
        node.name,
        ast,
        (token: any) => {
          if (!token || !token.kind) {
            return false;
          }
          return getTextForTokenKind(token.kind) === '(';
        },
        ast
      );

      const methodLoc = ast.getLineAndCharacterOfPosition(
          (openingParen as any).getStart(ast)
        ),
        nodeIsMethod = node.kind === SyntaxKind.MethodDeclaration,
        method: ESTreeNode = {
          type: AST_NODE_TYPES.FunctionExpression,
          id: null,
          generator: !!node.asteriskToken,
          expression: false, // ESTreeNode as ESTreeNode here
          async: hasModifier(SyntaxKind.AsyncKeyword, node),
          body: convertChild(node.body),
          range: [node.parameters.pos - 1, result.range[1]],
          loc: {
            start: {
              line: methodLoc.line + 1,
              column: methodLoc.character
            },
            end: result.loc.end
          }
        } as any;

      if (node.type) {
        (method as any).returnType = convertTypeAnnotation(node.type);
      }

      if (parent!.kind === SyntaxKind.ObjectLiteralExpression) {
        (method as any).params = node.parameters.map(convertChild);

        Object.assign(result, {
          type: AST_NODE_TYPES.Property,
          key: convertChild(node.name),
          value: method,
          computed: isComputedProperty(node.name),
          method: nodeIsMethod,
          shorthand: false,
          kind: 'init'
        });
      } else {
        // class

        /**
         * Unlike in object literal methods, class method params can have decorators
         */
        (method as any).params = convertParameters(node.parameters);

        /**
         * TypeScript class methods can be defined as "abstract"
         */
        const methodDefinitionType = hasModifier(
          SyntaxKind.AbstractKeyword,
          node
        )
          ? AST_NODE_TYPES.TSAbstractMethodDefinition
          : AST_NODE_TYPES.MethodDefinition;

        Object.assign(result, {
          type: methodDefinitionType,
          key: convertChild(node.name),
          value: method,
          computed: isComputedProperty(node.name),
          static: hasModifier(SyntaxKind.StaticKeyword, node),
          kind: 'method'
        });

        if (node.decorators) {
          result.decorators = node.decorators.map(convertChild);
        }

        const accessibility = getTSNodeAccessibility(node);
        if (accessibility) {
          result.accessibility = accessibility;
        }
      }

      if (
        (result as any).key.type === AST_NODE_TYPES.Identifier &&
        node.questionToken
      ) {
        (result as any).key.optional = true;
      }

      if (node.kind === SyntaxKind.GetAccessor) {
        (result as any).kind = 'get';
      } else if (node.kind === SyntaxKind.SetAccessor) {
        (result as any).kind = 'set';
      } else if (
        !(result as any).static &&
        node.name.kind === SyntaxKind.StringLiteral &&
        node.name.text === 'constructor' &&
        result.type !== AST_NODE_TYPES.Property
      ) {
        (result as any).kind = 'constructor';
      }

      // Process typeParameters
      if (node.typeParameters && node.typeParameters.length) {
        if (result.type !== AST_NODE_TYPES.Property) {
          method.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
        } else {
          result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
            node.typeParameters
          );
        }
      }

      break;
    }

    // TypeScript uses this even for static methods named "constructor"
    case SyntaxKind.Constructor: {
      const lastModifier = getLastModifier(node);
      const constructorToken =
        (lastModifier && findNextToken(lastModifier, node, ast)) ||
        node.getFirstToken()!;

      const constructorTokenRange = [
        constructorToken.getStart(ast),
        constructorToken.end
      ];

      const constructorLoc = ast.getLineAndCharacterOfPosition(
        node.parameters.pos - 1
      );

      const constructor: ESTreeNode = {
        type: AST_NODE_TYPES.FunctionExpression,
        id: null,
        params: convertParameters(node.parameters),
        generator: false,
        expression: false, // is not present in ESTreeNode
        async: false,
        body: convertChild(node.body),
        range: [node.parameters.pos - 1, result.range[1]],
        loc: {
          start: {
            line: constructorLoc.line + 1,
            column: constructorLoc.character
          },
          end: result.loc.end
        }
      } as any;

      // Process typeParameters
      if (node.typeParameters && node.typeParameters.length) {
        constructor.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          node.typeParameters
        );
      }

      // Process returnType
      if (node.type) {
        constructor.returnType = convertTypeAnnotation(node.type);
      }

      const constructorKey = {
        type: AST_NODE_TYPES.Identifier,
        name: 'constructor',
        range: constructorTokenRange,
        loc: getLocFor(constructorTokenRange[0], constructorTokenRange[1], ast)
      };

      const isStatic = hasModifier(SyntaxKind.StaticKeyword, node);

      Object.assign(result, {
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

      break;
    }

    case SyntaxKind.FunctionExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.FunctionExpression,
        id: convertChild(node.name),
        generator: !!node.asteriskToken,
        params: convertParameters(node.parameters),
        body: convertChild(node.body),
        async: hasModifier(SyntaxKind.AsyncKeyword, node),
        expression: false
      });

      // Process returnType
      if (node.type) {
        result.returnType = convertTypeAnnotation(node.type);
      }

      // Process typeParameters
      if (node.typeParameters && node.typeParameters.length) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          node.typeParameters
        );
      }
      break;

    case SyntaxKind.SuperKeyword:
      Object.assign(result, {
        type: AST_NODE_TYPES.Super
      });
      break;

    case SyntaxKind.ArrayBindingPattern:
      Object.assign(result, {
        type: AST_NODE_TYPES.ArrayPattern,
        elements: node.elements.map(convertPattern)
      });
      break;

    // occurs with missing array elements like [,]
    case SyntaxKind.OmittedExpression:
      return null;

    case SyntaxKind.ObjectBindingPattern:
      Object.assign(result, {
        type: AST_NODE_TYPES.ObjectPattern,
        properties: node.elements.map(convertPattern)
      });
      break;

    case SyntaxKind.BindingElement:
      if (parent!.kind === SyntaxKind.ArrayBindingPattern) {
        const arrayItem = convert({
          node: node.name,
          parent,
          ast,
          additionalOptions
        });

        if (node.initializer) {
          Object.assign(result, {
            type: AST_NODE_TYPES.AssignmentPattern,
            left: arrayItem,
            right: convertChild(node.initializer)
          });
        } else if (node.dotDotDotToken) {
          Object.assign(result, {
            type: AST_NODE_TYPES.RestElement,
            argument: arrayItem
          });
        } else {
          return arrayItem;
        }
      } else if (parent!.kind === SyntaxKind.ObjectBindingPattern) {
        if (node.dotDotDotToken) {
          Object.assign(result, {
            type: AST_NODE_TYPES.RestElement,
            argument: convertChild(node.propertyName || node.name)
          });
        } else {
          Object.assign(result, {
            type: AST_NODE_TYPES.Property,
            key: convertChild(node.propertyName || node.name),
            value: convertChild(node.name),
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
          (result as any).value = {
            type: AST_NODE_TYPES.AssignmentPattern,
            left: convertChild(node.name),
            right: convertChild(node.initializer),
            range: [node.name.getStart(ast), node.initializer.end],
            loc: getLocFor(node.name.getStart(ast), node.initializer.end, ast)
          };
        }
      }
      break;

    case SyntaxKind.ArrowFunction:
      Object.assign(result, {
        type: AST_NODE_TYPES.ArrowFunctionExpression,
        generator: false,
        id: null,
        params: convertParameters(node.parameters),
        body: convertChild(node.body),
        async: hasModifier(SyntaxKind.AsyncKeyword, node),
        expression: node.body.kind !== SyntaxKind.Block
      });

      // Process returnType
      if (node.type) {
        result.returnType = convertTypeAnnotation(node.type);
      }

      // Process typeParameters
      if (node.typeParameters && node.typeParameters.length) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          node.typeParameters
        );
      }
      break;

    case SyntaxKind.YieldExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.YieldExpression,
        delegate: !!node.asteriskToken,
        argument: convertChild(node.expression)
      });
      break;

    case SyntaxKind.AwaitExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.AwaitExpression,
        argument: convertChild(node.expression)
      });
      break;

    // Template Literals

    case SyntaxKind.NoSubstitutionTemplateLiteral:
      Object.assign(result, {
        type: AST_NODE_TYPES.TemplateLiteral,
        quasis: [
          {
            type: AST_NODE_TYPES.TemplateElement,
            value: {
              raw: ast.text.slice(node.getStart(ast) + 1, node.end - 1),
              cooked: node.text
            },
            tail: true,
            range: result.range,
            loc: result.loc
          }
        ],
        expressions: []
      });
      break;

    case SyntaxKind.TemplateExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.TemplateLiteral,
        quasis: [convertChild(node.head)],
        expressions: []
      });

      node.templateSpans.forEach(templateSpan => {
        (result as any).expressions.push(convertChild(templateSpan.expression));
        (result as any).quasis.push(convertChild(templateSpan.literal));
      });
      break;

    case SyntaxKind.TaggedTemplateExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.TaggedTemplateExpression,
        typeParameters: node.typeArguments
          ? convertTypeArgumentsToTypeParameters(node.typeArguments)
          : undefined,
        tag: convertChild(node.tag),
        quasi: convertChild(node.template)
      });
      break;

    case SyntaxKind.TemplateHead:
    case SyntaxKind.TemplateMiddle:
    case SyntaxKind.TemplateTail: {
      const tail = node.kind === SyntaxKind.TemplateTail;
      Object.assign(result, {
        type: AST_NODE_TYPES.TemplateElement,
        value: {
          raw: ast.text.slice(
            node.getStart(ast) + 1,
            node.end - (tail ? 1 : 2)
          ),
          cooked: node.text
        },
        tail
      });
      break;
    }

    // Patterns

    case SyntaxKind.SpreadAssignment:
    case SyntaxKind.SpreadElement: {
      if (config.allowPattern) {
        Object.assign(result, {
          type: AST_NODE_TYPES.RestElement,
          argument: convertPattern(node.expression)
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.SpreadElement,
          argument: convertChild(node.expression)
        });
      }
      break;
    }

    case SyntaxKind.Parameter: {
      let parameter: ESTreeNode;

      if (node.dotDotDotToken) {
        Object.assign(result, {
          type: AST_NODE_TYPES.RestElement,
          argument: convertChild(node.name)
        });
        parameter = result;
      } else if (node.initializer) {
        parameter = convertChild(node.name)!;
        Object.assign(result, {
          type: AST_NODE_TYPES.AssignmentPattern,
          left: parameter,
          right: convertChild(node.initializer)
        });

        if (node.modifiers) {
          // AssignmentPattern should not contain modifiers in range
          result.range[0] = parameter.range[0];
          result.loc = getLocFor(result.range[0], result.range[1], ast);
        }
      } else {
        parameter = result = convert({
          node: node.name,
          parent,
          ast,
          additionalOptions
        })!;
      }

      if (node.type) {
        parameter.typeAnnotation = convertTypeAnnotation(node.type);
        fixTypeAnnotationParentLocation(parameter);
      }

      if (node.questionToken) {
        if (node.questionToken.end > parameter.range[1]) {
          parameter.range[1] = node.questionToken.end;
          parameter.loc = getLocFor(
            parameter.range[0],
            parameter.range[1],
            ast
          );
        }
        parameter.optional = true;
      }

      if (node.modifiers) {
        return {
          type: AST_NODE_TYPES.TSParameterProperty,
          range: [node.getStart(ast), node.end],
          loc: getLoc(node, ast),
          accessibility: getTSNodeAccessibility(node) || undefined,
          readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
          static: hasModifier(SyntaxKind.StaticKeyword, node) || undefined,
          export: hasModifier(SyntaxKind.ExportKeyword, node) || undefined,
          parameter: result
        };
      }

      break;
    }

    // Classes

    case SyntaxKind.ClassDeclaration:
    case SyntaxKind.ClassExpression: {
      const heritageClauses = node.heritageClauses || [];
      let classNodeType = SyntaxKind[node.kind];

      if (node.typeParameters && node.typeParameters.length) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          node.typeParameters
        );
      }

      const superClass = heritageClauses.find(
        clause => clause.token === SyntaxKind.ExtendsKeyword
      );

      if (superClass) {
        if (superClass.types.length > 1) {
          throw createError(
            ast,
            superClass.types[1].pos,
            'Classes can only extend a single class.'
          );
        }

        if (superClass.types[0] && superClass.types[0].typeArguments) {
          (result as any).superTypeParameters = convertTypeArgumentsToTypeParameters(
            superClass.types[0].typeArguments
          );
        }
      }

      const implementsClause = heritageClauses.find(
        clause => clause.token === SyntaxKind.ImplementsKeyword
      );

      const classBodyRange = [node.members.pos - 1, node.end];

      Object.assign(result, {
        type: classNodeType,
        id: convertChild(node.name),
        body: {
          type: AST_NODE_TYPES.ClassBody,
          body: [],
          range: classBodyRange,
          loc: getLocFor(classBodyRange[0], classBodyRange[1], ast)
        },
        superClass:
          superClass && superClass.types[0]
            ? convertChild(superClass.types[0].expression)
            : null
      });

      if (implementsClause) {
        result.implements = implementsClause.types.map(convertChild);
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
        result.decorators = node.decorators.map(convertChild);
      }

      const filteredMembers = node.members.filter(isESTreeClassMember);

      if (filteredMembers.length) {
        result.body.body = filteredMembers.map(convertChild);
      }

      // check for exports
      result = fixExports(node, result, ast);

      break;
    }

    // Modules
    case SyntaxKind.ModuleBlock:
      Object.assign(result, {
        type: AST_NODE_TYPES.TSModuleBlock,
        body: convertBodyExpressions(node.statements)
      });
      break;

    case SyntaxKind.ImportDeclaration:
      Object.assign(result, {
        type: AST_NODE_TYPES.ImportDeclaration,
        source: convertChild(node.moduleSpecifier),
        specifiers: []
      });

      if (node.importClause) {
        if (node.importClause.name) {
          result.specifiers!.push(convertChild(node.importClause));
        }

        if (node.importClause.namedBindings) {
          switch (node.importClause.namedBindings.kind) {
            case SyntaxKind.NamespaceImport:
              result.specifiers!.push(
                convertChild(node.importClause.namedBindings)
              );
              break;
            case SyntaxKind.NamedImports:
              result.specifiers = result.specifiers!.concat(
                node.importClause.namedBindings.elements.map(convertChild)
              );
              break;
          }
        }
      }
      break;

    case SyntaxKind.NamespaceImport:
      Object.assign(result, {
        type: AST_NODE_TYPES.ImportNamespaceSpecifier,
        local: convertChild(node.name)
      });
      break;

    case SyntaxKind.ImportSpecifier:
      Object.assign(result, {
        type: AST_NODE_TYPES.ImportSpecifier,
        local: convertChild(node.name),
        imported: convertChild(node.propertyName || node.name)
      });
      break;

    case SyntaxKind.ImportClause:
      Object.assign(result, {
        type: AST_NODE_TYPES.ImportDefaultSpecifier,
        local: convertChild(node.name)
      });

      // have to adjust location information due to tree differences
      result.range[1] = node.name!.end;
      result.loc = getLocFor(result.range[0], result.range[1], ast);
      break;

    case SyntaxKind.ExportDeclaration:
      if (node.exportClause) {
        Object.assign(result, {
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          source: convertChild(node.moduleSpecifier),
          specifiers: node.exportClause.elements.map(convertChild),
          declaration: null
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.ExportAllDeclaration,
          source: convertChild(node.moduleSpecifier)
        });
      }
      break;

    case SyntaxKind.ExportSpecifier:
      Object.assign(result, {
        type: AST_NODE_TYPES.ExportSpecifier,
        local: convertChild(node.propertyName || node.name),
        exported: convertChild(node.name)
      });
      break;

    case SyntaxKind.ExportAssignment:
      if (node.isExportEquals) {
        Object.assign(result, {
          type: AST_NODE_TYPES.TSExportAssignment,
          expression: convertChild(node.expression)
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.ExportDefaultDeclaration,
          declaration: convertChild(node.expression)
        });
      }
      break;

    // Unary Operations

    case SyntaxKind.PrefixUnaryExpression:
    case SyntaxKind.PostfixUnaryExpression: {
      const operator = getTextForTokenKind(node.operator) || '';
      Object.assign(result, {
        /**
         * ESTree uses UpdateExpression for ++/--
         */
        type: /^(?:\+\+|--)$/.test(operator)
          ? AST_NODE_TYPES.UpdateExpression
          : AST_NODE_TYPES.UnaryExpression,
        operator,
        prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
        argument: convertChild(node.operand)
      });
      break;
    }

    case SyntaxKind.DeleteExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.UnaryExpression,
        operator: 'delete',
        prefix: true,
        argument: convertChild(node.expression)
      });
      break;

    case SyntaxKind.VoidExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.UnaryExpression,
        operator: 'void',
        prefix: true,
        argument: convertChild(node.expression)
      });
      break;

    case SyntaxKind.TypeOfExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.UnaryExpression,
        operator: 'typeof',
        prefix: true,
        argument: convertChild(node.expression)
      });
      break;

    case SyntaxKind.TypeOperator:
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTypeOperator,
        operator: getTextForTokenKind(node.operator),
        typeAnnotation: convertChild(node.type)
      });
      break;

    // Binary Operations

    case SyntaxKind.BinaryExpression:
      // TypeScript uses BinaryExpression for sequences as well
      if (isComma(node.operatorToken)) {
        Object.assign(result, {
          type: AST_NODE_TYPES.SequenceExpression,
          expressions: []
        });

        const left = convertChild(node.left)!,
          right = convertChild(node.right)!;

        if (left.type === AST_NODE_TYPES.SequenceExpression) {
          (result as any).expressions = (result as any).expressions.concat(
            (left as any).expressions
          );
        } else {
          (result as any).expressions.push(left);
        }

        if (right.type === AST_NODE_TYPES.SequenceExpression) {
          (result as any).expressions = (result as any).expressions.concat(
            (right as any).expressions
          );
        } else {
          (result as any).expressions.push(right);
        }
      } else {
        const type = getBinaryExpressionType(node.operatorToken);
        Object.assign(result, {
          type,
          operator: getTextForTokenKind(node.operatorToken.kind),
          left: converter(
            node.left,
            config.inTypeMode,
            type === AST_NODE_TYPES.AssignmentExpression
          ),
          right: convertChild(node.right)
        });

        // if the binary expression is in a destructured array, switch it
        if (result.type === AST_NODE_TYPES.AssignmentExpression) {
          if (config.allowPattern) {
            delete (result as any).operator;
            result.type = AST_NODE_TYPES.AssignmentPattern;
          }
        }
      }
      break;

    case SyntaxKind.PropertyAccessExpression:
      if (isJSXToken(parent!)) {
        const jsxMemberExpression = {
          type: AST_NODE_TYPES.MemberExpression,
          object: convertChild(node.expression),
          property: convertChild(node.name)
        };
        const isNestedMemberExpression =
          node.expression.kind === SyntaxKind.PropertyAccessExpression;
        if (node.expression.kind === SyntaxKind.ThisKeyword) {
          (jsxMemberExpression as any).object.name = 'this';
        }

        (jsxMemberExpression as any).object.type = isNestedMemberExpression
          ? AST_NODE_TYPES.MemberExpression
          : AST_NODE_TYPES.JSXIdentifier;
        (jsxMemberExpression as any).property.type =
          AST_NODE_TYPES.JSXIdentifier;
        Object.assign(result, jsxMemberExpression);
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.MemberExpression,
          object: convertChild(node.expression),
          property: convertChild(node.name),
          computed: false
        });
      }
      break;

    case SyntaxKind.ElementAccessExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.MemberExpression,
        object: convertChild(node.expression),
        property: convertChild(node.argumentExpression),
        computed: true
      });
      break;

    case SyntaxKind.ConditionalExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.ConditionalExpression,
        test: convertChild(node.condition),
        consequent: convertChild(node.whenTrue),
        alternate: convertChild(node.whenFalse)
      });
      break;

    case SyntaxKind.CallExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.CallExpression,
        callee: convertChild(node.expression),
        arguments: node.arguments.map(convertChild)
      });
      if (node.typeArguments && node.typeArguments.length) {
        result.typeParameters = convertTypeArgumentsToTypeParameters(
          node.typeArguments
        );
      }
      break;

    case SyntaxKind.NewExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.NewExpression,
        callee: convertChild(node.expression),
        arguments: node.arguments ? node.arguments.map(convertChild) : []
      });
      if (node.typeArguments && node.typeArguments.length) {
        result.typeParameters = convertTypeArgumentsToTypeParameters(
          node.typeArguments
        );
      }
      break;

    case SyntaxKind.MetaProperty: {
      const newToken = convertToken(node.getFirstToken()!, ast);
      Object.assign(result, {
        type: AST_NODE_TYPES.MetaProperty,
        meta: {
          type: AST_NODE_TYPES.Identifier,
          range: newToken.range,
          loc: newToken.loc,
          name: getTextForTokenKind(node.keywordToken)
        },
        property: convertChild(node.name)
      });
      break;
    }

    case SyntaxKind.Decorator: {
      Object.assign(result, {
        type: AST_NODE_TYPES.Decorator,
        expression: convertChild(node.expression)
      });
      break;
    }

    // Literals

    case SyntaxKind.StringLiteral:
      Object.assign(result, {
        type: AST_NODE_TYPES.Literal,
        raw: ast.text.slice(result.range[0], result.range[1])
      });
      if ((parent as any).name && (parent as any).name === node) {
        (result as any).value = node.text;
      } else {
        (result as any).value = unescapeStringLiteralText(node.text);
      }
      break;

    case SyntaxKind.NumericLiteral: {
      Object.assign(result, {
        type: AST_NODE_TYPES.Literal,
        value: Number(node.text),
        raw: node.getText()
      });
      break;
    }

    case SyntaxKind.BigIntLiteral: {
      const raw = ast.text.slice(result.range[0], result.range[1]);
      const value = raw.slice(0, -1); // remove suffix `n`
      Object.assign(result, {
        type: AST_NODE_TYPES.BigIntLiteral,
        raw,
        value
      });
      break;
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

      Object.assign(result, {
        type: AST_NODE_TYPES.Literal,
        value: regex,
        raw: node.text,
        regex: {
          pattern,
          flags
        }
      });
      break;
    }

    case SyntaxKind.TrueKeyword:
      Object.assign(result, {
        type: AST_NODE_TYPES.Literal,
        value: true,
        raw: 'true'
      });
      break;

    case SyntaxKind.FalseKeyword:
      Object.assign(result, {
        type: AST_NODE_TYPES.Literal,
        value: false,
        raw: 'false'
      });
      break;

    case SyntaxKind.NullKeyword: {
      if (config.inTypeMode) {
        Object.assign(result, {
          type: AST_NODE_TYPES.TSNullKeyword
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.Literal,
          value: null,
          raw: 'null'
        });
      }
      break;
    }

    case SyntaxKind.ImportKeyword:
      Object.assign(result, {
        type: AST_NODE_TYPES.Import
      });
      break;

    case SyntaxKind.EmptyStatement:
    case SyntaxKind.DebuggerStatement:
      Object.assign(result, {
        type: SyntaxKind[node.kind]
      });
      break;

    // JSX

    case SyntaxKind.JsxElement:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXElement,
        openingElement: convertChild(node.openingElement),
        closingElement: convertChild(node.closingElement),
        children: node.children.map(convertChild)
      });

      break;

    case SyntaxKind.JsxFragment:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXFragment,
        openingFragment: convertChild(node.openingFragment),
        closingFragment: convertChild(node.closingFragment),
        children: node.children.map(convertChild)
      });
      break;

    case SyntaxKind.JsxSelfClosingElement: {
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXElement,
        /**
         * Convert SyntaxKind.JsxSelfClosingElement to SyntaxKind.JsxOpeningElement,
         * TypeScript does not seem to have the idea of openingElement when tag is self-closing
         */
        openingElement: {
          type: AST_NODE_TYPES.JSXOpeningElement,
          typeParameters: node.typeArguments
            ? convertTypeArgumentsToTypeParameters(node.typeArguments)
            : undefined,
          selfClosing: true,
          name: convertTypeScriptJSXTagNameToESTreeName(node.tagName),
          attributes: node.attributes.properties.map(convertChild),
          range: result.range,
          loc: result.loc
        },
        closingElement: null,
        children: []
      });
      break;
    }

    case SyntaxKind.JsxOpeningElement:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXOpeningElement,
        typeParameters: node.typeArguments
          ? convertTypeArgumentsToTypeParameters(node.typeArguments)
          : undefined,
        selfClosing: false,
        name: convertTypeScriptJSXTagNameToESTreeName(node.tagName),
        attributes: node.attributes.properties.map(convertChild)
      });
      break;

    case SyntaxKind.JsxClosingElement:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXClosingElement,
        name: convertTypeScriptJSXTagNameToESTreeName(node.tagName)
      });
      break;

    case SyntaxKind.JsxOpeningFragment:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXOpeningFragment
      });
      break;
    case SyntaxKind.JsxClosingFragment:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXClosingFragment
      });
      break;

    case SyntaxKind.JsxExpression: {
      const eloc = ast.getLineAndCharacterOfPosition(result.range[0] + 1);
      const expression = node.expression
        ? convertChild(node.expression)
        : {
            type: AST_NODE_TYPES.JSXEmptyExpression,
            loc: {
              start: {
                line: eloc.line + 1,
                column: eloc.character
              },
              end: {
                line: result.loc.end.line,
                column: result.loc.end.column - 1
              }
            },
            range: [result.range[0] + 1, result.range[1] - 1]
          };

      Object.assign(result, {
        type: node.dotDotDotToken
          ? AST_NODE_TYPES.JSXSpreadChild
          : AST_NODE_TYPES.JSXExpressionContainer,
        expression
      });

      break;
    }

    case SyntaxKind.JsxAttribute: {
      const attributeName = convertToken(node.name, ast);
      attributeName.type = AST_NODE_TYPES.JSXIdentifier;
      attributeName.name = attributeName.value;
      delete attributeName.value;

      Object.assign(result, {
        type: AST_NODE_TYPES.JSXAttribute,
        name: attributeName,
        value: convertChild(node.initializer)
      });

      break;
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

      const type = additionalOptions.useJSXTextNode
        ? AST_NODE_TYPES.JSXText
        : AST_NODE_TYPES.Literal;

      Object.assign(result, {
        type,
        value: ast.text.slice(start, end),
        raw: ast.text.slice(start, end)
      });

      result.loc = getLocFor(start, end, ast);
      result.range = [start, end];

      break;
    }

    case SyntaxKind.JsxSpreadAttribute:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXSpreadAttribute,
        argument: convertChild(node.expression)
      });
      break;

    case SyntaxKind.QualifiedName: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSQualifiedName,
        left: convertChild(node.left),
        right: convertChild(node.right)
      });
      break;
    }

    // TypeScript specific

    case SyntaxKind.TypeReference: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTypeReference,
        typeName: convertChildType(node.typeName),
        typeParameters: node.typeArguments
          ? convertTypeArgumentsToTypeParameters(node.typeArguments)
          : undefined
      });
      break;
    }

    case SyntaxKind.TypeParameter: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTypeParameter,
        name: convertChildType(node.name),
        constraint: node.constraint
          ? convertChildType(node.constraint)
          : undefined,
        default: node.default ? convertChildType(node.default) : undefined
      });
      break;
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
      Object.assign(result, {
        type: AST_NODE_TYPES[`TS${SyntaxKind[node.kind]}` as AST_NODE_TYPES]
      });
      break;
    }

    case SyntaxKind.NonNullExpression: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSNonNullExpression,
        expression: convertChild(node.expression)
      });
      break;
    }

    case SyntaxKind.TypeLiteral: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTypeLiteral,
        members: node.members.map(convertChild)
      });
      break;
    }

    case SyntaxKind.ArrayType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSArrayType,
        elementType: convertChildType(node.elementType)
      });
      break;
    }

    case SyntaxKind.IndexedAccessType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSIndexedAccessType,
        objectType: convertChildType(node.objectType),
        indexType: convertChildType(node.indexType)
      });
      break;
    }

    case SyntaxKind.ConditionalType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSConditionalType,
        checkType: convertChildType(node.checkType),
        extendsType: convertChildType(node.extendsType),
        trueType: convertChildType(node.trueType),
        falseType: convertChildType(node.falseType)
      });
      break;
    }

    case SyntaxKind.TypeQuery: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTypeQuery,
        exprName: convertChildType(node.exprName)
      });
      break;
    }

    case SyntaxKind.MappedType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSMappedType,
        typeParameter: convertChildType(node.typeParameter)
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
        result.typeAnnotation = convertChildType(node.type);
      }
      break;
    }

    case SyntaxKind.ParenthesizedExpression:
      return convert({
        node: node.expression,
        parent,
        ast,
        additionalOptions
      });

    case SyntaxKind.TypeAliasDeclaration: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTypeAliasDeclaration,
        id: convertChild(node.name),
        typeAnnotation: convertChildType(node.type)
      });

      if (hasModifier(SyntaxKind.DeclareKeyword, node)) {
        result.declare = true;
      }

      // Process typeParameters
      if (node.typeParameters && node.typeParameters.length) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          node.typeParameters
        );
      }

      // check for exports
      result = fixExports(node, result, ast);
      break;
    }

    case SyntaxKind.MethodSignature: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSMethodSignature,
        computed: isComputedProperty(node.name),
        key: convertChild(node.name),
        params: convertParameters(node.parameters)
      });

      if (isOptional(node)) {
        result.optional = true;
      }

      if (node.type) {
        result.returnType = convertTypeAnnotation(node.type);
      }

      if (hasModifier(SyntaxKind.ReadonlyKeyword, node)) {
        result.readonly = true;
      }

      if (node.typeParameters) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
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
      break;
    }

    case SyntaxKind.PropertySignature: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSPropertySignature,
        optional: isOptional(node) || undefined,
        computed: isComputedProperty(node.name),
        key: convertChild(node.name),
        typeAnnotation: node.type
          ? convertTypeAnnotation(node.type)
          : undefined,
        initializer: convertChild(node.initializer) || undefined,
        readonly: hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
        static: hasModifier(SyntaxKind.StaticKeyword, node) || undefined,
        export: hasModifier(SyntaxKind.ExportKeyword, node) || undefined
      });

      const accessibility = getTSNodeAccessibility(node);
      if (accessibility) {
        result.accessibility = accessibility;
      }

      break;
    }

    case SyntaxKind.IndexSignature: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSIndexSignature,
        parameters: node.parameters.map(convertChild)
      });

      if (node.type) {
        result.typeAnnotation = convertTypeAnnotation(node.type);
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
      break;
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
      Object.assign(result, {
        type: type,
        params: convertParameters(node.parameters)
      });

      if (node.type) {
        result.returnType = convertTypeAnnotation(node.type);
      }

      if (node.typeParameters) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          node.typeParameters
        );
      }

      break;
    }

    case SyntaxKind.ExpressionWithTypeArguments: {
      Object.assign(result, {
        type:
          parent && parent.kind === SyntaxKind.InterfaceDeclaration
            ? AST_NODE_TYPES.TSInterfaceHeritage
            : AST_NODE_TYPES.TSClassImplements,
        expression: convertChild(node.expression)
      });

      if (node.typeArguments && node.typeArguments.length) {
        result.typeParameters = convertTypeArgumentsToTypeParameters(
          node.typeArguments
        );
      }
      break;
    }

    case SyntaxKind.InterfaceDeclaration: {
      const interfaceHeritageClauses = node.heritageClauses || [];

      if (node.typeParameters && node.typeParameters.length) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          node.typeParameters
        );
      }

      const interfaceBodyRange = [node.members.pos - 1, node.end];

      Object.assign(result, {
        type: AST_NODE_TYPES.TSInterfaceDeclaration,
        body: {
          type: AST_NODE_TYPES.TSInterfaceBody,
          body: node.members.map(member => convertChild(member)),
          range: interfaceBodyRange,
          loc: getLocFor(interfaceBodyRange[0], interfaceBodyRange[1], ast)
        },
        id: convertChild(node.name)
      });

      if (interfaceHeritageClauses.length > 0) {
        const interfaceExtends = [];
        const interfaceImplements = [];

        for (const heritageClause of interfaceHeritageClauses) {
          if (heritageClause.token === SyntaxKind.ExtendsKeyword) {
            for (const n of heritageClause.types) {
              interfaceExtends.push(convertChild(n));
            }
          } else if (heritageClause.token === SyntaxKind.ImplementsKeyword) {
            for (const n of heritageClause.types) {
              interfaceImplements.push(convertChild(n));
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
        result.decorators = node.decorators.map(convertChild);
      }
      if (hasModifier(SyntaxKind.AbstractKeyword, node)) {
        result.abstract = true;
      }
      if (hasModifier(SyntaxKind.DeclareKeyword, node)) {
        result.declare = true;
      }
      // check for exports
      result = fixExports(node, result, ast);

      break;
    }

    case SyntaxKind.FirstTypeNode:
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTypePredicate,
        parameterName: convertChild(node.parameterName),
        typeAnnotation: convertTypeAnnotation(node.type)
      });
      /**
       * Specific fix for type-guard location data
       */
      result.typeAnnotation!.loc = result.typeAnnotation!.typeAnnotation!.loc;
      result.typeAnnotation!.range = result.typeAnnotation!.typeAnnotation!.range;
      break;

    case SyntaxKind.ImportType:
      Object.assign(result, {
        type: AST_NODE_TYPES.TSImportType,
        isTypeOf: !!node.isTypeOf,
        parameter: convertChild(node.argument),
        qualifier: convertChild(node.qualifier),
        typeParameters: node.typeArguments
          ? convertTypeArgumentsToTypeParameters(node.typeArguments)
          : null
      });
      break;

    case SyntaxKind.EnumDeclaration: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSEnumDeclaration,
        id: convertChild(node.name),
        members: node.members.map(convertChild)
      });
      // apply modifiers first...
      applyModifiersToResult(node.modifiers);
      // ...then check for exports
      result = fixExports(node, result, ast);
      /**
       * Semantically, decorators are not allowed on enum declarations,
       * but the TypeScript compiler will parse them and produce a valid AST,
       * so we handle them here too.
       */
      if (node.decorators) {
        result.decorators = node.decorators.map(convertChild);
      }
      break;
    }

    case SyntaxKind.EnumMember: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSEnumMember,
        id: convertChild(node.name)
      });
      if (node.initializer) {
        (result as any).initializer = convertChild(node.initializer);
      }
      break;
    }

    case SyntaxKind.AbstractKeyword: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSAbstractKeyword
      });
      break;
    }

    case SyntaxKind.ModuleDeclaration: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSModuleDeclaration,
        id: convertChild(node.name)
      });
      if (node.body) {
        result.body = convertChild(node.body);
      }
      // apply modifiers first...
      applyModifiersToResult(node.modifiers);
      if (node.flags & ts.NodeFlags.GlobalAugmentation) {
        result.global = true;
      }
      // ...then check for exports
      result = fixExports(node, result, ast);
      break;
    }

    // TypeScript specific types
    case SyntaxKind.OptionalType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSOptionalType,
        typeAnnotation: convertChildType(node.type)
      });
      break;
    }
    case SyntaxKind.ParenthesizedType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSParenthesizedType,
        typeAnnotation: convertChildType(node.type)
      });
      break;
    }
    case SyntaxKind.TupleType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTupleType,
        elementTypes: node.elementTypes.map(convertChildType)
      });
      break;
    }
    case SyntaxKind.UnionType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSUnionType,
        types: node.types.map(convertChildType)
      });
      break;
    }
    case SyntaxKind.IntersectionType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSIntersectionType,
        types: node.types.map(convertChildType)
      });
      break;
    }
    case SyntaxKind.RestType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSRestType,
        typeAnnotation: convertChildType(node.type)
      });
      break;
    }
    case SyntaxKind.AsExpression: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSAsExpression,
        expression: convertChild(node.expression),
        typeAnnotation: convertChildType(node.type)
      });
      break;
    }
    case SyntaxKind.InferType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSInferType,
        typeParameter: convertChildType(node.typeParameter)
      });
      break;
    }
    case SyntaxKind.LiteralType: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSLiteralType,
        literal: convertChildType(node.literal)
      });
      break;
    }
    case SyntaxKind.TypeAssertionExpression: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTypeAssertion,
        typeAnnotation: convertChildType(node.type),
        expression: convertChild(node.expression)
      });
      break;
    }
    case SyntaxKind.ImportEqualsDeclaration: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSImportEqualsDeclaration,
        id: convertChild(node.name),
        moduleReference: convertChild(node.moduleReference),
        isExport: hasModifier(SyntaxKind.ExportKeyword, node)
      });
      break;
    }
    case SyntaxKind.ExternalModuleReference: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSExternalModuleReference,
        expression: convertChild(node.expression)
      });
      break;
    }
    case SyntaxKind.NamespaceExportDeclaration: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSNamespaceExportDeclaration,
        id: convertChild(node.name)
      });
      break;
    }

    default:
      deeplyCopy();
  }

  if (additionalOptions.shouldProvideParserServices) {
    tsNodeToESTreeNodeMap.set(node, result);
    esTreeNodeToTSNodeMap.set(result, node);
  }

  return result;
}
