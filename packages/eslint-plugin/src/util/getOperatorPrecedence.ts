/* eslint-disable @typescript-eslint/prefer-literal-enum-member -- the enums come from TS so to make merging upstream easier we purposely avoid adding literal values. */
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { SyntaxKind } from 'typescript';

import type { ValueOf } from './types';

export enum OperatorPrecedence {
  // Expression:
  //     AssignmentExpression
  //     Expression `,` AssignmentExpression
  Comma,

  // NOTE: `Spread` is higher than `Comma` due to how it is parsed in |ElementList|
  // SpreadElement:
  //     `...` AssignmentExpression
  Spread,

  // AssignmentExpression:
  //     ConditionalExpression
  //     YieldExpression
  //     ArrowFunction
  //     AsyncArrowFunction
  //     LeftHandSideExpression `=` AssignmentExpression
  //     LeftHandSideExpression AssignmentOperator AssignmentExpression
  //
  // NOTE: AssignmentExpression is broken down into several precedences due to the requirements
  //       of the parenthesize rules.

  // AssignmentExpression: YieldExpression
  // YieldExpression:
  //     `yield`
  //     `yield` AssignmentExpression
  //     `yield` `*` AssignmentExpression
  Yield,

  // AssignmentExpression: LeftHandSideExpression `=` AssignmentExpression
  // AssignmentExpression: LeftHandSideExpression AssignmentOperator AssignmentExpression
  // AssignmentOperator: one of
  //     `*=` `/=` `%=` `+=` `-=` `<<=` `>>=` `>>>=` `&=` `^=` `|=` `**=`
  Assignment,

  // NOTE: `Conditional` is considered higher than `Assignment` here, but in reality they have
  //       the same precedence.
  // AssignmentExpression: ConditionalExpression
  // ConditionalExpression:
  //     ShortCircuitExpression
  //     ShortCircuitExpression `?` AssignmentExpression `:` AssignmentExpression
  // ShortCircuitExpression:
  //     LogicalORExpression
  //     CoalesceExpression
  Conditional,

  // CoalesceExpression:
  //     CoalesceExpressionHead `??` BitwiseORExpression
  // CoalesceExpressionHead:
  //     CoalesceExpression
  //     BitwiseORExpression
  Coalesce = Conditional, // NOTE: This is wrong

  // LogicalORExpression:
  //     LogicalANDExpression
  //     LogicalORExpression `||` LogicalANDExpression
  LogicalOR,

  // LogicalANDExpression:
  //     BitwiseORExpression
  //     LogicalANDExpression `&&` BitwiseORExpression
  LogicalAND,

  // BitwiseORExpression:
  //     BitwiseXORExpression
  //     BitwiseORExpression `^` BitwiseXORExpression
  BitwiseOR,

  // BitwiseXORExpression:
  //     BitwiseANDExpression
  //     BitwiseXORExpression `^` BitwiseANDExpression
  BitwiseXOR,

  // BitwiseANDExpression:
  //     EqualityExpression
  //     BitwiseANDExpression `^` EqualityExpression
  BitwiseAND,

  // EqualityExpression:
  //     RelationalExpression
  //     EqualityExpression `==` RelationalExpression
  //     EqualityExpression `!=` RelationalExpression
  //     EqualityExpression `===` RelationalExpression
  //     EqualityExpression `!==` RelationalExpression
  Equality,

  // RelationalExpression:
  //     ShiftExpression
  //     RelationalExpression `<` ShiftExpression
  //     RelationalExpression `>` ShiftExpression
  //     RelationalExpression `<=` ShiftExpression
  //     RelationalExpression `>=` ShiftExpression
  //     RelationalExpression `instanceof` ShiftExpression
  //     RelationalExpression `in` ShiftExpression
  //     [+TypeScript] RelationalExpression `as` Type
  Relational,

  // ShiftExpression:
  //     AdditiveExpression
  //     ShiftExpression `<<` AdditiveExpression
  //     ShiftExpression `>>` AdditiveExpression
  //     ShiftExpression `>>>` AdditiveExpression
  Shift,

  // AdditiveExpression:
  //     MultiplicativeExpression
  //     AdditiveExpression `+` MultiplicativeExpression
  //     AdditiveExpression `-` MultiplicativeExpression
  Additive,

