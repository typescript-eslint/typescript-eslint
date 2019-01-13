/**
 * @fileoverview Utilities for finding and converting TSNodes into ESTreeNodes
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const ts = require('typescript'),
  unescape = require('lodash.unescape');

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

const SyntaxKind = ts.SyntaxKind;

const ASSIGNMENT_OPERATORS = [
  SyntaxKind.EqualsToken,
  SyntaxKind.PlusEqualsToken,
  SyntaxKind.MinusEqualsToken,
  SyntaxKind.AsteriskEqualsToken,
  SyntaxKind.SlashEqualsToken,
  SyntaxKind.PercentEqualsToken,
  SyntaxKind.LessThanLessThanEqualsToken,
  SyntaxKind.GreaterThanGreaterThanEqualsToken,
  SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  SyntaxKind.AmpersandEqualsToken,
  SyntaxKind.BarEqualsToken,
  SyntaxKind.CaretEqualsToken
];

const LOGICAL_OPERATORS = [
  SyntaxKind.BarBarToken,
  SyntaxKind.AmpersandAmpersandToken
];

const TOKEN_TO_TEXT = {};
TOKEN_TO_TEXT[SyntaxKind.OpenBraceToken] = '{';
TOKEN_TO_TEXT[SyntaxKind.CloseBraceToken] = '}';
TOKEN_TO_TEXT[SyntaxKind.OpenParenToken] = '(';
TOKEN_TO_TEXT[SyntaxKind.CloseParenToken] = ')';
TOKEN_TO_TEXT[SyntaxKind.OpenBracketToken] = '[';
TOKEN_TO_TEXT[SyntaxKind.CloseBracketToken] = ']';
TOKEN_TO_TEXT[SyntaxKind.DotToken] = '.';
TOKEN_TO_TEXT[SyntaxKind.DotDotDotToken] = '...';
TOKEN_TO_TEXT[SyntaxKind.SemicolonToken] = ';';
TOKEN_TO_TEXT[SyntaxKind.CommaToken] = ',';
TOKEN_TO_TEXT[SyntaxKind.LessThanToken] = '<';
TOKEN_TO_TEXT[SyntaxKind.GreaterThanToken] = '>';
TOKEN_TO_TEXT[SyntaxKind.LessThanEqualsToken] = '<=';
TOKEN_TO_TEXT[SyntaxKind.GreaterThanEqualsToken] = '>=';
TOKEN_TO_TEXT[SyntaxKind.EqualsEqualsToken] = '==';
TOKEN_TO_TEXT[SyntaxKind.ExclamationEqualsToken] = '!=';
TOKEN_TO_TEXT[SyntaxKind.EqualsEqualsEqualsToken] = '===';
TOKEN_TO_TEXT[SyntaxKind.InstanceOfKeyword] = 'instanceof';
TOKEN_TO_TEXT[SyntaxKind.ExclamationEqualsEqualsToken] = '!==';
TOKEN_TO_TEXT[SyntaxKind.EqualsGreaterThanToken] = '=>';
TOKEN_TO_TEXT[SyntaxKind.PlusToken] = '+';
TOKEN_TO_TEXT[SyntaxKind.MinusToken] = '-';
TOKEN_TO_TEXT[SyntaxKind.AsteriskToken] = '*';
TOKEN_TO_TEXT[SyntaxKind.AsteriskAsteriskToken] = '**';
TOKEN_TO_TEXT[SyntaxKind.SlashToken] = '/';
TOKEN_TO_TEXT[SyntaxKind.PercentToken] = '%';
TOKEN_TO_TEXT[SyntaxKind.PlusPlusToken] = '++';
TOKEN_TO_TEXT[SyntaxKind.MinusMinusToken] = '--';
TOKEN_TO_TEXT[SyntaxKind.LessThanLessThanToken] = '<<';
TOKEN_TO_TEXT[SyntaxKind.LessThanSlashToken] = '</';
TOKEN_TO_TEXT[SyntaxKind.GreaterThanGreaterThanToken] = '>>';
TOKEN_TO_TEXT[SyntaxKind.GreaterThanGreaterThanGreaterThanToken] = '>>>';
TOKEN_TO_TEXT[SyntaxKind.AmpersandToken] = '&';
TOKEN_TO_TEXT[SyntaxKind.BarToken] = '|';
TOKEN_TO_TEXT[SyntaxKind.CaretToken] = '^';
TOKEN_TO_TEXT[SyntaxKind.ExclamationToken] = '!';
TOKEN_TO_TEXT[SyntaxKind.TildeToken] = '~';
TOKEN_TO_TEXT[SyntaxKind.AmpersandAmpersandToken] = '&&';
TOKEN_TO_TEXT[SyntaxKind.BarBarToken] = '||';
TOKEN_TO_TEXT[SyntaxKind.QuestionToken] = '?';
TOKEN_TO_TEXT[SyntaxKind.ColonToken] = ':';
TOKEN_TO_TEXT[SyntaxKind.EqualsToken] = '=';
TOKEN_TO_TEXT[SyntaxKind.PlusEqualsToken] = '+=';
TOKEN_TO_TEXT[SyntaxKind.MinusEqualsToken] = '-=';
TOKEN_TO_TEXT[SyntaxKind.AsteriskEqualsToken] = '*=';
TOKEN_TO_TEXT[SyntaxKind.AsteriskAsteriskEqualsToken] = '**=';
TOKEN_TO_TEXT[SyntaxKind.SlashEqualsToken] = '/=';
TOKEN_TO_TEXT[SyntaxKind.PercentEqualsToken] = '%=';
TOKEN_TO_TEXT[SyntaxKind.LessThanLessThanEqualsToken] = '<<=';
TOKEN_TO_TEXT[SyntaxKind.GreaterThanGreaterThanEqualsToken] = '>>=';
TOKEN_TO_TEXT[SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken] = '>>>=';
TOKEN_TO_TEXT[SyntaxKind.AmpersandEqualsToken] = '&=';
TOKEN_TO_TEXT[SyntaxKind.BarEqualsToken] = '|=';
TOKEN_TO_TEXT[SyntaxKind.CaretEqualsToken] = '^=';
TOKEN_TO_TEXT[SyntaxKind.AtToken] = '@';
TOKEN_TO_TEXT[SyntaxKind.InKeyword] = 'in';
TOKEN_TO_TEXT[SyntaxKind.UniqueKeyword] = 'unique';
TOKEN_TO_TEXT[SyntaxKind.KeyOfKeyword] = 'keyof';
TOKEN_TO_TEXT[SyntaxKind.NewKeyword] = 'new';
TOKEN_TO_TEXT[SyntaxKind.ImportKeyword] = 'import';

/**
 * Find the first matching child based on the given sourceFile and predicate function.
 * @param {TSNode} node The current TSNode
 * @param {Object} sourceFile The full AST source file
 * @param {Function} predicate The predicate function to apply to each checked child
 * @returns {TSNode|undefined} a matching child TSNode
 */
