/**
 * @fileoverview Utilities for finding and converting ts.Nodes into ESTreeNodes
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import ts from 'typescript';
import unescape from 'lodash.unescape';
import {
  ESTreeNodeLoc,
  ESTreeNode,
  ESTreeToken
} from './temp-types-based-on-js-source';
import { AST_NODE_TYPES } from './ast-node-types';

const SyntaxKind = ts.SyntaxKind;

const ASSIGNMENT_OPERATORS: ts.AssignmentOperator[] = [
  SyntaxKind.EqualsToken,
  SyntaxKind.PlusEqualsToken,
  SyntaxKind.MinusEqualsToken,
  SyntaxKind.AsteriskEqualsToken,
  SyntaxKind.AsteriskAsteriskEqualsToken,
  SyntaxKind.SlashEqualsToken,
  SyntaxKind.PercentEqualsToken,
  SyntaxKind.LessThanLessThanEqualsToken,
  SyntaxKind.GreaterThanGreaterThanEqualsToken,
  SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  SyntaxKind.AmpersandEqualsToken,
  SyntaxKind.BarEqualsToken,
  SyntaxKind.CaretEqualsToken
];

const LOGICAL_OPERATORS: ts.LogicalOperator[] = [
  SyntaxKind.BarBarToken,
  SyntaxKind.AmpersandAmpersandToken
];

const TOKEN_TO_TEXT: { readonly [P in ts.SyntaxKind]?: string } = {
  [SyntaxKind.OpenBraceToken]: '{',
  [SyntaxKind.CloseBraceToken]: '}',
  [SyntaxKind.OpenParenToken]: '(',
  [SyntaxKind.CloseParenToken]: ')',
  [SyntaxKind.OpenBracketToken]: '[',
  [SyntaxKind.CloseBracketToken]: ']',
  [SyntaxKind.DotToken]: '.',
  [SyntaxKind.DotDotDotToken]: '...',
  [SyntaxKind.SemicolonToken]: ',',
  [SyntaxKind.CommaToken]: ',',
  [SyntaxKind.LessThanToken]: '<',
  [SyntaxKind.GreaterThanToken]: '>',
  [SyntaxKind.LessThanEqualsToken]: '<=',
  [SyntaxKind.GreaterThanEqualsToken]: '>=',
  [SyntaxKind.EqualsEqualsToken]: '==',
  [SyntaxKind.ExclamationEqualsToken]: '!=',
  [SyntaxKind.EqualsEqualsEqualsToken]: '===',
  [SyntaxKind.InstanceOfKeyword]: 'instanceof',
  [SyntaxKind.ExclamationEqualsEqualsToken]: '!==',
  [SyntaxKind.EqualsGreaterThanToken]: '=>',
  [SyntaxKind.PlusToken]: '+',
  [SyntaxKind.MinusToken]: '-',
  [SyntaxKind.AsteriskToken]: '*',
  [SyntaxKind.AsteriskAsteriskToken]: '**',
  [SyntaxKind.SlashToken]: '/',
  [SyntaxKind.PercentToken]: '%',
  [SyntaxKind.PlusPlusToken]: '++',
  [SyntaxKind.MinusMinusToken]: '--',
  [SyntaxKind.LessThanLessThanToken]: '<<',
  [SyntaxKind.LessThanSlashToken]: '</',
  [SyntaxKind.GreaterThanGreaterThanToken]: '>>',
  [SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: '>>>',
  [SyntaxKind.AmpersandToken]: '&',
  [SyntaxKind.BarToken]: '|',
  [SyntaxKind.CaretToken]: '^',
  [SyntaxKind.ExclamationToken]: '!',
  [SyntaxKind.TildeToken]: '~',
  [SyntaxKind.AmpersandAmpersandToken]: '&&',
  [SyntaxKind.BarBarToken]: '||',
  [SyntaxKind.QuestionToken]: '?',
  [SyntaxKind.ColonToken]: ':',
  [SyntaxKind.EqualsToken]: '=',
  [SyntaxKind.PlusEqualsToken]: '+=',
  [SyntaxKind.MinusEqualsToken]: '-=',
  [SyntaxKind.AsteriskEqualsToken]: '*=',
  [SyntaxKind.AsteriskAsteriskEqualsToken]: '**=',
  [SyntaxKind.SlashEqualsToken]: '/=',
  [SyntaxKind.PercentEqualsToken]: '%=',
  [SyntaxKind.LessThanLessThanEqualsToken]: '<<=',
  [SyntaxKind.GreaterThanGreaterThanEqualsToken]: '>>=',
  [SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken]: '>>>=',
  [SyntaxKind.AmpersandEqualsToken]: '&=',
  [SyntaxKind.BarEqualsToken]: '|=',
  [SyntaxKind.CaretEqualsToken]: '^=',
  [SyntaxKind.AtToken]: '@',
  [SyntaxKind.InKeyword]: 'in',
  [SyntaxKind.UniqueKeyword]: 'unique',
  [SyntaxKind.KeyOfKeyword]: 'keyof',
  [SyntaxKind.NewKeyword]: 'new',
  [SyntaxKind.ImportKeyword]: 'import'
};

/**
 * Returns true if the given ts.Token is the assignment operator
 * @param  {ts.Token}  operator the operator token
 * @returns {boolean}          is assignment
 */