  // MultiplicativeExpression:
  //     ExponentiationExpression
  //     MultiplicativeExpression MultiplicativeOperator ExponentiationExpression
  // MultiplicativeOperator: one of `*`, `/`, `%`
  Multiplicative,

  // ExponentiationExpression:
  //     UnaryExpression
  //     UpdateExpression `**` ExponentiationExpression
  Exponentiation,

  // UnaryExpression:
  //     UpdateExpression
  //     `delete` UnaryExpression
  //     `void` UnaryExpression
  //     `typeof` UnaryExpression
  //     `+` UnaryExpression
  //     `-` UnaryExpression
  //     `~` UnaryExpression
  //     `!` UnaryExpression
  //     AwaitExpression
  // UpdateExpression:            // TODO: Do we need to investigate the precedence here?
  //     `++` UnaryExpression
  //     `--` UnaryExpression
  Unary,

  // UpdateExpression:
  //     LeftHandSideExpression
  //     LeftHandSideExpression `++`
  //     LeftHandSideExpression `--`
  Update,

  // LeftHandSideExpression:
  //     NewExpression
  //     CallExpression
  // NewExpression:
  //     MemberExpression
  //     `new` NewExpression
  LeftHandSide,

  // CallExpression:
  //     CoverCallExpressionAndAsyncArrowHead
  //     SuperCall
  //     ImportCall
  //     CallExpression Arguments
  //     CallExpression `[` Expression `]`
  //     CallExpression `.` IdentifierName
  //     CallExpression TemplateLiteral
  // MemberExpression:
  //     PrimaryExpression
  //     MemberExpression `[` Expression `]`
  //     MemberExpression `.` IdentifierName
  //     MemberExpression TemplateLiteral
  //     SuperProperty
  //     MetaProperty
  //     `new` MemberExpression Arguments
  Member,

  // TODO: JSXElement?
  // PrimaryExpression:
  //     `this`
  //     IdentifierReference
  //     Literal
  //     ArrayLiteral
  //     ObjectLiteral
  //     FunctionExpression
  //     ClassExpression
  //     GeneratorExpression
  //     AsyncFunctionExpression
  //     AsyncGeneratorExpression
  //     RegularExpressionLiteral
  //     TemplateLiteral
  //     CoverParenthesizedExpressionAndArrowParameterList
  Primary,

  Highest = Primary,
  Lowest = Comma,
  // -1 is lower than all other precedences. Returning it will cause binary expression
  // parsing to stop.
  Invalid = -1,
}

export function getOperatorPrecedenceForNode(
  node: TSESTree.Node,
): OperatorPrecedence {
  switch (node.type) {
    case AST_NODE_TYPES.SpreadElement:
    case AST_NODE_TYPES.RestElement:
      return OperatorPrecedence.Spread;

    case AST_NODE_TYPES.YieldExpression:
    case AST_NODE_TYPES.ArrowFunctionExpression:
      return OperatorPrecedence.Yield;

    case AST_NODE_TYPES.ConditionalExpression:
      return OperatorPrecedence.Conditional;

    case AST_NODE_TYPES.SequenceExpression:
      return OperatorPrecedence.Comma;

    case AST_NODE_TYPES.AssignmentExpression:
    case AST_NODE_TYPES.BinaryExpression:
    case AST_NODE_TYPES.LogicalExpression:
      switch (node.operator) {
        case '==':
        case '+=':
        case '-=':
        case '**=':
        case '*=':
        case '/=':
        case '%=':
        case '<<=':
        case '>>=':
        case '>>>=':
        case '&=':
        case '^=':
        case '|=':
        case '||=':
        case '&&=':
        case '??=':
          return OperatorPrecedence.Assignment;

        default:
          return getBinaryOperatorPrecedence(node.operator);
      }

    case AST_NODE_TYPES.TSTypeAssertion:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.UnaryExpression:
    case AST_NODE_TYPES.AwaitExpression:
      return OperatorPrecedence.Unary;

    case AST_NODE_TYPES.UpdateExpression:
      // TODO: Should prefix `++` and `--` be moved to the `Update` precedence?
      if (node.prefix) {
        return OperatorPrecedence.Unary;
      }
      return OperatorPrecedence.Update;

    case AST_NODE_TYPES.ChainExpression:
      return getOperatorPrecedenceForNode(node.expression);

    case AST_NODE_TYPES.CallExpression:
      return OperatorPrecedence.LeftHandSide;

    case AST_NODE_TYPES.NewExpression:
      return node.arguments.length > 0
        ? OperatorPrecedence.Member
        : OperatorPrecedence.LeftHandSide;

    case AST_NODE_TYPES.TaggedTemplateExpression:
    case AST_NODE_TYPES.MemberExpression:
    case AST_NODE_TYPES.MetaProperty:
      return OperatorPrecedence.Member;

    case AST_NODE_TYPES.TSAsExpression:
      return OperatorPrecedence.Relational;

    case AST_NODE_TYPES.ThisExpression:
    case AST_NODE_TYPES.Super:
    case AST_NODE_TYPES.Identifier:
    case AST_NODE_TYPES.PrivateIdentifier:
    case AST_NODE_TYPES.Literal:
    case AST_NODE_TYPES.ArrayExpression:
    case AST_NODE_TYPES.ObjectExpression:
    case AST_NODE_TYPES.FunctionExpression:
    case AST_NODE_TYPES.ClassExpression:
    case AST_NODE_TYPES.TemplateLiteral:
    case AST_NODE_TYPES.JSXElement:
    case AST_NODE_TYPES.JSXFragment:
      // we don't have nodes for these cases
      // case SyntaxKind.ParenthesizedExpression:
      // case SyntaxKind.OmittedExpression:
      return OperatorPrecedence.Primary;

    default:
      return OperatorPrecedence.Invalid;
  }
}