function findFirstMatchingChild(node, sourceFile, predicate) {
  const children = node.getChildren(sourceFile);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child && predicate(child)) {
      return child;
    }

    const grandChild = findFirstMatchingChild(child, sourceFile, predicate);
    if (grandChild) {
      return grandChild;
    }
  }
  return undefined;
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = {
  /**
   * Expose the enum of possible TSNode `kind`s.
   */
  SyntaxKind,
  isAssignmentOperator,
  isLogicalOperator,
  getTextForTokenKind,
  isESTreeClassMember,
  hasModifier,
  isComma,
  getBinaryExpressionType,
  getLocFor,
  getLoc,
  isToken,
  isJSXToken,
  getDeclarationKind,
  getTSNodeAccessibility,
  hasStaticModifierFlag,
  findNextToken,
  findFirstMatchingToken,
  findChildOfKind,
  findFirstMatchingAncestor,
  findAncestorOfKind,
  hasJSXAncestor,
  unescapeStringLiteralText,
  isComputedProperty,
  isOptional,
  fixExports,
  getTokenType,
  convertToken,
  convertTokens,
  getNodeContainer,
  isWithinTypeAnnotation,
  isTypeKeyword,
  isComment,
  isJSDocComment,
  createError
};

/**
 * Returns true if the given TSToken is the assignment operator
 * @param  {TSToken}  operator the operator token
 * @returns {boolean}          is assignment
 */