export function isAssignmentOperator(
  operator: ts.Token<ts.AssignmentOperator>
): boolean {
  return ASSIGNMENT_OPERATORS.indexOf(operator.kind) > -1;
}

/**
 * Returns true if the given ts.Token is a logical operator
 * @param  {ts.Token}  operator the operator token
 * @returns {boolean}          is a logical operator
 */
export function isLogicalOperator(
  operator: ts.Token<ts.LogicalOperator>
): boolean {
  return LOGICAL_OPERATORS.indexOf(operator.kind) > -1;
}

/**
 * Returns the string form of the given TSToken SyntaxKind
 * @param  {number}  kind the token's SyntaxKind
 * @returns {string}          the token applicable token as a string
 */
export function getTextForTokenKind(kind: ts.SyntaxKind): string | undefined {
  return TOKEN_TO_TEXT[kind];
}

/**
 * Returns true if the given ts.Node is a valid ESTree class member
 * @param  {ts.Node}  node TypeScript AST node
 * @returns {boolean}      is valid ESTree class member
 */
export function isESTreeClassMember(node: ts.Node): boolean {
  return node.kind !== SyntaxKind.SemicolonClassElement;
}

/**
 * Checks if a ts.Node has a modifier
 * @param {ts.KeywordSyntaxKind} modifierKind TypeScript SyntaxKind modifier
 * @param {ts.Node} node TypeScript AST node
 * @returns {boolean} has the modifier specified
 */
export function hasModifier(
  modifierKind: ts.KeywordSyntaxKind,
  node: ts.Node
): boolean {
  return (
    !!node.modifiers &&
    !!node.modifiers.length &&
    node.modifiers.some(modifier => modifier.kind === modifierKind)
  );
}

/**
 * Get last last modifier in ast
 * @param node TypeScript AST node
 * @returns returns last modifier if present or null
 */
export function getLastModifier(node: ts.Node): ts.Modifier | null {
  return (
    (!!node.modifiers &&
      !!node.modifiers.length &&
      node.modifiers[node.modifiers.length - 1]) ||
    null
  );
}

/**
 * Returns true if the given ts.Token is a comma
 * @param  {ts.Node}  token the TypeScript token
 * @returns {boolean}       is comma
 */
export function isComma(token: ts.Node): boolean {
  return token.kind === SyntaxKind.CommaToken;
}

/**
 * Returns true if the given ts.Node is a comment
 * @param {ts.Node} node the TypeScript node
 * @returns {boolean} is comment
 */
export function isComment(node: ts.Node): boolean {
  return (
    node.kind === SyntaxKind.SingleLineCommentTrivia ||
    node.kind === SyntaxKind.MultiLineCommentTrivia
  );
}

/**
 * Returns true if the given ts.Node is a JSDoc comment
 * @param {ts.Node} node the TypeScript node
 * @returns {boolean} is JSDoc comment
 */
export function isJSDocComment(node: ts.Node): boolean {
  return node.kind === SyntaxKind.JSDocComment;
}

/**
 * Returns the binary expression type of the given ts.Token
 * @param  {ts.Token} operator the operator token
 * @returns {string}          the binary expression type
 */
