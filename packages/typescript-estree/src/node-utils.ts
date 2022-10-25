import * as ts from 'typescript';

import { getModifiers } from './getModifiers';
import { xhtmlEntities } from './jsx/xhtml-entities';
import type { TSESTree } from './ts-estree';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from './ts-estree';

const SyntaxKind = ts.SyntaxKind;

const LOGICAL_OPERATORS: (
  | ts.LogicalOperator
  | ts.SyntaxKind.QuestionQuestionToken
)[] = [
  SyntaxKind.BarBarToken,
  SyntaxKind.AmpersandAmpersandToken,
  SyntaxKind.QuestionQuestionToken,
];

interface TokenToText extends TSESTree.PunctuatorTokenToText {
  [SyntaxKind.ImportKeyword]: 'import';
  [SyntaxKind.InKeyword]: 'in';
  [SyntaxKind.InstanceOfKeyword]: 'instanceof';
  [SyntaxKind.NewKeyword]: 'new';
  [SyntaxKind.KeyOfKeyword]: 'keyof';
  [SyntaxKind.ReadonlyKeyword]: 'readonly';
  [SyntaxKind.UniqueKeyword]: 'unique';
}

/**
 * Returns true if the given ts.Token is the assignment operator
 * @param operator the operator token
 * @returns is assignment
 */
export function isAssignmentOperator<T extends ts.SyntaxKind>(
  operator: ts.Token<T>,
): boolean {
  return (
    operator.kind >= SyntaxKind.FirstAssignment &&
    operator.kind <= SyntaxKind.LastAssignment
  );
}

/**
 * Returns true if the given ts.Token is a logical operator
 * @param operator the operator token
 * @returns is a logical operator
 */
export function isLogicalOperator<T extends ts.SyntaxKind>(
  operator: ts.Token<T>,
): boolean {
  return (LOGICAL_OPERATORS as ts.SyntaxKind[]).includes(operator.kind);
}

/**
 * Returns the string form of the given TSToken SyntaxKind
 * @param kind the token's SyntaxKind
 * @returns the token applicable token as a string
 */
export function getTextForTokenKind<T extends ts.SyntaxKind>(
  kind: T,
): T extends keyof TokenToText ? TokenToText[T] : string | undefined {
  return ts.tokenToString(kind) as T extends keyof TokenToText
    ? TokenToText[T]
    : string | undefined;
}

/**
 * Returns true if the given ts.Node is a valid ESTree class member
 * @param node TypeScript AST node
 * @returns is valid ESTree class member
 */
export function isESTreeClassMember(node: ts.Node): boolean {
  return node.kind !== SyntaxKind.SemicolonClassElement;
}

/**
 * Checks if a ts.Node has a modifier
 * @param modifierKind TypeScript SyntaxKind modifier
 * @param node TypeScript AST node
 * @returns has the modifier specified
 */
export function hasModifier(
  modifierKind: ts.KeywordSyntaxKind,
  node: ts.Node,
): boolean {
  const modifiers = getModifiers(node);
  return modifiers?.some(modifier => modifier.kind === modifierKind) === true;
}

/**
 * Get last last modifier in ast
 * @param node TypeScript AST node
 * @returns returns last modifier if present or null
 */
export function getLastModifier(node: ts.Node): ts.Modifier | null {
  const modifiers = getModifiers(node);
  if (modifiers == null) {
    return null;
  }
  return modifiers[modifiers.length - 1] ?? null;
}

/**
 * Returns true if the given ts.Token is a comma
 * @param token the TypeScript token
 * @returns is comma
 */
export function isComma(
  token: ts.Node,
): token is ts.Token<ts.SyntaxKind.CommaToken> {
  return token.kind === SyntaxKind.CommaToken;
}

/**
 * Returns true if the given ts.Node is a comment
 * @param node the TypeScript node
 * @returns is comment
 */
export function isComment(node: ts.Node): boolean {
  return (
    node.kind === SyntaxKind.SingleLineCommentTrivia ||
    node.kind === SyntaxKind.MultiLineCommentTrivia
  );
}

/**
 * Returns true if the given ts.Node is a JSDoc comment
 * @param node the TypeScript node
 * @returns is JSDoc comment
 */
export function isJSDocComment(node: ts.Node): node is ts.JSDoc {
  return node.kind === SyntaxKind.JSDocComment;
}