function isAssignmentOperator(operator) {
  return ASSIGNMENT_OPERATORS.indexOf(operator.kind) > -1;
}

/**
 * Returns true if the given TSToken is a logical operator
 * @param  {TSToken}  operator the operator token
 * @returns {boolean}          is a logical operator
 */
function isLogicalOperator(operator) {
  return LOGICAL_OPERATORS.indexOf(operator.kind) > -1;
}

/**
 * Returns the string form of the given TSToken SyntaxKind
 * @param  {number}  kind the token's SyntaxKind
 * @returns {string}          the token applicable token as a string
 */
function getTextForTokenKind(kind) {
  return TOKEN_TO_TEXT[kind];
}

/**
 * Returns true if the given TSNode is a valid ESTree class member
 * @param  {TSNode}  node TypeScript AST node
 * @returns {boolean}      is valid ESTree class member
 */
function isESTreeClassMember(node) {
  return node.kind !== SyntaxKind.SemicolonClassElement;
}

/**
 * Checks if a TSNode has a modifier
 * @param {SyntaxKind} modifierKind TypeScript SyntaxKind modifier
 * @param {TSNode} node TypeScript AST node
 * @returns {boolean} has the modifier specified
 */
function hasModifier(modifierKind, node) {
  return (
    !!node.modifiers &&
    !!node.modifiers.length &&
    node.modifiers.some(modifier => modifier.kind === modifierKind)
  );
}

/**
 * Returns true if the given TSToken is a comma
 * @param  {TSToken}  token the TypeScript token
 * @returns {boolean}       is comma
 */
function isComma(token) {
  return token.kind === SyntaxKind.CommaToken;
}

/**
 * Returns true if the given TSNode is a comment
 * @param {TSNode} node the TypeScript node
 * @returns {boolean} is commment
 */
function isComment(node) {
  return (
    node.kind === SyntaxKind.SingleLineCommentTrivia ||
    node.kind === SyntaxKind.MultiLineCommentTrivia
  );
}

/**
 * Returns true if the given TSNode is a JSDoc comment
 * @param {TSNode} node the TypeScript node
 * @returns {boolean} is JSDoc comment
 */
function isJSDocComment(node) {
  return node.kind === SyntaxKind.JSDocComment;
}

/**
 * Returns the binary expression type of the given TSToken
 * @param  {TSToken} operator the operator token
 * @returns {string}          the binary expression type
 */
function getBinaryExpressionType(operator) {
  if (isAssignmentOperator(operator)) {
    return 'AssignmentExpression';
  } else if (isLogicalOperator(operator)) {
    return 'LogicalExpression';
  }
  return 'BinaryExpression';
}

/**
 * Returns line and column data for the given start and end positions,
 * for the given AST
 * @param  {Object} start start data
 * @param  {Object} end   end data
 * @param  {Object} ast   the AST object
 * @returns {Object}       the loc data
 */