export function getBinaryExpressionType(
  operator: ts.Token<any>
):
  | AST_NODE_TYPES.AssignmentExpression
  | AST_NODE_TYPES.LogicalExpression
  | AST_NODE_TYPES.BinaryExpression {
  if (isAssignmentOperator(operator)) {
    return AST_NODE_TYPES.AssignmentExpression;
  } else if (isLogicalOperator(operator)) {
    return AST_NODE_TYPES.LogicalExpression;
  }
  return AST_NODE_TYPES.BinaryExpression;
}

/**
 * Returns line and column data for the given start and end positions,
 * for the given AST
 * @param  {number} start start data
 * @param  {number} end   end data
 * @param  {ts.SourceFile} ast   the AST object
 * @returns {ESTreeNodeLoc}       the loc data
 */
export function getLocFor(
  start: number,
  end: number,
  ast: ts.SourceFile
): ESTreeNodeLoc {
  const startLoc = ast.getLineAndCharacterOfPosition(start),
    endLoc = ast.getLineAndCharacterOfPosition(end);

  return {
    start: {
      line: startLoc.line + 1,
      column: startLoc.character
    },
    end: {
      line: endLoc.line + 1,
      column: endLoc.character
    }
  };
}

/**
 * Check whatever node can contain directive
 * @param {ts.Node} node
 * @returns {boolean} returns true if node can contain directive
 */
export function canContainDirective(node: ts.Node): boolean {
  switch (node.kind) {
    case ts.SyntaxKind.SourceFile:
    case ts.SyntaxKind.ModuleBlock:
      return true;
    case ts.SyntaxKind.Block:
      switch (node.parent.kind) {
        case ts.SyntaxKind.Constructor:
        case ts.SyntaxKind.GetAccessor:
        case ts.SyntaxKind.SetAccessor:
        case ts.SyntaxKind.ArrowFunction:
        case ts.SyntaxKind.FunctionExpression:
        case ts.SyntaxKind.FunctionDeclaration:
        case ts.SyntaxKind.MethodDeclaration:
          return true;
        default:
          return false;
      }
    default:
      return false;
  }
}

/**
 * Returns line and column data for the given ts.Node or ts.Token,
 * for the given AST
 * @param  {ts.Node} nodeOrToken the ts.Node or ts.Token
 * @param  {ts.SourceFile} ast         the AST object
 * @returns {ESTreeLoc}             the loc data
 */
export function getLoc(
  nodeOrToken: ts.Node,
  ast: ts.SourceFile
): ESTreeNodeLoc {
  return getLocFor(nodeOrToken.getStart(ast), nodeOrToken.end, ast);
}

/**
 * Returns true if a given ts.Node is a token
 * @param  {ts.Node} node the ts.Node
 * @returns {boolean}     is a token
 */
export function isToken(node: ts.Node): boolean {
  return (
    node.kind >= SyntaxKind.FirstToken && node.kind <= SyntaxKind.LastToken
  );
}

/**
 * Returns true if a given ts.Node is a JSX token
 * @param  {ts.Node} node ts.Node to be checked
 * @returns {boolean}       is a JSX token
 */
export function isJSXToken(node: ts.Node): boolean {
  return (
    node.kind >= SyntaxKind.JsxElement && node.kind <= SyntaxKind.JsxAttribute
  );
}

/**
 * Returns the declaration kind of the given ts.Node
 * @param  {ts.VariableDeclarationList}  node TypeScript AST node
 * @returns {string}     declaration kind
 */
export function getDeclarationKind(
  node: ts.VariableDeclarationList
): 'let' | 'const' | 'var' {
  if (node.flags & ts.NodeFlags.Let) {
    return 'let';
  }
  if (node.flags & ts.NodeFlags.Const) {
    return 'const';
  }
  return 'var';
}

/**
 * Gets a ts.Node's accessibility level
 * @param {ts.Node} node The ts.Node
 * @returns {string | null} accessibility "public", "protected", "private", or null
 */
