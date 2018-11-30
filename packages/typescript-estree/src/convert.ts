/**
 * @fileoverview Converts TypeScript AST into ESTree format.
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import ts from 'typescript';
import nodeUtils from './node-utils';
import { AST_NODE_TYPES } from './ast-node-types';
import { ESTreeNode } from './temp-types-based-on-js-source';

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
  ast: ts.SourceFile;
  additionalOptions: ConvertAdditionalOptions;
}

/**
 * Converts a TypeScript node into an ESTree node
 * @param  {Object} config configuration options for the conversion
 * @param  {ts.Node} config.node   the ts.Node
 * @param  {ts.Node} config.parent the parent ts.Node
 * @param  {ts.SourceFile} config.ast the full TypeScript AST
 * @param  {Object} config.additionalOptions additional options for the conversion
 * @returns {ESTreeNode|null}        the converted ESTreeNode
 */
export default function convert(config: ConvertConfig): ESTreeNode | null {
  const node = config.node as ts.Node;
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
  let result: Partial<ESTreeNode> = {
    type: '',
    range: [node.getStart(ast), node.end],
    loc: nodeUtils.getLoc(node, ast)
  };

  /**
   * Copies the result object into an ESTree node with just a type property.
   * This is used only for leaf nodes that have no other properties.
   * @returns {void}
   */
  function simplyCopy(): void {
    Object.assign(result, {
      type: SyntaxKind[node.kind]
    });
  }

  /**
   * Converts a TypeScript node into an ESTree node.
   * @param  {ts.Node} child the child ts.Node
   * @returns {ESTreeNode|null}       the converted ESTree node
   */
  function convertChild(child: ts.Node): ESTreeNode | null {
    return convert({ node: child, parent: node, ast, additionalOptions });
  }

  /**
   * Converts a child into a type annotation. This creates an intermediary
   * TypeAnnotation node to match what Flow does.
   * @param {ts.Node} child The TypeScript AST node to convert.
   * @returns {ESTreeNode} The type annotation node.
   */
  function convertTypeAnnotation(child: ts.Node): ESTreeNode {
    const annotation = convertChild(child);
    const annotationStartCol = child.getFullStart() - 1;
    const loc = nodeUtils.getLocFor(annotationStartCol, child.end, ast);
    return {
      type: AST_NODE_TYPES.TSTypeAnnotation,
      loc,
      range: [annotationStartCol, child.end],
      typeAnnotation: annotation
    };
  }

  /**
   * Converts a ts.Node's typeArguments ts.NodeArray to a flow-like typeParameters node
   * @param {ts.NodeArray} typeArguments ts.Node typeArguments
   * @returns {ESTreeNode} TypeParameterInstantiation node
   */
  function convertTypeArgumentsToTypeParameters(
    typeArguments: ts.NodeArray<any>
  ): ESTreeNode {
    /**
     * Even if typeArguments is an empty array, TypeScript sets a `pos` and `end`
     * property on the array object so we can safely read the values here
     */
    const start = typeArguments.pos - 1;
    let end = typeArguments.end + 1;
    if (typeArguments && typeArguments.length) {
      const firstTypeArgument = typeArguments[0];
      const typeArgumentsParent = firstTypeArgument.parent;
      /**
       * In the case of the parent being a CallExpression or a TypeReference we have to use
       * slightly different logic to calculate the correct end position
       */
      if (
        typeArgumentsParent &&
        (typeArgumentsParent.kind === SyntaxKind.CallExpression ||
          typeArgumentsParent.kind === SyntaxKind.TypeReference)
      ) {
        const lastTypeArgument = typeArguments[typeArguments.length - 1];
        const greaterThanToken = nodeUtils.findNextToken(
          lastTypeArgument,
          ast,
          ast
        );
        end = greaterThanToken!.end;
      }
    }
    return {
      type: AST_NODE_TYPES.TSTypeParameterInstantiation,
      range: [start, end],
      loc: nodeUtils.getLocFor(start, end, ast),
      params: typeArguments.map(typeArgument => {
        if (nodeUtils.isTypeKeyword(typeArgument.kind)) {
          return {
            type: AST_NODE_TYPES[`TS${SyntaxKind[typeArgument.kind]}`],
            range: [typeArgument.getStart(ast), typeArgument.getEnd()],
            loc: nodeUtils.getLoc(typeArgument, ast)
          };
        }
        if (typeArgument.kind === SyntaxKind.ImportType) {
          return convert({
            node: typeArgument,
            parent: null,
            ast,
            additionalOptions
          });
        }
        return {
          type: AST_NODE_TYPES.TSTypeReference,
          range: [typeArgument.getStart(ast), typeArgument.getEnd()],
          loc: nodeUtils.getLoc(typeArgument, ast),
          typeName: convertChild(typeArgument.typeName || typeArgument),
          typeParameters: typeArgument.typeArguments
            ? convertTypeArgumentsToTypeParameters(typeArgument.typeArguments)
            : undefined
        };
      })
    };
  }

  /**
   * Converts a ts.Node's typeParameters ts.ts.NodeArray to a flow-like TypeParameterDeclaration node
   * @param {ts.NodeArray} typeParameters ts.Node typeParameters
   * @returns {ESTreeNode} TypeParameterDeclaration node
   */
  function convertTSTypeParametersToTypeParametersDeclaration(
    typeParameters: ts.NodeArray<any>
  ): ESTreeNode {
    const firstTypeParameter = typeParameters[0];
    const lastTypeParameter = typeParameters[typeParameters.length - 1];

    const greaterThanToken = nodeUtils.findNextToken(
      lastTypeParameter,
      ast,
      ast
    );

    return {
      type: AST_NODE_TYPES.TSTypeParameterDeclaration,
      range: [firstTypeParameter.pos - 1, greaterThanToken!.end],
      loc: nodeUtils.getLocFor(
        firstTypeParameter.pos - 1,
        greaterThanToken!.end,
        ast
      ),
      params: typeParameters.map(typeParameter => {
        const name = typeParameter.name.text;

        const constraint = typeParameter.constraint
          ? convert({
              node: typeParameter.constraint,
              parent: typeParameter,
              ast,
              additionalOptions
            })
          : undefined;

        const defaultParameter = typeParameter.default
          ? convert({
              node: typeParameter.default,
              parent: typeParameter,
              ast,
              additionalOptions
            })
          : typeParameter.default;

        return {
          type: AST_NODE_TYPES.TSTypeParameter,
          range: [typeParameter.getStart(ast), typeParameter.getEnd()],
          loc: nodeUtils.getLoc(typeParameter, ast),
          name,
          constraint,
          default: defaultParameter
        };
      })
    };
  }

  /**
   * Converts a child into a class implements node. This creates an intermediary
   * ClassImplements node to match what Flow does.
   * @param {ts.Node} child The TypeScript AST node to convert.
   * @returns {ESTreeNode} The type annotation node.
   */
  function convertClassImplements(child: any): ESTreeNode {
    const id = convertChild(child.expression) as ESTreeNode;
    const classImplementsNode: ESTreeNode = {
      type: AST_NODE_TYPES.ClassImplements,
      loc: id.loc,
      range: id.range,
      id
    };
    if (child.typeArguments && child.typeArguments.length) {
      classImplementsNode.typeParameters = convertTypeArgumentsToTypeParameters(
        child.typeArguments
      );
    }
    return classImplementsNode;
  }

  /**
   * Converts a child into a interface heritage node.
   * @param {ts.Node} child The TypeScript AST node to convert.
   * @returns {ESTreeNode} The type annotation node.
   */
  function convertInterfaceHeritageClause(child: any): ESTreeNode {
    const id = convertChild(child.expression) as ESTreeNode;
    const classImplementsNode: ESTreeNode = {
      type: AST_NODE_TYPES.TSInterfaceHeritage,
      loc: id.loc,
      range: id.range,
      id
    };

    if (child.typeArguments && child.typeArguments.length) {
      classImplementsNode.typeParameters = convertTypeArgumentsToTypeParameters(
        child.typeArguments
      );
    }
    return classImplementsNode;
  }

  /**
   * Converts a ts.NodeArray of ts.Decorators into an array of ESTreeNode decorators
   * @param  {ts.NodeArray<ts.Decorator>} decorators A ts.NodeArray of ts.Decorators to be converted
   * @returns {ESTreeNode[]}       an array of converted ESTreeNode decorators
   */
  function convertDecorators(
    decorators: ts.NodeArray<ts.Decorator>
  ): ESTreeNode[] {
    if (!decorators || !decorators.length) {
      return [];
    }
    return decorators.map(decorator => {
      const expression = convertChild(decorator.expression);
      return {
        type: AST_NODE_TYPES.Decorator,
        range: [decorator.getStart(ast), decorator.end],
        loc: nodeUtils.getLoc(decorator, ast),
        expression
      };
    });
  }

  /**
   * Converts an array of ts.Node parameters into an array of ESTreeNode params
   * @param  {ts.Node[]} parameters An array of ts.Node params to be converted
   * @returns {ESTreeNode[]}       an array of converted ESTreeNode params
   */
  function convertParameters(parameters: ts.Node[]): ESTreeNode[] {
    if (!parameters || !parameters.length) {
      return [];
    }
    return parameters.map(param => {
      const convertedParam = convertChild(param) as ESTreeNode;
      if (!param.decorators || !param.decorators.length) {
        return convertedParam;
      }
      return Object.assign(convertedParam, {
        decorators: convertDecorators(param.decorators)
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
    const customType = `TS${SyntaxKind[node.kind]}`;
    /**
     * If the "errorOnUnknownASTType" option is set to true, throw an error,
     * otherwise fallback to just inlcuding the unknown type as-is.
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
          const decorators = convertDecorators((node as any).decorators);
          if (decorators && decorators.length) {
            result.decorators = decorators;
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
   * @param {Object} tagName  the tagName object from a JSX ts.Node
   * @returns {Object}    the converted ESTree name object
   */
  function convertTypeScriptJSXTagNameToESTreeName(tagName: any): any {
    const tagNameToken = nodeUtils.convertToken(tagName, ast);

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
   * @param {ts.Node[]} modifiers original ts.Nodes from the node.modifiers array
   * @returns {void} (the current result object will be mutated)
   */
  function applyModifiersToResult(modifiers: ts.Node[]): void {
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
    const end = (node as any).type.getEnd();
    typeAnnotationParent.range[1] = end;
    const loc = nodeUtils.getLocFor(
      typeAnnotationParent.range[0],
      typeAnnotationParent.range[1],
      ast
    );
    typeAnnotationParent.loc = loc;
  }

  /**
   * The core of the conversion logic:
   * Identify and convert each relevant TypeScript SyntaxKind
   */
  switch (node.kind) {
    case SyntaxKind.SourceFile:
      Object.assign(result, {
        type: AST_NODE_TYPES.Program,
        body: [],
        sourceType: (node as any).externalModuleIndicator ? 'module' : 'script'
      });

      // filter out unknown nodes for now
      (node as any).statements.forEach((statement: any) => {
        const convertedStatement = convertChild(statement);
        if (convertedStatement) {
          result.body.push(convertedStatement);
        }
      });

      (result as any).range[1] = (node as any).endOfFileToken.end;
      result.loc = nodeUtils.getLocFor(
        node.getStart(ast),
        (result as any).range[1],
        ast
      );
      break;

    case SyntaxKind.Block:
      Object.assign(result, {
        type: AST_NODE_TYPES.BlockStatement,
        body: (node as any).statements.map(convertChild)
      });
      break;

    case SyntaxKind.Identifier:
      Object.assign(result, {
        type: AST_NODE_TYPES.Identifier,
        name: (node as any).text
      });
      break;

    case SyntaxKind.WithStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.WithStatement,
        object: convertChild((node as any).expression),
        body: convertChild((node as any).statement)
      });
      break;

    // Control Flow

    case SyntaxKind.ReturnStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.ReturnStatement,
        argument: convertChild((node as any).expression)
      });
      break;

    case SyntaxKind.LabeledStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.LabeledStatement,
        label: convertChild((node as any).label),
        body: convertChild((node as any).statement)
      });
      break;

    case SyntaxKind.BreakStatement:
    case SyntaxKind.ContinueStatement:
      Object.assign(result, {
        type: SyntaxKind[node.kind],
        label: convertChild((node as any).label)
      });
      break;

    // Choice

    case SyntaxKind.IfStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.IfStatement,
        test: convertChild((node as any).expression),
        consequent: convertChild((node as any).thenStatement),
        alternate: convertChild((node as any).elseStatement)
      });
      break;

    case SyntaxKind.SwitchStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.SwitchStatement,
        discriminant: convertChild((node as any).expression),
        cases: (node as any).caseBlock.clauses.map(convertChild)
      });
      break;

    case SyntaxKind.CaseClause:
    case SyntaxKind.DefaultClause:
      Object.assign(result, {
        type: AST_NODE_TYPES.SwitchCase,
        test: convertChild((node as any).expression),
        consequent: (node as any).statements.map(convertChild)
      });
      break;

    // Exceptions

    case SyntaxKind.ThrowStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.ThrowStatement,
        argument: convertChild((node as any).expression)
      });
      break;

    case SyntaxKind.TryStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.TryStatement,
        block: convert({
          node: (node as any).tryBlock,
          parent: null,
          ast,
          additionalOptions
        }),
        handler: convertChild((node as any).catchClause),
        finalizer: convertChild((node as any).finallyBlock)
      });
      break;

    case SyntaxKind.CatchClause:
      Object.assign(result, {
        type: AST_NODE_TYPES.CatchClause,
        param: (node as any).variableDeclaration
          ? convertChild((node as any).variableDeclaration.name)
          : null,
        body: convertChild((node as any).block)
      });
      break;

    // Loops

    case SyntaxKind.WhileStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.WhileStatement,
        test: convertChild((node as any).expression),
        body: convertChild((node as any).statement)
      });
      break;

    /**
     * Unlike other parsers, TypeScript calls a "DoWhileStatement"
     * a "DoStatement"
     */
    case SyntaxKind.DoStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.DoWhileStatement,
        test: convertChild((node as any).expression),
        body: convertChild((node as any).statement)
      });
      break;

    case SyntaxKind.ForStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.ForStatement,
        init: convertChild((node as any).initializer),
        test: convertChild((node as any).condition),
        update: convertChild((node as any).incrementor),
        body: convertChild((node as any).statement)
      });
      break;

    case SyntaxKind.ForInStatement:
    case SyntaxKind.ForOfStatement: {
      const isAwait = !!(
        (node as any).awaitModifier &&
        (node as any).awaitModifier.kind === SyntaxKind.AwaitKeyword
      );
      Object.assign(result, {
        type: SyntaxKind[node.kind],
        left: convertChild((node as any).initializer),
        right: convertChild((node as any).expression),
        body: convertChild((node as any).statement),
        await: isAwait
      });
      break;
    }

    // Declarations

    case SyntaxKind.FunctionDeclaration: {
      let functionDeclarationType = AST_NODE_TYPES.FunctionDeclaration;

      if (node.modifiers && node.modifiers.length) {
        const isDeclareFunction = nodeUtils.hasModifier(
          SyntaxKind.DeclareKeyword,
          node
        );
        if (isDeclareFunction) {
          functionDeclarationType = AST_NODE_TYPES.DeclareFunction;
        }
      }

      Object.assign(result, {
        type: functionDeclarationType,
        id: convertChild((node as any).name),
        generator: !!(node as any).asteriskToken,
        expression: false,
        async: nodeUtils.hasModifier(SyntaxKind.AsyncKeyword, node),
        params: convertParameters((node as any).parameters),
        body: convertChild((node as any).body)
      });

      // Process returnType
      if ((node as any).type) {
        (result as any).returnType = convertTypeAnnotation((node as any).type);
      }

      // Process typeParameters
      if ((node as any).typeParameters && (node as any).typeParameters.length) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          (node as any).typeParameters
        );
      }

      // check for exports
      result = nodeUtils.fixExports(node, result as any, ast);

      break;
    }

    case SyntaxKind.VariableDeclaration: {
      Object.assign(result, {
        type: AST_NODE_TYPES.VariableDeclarator,
        id: convertChild((node as any).name),
        init: convertChild((node as any).initializer)
      });

      if ((node as any).exclamationToken) {
        (result as any).definite = true;
      }

      if ((node as any).type) {
        (result as any).id.typeAnnotation = convertTypeAnnotation(
          (node as any).type
        );
        fixTypeAnnotationParentLocation((result as any).id);
      }
      break;
    }

    case SyntaxKind.VariableStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.VariableDeclaration,
        declarations: (node as any).declarationList.declarations.map(
          convertChild
        ),
        kind: nodeUtils.getDeclarationKind((node as any).declarationList)
      });

      // check for exports
      result = nodeUtils.fixExports(node, result as any, ast);
      break;

    // mostly for for-of, for-in
    case SyntaxKind.VariableDeclarationList:
      Object.assign(result, {
        type: AST_NODE_TYPES.VariableDeclaration,
        declarations: (node as any).declarations.map(convertChild),
        kind: nodeUtils.getDeclarationKind(node)
      });
      break;

    // Expressions

    case SyntaxKind.ExpressionStatement:
      Object.assign(result, {
        type: AST_NODE_TYPES.ExpressionStatement,
        expression: convertChild((node as any).expression)
      });
      break;

    case SyntaxKind.ThisKeyword:
      Object.assign(result, {
        type: AST_NODE_TYPES.ThisExpression
      });
      break;

    case SyntaxKind.ArrayLiteralExpression: {
      const arrayAssignNode = nodeUtils.findAncestorOfKind(
        node,
        SyntaxKind.BinaryExpression
      );
      const arrayIsInForOf =
        node.parent && node.parent.kind === SyntaxKind.ForOfStatement;
      const arrayIsInForIn =
        node.parent && node.parent.kind === SyntaxKind.ForInStatement;
      let arrayIsInAssignment;

      if (arrayAssignNode) {
        if (node.parent.kind === SyntaxKind.CallExpression) {
          arrayIsInAssignment = false;
        } else if (
          nodeUtils.getBinaryExpressionType(
            (arrayAssignNode as any).operatorToken
          ) === AST_NODE_TYPES.AssignmentExpression
        ) {
          arrayIsInAssignment =
            nodeUtils.findChildOfKind(
              (arrayAssignNode as any).left,
              SyntaxKind.ArrayLiteralExpression,
              ast
            ) === node || (arrayAssignNode as any).left === node;
        } else {
          arrayIsInAssignment = false;
        }
      }

      // TypeScript uses ArrayLiteralExpression in destructuring assignment, too
      if (arrayIsInAssignment || arrayIsInForOf || arrayIsInForIn) {
        Object.assign(result, {
          type: AST_NODE_TYPES.ArrayPattern,
          elements: (node as any).elements.map(convertChild)
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.ArrayExpression,
          elements: (node as any).elements.map(convertChild)
        });
      }
      break;
    }

    case SyntaxKind.ObjectLiteralExpression: {
      const ancestorNode = nodeUtils.findFirstMatchingAncestor(
        node,
        parentNode =>
          parentNode.kind === SyntaxKind.BinaryExpression ||
          parentNode.kind === SyntaxKind.ArrowFunction
      );
      const objectAssignNode =
        ancestorNode &&
        ancestorNode.kind === SyntaxKind.BinaryExpression &&
        (ancestorNode as any).operatorToken.kind === SyntaxKind.FirstAssignment
          ? ancestorNode
          : null;

      let objectIsInAssignment = false;

      if (objectAssignNode) {
        if ((objectAssignNode as any).left === node) {
          objectIsInAssignment = true;
        } else if (node.parent.kind === SyntaxKind.CallExpression) {
          objectIsInAssignment = false;
        } else {
          objectIsInAssignment =
            nodeUtils.findChildOfKind(
              (objectAssignNode as any).left,
              SyntaxKind.ObjectLiteralExpression,
              ast
            ) === node;
        }
      }

      // TypeScript uses ObjectLiteralExpression in destructuring assignment, too
      if (objectIsInAssignment) {
        Object.assign(result, {
          type: AST_NODE_TYPES.ObjectPattern,
          properties: (node as any).properties.map(convertChild)
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.ObjectExpression,
          properties: (node as any).properties.map(convertChild)
        });
      }

      break;
    }

    case SyntaxKind.PropertyAssignment:
      Object.assign(result, {
        type: AST_NODE_TYPES.Property,
        key: convertChild((node as any).name),
        value: convertChild((node as any).initializer),
        computed: nodeUtils.isComputedProperty((node as any).name),
        method: false,
        shorthand: false,
        kind: 'init'
      });
      break;

    case SyntaxKind.ShorthandPropertyAssignment: {
      if ((node as any).objectAssignmentInitializer) {
        Object.assign(result, {
          type: AST_NODE_TYPES.Property,
          key: convertChild((node as any).name),
          value: {
            type: AST_NODE_TYPES.AssignmentPattern,
            left: convertChild((node as any).name),
            right: convertChild((node as any).objectAssignmentInitializer),
            loc: result.loc,
            range: result.range
          },
          computed: false,
          method: false,
          shorthand: true,
          kind: 'init'
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.Property,
          key: convertChild((node as any).name),
          value: convertChild((node as any).initializer || (node as any).name),
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
        return convertChild((node as any).expression);
      }
      break;

    case SyntaxKind.PropertyDeclaration: {
      const isAbstract = nodeUtils.hasModifier(
        SyntaxKind.AbstractKeyword,
        node
      );
      Object.assign(result, {
        type: isAbstract
          ? AST_NODE_TYPES.TSAbstractClassProperty
          : AST_NODE_TYPES.ClassProperty,
        key: convertChild((node as any).name),
        value: convertChild((node as any).initializer),
        computed: nodeUtils.isComputedProperty((node as any).name),
        static: nodeUtils.hasStaticModifierFlag(node),
        readonly:
          nodeUtils.hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined
      });

      if ((node as any).type) {
        result.typeAnnotation = convertTypeAnnotation((node as any).type);
      }

      if (node.decorators) {
        result.decorators = convertDecorators(node.decorators);
      }

      const accessibility = nodeUtils.getTSNodeAccessibility(node);
      if (accessibility) {
        (result as any).accessibility = accessibility;
      }

      if (
        (node as any).name.kind === SyntaxKind.Identifier &&
        (node as any).questionToken
      ) {
        (result as any).optional = true;
      }

      if ((node as any).exclamationToken) {
        (result as any).definite = true;
      }

      if (
        (result as any).key.type === AST_NODE_TYPES.Literal &&
        (node as any).questionToken
      ) {
        (result as any).optional = true;
      }
      break;
    }

    case SyntaxKind.GetAccessor:
    case SyntaxKind.SetAccessor:
    case SyntaxKind.MethodDeclaration: {
      const openingParen = nodeUtils.findFirstMatchingToken(
        (node as any).name,
        ast,
        (token: any) => {
          if (!token || !token.kind) {
            return false;
          }
          return nodeUtils.getTextForTokenKind(token.kind) === '(';
        },
        ast
      );

      const methodLoc = ast.getLineAndCharacterOfPosition(
          (openingParen as any).getStart(ast)
        ),
        nodeIsMethod = node.kind === SyntaxKind.MethodDeclaration,
        method = {
          type: AST_NODE_TYPES.FunctionExpression,
          id: null,
          generator: !!(node as any).asteriskToken,
          expression: false,
          async: nodeUtils.hasModifier(SyntaxKind.AsyncKeyword, node),
          body: convertChild((node as any).body),
          range: [(node as any).parameters.pos - 1, (result as any).range[1]],
          loc: {
            start: {
              line: methodLoc.line + 1,
              column: methodLoc.character
            },
            end: (result as any).loc.end
          }
        };

      if ((node as any).type) {
        (method as any).returnType = convertTypeAnnotation((node as any).type);
      }

      if (parent!.kind === SyntaxKind.ObjectLiteralExpression) {
        (method as any).params = (node as any).parameters.map(convertChild);

        Object.assign(result, {
          type: AST_NODE_TYPES.Property,
          key: convertChild((node as any).name),
          value: method,
          computed: nodeUtils.isComputedProperty((node as any).name),
          method: nodeIsMethod,
          shorthand: false,
          kind: 'init'
        });
      } else {
        // class

        /**
         * Unlike in object literal methods, class method params can have decorators
         */
        (method as any).params = convertParameters((node as any).parameters);

        /**
         * TypeScript class methods can be defined as "abstract"
         */
        const methodDefinitionType = nodeUtils.hasModifier(
          SyntaxKind.AbstractKeyword,
          node
        )
          ? AST_NODE_TYPES.TSAbstractMethodDefinition
          : AST_NODE_TYPES.MethodDefinition;

        Object.assign(result, {
          type: methodDefinitionType,
          key: convertChild((node as any).name),
          value: method,
          computed: nodeUtils.isComputedProperty((node as any).name),
          static: nodeUtils.hasStaticModifierFlag(node),
          kind: 'method'
        });

        if (node.decorators) {
          result.decorators = convertDecorators(node.decorators);
        }

        const accessibility = nodeUtils.getTSNodeAccessibility(node);
        if (accessibility) {
          (result as any).accessibility = accessibility;
        }
      }

      if (
        (result as any).key.type === AST_NODE_TYPES.Identifier &&
        (node as any).questionToken
      ) {
        (result as any).key.optional = true;
      }

      if (node.kind === SyntaxKind.GetAccessor) {
        (result as any).kind = 'get';
      } else if (node.kind === SyntaxKind.SetAccessor) {
        (result as any).kind = 'set';
      } else if (
        !(result as any).static &&
        (node as any).name.kind === SyntaxKind.StringLiteral &&
        (node as any).name.text === 'constructor'
      ) {
        (result as any).kind = 'constructor';
      }

      // Process typeParameters
      if ((node as any).typeParameters && (node as any).typeParameters.length) {
        (method as any).typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          (node as any).typeParameters
        );
      }

      break;
    }

    // TypeScript uses this even for static methods named "constructor"
    case SyntaxKind.Constructor: {
      const constructorIsStatic = nodeUtils.hasStaticModifierFlag(node),
        constructorIsAbstract = nodeUtils.hasModifier(
          SyntaxKind.AbstractKeyword,
          node
        ),
        firstConstructorToken = constructorIsStatic
          ? nodeUtils.findNextToken((node as any).getFirstToken(), ast, ast)
          : node.getFirstToken(),
        constructorLoc = ast.getLineAndCharacterOfPosition(
          (node as any).parameters.pos - 1
        ),
        constructor = {
          type: AST_NODE_TYPES.FunctionExpression,
          id: null,
          params: convertParameters((node as any).parameters),
          generator: false,
          expression: false,
          async: false,
          body: convertChild((node as any).body),
          range: [(node as any).parameters.pos - 1, (result as any).range[1]],
          loc: {
            start: {
              line: constructorLoc.line + 1,
              column: constructorLoc.character
            },
            end: (result as any).loc.end
          }
        };

      const constructorIdentifierLocStart = ast.getLineAndCharacterOfPosition(
          (firstConstructorToken as any).getStart(ast)
        ),
        constructorIdentifierLocEnd = ast.getLineAndCharacterOfPosition(
          (firstConstructorToken as any).getEnd(ast)
        ),
        constructorIsComputed =
          !!(node as any).name &&
          nodeUtils.isComputedProperty((node as any).name);

      let constructorKey;

      if (constructorIsComputed) {
        constructorKey = {
          type: AST_NODE_TYPES.Literal,
          value: 'constructor',
          raw: (node as any).name.getText(),
          range: [
            (firstConstructorToken as any).getStart(ast),
            (firstConstructorToken as any).end
          ],
          loc: {
            start: {
              line: constructorIdentifierLocStart.line + 1,
              column: constructorIdentifierLocStart.character
            },
            end: {
              line: constructorIdentifierLocEnd.line + 1,
              column: constructorIdentifierLocEnd.character
            }
          }
        };
      } else {
        constructorKey = {
          type: AST_NODE_TYPES.Identifier,
          name: 'constructor',
          range: [
            (firstConstructorToken as any).getStart(ast),
            (firstConstructorToken as any).end
          ],
          loc: {
            start: {
              line: constructorIdentifierLocStart.line + 1,
              column: constructorIdentifierLocStart.character
            },
            end: {
              line: constructorIdentifierLocEnd.line + 1,
              column: constructorIdentifierLocEnd.character
            }
          }
        };
      }

      Object.assign(result, {
        type: constructorIsAbstract
          ? AST_NODE_TYPES.TSAbstractMethodDefinition
          : AST_NODE_TYPES.MethodDefinition,
        key: constructorKey,
        value: constructor,
        computed: constructorIsComputed,
        static: constructorIsStatic,
        kind:
          constructorIsStatic || constructorIsComputed
            ? 'method'
            : 'constructor'
      });

      const accessibility = nodeUtils.getTSNodeAccessibility(node);
      if (accessibility) {
        (result as any).accessibility = accessibility;
      }

      break;
    }

    case SyntaxKind.FunctionExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.FunctionExpression,
        id: convertChild((node as any).name),
        generator: !!(node as any).asteriskToken,
        params: convertParameters((node as any).parameters),
        body: convertChild((node as any).body),
        async: nodeUtils.hasModifier(SyntaxKind.AsyncKeyword, node),
        expression: false
      });

      // Process returnType
      if ((node as any).type) {
        (result as any).returnType = convertTypeAnnotation((node as any).type);
      }

      // Process typeParameters
      if ((node as any).typeParameters && (node as any).typeParameters.length) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          (node as any).typeParameters
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
        elements: (node as any).elements.map(convertChild)
      });
      break;

    // occurs with missing array elements like [,]
    case SyntaxKind.OmittedExpression:
      return null;

    case SyntaxKind.ObjectBindingPattern:
      Object.assign(result, {
        type: AST_NODE_TYPES.ObjectPattern,
        properties: (node as any).elements.map(convertChild)
      });
      break;

    case SyntaxKind.BindingElement:
      if (parent!.kind === SyntaxKind.ArrayBindingPattern) {
        const arrayItem = convert({
          node: (node as any).name,
          parent,
          ast,
          additionalOptions
        });

        if ((node as any).initializer) {
          Object.assign(result, {
            type: AST_NODE_TYPES.AssignmentPattern,
            left: arrayItem,
            right: convertChild((node as any).initializer)
          });
        } else if ((node as any).dotDotDotToken) {
          Object.assign(result, {
            type: AST_NODE_TYPES.RestElement,
            argument: arrayItem
          });
        } else {
          return arrayItem;
        }
      } else if (parent!.kind === SyntaxKind.ObjectBindingPattern) {
        if ((node as any).dotDotDotToken) {
          Object.assign(result, {
            type: AST_NODE_TYPES.RestElement,
            argument: convertChild(
              (node as any).propertyName || (node as any).name
            )
          });
        } else {
          Object.assign(result, {
            type: AST_NODE_TYPES.Property,
            key: convertChild((node as any).propertyName || (node as any).name),
            value: convertChild((node as any).name),
            computed: Boolean(
              (node as any).propertyName &&
                (node as any).propertyName.kind ===
                  SyntaxKind.ComputedPropertyName
            ),
            method: false,
            shorthand: !(node as any).propertyName,
            kind: 'init'
          });
        }

        if ((node as any).initializer) {
          (result as any).value = {
            type: AST_NODE_TYPES.AssignmentPattern,
            left: convertChild((node as any).name),
            right: convertChild((node as any).initializer),
            range: [
              (node as any).name.getStart(ast),
              (node as any).initializer.end
            ],
            loc: nodeUtils.getLocFor(
              (node as any).name.getStart(ast),
              (node as any).initializer.end,
              ast
            )
          };
        }
      }
      break;

    case SyntaxKind.ArrowFunction:
      Object.assign(result, {
        type: AST_NODE_TYPES.ArrowFunctionExpression,
        generator: false,
        id: null,
        params: convertParameters((node as any).parameters),
        body: convertChild((node as any).body),
        async: nodeUtils.hasModifier(SyntaxKind.AsyncKeyword, node),
        expression: (node as any).body.kind !== SyntaxKind.Block
      });

      // Process returnType
      if ((node as any).type) {
        (result as any).returnType = convertTypeAnnotation((node as any).type);
      }

      // Process typeParameters
      if ((node as any).typeParameters && (node as any).typeParameters.length) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          (node as any).typeParameters
        );
      }
      break;

    case SyntaxKind.YieldExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.YieldExpression,
        delegate: !!(node as any).asteriskToken,
        argument: convertChild((node as any).expression)
      });
      break;

    case SyntaxKind.AwaitExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.AwaitExpression,
        argument: convertChild((node as any).expression)
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
              cooked: (node as any).text
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
        quasis: [convertChild((node as any).head)],
        expressions: []
      });

      (node as any).templateSpans.forEach((templateSpan: any) => {
        (result as any).expressions.push(convertChild(templateSpan.expression));
        (result as any).quasis.push(convertChild(templateSpan.literal));
      });
      break;

    case SyntaxKind.TaggedTemplateExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.TaggedTemplateExpression,
        typeParameters: (node as any).typeArguments
          ? convertTypeArgumentsToTypeParameters((node as any).typeArguments)
          : undefined,
        tag: convertChild((node as any).tag),
        quasi: convertChild((node as any).template)
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
          cooked: (node as any).text
        },
        tail
      });
      break;
    }

    // Patterns

    case SyntaxKind.SpreadElement: {
      let type = AST_NODE_TYPES.SpreadElement;

      if (
        node.parent &&
        node.parent.parent &&
        node.parent.parent.kind === SyntaxKind.BinaryExpression
      ) {
        if ((node as any).parent.parent.left === node.parent) {
          type = AST_NODE_TYPES.RestElement;
        } else if ((node as any).parent.parent.right === node.parent) {
          type = AST_NODE_TYPES.SpreadElement;
        }
      }

      Object.assign(result, {
        type,
        argument: convertChild((node as any).expression)
      });
      break;
    }
    case SyntaxKind.SpreadAssignment: {
      let type = AST_NODE_TYPES.SpreadElement;

      if (
        node.parent &&
        node.parent.parent &&
        node.parent.parent.kind === SyntaxKind.BinaryExpression
      ) {
        if ((node as any).parent.parent.right === node.parent) {
          type = AST_NODE_TYPES.SpreadElement;
        } else if ((node as any).parent.parent.left === node.parent) {
          type = AST_NODE_TYPES.RestElement;
        }
      }

      Object.assign(result, {
        type,
        argument: convertChild((node as any).expression)
      });
      break;
    }

    case SyntaxKind.Parameter: {
      let parameter;

      if ((node as any).dotDotDotToken) {
        parameter = convertChild((node as any).name);
        Object.assign(result, {
          type: AST_NODE_TYPES.RestElement,
          argument: parameter
        });
      } else if ((node as any).initializer) {
        parameter = convertChild((node as any).name);
        Object.assign(result, {
          type: AST_NODE_TYPES.AssignmentPattern,
          left: parameter,
          right: convertChild((node as any).initializer)
        });
      } else {
        parameter = convert({
          node: (node as any).name,
          parent,
          ast,
          additionalOptions
        });
        (result as any) = parameter;
      }

      if ((node as any).type) {
        (parameter as any).typeAnnotation = convertTypeAnnotation(
          (node as any).type
        );
        fixTypeAnnotationParentLocation(parameter as any);
      }

      if ((node as any).questionToken) {
        (parameter as any).optional = true;
      }

      if (node.modifiers) {
        return {
          type: AST_NODE_TYPES.TSParameterProperty,
          range: [node.getStart(ast), node.end],
          loc: nodeUtils.getLoc(node, ast),
          accessibility: nodeUtils.getTSNodeAccessibility(node) || undefined,
          readonly:
            nodeUtils.hasModifier(SyntaxKind.ReadonlyKeyword, node) ||
            undefined,
          static:
            nodeUtils.hasModifier(SyntaxKind.StaticKeyword, node) || undefined,
          export:
            nodeUtils.hasModifier(SyntaxKind.ExportKeyword, node) || undefined,
          parameter: result
        };
      }

      break;
    }

    // Classes

    case SyntaxKind.ClassDeclaration:
    case SyntaxKind.ClassExpression: {
      const heritageClauses = (node as any).heritageClauses || [];

      let classNodeType = SyntaxKind[node.kind];
      let lastClassToken = heritageClauses.length
        ? heritageClauses[heritageClauses.length - 1]
        : (node as any).name;

      if ((node as any).typeParameters && (node as any).typeParameters.length) {
        const lastTypeParameter = (node as any).typeParameters[
          (node as any).typeParameters.length - 1
        ];

        if (!lastClassToken || lastTypeParameter.pos > lastClassToken.pos) {
          lastClassToken = nodeUtils.findNextToken(lastTypeParameter, ast, ast);
        }
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          (node as any).typeParameters
        );
      }

      if (node.modifiers && node.modifiers.length) {
        /**
         * TypeScript class declarations can be defined as "abstract"
         */
        if (node.kind === SyntaxKind.ClassDeclaration) {
          if (nodeUtils.hasModifier(SyntaxKind.AbstractKeyword, node)) {
            classNodeType = `TSAbstract${classNodeType}`;
          }
        }

        /**
         * We need check for modifiers, and use the last one, as there
         * could be multiple before the open brace
         */
        const lastModifier = node.modifiers[node.modifiers.length - 1];

        if (!lastClassToken || lastModifier.pos > lastClassToken.pos) {
          lastClassToken = nodeUtils.findNextToken(lastModifier, ast, ast);
        }
      } else if (!lastClassToken) {
        // no name
        lastClassToken = node.getFirstToken();
      }

      const openBrace = nodeUtils.findNextToken(lastClassToken, ast, ast)!;
      const superClass = heritageClauses.find(
        (clause: any) => clause.token === SyntaxKind.ExtendsKeyword
      );

      if (superClass) {
        if (superClass.types.length > 1) {
          throw nodeUtils.createError(
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
        (clause: any) => clause.token === SyntaxKind.ImplementsKeyword
      );

      Object.assign(result, {
        type: classNodeType,
        id: convertChild((node as any).name),
        body: {
          type: AST_NODE_TYPES.ClassBody,
          body: [],

          // TODO: Fix location info
          range: [openBrace.getStart(ast), (result as any).range[1]],
          loc: nodeUtils.getLocFor(openBrace.getStart(ast), node.end, ast)
        },
        superClass:
          superClass && superClass.types[0]
            ? convertChild(superClass.types[0].expression)
            : null
      });

      if (implementsClause) {
        (result as any).implements = implementsClause.types.map(
          convertClassImplements
        );
      }

      if (node.decorators) {
        result.decorators = convertDecorators(node.decorators);
      }

      const filteredMembers = (node as any).members.filter(
        nodeUtils.isESTreeClassMember
      );

      if (filteredMembers.length) {
        result.body.body = filteredMembers.map(convertChild);
      }

      // check for exports
      result = nodeUtils.fixExports(node, result as any, ast);

      break;
    }

    // Modules
    case SyntaxKind.ModuleBlock:
      Object.assign(result, {
        type: AST_NODE_TYPES.TSModuleBlock,
        body: (node as any).statements.map(convertChild)
      });
      break;

    case SyntaxKind.ImportDeclaration:
      Object.assign(result, {
        type: AST_NODE_TYPES.ImportDeclaration,
        source: convertChild((node as any).moduleSpecifier),
        specifiers: []
      });

      if ((node as any).importClause) {
        if ((node as any).importClause.name) {
          (result as any).specifiers.push(
            convertChild((node as any).importClause)
          );
        }

        if ((node as any).importClause.namedBindings) {
          if (
            (node as any).importClause.namedBindings.kind ===
            SyntaxKind.NamespaceImport
          ) {
            (result as any).specifiers.push(
              convertChild((node as any).importClause.namedBindings)
            );
          } else {
            result.specifiers = (result as any).specifiers.concat(
              (node as any).importClause.namedBindings.elements.map(
                convertChild
              )
            );
          }
        }
      }

      break;

    case SyntaxKind.NamespaceImport:
      Object.assign(result, {
        type: AST_NODE_TYPES.ImportNamespaceSpecifier,
        local: convertChild((node as any).name)
      });
      break;

    case SyntaxKind.ImportSpecifier:
      Object.assign(result, {
        type: AST_NODE_TYPES.ImportSpecifier,
        local: convertChild((node as any).name),
        imported: convertChild((node as any).propertyName || (node as any).name)
      });
      break;

    case SyntaxKind.ImportClause:
      Object.assign(result, {
        type: AST_NODE_TYPES.ImportDefaultSpecifier,
        local: convertChild((node as any).name)
      });

      // have to adjust location information due to tree differences
      (result as any).range[1] = (node as any).name.end;
      result.loc = nodeUtils.getLocFor(
        (result as any).range[0],
        (result as any).range[1],
        ast
      );
      break;

    case SyntaxKind.NamedImports:
      Object.assign(result, {
        type: AST_NODE_TYPES.ImportDefaultSpecifier,
        local: convertChild((node as any).name)
      });
      break;

    case SyntaxKind.ExportDeclaration:
      if ((node as any).exportClause) {
        Object.assign(result, {
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          source: convertChild((node as any).moduleSpecifier),
          specifiers: (node as any).exportClause.elements.map(convertChild),
          declaration: null
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.ExportAllDeclaration,
          source: convertChild((node as any).moduleSpecifier)
        });
      }
      break;

    case SyntaxKind.ExportSpecifier:
      Object.assign(result, {
        type: AST_NODE_TYPES.ExportSpecifier,
        local: convertChild((node as any).propertyName || (node as any).name),
        exported: convertChild((node as any).name)
      });
      break;

    case SyntaxKind.ExportAssignment:
      if ((node as any).isExportEquals) {
        Object.assign(result, {
          type: AST_NODE_TYPES.TSExportAssignment,
          expression: convertChild((node as any).expression)
        });
      } else {
        Object.assign(result, {
          type: AST_NODE_TYPES.ExportDefaultDeclaration,
          declaration: convertChild((node as any).expression)
        });
      }
      break;

    // Unary Operations

    case SyntaxKind.PrefixUnaryExpression:
    case SyntaxKind.PostfixUnaryExpression: {
      const operator = nodeUtils.getTextForTokenKind((node as any).operator);
      Object.assign(result, {
        /**
         * ESTree uses UpdateExpression for ++/--
         */
        type: /^(?:\+\+|--)$/.test(operator)
          ? AST_NODE_TYPES.UpdateExpression
          : AST_NODE_TYPES.UnaryExpression,
        operator,
        prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
        argument: convertChild((node as any).operand)
      });
      break;
    }

    case SyntaxKind.DeleteExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.UnaryExpression,
        operator: 'delete',
        prefix: true,
        argument: convertChild((node as any).expression)
      });
      break;

    case SyntaxKind.VoidExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.UnaryExpression,
        operator: 'void',
        prefix: true,
        argument: convertChild((node as any).expression)
      });
      break;

    case SyntaxKind.TypeOfExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.UnaryExpression,
        operator: 'typeof',
        prefix: true,
        argument: convertChild((node as any).expression)
      });
      break;

    case SyntaxKind.TypeOperator:
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTypeOperator,
        operator: nodeUtils.getTextForTokenKind((node as any).operator),
        typeAnnotation: convertChild((node as any).type)
      });
      break;

    // Binary Operations

    case SyntaxKind.BinaryExpression:
      // TypeScript uses BinaryExpression for sequences as well
      if (nodeUtils.isComma((node as any).operatorToken)) {
        Object.assign(result, {
          type: AST_NODE_TYPES.SequenceExpression,
          expressions: []
        });

        const left = convertChild((node as any).left),
          right = convertChild((node as any).right);

        if ((left as any).type === AST_NODE_TYPES.SequenceExpression) {
          (result as any).expressions = (result as any).expressions.concat(
            (left as any).expressions
          );
        } else {
          (result as any).expressions.push(left);
        }

        if ((right as any).type === AST_NODE_TYPES.SequenceExpression) {
          (result as any).expressions = (result as any).expressions.concat(
            (right as any).expressions
          );
        } else {
          (result as any).expressions.push(right);
        }
      } else if (
        (node as any).operatorToken &&
        (node as any).operatorToken.kind ===
          SyntaxKind.AsteriskAsteriskEqualsToken
      ) {
        Object.assign(result, {
          type: AST_NODE_TYPES.AssignmentExpression,
          operator: nodeUtils.getTextForTokenKind(
            (node as any).operatorToken.kind
          ),
          left: convertChild((node as any).left),
          right: convertChild((node as any).right)
        });
      } else {
        Object.assign(result, {
          type: nodeUtils.getBinaryExpressionType((node as any).operatorToken),
          operator: nodeUtils.getTextForTokenKind(
            (node as any).operatorToken.kind
          ),
          left: convertChild((node as any).left),
          right: convertChild((node as any).right)
        });

        // if the binary expression is in a destructured array, switch it
        if (result.type === AST_NODE_TYPES.AssignmentExpression) {
          const upperArrayNode = nodeUtils.findAncestorOfKind(
              node,
              SyntaxKind.ArrayLiteralExpression
            ),
            upperArrayAssignNode =
              upperArrayNode &&
              nodeUtils.findAncestorOfKind(
                upperArrayNode,
                SyntaxKind.BinaryExpression
              );

          let upperArrayIsInAssignment;

          if (upperArrayAssignNode) {
            if ((upperArrayAssignNode as any).left === upperArrayNode) {
              upperArrayIsInAssignment = true;
            } else {
              upperArrayIsInAssignment =
                nodeUtils.findChildOfKind(
                  (upperArrayAssignNode as any).left,
                  SyntaxKind.ArrayLiteralExpression,
                  ast
                ) === upperArrayNode;
            }
          }

          if (upperArrayIsInAssignment) {
            delete (result as any).operator;
            result.type = AST_NODE_TYPES.AssignmentPattern;
          }
        }
      }
      break;

    case SyntaxKind.PropertyAccessExpression:
      if (nodeUtils.isJSXToken(parent!)) {
        const jsxMemberExpression = {
          type: AST_NODE_TYPES.MemberExpression,
          object: convertChild((node as any).expression),
          property: convertChild((node as any).name)
        };
        const isNestedMemberExpression =
          (node as any).expression.kind === SyntaxKind.PropertyAccessExpression;
        if ((node as any).expression.kind === SyntaxKind.ThisKeyword) {
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
          object: convertChild((node as any).expression),
          property: convertChild((node as any).name),
          computed: false
        });
      }
      break;

    case SyntaxKind.ElementAccessExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.MemberExpression,
        object: convertChild((node as any).expression),
        property: convertChild((node as any).argumentExpression),
        computed: true
      });
      break;

    case SyntaxKind.ConditionalExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.ConditionalExpression,
        test: convertChild((node as any).condition),
        consequent: convertChild((node as any).whenTrue),
        alternate: convertChild((node as any).whenFalse)
      });
      break;

    case SyntaxKind.CallExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.CallExpression,
        callee: convertChild((node as any).expression),
        arguments: (node as any).arguments.map(convertChild)
      });
      if ((node as any).typeArguments && (node as any).typeArguments.length) {
        result.typeParameters = convertTypeArgumentsToTypeParameters(
          (node as any).typeArguments
        );
      }
      break;

    case SyntaxKind.NewExpression:
      Object.assign(result, {
        type: AST_NODE_TYPES.NewExpression,
        callee: convertChild((node as any).expression),
        arguments: (node as any).arguments
          ? (node as any).arguments.map(convertChild)
          : []
      });
      if ((node as any).typeArguments && (node as any).typeArguments.length) {
        result.typeParameters = convertTypeArgumentsToTypeParameters(
          (node as any).typeArguments
        );
      }
      break;

    case SyntaxKind.MetaProperty: {
      const newToken = nodeUtils.convertToken(
        (node as any).getFirstToken(),
        ast
      );
      Object.assign(result, {
        type: AST_NODE_TYPES.MetaProperty,
        meta: {
          type: AST_NODE_TYPES.Identifier,
          range: newToken.range,
          loc: newToken.loc,
          name: nodeUtils.getTextForTokenKind((node as any).keywordToken)
        },
        property: convertChild((node as any).name)
      });
      break;
    }

    // Literals

    case SyntaxKind.StringLiteral:
      Object.assign(result, {
        type: AST_NODE_TYPES.Literal,
        raw: ast.text.slice((result as any).range[0], (result as any).range[1])
      });
      if ((parent as any).name && (parent as any).name === node) {
        (result as any).value = (node as any).text;
      } else {
        (result as any).value = nodeUtils.unescapeStringLiteralText(
          (node as any).text
        );
      }
      break;

    case SyntaxKind.NumericLiteral:
      Object.assign(result, {
        type: AST_NODE_TYPES.Literal,
        value: Number((node as any).text),
        raw: ast.text.slice((result as any).range[0], (result as any).range[1])
      });
      break;

    case SyntaxKind.RegularExpressionLiteral: {
      const pattern = (node as any).text.slice(
        1,
        (node as any).text.lastIndexOf('/')
      );
      const flags = (node as any).text.slice(
        (node as any).text.lastIndexOf('/') + 1
      );

      let regex = null;
      try {
        regex = new RegExp(pattern, flags);
      } catch (exception) {
        regex = null;
      }

      Object.assign(result, {
        type: AST_NODE_TYPES.Literal,
        value: regex,
        raw: (node as any).text,
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
      if (nodeUtils.isWithinTypeAnnotation(node)) {
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
      simplyCopy();
      break;

    // JSX

    case SyntaxKind.JsxElement:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXElement,
        openingElement: convertChild((node as any).openingElement),
        closingElement: convertChild((node as any).closingElement),
        children: (node as any).children.map(convertChild)
      });

      break;

    case SyntaxKind.JsxFragment:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXFragment,
        openingFragment: convertChild((node as ts.JsxFragment).openingFragment),
        closingFragment: convertChild((node as ts.JsxFragment).closingFragment),
        children: (node as any).children.map(convertChild)
      });
      break;

    case SyntaxKind.JsxSelfClosingElement: {
      /**
       * Convert SyntaxKind.JsxSelfClosingElement to SyntaxKind.JsxOpeningElement,
       * TypeScript does not seem to have the idea of openingElement when tag is self-closing
       */
      node.kind = SyntaxKind.JsxOpeningElement;

      const openingElement = convertChild(node);
      (openingElement as any).selfClosing = true;

      Object.assign(result, {
        type: AST_NODE_TYPES.JSXElement,
        openingElement,
        closingElement: null,
        children: []
      });

      break;
    }

    case SyntaxKind.JsxOpeningElement:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXOpeningElement,
        typeParameters: (node as any).typeArguments
          ? convertTypeArgumentsToTypeParameters((node as any).typeArguments)
          : undefined,
        selfClosing: false,
        name: convertTypeScriptJSXTagNameToESTreeName((node as any).tagName),
        attributes: (node as any).attributes.properties.map(convertChild)
      });
      break;

    case SyntaxKind.JsxClosingElement:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXClosingElement,
        name: convertTypeScriptJSXTagNameToESTreeName((node as any).tagName)
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
      const eloc = ast.getLineAndCharacterOfPosition(
        (result as any).range[0] + 1
      );
      const expression = (node as any).expression
        ? convertChild((node as any).expression)
        : {
            type: AST_NODE_TYPES.JSXEmptyExpression,
            loc: {
              start: {
                line: eloc.line + 1,
                column: eloc.character
              },
              end: {
                line: (result as any).loc.end.line,
                column: (result as any).loc.end.column - 1
              }
            },
            range: [(result as any).range[0] + 1, (result as any).range[1] - 1]
          };

      Object.assign(result, {
        type: (node as any).dotDotDotToken
          ? AST_NODE_TYPES.JSXSpreadChild
          : AST_NODE_TYPES.JSXExpressionContainer,
        expression
      });

      break;
    }

    case SyntaxKind.JsxAttribute: {
      const attributeName = nodeUtils.convertToken((node as any).name, ast);
      attributeName.type = AST_NODE_TYPES.JSXIdentifier;
      attributeName.name = attributeName.value;
      delete attributeName.value;

      Object.assign(result, {
        type: AST_NODE_TYPES.JSXAttribute,
        name: attributeName,
        value: convertChild((node as any).initializer)
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

      result.loc = nodeUtils.getLocFor(start, end, ast);
      result.range = [start, end];

      break;
    }

    case SyntaxKind.JsxSpreadAttribute:
      Object.assign(result, {
        type: AST_NODE_TYPES.JSXSpreadAttribute,
        argument: convertChild((node as any).expression)
      });

      break;

    case SyntaxKind.FirstNode: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSQualifiedName,
        left: convertChild((node as any).left),
        right: convertChild((node as any).right)
      });

      break;
    }

    // TypeScript specific

    case SyntaxKind.ParenthesizedExpression:
      return convert({
        node: (node as any).expression,
        parent,
        ast,
        additionalOptions
      });

    /**
     * Convert TypeAliasDeclaration node into VariableDeclaration
     * to allow core rules such as "semi" to work automatically
     */
    case SyntaxKind.TypeAliasDeclaration: {
      const typeAliasDeclarator = {
        type: AST_NODE_TYPES.VariableDeclarator,
        id: convertChild((node as any).name),
        init: convertChild((node as any).type),
        range: [(node as any).name.getStart(ast), (node as any).end]
      };

      (typeAliasDeclarator as any).loc = nodeUtils.getLocFor(
        typeAliasDeclarator.range[0],
        typeAliasDeclarator.range[1],
        ast
      );

      // Process typeParameters
      if ((node as any).typeParameters && (node as any).typeParameters.length) {
        (typeAliasDeclarator as any).typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          (node as any).typeParameters
        );
      }

      Object.assign(result, {
        type: AST_NODE_TYPES.VariableDeclaration,
        kind: nodeUtils.getDeclarationKind(node),
        declarations: [typeAliasDeclarator]
      });

      // check for exports
      result = nodeUtils.fixExports(node, result as any, ast);

      break;
    }

    case SyntaxKind.MethodSignature: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSMethodSignature,
        optional: nodeUtils.isOptional(node),
        computed: nodeUtils.isComputedProperty((node as any).name),
        key: convertChild((node as any).name),
        params: convertParameters((node as any).parameters),
        typeAnnotation: (node as any).type
          ? convertTypeAnnotation((node as any).type)
          : null,
        readonly:
          nodeUtils.hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
        static: nodeUtils.hasModifier(SyntaxKind.StaticKeyword, node),
        export:
          nodeUtils.hasModifier(SyntaxKind.ExportKeyword, node) || undefined
      });

      const accessibility = nodeUtils.getTSNodeAccessibility(node);
      if (accessibility) {
        (result as any).accessibility = accessibility;
      }

      if ((node as any).typeParameters) {
        (result as any).typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          (node as any).typeParameters
        );
      }

      break;
    }

    case SyntaxKind.PropertySignature: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSPropertySignature,
        optional: nodeUtils.isOptional(node) || undefined,
        computed: nodeUtils.isComputedProperty((node as any).name),
        key: convertChild((node as any).name),
        typeAnnotation: (node as any).type
          ? convertTypeAnnotation((node as any).type)
          : undefined,
        initializer: convertChild((node as any).initializer) || undefined,
        readonly:
          nodeUtils.hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
        static:
          nodeUtils.hasModifier(SyntaxKind.StaticKeyword, node) || undefined,
        export:
          nodeUtils.hasModifier(SyntaxKind.ExportKeyword, node) || undefined
      });

      const accessibility = nodeUtils.getTSNodeAccessibility(node);
      if (accessibility) {
        (result as any).accessibility = accessibility;
      }

      break;
    }

    case SyntaxKind.IndexSignature: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSIndexSignature,
        index: convertChild((node as any).parameters[0]),
        typeAnnotation: (node as any).type
          ? convertTypeAnnotation((node as any).type)
          : null,
        readonly:
          nodeUtils.hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
        static: nodeUtils.hasModifier(SyntaxKind.StaticKeyword, node),
        export:
          nodeUtils.hasModifier(SyntaxKind.ExportKeyword, node) || undefined
      });

      const accessibility = nodeUtils.getTSNodeAccessibility(node);
      if (accessibility) {
        (result as any).accessibility = accessibility;
      }

      break;
    }

    case SyntaxKind.ConstructSignature: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSConstructSignature,
        params: convertParameters((node as any).parameters),
        typeAnnotation: (node as any).type
          ? convertTypeAnnotation((node as any).type)
          : null
      });

      if ((node as any).typeParameters) {
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          (node as any).typeParameters
        );
      }

      break;
    }

    case SyntaxKind.InterfaceDeclaration: {
      const interfaceHeritageClauses = (node as any).heritageClauses || [];

      let interfaceLastClassToken = interfaceHeritageClauses.length
        ? interfaceHeritageClauses[interfaceHeritageClauses.length - 1]
        : (node as any).name;

      if ((node as any).typeParameters && (node as any).typeParameters.length) {
        const interfaceLastTypeParameter = (node as any).typeParameters[
          (node as any).typeParameters.length - 1
        ];

        if (
          !interfaceLastClassToken ||
          interfaceLastTypeParameter.pos > interfaceLastClassToken.pos
        ) {
          interfaceLastClassToken = nodeUtils.findNextToken(
            interfaceLastTypeParameter,
            ast,
            ast
          );
        }
        result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(
          (node as any).typeParameters
        );
      }

      const hasImplementsClause = interfaceHeritageClauses.length > 0;
      const hasAbstractKeyword = nodeUtils.hasModifier(
        SyntaxKind.AbstractKeyword,
        node
      );
      const interfaceOpenBrace = nodeUtils.findNextToken(
        interfaceLastClassToken,
        ast,
        ast
      )!;

      const interfaceBody = {
        type: AST_NODE_TYPES.TSInterfaceBody,
        body: (node as any).members.map((member: any) => convertChild(member)),
        range: [interfaceOpenBrace.getStart(ast), (result as any).range[1]],
        loc: nodeUtils.getLocFor(
          interfaceOpenBrace.getStart(ast),
          node.end,
          ast
        )
      };

      Object.assign(result, {
        abstract: hasAbstractKeyword,
        type: AST_NODE_TYPES.TSInterfaceDeclaration,
        body: interfaceBody,
        id: convertChild((node as any).name),
        heritage: hasImplementsClause
          ? interfaceHeritageClauses[0].types.map(
              convertInterfaceHeritageClause
            )
          : []
      });
      /**
       * Semantically, decorators are not allowed on interface declarations,
       * but the TypeScript compiler will parse them and produce a valid AST,
       * so we handle them here too.
       */
      if (node.decorators) {
        result.decorators = convertDecorators(node.decorators);
      }
      // check for exports
      result = nodeUtils.fixExports(node, result as any, ast);

      break;
    }

    case SyntaxKind.FirstTypeNode:
      Object.assign(result, {
        type: AST_NODE_TYPES.TSTypePredicate,
        parameterName: convertChild((node as any).parameterName),
        typeAnnotation: convertTypeAnnotation((node as any).type)
      });
      /**
       * Specific fix for type-guard location data
       */
      (result as any).typeAnnotation.loc = (result as any).typeAnnotation.typeAnnotation.loc;
      (result as any).typeAnnotation.range = (result as any).typeAnnotation.typeAnnotation.range;
      break;

    case SyntaxKind.ImportType:
      Object.assign(result, {
        type: AST_NODE_TYPES.TSImportType,
        isTypeOf: !!(node as any).isTypeOf,
        parameter: convertChild((node as any).argument),
        qualifier: convertChild((node as any).qualifier),
        typeParameters: (node as any).typeArguments
          ? convertTypeArgumentsToTypeParameters((node as any).typeArguments)
          : null
      });
      break;

    case SyntaxKind.EnumDeclaration: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSEnumDeclaration,
        id: convertChild((node as any).name),
        members: (node as any).members.map(convertChild)
      });
      // apply modifiers first...
      applyModifiersToResult((node as any).modifiers);
      // ...then check for exports
      result = nodeUtils.fixExports(node, result as any, ast);
      /**
       * Semantically, decorators are not allowed on enum declarations,
       * but the TypeScript compiler will parse them and produce a valid AST,
       * so we handle them here too.
       */
      if (node.decorators) {
        result.decorators = convertDecorators(node.decorators);
      }
      break;
    }

    case SyntaxKind.EnumMember: {
      Object.assign(result, {
        type: AST_NODE_TYPES.TSEnumMember,
        id: convertChild((node as any).name)
      });
      if ((node as any).initializer) {
        (result as any).initializer = convertChild((node as any).initializer);
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
        id: convertChild((node as any).name)
      });
      if ((node as any).body) {
        result.body = convertChild((node as any).body);
      }
      // apply modifiers first...
      applyModifiersToResult((node as any).modifiers);
      if (node.flags & ts.NodeFlags.GlobalAugmentation) {
        result.global = true;
      }
      // ...then check for exports
      result = nodeUtils.fixExports(node, result as any, ast);
      break;
    }

    default:
      deeplyCopy();
  }

  if (additionalOptions.shouldProvideParserServices) {
    tsNodeToESTreeNodeMap.set(node, result);
    esTreeNodeToTSNodeMap.set(result, node);
  }

  return result as any;
}