function getLocFor(start, end, ast) {
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
 * Returns line and column data for the given ESTreeNode or ESTreeToken,
 * for the given AST
 * @param  {ESTreeToken|ESTreeNode} nodeOrToken the ESTreeNode or ESTreeToken
 * @param  {Object} ast         the AST object
 * @returns {Object}             the loc data
 */
function getLoc(nodeOrToken, ast) {
  return getLocFor(nodeOrToken.getStart(), nodeOrToken.end, ast);
}

/**
 * Returns true if a given TSNode is a token
 * @param  {TSNode} node the TSNode
 * @returns {boolean}     is a token
 */
function isToken(node) {
  return (
    node.kind >= SyntaxKind.FirstToken && node.kind <= SyntaxKind.LastToken
  );
}

/**
 * Returns true if a given TSNode is a JSX token
 * @param  {TSNode} node TSNode to be checked
 * @returns {boolean}       is a JSX token
 */
function isJSXToken(node) {
  return (
    node.kind >= SyntaxKind.JsxElement && node.kind <= SyntaxKind.JsxAttribute
  );
}

/**
 * Returns true if the given TSNode.kind value corresponds to a type keyword
 * @param {number} kind TypeScript SyntaxKind
 * @returns {boolean} is a type keyword
 */
function isTypeKeyword(kind) {
  switch (kind) {
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.BooleanKeyword:
    case SyntaxKind.NeverKeyword:
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.ObjectKeyword:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.SymbolKeyword:
    case SyntaxKind.UnknownKeyword:
    case SyntaxKind.VoidKeyword:
      return true;
    default:
      return false;
  }
}

/**
 * Returns the declaration kind of the given TSNode
 * @param  {TSNode}  node TypeScript AST node
 * @returns {string}     declaration kind
 */
function getDeclarationKind(node) {
  switch (node.kind) {
    case SyntaxKind.TypeAliasDeclaration:
      return 'type';
    case SyntaxKind.VariableDeclarationList:
      if (node.flags & ts.NodeFlags.Let) {
        return 'let';
      }
      if (node.flags & ts.NodeFlags.Const) {
        return 'const';
      }
      return 'var';
    default:
      throw 'Unable to determine declaration kind.';
  }
}

/**
 * Gets a TSNode's accessibility level
 * @param {TSNode} node The TSNode
 * @returns {string | null} accessibility "public", "protected", "private", or null
 */
function getTSNodeAccessibility(node) {
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
        continue;
    }
  }
  return null;
}

/**
 * Returns true if the given TSNode has the modifier flag set which corresponds
 * to the static keyword.
 * @param {TSNode} node The TSNode
 * @returns {boolean} whether or not the static modifier flag is set
 */
function hasStaticModifierFlag(node) {
  /**
   * TODO: Remove dependency on private TypeScript method
   */
  return Boolean(ts.getModifierFlags(node) & ts.ModifierFlags.Static);
}

/**
 * Finds the next token based on the previous one and its parent
 * @param {TSToken} previousToken The previous TSToken
 * @param {TSNode} parent The parent TSNode
 * @returns {TSToken} the next TSToken
 */
function findNextToken(previousToken, parent) {
  /**
   * TODO: Remove dependency on private TypeScript method
   */
  return ts.findNextToken(previousToken, parent);
}

/**
 * Find the first matching token based on the given predicate function.
 * @param {TSToken} previousToken The previous TSToken
 * @param {TSNode} parent The parent TSNode
 * @param {Function} predicate The predicate function to apply to each checked token
 * @returns {TSToken|undefined} a matching TSToken
 */
function findFirstMatchingToken(previousToken, parent, predicate) {
  while (previousToken) {
    if (predicate(previousToken)) {
      return previousToken;
    }
    previousToken = findNextToken(previousToken, parent);
  }
  return undefined;
}

/**
 * Finds the first child TSNode which matches the given kind
 * @param {TSNode} node The parent TSNode
 * @param {number} kind The TSNode kind to match against
 * @param {Object} sourceFile The full AST source file
 * @returns {TSNode|undefined} a matching TSNode
 */
function findChildOfKind(node, kind, sourceFile) {
  return findFirstMatchingChild(node, sourceFile, child => child.kind === kind);
}

/**
 * Find the first matching ancestor based on the given predicate function.
 * @param {TSNode} node The current TSNode
 * @param {Function} predicate The predicate function to apply to each checked ancestor
 * @returns {TSNode|undefined} a matching parent TSNode
 */
function findFirstMatchingAncestor(node, predicate) {
  while (node) {
    if (predicate(node)) {
      return node;
    }
    node = node.parent;
  }
  return undefined;
}

/**
 * Finds the first parent TSNode which mastches the given kind
 * @param {TSNode} node The current TSNode
 * @param {number} kind The TSNode kind to match against
 * @returns {TSNode|undefined} a matching parent TSNode
 */
function findAncestorOfKind(node, kind) {
  return findFirstMatchingAncestor(node, parent => parent.kind === kind);
}

/**
 * Returns true if a given TSNode has a JSX token within its hierarchy
 * @param  {TSNode} node TSNode to be checked
 * @returns {boolean}       has JSX ancestor
 */
function hasJSXAncestor(node) {
  return !!findFirstMatchingAncestor(node, isJSXToken);
}

/**
 * Unescape the text content of string literals, e.g. &amp; -> &
 * @param {string} text The escaped string literal text.
 * @returns {string} The unescaped string literal text.
 */