export function getTSNodeAccessibility(
  node: ts.Node
): 'public' | 'protected' | 'private' | null {
  const modifiers = node.modifiers;
  if (!modifiers) {
    return null;
  }
  for (let i = 0; i < modifiers.length; i++) {
    const modifier = modifiers[i];
    switch (modifier.kind) {
      case SyntaxKind.PublicKeyword:
        return 'public';
      case SyntaxKind.ProtectedKeyword:
        return 'protected';
      case SyntaxKind.PrivateKeyword:
        return 'private';
      default:
        break;
    }
  }
  return null;
}

/**
 * Finds the next token based on the previous one and its parent
 * Had to copy this from TS instead of using TS's version because theirs doesn't pass the ast to getChildren
 * @param {ts.TextRange} previousToken The previous TSToken
 * @param {ts.Node} parent The parent TSNode
 * @param {ts.SourceFile} ast The TS AST
 * @returns {ts.Node|undefined} the next TSToken
 */
export function findNextToken(
  previousToken: ts.TextRange,
  parent: ts.Node,
  ast: ts.SourceFile
): ts.Node | undefined {
  return find(parent);

  function find(n: ts.Node): ts.Node | undefined {
    if (ts.isToken(n) && n.pos === previousToken.end) {
      // this is token that starts at the end of previous token - return it
      return n;
    }
    return firstDefined(n.getChildren(ast), (child: ts.Node) => {
      const shouldDiveInChildNode =
        // previous token is enclosed somewhere in the child
        (child.pos <= previousToken.pos && child.end > previousToken.end) ||
        // previous token ends exactly at the beginning of child
        child.pos === previousToken.end;
      return shouldDiveInChildNode && nodeHasTokens(child, ast)
        ? find(child)
        : undefined;
    });
  }
}

/**
 * Find the first matching token based on the given predicate function.
 * @param {ts.Node} previousToken The previous ts.Token
 * @param {ts.Node} parent The parent ts.Node
 * @param {Function} predicate The predicate function to apply to each checked token
 * @param {ts.SourceFile} ast The TS AST
 * @returns {ts.Node|undefined} a matching ts.Token
 */
export function findFirstMatchingToken(
  previousToken: ts.Node | undefined,
  parent: ts.Node,
  predicate: (node: ts.Node) => boolean,
  ast: ts.SourceFile
): ts.Node | undefined {
  while (previousToken) {
    if (predicate(previousToken)) {
      return previousToken;
    }
    previousToken = findNextToken(previousToken, parent, ast);
  }
  return undefined;
}

/**
 * Find the first matching ancestor based on the given predicate function.
 * @param {ts.Node} node The current ts.Node
 * @param {Function} predicate The predicate function to apply to each checked ancestor
 * @returns {ts.Node|undefined} a matching parent ts.Node
 */
export function findFirstMatchingAncestor(
  node: ts.Node,
  predicate: (node: ts.Node) => boolean
): ts.Node | undefined {
  while (node) {
    if (predicate(node)) {
      return node;
    }
    node = node.parent;
  }
  return undefined;
}

/**
 * Returns true if a given ts.Node has a JSX token within its hierarchy
 * @param  {ts.Node} node ts.Node to be checked
 * @returns {boolean}       has JSX ancestor
 */
export function hasJSXAncestor(node: ts.Node): boolean {
  return !!findFirstMatchingAncestor(node, isJSXToken);
}

/**
 * Unescape the text content of string literals, e.g. &amp; -> &
 * @param {string} text The escaped string literal text.
 * @returns {string} The unescaped string literal text.
 */
export function unescapeStringLiteralText(text: string): string {
  return unescape(text);
}

/**
 * Returns true if a given ts.Node is a computed property
 * @param  {ts.Node} node ts.Node to be checked
 * @returns {boolean}       is Computed Property
 */
export function isComputedProperty(node: ts.Node): boolean {
  return node.kind === SyntaxKind.ComputedPropertyName;
}

/**
 * Returns true if a given ts.Node is optional (has QuestionToken)
 * @param  {ts.Node} node ts.Node to be checked
 * @returns {boolean}       is Optional
 */
export function isOptional(node: {
  questionToken?: ts.QuestionToken;
}): boolean {
  return node.questionToken
    ? node.questionToken.kind === SyntaxKind.QuestionToken
    : false;
}

/**
 * Fixes the exports of the given ts.Node
 * @param  {ts.Node} node   the ts.Node
 * @param  {ESTreeNode} result result
 * @param  {ts.SourceFile} ast    the AST
 * @returns {ESTreeNode}        the ESTreeNode with fixed exports
 */