type TSESTreeOperatorKind =
  | ValueOf<TSESTree.BinaryOperatorToText>
  | ValueOf<TSESTree.PunctuatorTokenToText>;

export function getOperatorPrecedence(
  nodeKind: SyntaxKind,
  operatorKind: SyntaxKind,
  hasArguments?: boolean,
): OperatorPrecedence {
  switch (nodeKind) {
    // A list of comma-separated expressions. This node is only created by transformations.
    case SyntaxKind.CommaListExpression:
      return OperatorPrecedence.Comma;

    case SyntaxKind.SpreadElement:
      return OperatorPrecedence.Spread;

    case SyntaxKind.YieldExpression:
      return OperatorPrecedence.Yield;

    case SyntaxKind.ConditionalExpression:
      return OperatorPrecedence.Conditional;

    case SyntaxKind.BinaryExpression:
      switch (operatorKind) {
        case SyntaxKind.CommaToken:
          return OperatorPrecedence.Comma;

        case SyntaxKind.EqualsToken:
        case SyntaxKind.PlusEqualsToken:
        case SyntaxKind.MinusEqualsToken:
        case SyntaxKind.AsteriskAsteriskEqualsToken:
        case SyntaxKind.AsteriskEqualsToken:
        case SyntaxKind.SlashEqualsToken:
        case SyntaxKind.PercentEqualsToken:
        case SyntaxKind.LessThanLessThanEqualsToken:
        case SyntaxKind.GreaterThanGreaterThanEqualsToken:
        case SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
        case SyntaxKind.AmpersandEqualsToken:
        case SyntaxKind.CaretEqualsToken:
        case SyntaxKind.BarEqualsToken:
        case SyntaxKind.BarBarEqualsToken:
        case SyntaxKind.AmpersandAmpersandEqualsToken:
        case SyntaxKind.QuestionQuestionEqualsToken:
          return OperatorPrecedence.Assignment;

        default:
          return getBinaryOperatorPrecedence(operatorKind);
      }

    // TODO: Should prefix `++` and `--` be moved to the `Update` precedence?
    case SyntaxKind.TypeAssertionExpression:
    case SyntaxKind.NonNullExpression:
    case SyntaxKind.PrefixUnaryExpression:
    case SyntaxKind.TypeOfExpression:
    case SyntaxKind.VoidExpression:
    case SyntaxKind.DeleteExpression:
    case SyntaxKind.AwaitExpression:
      return OperatorPrecedence.Unary;

    case SyntaxKind.PostfixUnaryExpression:
      return OperatorPrecedence.Update;

    case SyntaxKind.CallExpression:
      return OperatorPrecedence.LeftHandSide;

    case SyntaxKind.NewExpression:
      return hasArguments
        ? OperatorPrecedence.Member
        : OperatorPrecedence.LeftHandSide;

    case SyntaxKind.TaggedTemplateExpression:
    case SyntaxKind.PropertyAccessExpression:
    case SyntaxKind.ElementAccessExpression:
    case SyntaxKind.MetaProperty:
      return OperatorPrecedence.Member;

    case SyntaxKind.AsExpression:
    case SyntaxKind.SatisfiesExpression:
      return OperatorPrecedence.Relational;

    case SyntaxKind.ThisKeyword:
    case SyntaxKind.SuperKeyword:
    case SyntaxKind.Identifier:
    case SyntaxKind.PrivateIdentifier:
    case SyntaxKind.NullKeyword:
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.FalseKeyword:
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.BigIntLiteral:
    case SyntaxKind.StringLiteral:
    case SyntaxKind.ArrayLiteralExpression:
    case SyntaxKind.ObjectLiteralExpression:
    case SyntaxKind.FunctionExpression:
    case SyntaxKind.ArrowFunction:
    case SyntaxKind.ClassExpression:
    case SyntaxKind.RegularExpressionLiteral:
    case SyntaxKind.NoSubstitutionTemplateLiteral:
    case SyntaxKind.TemplateExpression:
    case SyntaxKind.ParenthesizedExpression:
    case SyntaxKind.OmittedExpression:
    case SyntaxKind.JsxElement:
    case SyntaxKind.JsxSelfClosingElement:
    case SyntaxKind.JsxFragment:
      return OperatorPrecedence.Primary;

    default:
      return OperatorPrecedence.Invalid;
  }
}