/**
 * Returns the binary expression type of the given ts.Token
 * @param operator the operator token
 * @returns the binary expression type
 */
export function getBinaryExpressionType<T extends ts.SyntaxKind>(
  operator: ts.Token<T>,
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
 * Returns line and column data for the given positions,
 * @param pos position to check
 * @param ast the AST object
 * @returns line and column
 */
export function getLineAndCharacterFor(
  pos: number,
  ast: ts.SourceFile,
): TSESTree.Position {
  const loc = ast.getLineAndCharacterOfPosition(pos);
  return {
    line: loc.line + 1,
    column: loc.character,
  };
}

/**
 * Returns line and column data for the given start and end positions,
 * for the given AST
 * @param start start data
 * @param end   end data
 * @param ast   the AST object
 * @returns the loc data
 */
export function getLocFor(
  start: number,
  end: number,
  ast: ts.SourceFile,
): TSESTree.SourceLocation {
  return {
    start: getLineAndCharacterFor(start, ast),
    end: getLineAndCharacterFor(end, ast),
  };
}

/**
 * Check whatever node can contain directive
 * @param node
 * @returns returns true if node can contain directive
 */
export function canContainDirective(
  node:
    | ts.SourceFile
    | ts.Block
    | ts.ModuleBlock
    | ts.ClassStaticBlockDeclaration,
): boolean {
  if (node.kind === ts.SyntaxKind.Block) {
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
  }
  return true;
}

/**
 * Returns range for the given ts.Node
 * @param node the ts.Node or ts.Token
 * @param ast the AST object
 * @returns the range data
 */
export function getRange(
  node: Pick<ts.Node, 'getEnd' | 'getStart'>,
  ast: ts.SourceFile,
): [number, number] {
  return [node.getStart(ast), node.getEnd()];
}

/**
 * Returns true if a given ts.Node is a token
 * @param node the ts.Node
 * @returns is a token
 */
export function isToken(node: ts.Node): node is ts.Token<ts.TokenSyntaxKind> {
  return (
    node.kind >= SyntaxKind.FirstToken && node.kind <= SyntaxKind.LastToken
  );
}

/**
 * Returns true if a given ts.Node is a JSX token
 * @param node ts.Node to be checked
 * @returns is a JSX token
 */
export function isJSXToken(node: ts.Node): boolean {
  return (
    node.kind >= SyntaxKind.JsxElement && node.kind <= SyntaxKind.JsxAttribute
  );
}

/**
 * Returns the declaration kind of the given ts.Node
 * @param node TypeScript AST node
 * @returns declaration kind
 */
export function getDeclarationKind(
  node: ts.VariableDeclarationList,
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
 * @param node The ts.Node
 * @returns accessibility "public", "protected", "private", or null
 */
export function getTSNodeAccessibility(
  node: ts.Node,
): 'public' | 'protected' | 'private' | null {
  const modifiers = getModifiers(node);
  if (modifiers == null) {
    return null;
  }
  for (const modifier of modifiers) {
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
 * @param previousToken The previous TSToken
 * @param parent The parent TSNode
 * @param ast The TS AST
 * @returns the next TSToken
 */
export function findNextToken(
  previousToken: ts.TextRange,
  parent: ts.Node,
  ast: ts.SourceFile,
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
 * Find the first matching ancestor based on the given predicate function.
 * @param node The current ts.Node
 * @param predicate The predicate function to apply to each checked ancestor
 * @returns a matching parent ts.Node
 */
export function findFirstMatchingAncestor(
  node: ts.Node,
  predicate: (node: ts.Node) => boolean,
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
 * @param node ts.Node to be checked
 * @returns has JSX ancestor
 */
export function hasJSXAncestor(node: ts.Node): boolean {
  return !!findFirstMatchingAncestor(node, isJSXToken);
}

/**
 * Unescape the text content of string literals, e.g. &amp; -> &
 * @param text The escaped string literal text.
 * @returns The unescaped string literal text.
 */
export function unescapeStringLiteralText(text: string): string {
  return text.replace(/&(?:#\d+|#x[\da-fA-F]+|[0-9a-zA-Z]+);/g, entity => {
    const item = entity.slice(1, -1);
    if (item[0] === '#') {
      const codePoint =
        item[1] === 'x'
          ? parseInt(item.slice(2), 16)
          : parseInt(item.slice(1), 10);
      return codePoint > 0x10ffff // RangeError: Invalid code point
        ? entity
        : String.fromCodePoint(codePoint);
    }
    return xhtmlEntities[item] || entity;
  });
}

/**
 * Returns true if a given ts.Node is a computed property
 * @param node ts.Node to be checked
 * @returns is Computed Property
 */
export function isComputedProperty(
  node: ts.Node,
): node is ts.ComputedPropertyName {
  return node.kind === SyntaxKind.ComputedPropertyName;
}

/**
 * Returns true if a given ts.Node is optional (has QuestionToken)
 * @param node ts.Node to be checked
 * @returns is Optional
 */
export function isOptional(node: {
  questionToken?: ts.QuestionToken;
}): boolean {
  return node.questionToken
    ? node.questionToken.kind === SyntaxKind.QuestionToken
    : false;
}

/**
 * Returns true if the node is an optional chain node
 */
export function isChainExpression(
  node: TSESTree.Node,
): node is TSESTree.ChainExpression {
  return node.type === AST_NODE_TYPES.ChainExpression;
}

/**
 * Returns true of the child of property access expression is an optional chain
 */
export function isChildUnwrappableOptionalChain(
  node:
    | ts.PropertyAccessExpression
    | ts.ElementAccessExpression
    | ts.CallExpression
    | ts.NonNullExpression,
  child: TSESTree.Node,
): boolean {
  return (
    isChainExpression(child) &&
    // (x?.y).z is semantically different, and as such .z is no longer optional
    node.expression.kind !== ts.SyntaxKind.ParenthesizedExpression
  );
}

/**
 * Returns the type of a given ts.Token
 * @param token the ts.Token
 * @returns the token type
 */
export function getTokenType(
  token: ts.Identifier | ts.Token<ts.SyntaxKind>,
): Exclude<AST_TOKEN_TYPES, AST_TOKEN_TYPES.Line | AST_TOKEN_TYPES.Block> {
  if ('originalKeywordKind' in token && token.originalKeywordKind) {
    if (token.originalKeywordKind === SyntaxKind.NullKeyword) {
      return AST_TOKEN_TYPES.Null;
    } else if (
      token.originalKeywordKind >= SyntaxKind.FirstFutureReservedWord &&
      token.originalKeywordKind <= SyntaxKind.LastKeyword
    ) {
      return AST_TOKEN_TYPES.Identifier;
    }
    return AST_TOKEN_TYPES.Keyword;
  }

  if (
    token.kind >= SyntaxKind.FirstKeyword &&
    token.kind <= SyntaxKind.LastFutureReservedWord
  ) {
    if (
      token.kind === SyntaxKind.FalseKeyword ||
      token.kind === SyntaxKind.TrueKeyword
    ) {
      return AST_TOKEN_TYPES.Boolean;
    }

    return AST_TOKEN_TYPES.Keyword;
  }

  if (
    token.kind >= SyntaxKind.FirstPunctuation &&
    token.kind <= SyntaxKind.LastPunctuation
  ) {
    return AST_TOKEN_TYPES.Punctuator;
  }

  if (
    token.kind >= SyntaxKind.NoSubstitutionTemplateLiteral &&
    token.kind <= SyntaxKind.TemplateTail
  ) {
    return AST_TOKEN_TYPES.Template;
  }

  switch (token.kind) {
    case SyntaxKind.NumericLiteral:
      return AST_TOKEN_TYPES.Numeric;

    case SyntaxKind.JsxText:
      return AST_TOKEN_TYPES.JSXText;

    case SyntaxKind.StringLiteral:
      // A TypeScript-StringLiteral token with a TypeScript-JsxAttribute or TypeScript-JsxElement parent,
      // must actually be an ESTree-JSXText token
      if (
        token.parent.kind === SyntaxKind.JsxAttribute ||
        token.parent.kind === SyntaxKind.JsxElement
      ) {
        return AST_TOKEN_TYPES.JSXText;
      }

      return AST_TOKEN_TYPES.String;

    case SyntaxKind.RegularExpressionLiteral:
      return AST_TOKEN_TYPES.RegularExpression;

    case SyntaxKind.Identifier:
    case SyntaxKind.ConstructorKeyword:
    case SyntaxKind.GetKeyword:
    case SyntaxKind.SetKeyword:

    // intentional fallthrough
    default:
  }

  // Some JSX tokens have to be determined based on their parent
  if (token.kind === SyntaxKind.Identifier) {
    if (isJSXToken(token.parent)) {
      return AST_TOKEN_TYPES.JSXIdentifier;
    }

    if (
      token.parent.kind === SyntaxKind.PropertyAccessExpression &&
      hasJSXAncestor(token)
    ) {
      return AST_TOKEN_TYPES.JSXIdentifier;
    }
  }

  return AST_TOKEN_TYPES.Identifier;
}

/**
 * Extends and formats a given ts.Token, for a given AST
 * @param token the ts.Token
 * @param ast   the AST object
 * @returns the converted Token
 */
export function convertToken(
  token: ts.Token<ts.TokenSyntaxKind>,
  ast: ts.SourceFile,
): TSESTree.Token {
  const start =
    token.kind === SyntaxKind.JsxText
      ? token.getFullStart()
      : token.getStart(ast);
  const end = token.getEnd();
  const value = ast.text.slice(start, end);
  const tokenType = getTokenType(token);

  if (tokenType === AST_TOKEN_TYPES.RegularExpression) {
    return {
      type: tokenType,
      value,
      range: [start, end],
      loc: getLocFor(start, end, ast),
      regex: {
        pattern: value.slice(1, value.lastIndexOf('/')),
        flags: value.slice(value.lastIndexOf('/') + 1),
      },
    };
  } else {
    // @ts-expect-error TS is complaining about `value` not being the correct
    // type but it is
    return {
      type: tokenType,
      value,
      range: [start, end],
      loc: getLocFor(start, end, ast),
    };
  }
}

/**
 * Converts all tokens for the given AST
 * @param ast the AST object
 * @returns the converted Tokens
 */
export function convertTokens(ast: ts.SourceFile): TSESTree.Token[] {
  const result: TSESTree.Token[] = [];
  /**
   * @param node the ts.Node
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

export class TSError extends Error {
  constructor(
    message: string,
    public readonly fileName: string,
    public readonly index: number,
    public readonly lineNumber: number,
    public readonly column: number,
  ) {
    super(message);
    Object.defineProperty(this, 'name', {
      value: new.target.name,
      enumerable: false,
      configurable: true,
    });
  }
}

/**
 * @param ast     the AST object
 * @param start   the index at which the error starts
 * @param message the error message
 * @returns converted error object
 */
export function createError(
  ast: ts.SourceFile,
  start: number,
  message: string,
): TSError {
  const loc = ast.getLineAndCharacterOfPosition(start);
  return new TSError(message, ast.fileName, start, loc.line + 1, loc.character);
}

/**
 * @param n the TSNode
 * @param ast the TS AST
 */
export function nodeHasTokens(n: ts.Node, ast: ts.SourceFile): boolean {
  // If we have a token or node that has a non-zero width, it must have tokens.
  // Note: getWidth() does not take trivia into account.
  return n.kind === SyntaxKind.EndOfFileToken
    ? !!(n as ts.JSDocContainer).jsDoc
    : n.getWidth(ast) !== 0;
}

/**
 * Like `forEach`, but suitable for use with numbers and strings (which may be falsy).
 * @template T
 * @template U
 * @param array
 * @param callback
 */
export function firstDefined<T, U>(
  array: readonly T[] | undefined,
  callback: (element: T, index: number) => U | undefined,
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

export function identifierIsThisKeyword(id: ts.Identifier): boolean {
  return id.originalKeywordKind === SyntaxKind.ThisKeyword;
}

export function isThisIdentifier(
  node: ts.Node | undefined,
): node is ts.Identifier {
  return (
    !!node &&
    node.kind === SyntaxKind.Identifier &&
    identifierIsThisKeyword(node as ts.Identifier)
  );
}

export function isThisInTypeQuery(node: ts.Node): boolean {
  if (!isThisIdentifier(node)) {
    return false;
  }

  while (ts.isQualifiedName(node.parent) && node.parent.left === node) {
    node = node.parent;
  }

  return node.parent.kind === SyntaxKind.TypeQuery;
}