export function fixExports(
  node: ts.Node,
  result: ESTreeNode,
  ast: ts.SourceFile
): ESTreeNode {
  // check for exports
  if (node.modifiers && node.modifiers[0].kind === SyntaxKind.ExportKeyword) {
    const exportKeyword = node.modifiers[0],
      nextModifier = node.modifiers[1],
      lastModifier = node.modifiers[node.modifiers.length - 1],
      declarationIsDefault =
        nextModifier && nextModifier.kind === SyntaxKind.DefaultKeyword,
      varToken = findNextToken(lastModifier, ast, ast);

    result.range[0] = varToken!.getStart(ast);
    result.loc = getLocFor(result.range[0], result.range[1], ast);

    const declarationType = declarationIsDefault
      ? AST_NODE_TYPES.ExportDefaultDeclaration
      : AST_NODE_TYPES.ExportNamedDeclaration;

    const newResult: any = {
      type: declarationType,
      declaration: result,
      range: [exportKeyword.getStart(ast), result.range[1]],
      loc: getLocFor(exportKeyword.getStart(ast), result.range[1], ast)
    };

    if (!declarationIsDefault) {
      newResult.specifiers = [];
      newResult.source = null;
    }

    return newResult;
  }

  return result;
}

/**
 * Returns the type of a given ts.Token
 * @param  {ts.Token} token the ts.Token
 * @returns {string}       the token type
 */
export function getTokenType(token: any): string {
  // Need two checks for keywords since some are also identifiers
  if (token.originalKeywordKind) {
    switch (token.originalKeywordKind) {
      case SyntaxKind.NullKeyword:
        return 'Null';

      case SyntaxKind.GetKeyword:
      case SyntaxKind.SetKeyword:
      case SyntaxKind.TypeKeyword:
      case SyntaxKind.ModuleKeyword:
        return 'Identifier';

      default:
        return 'Keyword';
    }
  }

  if (
    token.kind >= SyntaxKind.FirstKeyword &&
    token.kind <= SyntaxKind.LastFutureReservedWord
  ) {
    if (
      token.kind === SyntaxKind.FalseKeyword ||
      token.kind === SyntaxKind.TrueKeyword
    ) {
      return 'Boolean';
    }

    return 'Keyword';
  }

  if (
    token.kind >= SyntaxKind.FirstPunctuation &&
    token.kind <= SyntaxKind.LastBinaryOperator
  ) {
    return 'Punctuator';
  }

  if (
    token.kind >= SyntaxKind.NoSubstitutionTemplateLiteral &&
    token.kind <= SyntaxKind.TemplateTail
  ) {
    return 'Template';
  }

  switch (token.kind) {
    case SyntaxKind.NumericLiteral:
      return 'Numeric';

    case SyntaxKind.JsxText:
      return 'JSXText';

    case SyntaxKind.StringLiteral:
      // A TypeScript-StringLiteral token with a TypeScript-JsxAttribute or TypeScript-JsxElement parent,
      // must actually be an ESTree-JSXText token
      if (
        token.parent &&
        (token.parent.kind === SyntaxKind.JsxAttribute ||
          token.parent.kind === SyntaxKind.JsxElement)
      ) {
        return 'JSXText';
      }

      return 'String';

    case SyntaxKind.RegularExpressionLiteral:
      return 'RegularExpression';

    case SyntaxKind.Identifier:
    case SyntaxKind.ConstructorKeyword:
    case SyntaxKind.GetKeyword:
    case SyntaxKind.SetKeyword:

    // falls through
    default:
  }

  // Some JSX tokens have to be determined based on their parent
  if (token.parent) {
    if (
      token.kind === SyntaxKind.Identifier &&
      token.parent.kind === SyntaxKind.PropertyAccessExpression &&
      hasJSXAncestor(token)
    ) {
      return 'JSXIdentifier';
    }

    if (isJSXToken(token.parent)) {
      if (token.kind === SyntaxKind.PropertyAccessExpression) {
        return 'JSXMemberExpression';
      }

      if (token.kind === SyntaxKind.Identifier) {
        return 'JSXIdentifier';
      }
    }
  }

  return 'Identifier';
}