export function getBinaryOperatorPrecedence(
  kind: SyntaxKind | TSESTreeOperatorKind,
): OperatorPrecedence {
  switch (kind) {
    case SyntaxKind.QuestionQuestionToken:
    case '??':
      return OperatorPrecedence.Coalesce;

    case SyntaxKind.BarBarToken:
    case '||':
      return OperatorPrecedence.LogicalOR;

    case SyntaxKind.AmpersandAmpersandToken:
    case '&&':
      return OperatorPrecedence.LogicalAND;

    case SyntaxKind.BarToken:
    case '|':
      return OperatorPrecedence.BitwiseOR;

    case SyntaxKind.CaretToken:
    case '^':
      return OperatorPrecedence.BitwiseXOR;

    case SyntaxKind.AmpersandToken:
    case '&':
      return OperatorPrecedence.BitwiseAND;

    case SyntaxKind.EqualsEqualsToken:
    case '==':
    case SyntaxKind.ExclamationEqualsToken:
    case '!=':
    case SyntaxKind.EqualsEqualsEqualsToken:
    case '===':
    case SyntaxKind.ExclamationEqualsEqualsToken:
    case '!==':
      return OperatorPrecedence.Equality;

    case SyntaxKind.LessThanToken:
    case '<':
    case SyntaxKind.GreaterThanToken:
    case '>':
    case SyntaxKind.LessThanEqualsToken:
    case '<=':
    case SyntaxKind.GreaterThanEqualsToken:
    case '>=':
    case SyntaxKind.InstanceOfKeyword:
    case 'instanceof':
    case SyntaxKind.InKeyword:
    case 'in':
    case SyntaxKind.AsKeyword:
      // case 'as': -- we don't have a token for this
      return OperatorPrecedence.Relational;

    case SyntaxKind.LessThanLessThanToken:
    case '<<':
    case SyntaxKind.GreaterThanGreaterThanToken:
    case '>>':
    case SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
    case '>>>':
      return OperatorPrecedence.Shift;

    case SyntaxKind.PlusToken:
    case '+':
    case SyntaxKind.MinusToken:
    case '-':
      return OperatorPrecedence.Additive;

    case SyntaxKind.AsteriskToken:
    case '*':
    case SyntaxKind.SlashToken:
    case '/':
    case SyntaxKind.PercentToken:
    case '%':
      return OperatorPrecedence.Multiplicative;

    case SyntaxKind.AsteriskAsteriskToken:
    case '**':
      return OperatorPrecedence.Exponentiation;
  }

  // -1 is lower than all other precedences.  Returning it will cause binary expression
  // parsing to stop.
  return -1;
}