function unescapeStringLiteralText(text) {
  return unescape(text);
}

/**
 * Returns true if a given TSNode is a computed property
 * @param  {TSNode} node TSNode to be checked
 * @returns {boolean}       is Computed Property
 */
function isComputedProperty(node) {
  return node.kind === SyntaxKind.ComputedPropertyName;
}

/**
 * Returns true if a given TSNode is optional (has QuestionToken)
 * @param  {TSNode} node TSNode to be checked
 * @returns {boolean}       is Optional
 */
function isOptional(node) {
  return node.questionToken
    ? node.questionToken.kind === SyntaxKind.QuestionToken
    : false;
}

/**
 * Returns true if the given TSNode is within the context of a "typeAnnotation",
 * which effectively means - is it coming from its parent's `type` or `types` property
 * @param  {TSNode} node TSNode to be checked
 * @returns {boolean}       is within "typeAnnotation context"
 */
function isWithinTypeAnnotation(node) {
  return (
    node.parent.type === node ||
    (node.parent.types && node.parent.types.indexOf(node) > -1)
  );
}

/**
 * Fixes the exports of the given TSNode
 * @param  {TSNode} node   the TSNode
 * @param  {Object} result result
 * @param  {Object} ast    the AST
 * @returns {TSNode}        the TSNode with fixed exports
 */
function fixExports(node, result, ast) {
  // check for exports
  if (node.modifiers && node.modifiers[0].kind === SyntaxKind.ExportKeyword) {
    const exportKeyword = node.modifiers[0],
      nextModifier = node.modifiers[1],
      lastModifier = node.modifiers[node.modifiers.length - 1],
      declarationIsDefault =
        nextModifier && nextModifier.kind === SyntaxKind.DefaultKeyword,
      varToken = findNextToken(lastModifier, ast);

    result.range[0] = varToken.getStart();
    result.loc = getLocFor(result.range[0], result.range[1], ast);

    const declarationType = declarationIsDefault
      ? 'ExportDefaultDeclaration'
      : 'ExportNamedDeclaration';

    const newResult = {
      type: declarationType,
      declaration: result,
      range: [exportKeyword.getStart(), result.range[1]],
      loc: getLocFor(exportKeyword.getStart(), result.range[1], ast)
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
 * Returns the type of a given ESTreeToken
 * @param  {ESTreeToken} token the ESTreeToken
 * @returns {string}       the token type
 */
function getTokenType(token) {
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
 * Extends and formats a given ESTreeToken, for a given AST
 * @param  {ESTreeToken} token the ESTreeToken
 * @param  {Object} ast   the AST object
 * @returns {ESTreeToken}       the converted ESTreeToken
 */
function convertToken(token, ast) {
  const start =
      token.kind === SyntaxKind.JsxText
        ? token.getFullStart()
        : token.getStart(),
    end = token.getEnd(),
    value = ast.text.slice(start, end),
    newToken = {
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
 * @param  {Object} ast the AST object
 * @returns {ESTreeToken[]}     the converted ESTreeTokens
 */
function convertTokens(ast) {
  const result = [];
  /**
   * @param  {TSNode} node the TSNode
   * @returns {undefined}
   */
  function walk(node) {
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
      node.getChildren().forEach(walk);
    }
  }
  walk(ast);
  return result;
}

/**
 * Get container token node between range
 * @param  {Object} ast the AST object
 * @param {int} start The index at which the comment starts.
 * @param {int} end The index at which the comment ends.
 * @returns {TSToken}       typescript container token
 * @private
 */
function getNodeContainer(ast, start, end) {
  let container = null;

  /**
   * @param  {TSNode} node the TSNode
   * @returns {undefined}
   */
  function walk(node) {
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

  return container;
}

/**
 * @param {Object} ast     the AST object
 * @param {int} start      the index at which the error starts
 * @param {string} message the error message
 * @returns {Object}       converted error object
 */
function createError(ast, start, message) {
  const loc = ast.getLineAndCharacterOfPosition(start);
  return {
    index: start,
    lineNumber: loc.line + 1,
    column: loc.character,
    message
  };
}
