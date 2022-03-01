import { SyntaxKind } from 'typescript';

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

export function getOperatorPrecedence(
  nodeKind: SyntaxKind,
  operatorKind: SyntaxKind,
  hasArguments?: boolean,
): OperatorPrecedence {
  switch (nodeKind) {
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
  kind: SyntaxKind,
): OperatorPrecedence {
  switch (kind) {
    case SyntaxKind.QuestionQuestionToken:
      return OperatorPrecedence.Coalesce;
    case SyntaxKind.BarBarToken:
      return OperatorPrecedence.LogicalOR;
    case SyntaxKind.AmpersandAmpersandToken:
      return OperatorPrecedence.LogicalAND;
    case SyntaxKind.BarToken:
      return OperatorPrecedence.BitwiseOR;
    case SyntaxKind.CaretToken:
      return OperatorPrecedence.BitwiseXOR;
    case SyntaxKind.AmpersandToken:
      return OperatorPrecedence.BitwiseAND;
    case SyntaxKind.EqualsEqualsToken:
    case SyntaxKind.ExclamationEqualsToken:
    case SyntaxKind.EqualsEqualsEqualsToken:
    case SyntaxKind.ExclamationEqualsEqualsToken:
      return OperatorPrecedence.Equality;
    case SyntaxKind.LessThanToken:
    case SyntaxKind.GreaterThanToken:
    case SyntaxKind.LessThanEqualsToken:
    case SyntaxKind.GreaterThanEqualsToken:
    case SyntaxKind.InstanceOfKeyword:
    case SyntaxKind.InKeyword:
    case SyntaxKind.AsKeyword:
      return OperatorPrecedence.Relational;
    case SyntaxKind.LessThanLessThanToken:
    case SyntaxKind.GreaterThanGreaterThanToken:
    case SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
      return OperatorPrecedence.Shift;
    case SyntaxKind.PlusToken:
    case SyntaxKind.MinusToken:
      return OperatorPrecedence.Additive;
    case SyntaxKind.AsteriskToken:
    case SyntaxKind.SlashToken:
    case SyntaxKind.PercentToken:
      return OperatorPrecedence.Multiplicative;
    case SyntaxKind.AsteriskAsteriskToken:
      return OperatorPrecedence.Exponentiation;
  }

  // -1 is lower than all other precedences.  Returning it will cause binary expression
  // parsing to stop.
  return -1;
}