/**
 * Extends and formats a given ts.Token, for a given AST
 * @param  {ts.Node} token the ts.Token
 * @param  {ts.SourceFile} ast   the AST object
 * @returns {ESTreeToken}       the converted ESTreeToken
 */
export function convertToken(token: ts.Node, ast: ts.SourceFile): ESTreeToken {
  const start =
      token.kind === SyntaxKind.JsxText
        ? token.getFullStart()
        : token.getStart(ast),
    end = token.getEnd(),
    value = ast.text.slice(start, end),
    newToken: any = {
      type: getTokenType(token),
      value,
      range: [start, end],
      loc: getLocFor(start, end, ast)
    };

  if (newToken.type === 'RegularExpression') {
    newToken.regex = {
      pattern: value.slice(1, value.lastIndexOf('/')),
      flags: value.slice(value.lastIndexOf('/') + 1)
    };
  }

  return newToken;
}

/**
 * Converts all tokens for the given AST
 * @param  {ts.SourceFile} ast the AST object
 * @returns {ESTreeToken[]}     the converted ESTreeTokens
 */
export function convertTokens(ast: ts.SourceFile): ESTreeToken[] {
  const result: ESTreeToken[] = [];
  /**
   * @param  {ts.Node} node the ts.Node
   * @returns {void}
   */
  function walk(node: ts.Node): void {
    // TypeScript generates tokens for types in JSDoc blocks. Comment tokens
    // and their children should not be walked or added to the resulting tokens list.
    if (isComment(node) || isJSDocComment(node)) {
      return;
    }

    if (isToken(node) && node.kind !== SyntaxKind.EndOfFileToken) {
      const converted = convertToken(node, ast);

      if (converted) {
        result.push(converted);
      }
    } else {
      node.getChildren(ast).forEach(walk);
    }
  }
  walk(ast);
  return result;
}

/**
 * Get container token node between range
 * @param {ts.SourceFile} ast the AST object
 * @param {number} start The index at which the comment starts.
 * @param {number} end The index at which the comment ends.
 * @returns {ts.Node}       typescript container token
 * @private
 */
export function getNodeContainer(
  ast: ts.SourceFile,
  start: number,
  end: number
): ts.Node {
  let container: ts.Node | null = null;

  /**
   * @param  {ts.Node} node the ts.Node
   * @returns {void}
   */
  function walk(node: ts.Node): void {
    const nodeStart = node.pos;
    const nodeEnd = node.end;

    if (start >= nodeStart && end <= nodeEnd) {
      if (isToken(node)) {
        container = node;
      } else {
        node.getChildren().forEach(walk);
      }
    }
  }
  walk(ast);

  return container!;
}

/**
 * @param {ts.SourceFile} ast     the AST object
 * @param {number} start      the index at which the error starts
 * @param {string} message the error message
 * @returns {Object}       converted error object
 */
export function createError(
  ast: ts.SourceFile,
  start: number,
  message: string
) {
  const loc = ast.getLineAndCharacterOfPosition(start);
  return {
    index: start,
    lineNumber: loc.line + 1,
    column: loc.character,
    message
  };
}

/**
 * @param {ts.Node} n the TSNode
 * @param {ts.SourceFile} ast the TS AST
 */
export function nodeHasTokens(n: ts.Node, ast: ts.SourceFile) {
  // If we have a token or node that has a non-zero width, it must have tokens.
  // Note: getWidth() does not take trivia into account.
  return n.kind === SyntaxKind.EndOfFileToken
    ? !!(n as any).jsDoc
    : n.getWidth(ast) !== 0;
}

/**
 * Like `forEach`, but suitable for use with numbers and strings (which may be falsy).
 * @template T
 * @template U
 * @param {ReadonlyArray<T>|undefined} array
 * @param {(element: T, index: number) => (U|undefined)} callback
 * @returns {U|undefined}
 */
export function firstDefined<T, U>(
  array: ReadonlyArray<T> | undefined,
  callback: (element: T, index: number) => U | undefined
): U | undefined {
  if (array === undefined) {
    return undefined;
  }

  for (let i = 0; i < array.length; i++) {
    const result = callback(array[i], i);
    if (result !== undefined) {
      return result;
    }
  }
  return undefined;
}
