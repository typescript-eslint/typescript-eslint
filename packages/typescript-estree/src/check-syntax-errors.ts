import * as ts from 'typescript';

import type { TSNode } from './ts-estree';

import { checkModifiers } from './check-modifiers';
import {
  isValidAssignmentTarget,
  createError,
  hasModifier,
  getDeclarationKind,
  getTextForTokenKind,
} from './node-utils';

const SyntaxKind = ts.SyntaxKind;

export function checkSyntaxError(tsNode: ts.Node): void {
  checkModifiers(tsNode);

  const node = tsNode as TSNode;

  switch (node.kind) {
    case SyntaxKind.SwitchStatement:
      if (
        node.caseBlock.clauses.filter(
          switchCase => switchCase.kind === SyntaxKind.DefaultClause,
        ).length > 1
      ) {
        throw createError(
          node,
          "A 'default' clause cannot appear more than once in a 'switch' statement.",
        );
      }
      break;

    case SyntaxKind.ThrowStatement:
      if (node.expression.end === node.expression.pos) {
        throw createError(node, 'A throw statement must throw an expression.');
      }
      break;

    case SyntaxKind.CatchClause:
      if (node.variableDeclaration?.initializer) {
        throw createError(
          node.variableDeclaration.initializer,
          'Catch clause variable cannot have an initializer.',
        );
      }
      break;

    case SyntaxKind.FunctionDeclaration: {
      const isDeclare = hasModifier(SyntaxKind.DeclareKeyword, node);
      const isAsync = hasModifier(SyntaxKind.AsyncKeyword, node);
      const isGenerator = !!node.asteriskToken;
      if (isDeclare) {
        if (node.body) {
          throw createError(
            node,
            'An implementation cannot be declared in ambient contexts.',
          );
        } else if (isAsync) {
          throw createError(
            node,
            "'async' modifier cannot be used in an ambient context.",
          );
        } else if (isGenerator) {
          throw createError(
            node,
            'Generators are not allowed in an ambient context.',
          );
        }
      } else if (!node.body && isGenerator) {
        throw createError(
          node,
          'A function signature cannot be declared as a generator.',
        );
      }
      break;
    }

    case SyntaxKind.VariableDeclaration: {
      const hasExclamationToken = !!node.exclamationToken;
      if (hasExclamationToken) {
        if (node.initializer) {
          throw createError(
            node,
            'Declarations with initializers cannot also have definite assignment assertions.',
          );
        } else if (node.name.kind !== SyntaxKind.Identifier || !node.type) {
          throw createError(
            node,
            'Declarations with definite assignment assertions must also have type annotations.',
          );
        }
      }

      if (node.parent.kind === SyntaxKind.VariableDeclarationList) {
        const variableDeclarationList = node.parent;
        const kind = getDeclarationKind(variableDeclarationList);

        if (
          (variableDeclarationList.parent.kind === SyntaxKind.ForInStatement ||
            variableDeclarationList.parent.kind === SyntaxKind.ForStatement) &&
          (kind === 'using' || kind === 'await using')
        ) {
          if (!node.initializer) {
            throw createError(
              node,
              `'${kind}' declarations may not be initialized in for statement.`,
            );
          }

          if (node.name.kind !== SyntaxKind.Identifier) {
            throw createError(
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
              throw createError(
                node,
                `'${kind}' declarations must be initialized.`,
              );
            }
            if (node.name.kind !== SyntaxKind.Identifier) {
              throw createError(
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
            throw createError(
              node,
              `A definite assignment assertion '!' is not permitted in this context.`,
            );
          }

          if (
            hasDeclareKeyword &&
            node.initializer &&
            (['let', 'var'].includes(kind) || node.type)
          ) {
            throw createError(
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

      break;
    }

    case SyntaxKind.VariableStatement: {
      const declarations = node.declarationList.declarations;

      if (!declarations.length) {
        throw createError(
          node,
          'A variable declaration list must have at least one variable declarator.',
        );
      }
      break;
    }

    case SyntaxKind.PropertyAssignment: {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const { exclamationToken, questionToken } = node;

      if (questionToken) {
        throw createError(
          questionToken,
          'A property assignment cannot have a question token.',
        );
      }

      if (exclamationToken) {
        throw createError(
          exclamationToken,
          'A property assignment cannot have an exclamation token.',
        );
      }
      break;
    }

    case SyntaxKind.ShorthandPropertyAssignment: {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const { exclamationToken, modifiers, questionToken } = node;

      if (modifiers) {
        throw createError(
          modifiers[0],
          'A shorthand property assignment cannot have modifiers.',
        );
      }

      if (questionToken) {
        throw createError(
          questionToken,
          'A shorthand property assignment cannot have a question token.',
        );
      }

      if (exclamationToken) {
        throw createError(
          exclamationToken,
          'A shorthand property assignment cannot have an exclamation token.',
        );
      }
      break;
    }

    case SyntaxKind.PropertyDeclaration: {
      const isAbstract = hasModifier(SyntaxKind.AbstractKeyword, node);

      if (isAbstract && node.initializer) {
        throw createError(
          node.initializer,
          `Abstract property cannot have an initializer.`,
        );
      }

      if (
        node.name.kind === SyntaxKind.StringLiteral &&
        node.name.text === 'constructor'
      ) {
        throw createError(
          node.name,
          "Classes may not have a field named 'constructor'.",
        );
      }
      break;
    }

    case SyntaxKind.TaggedTemplateExpression:
      if (node.tag.flags & ts.NodeFlags.OptionalChain) {
        throw createError(
          node,
          'Tagged template expressions are not permitted in an optional chain.',
        );
      }
      break;

    case SyntaxKind.ClassDeclaration:
      if (
        !node.name &&
        (!hasModifier(ts.SyntaxKind.ExportKeyword, node) ||
          !hasModifier(ts.SyntaxKind.DefaultKeyword, node))
      ) {
        throw createError(
          node,
          "A class declaration without the 'default' modifier must have a name.",
        );
      }
      break;

    case SyntaxKind.BinaryExpression:
      if (
        node.operatorToken.kind !== SyntaxKind.InKeyword &&
        node.left.kind === SyntaxKind.PrivateIdentifier
      ) {
        throw createError(
          node.left,
          "Private identifiers cannot appear on the right-hand-side of an 'in' expression.",
        );
      } else if (node.right.kind === SyntaxKind.PrivateIdentifier) {
        throw createError(
          node.right,
          "Private identifiers are only allowed on the left-hand-side of an 'in' expression.",
        );
      }
      break;

    case SyntaxKind.MappedType:
      if (node.members && node.members.length > 0) {
        throw createError(
          node.members[0],
          'A mapped type may not declare properties or methods.',
        );
      }
      break;

    case SyntaxKind.PropertySignature: {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const { initializer } = node;
      if (initializer) {
        throw createError(
          initializer,
          'A property signature cannot have an initializer.',
        );
      }
      break;
    }

    case SyntaxKind.FunctionType: {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const { modifiers } = node;
      if (modifiers) {
        throw createError(
          modifiers[0],
          'A function type cannot have modifiers.',
        );
      }
      break;
    }

    case SyntaxKind.EnumMember: {
      const computed = node.name.kind === ts.SyntaxKind.ComputedPropertyName;
      if (computed) {
        throw createError(
          node.name,
          'Computed property names are not allowed in enums.',
        );
      }

      if (
        node.name.kind === SyntaxKind.NumericLiteral ||
        node.name.kind === SyntaxKind.BigIntLiteral
      ) {
        throw createError(
          node.name,
          'An enum member cannot have a numeric name.',
        );
      }
      break;
    }

    case SyntaxKind.ExternalModuleReference:
      if (node.expression.kind !== SyntaxKind.StringLiteral) {
        throw createError(node.expression, 'String literal expected.');
      }
      break;

    case SyntaxKind.PrefixUnaryExpression:
    case SyntaxKind.PostfixUnaryExpression: {
      const operator = getTextForTokenKind(node.operator);
      /**
       * ESTree uses UpdateExpression for ++/--
       */
      if (
        (operator === '++' || operator === '--') &&
        !isValidAssignmentTarget(node.operand)
      ) {
        throw createError(
          node.operand,
          'Invalid left-hand side expression in unary operation',
        );
      }
      break;
    }

    case SyntaxKind.ImportDeclaration:
      assertModuleSpecifier(node, false);
      break;

    case SyntaxKind.ExportDeclaration:
      assertModuleSpecifier(
        node,
        node.exportClause?.kind === SyntaxKind.NamedExports,
      );
      break;

    case SyntaxKind.CallExpression:
      if (
        node.expression.kind === SyntaxKind.ImportKeyword &&
        node.arguments.length !== 1 &&
        node.arguments.length !== 2
      ) {
        throw createError(
          node.arguments.length > 1 ? node.arguments[2] : node,
          'Dynamic import requires exactly one or two arguments.',
        );
      }
      break;

    case SyntaxKind.ModuleDeclaration: {
      if (node.flags & ts.NodeFlags.GlobalAugmentation) {
        const { body } = node;
        if (body == null || body.kind === SyntaxKind.ModuleDeclaration) {
          throw createError(node.body ?? node, 'Expected a valid module body');
        }

        const { name } = node;
        if (name.kind !== ts.SyntaxKind.Identifier) {
          throw createError(
            name,
            'global module augmentation must have an Identifier id',
          );
        }

        return;
      }

      if (ts.isStringLiteral(node.name)) {
        return;
      }

      if (node.body == null) {
        throw createError(node, 'Expected a module body');
      }

      if (node.name.kind !== ts.SyntaxKind.Identifier) {
        throw createError(node.name, '`namespace`s must have an Identifier id');
      }

      break;
    }

    case SyntaxKind.ForInStatement:
    case SyntaxKind.ForOfStatement: {
      checkForStatementDeclaration(node);
      break;
    }

    // No default
  }
}

function checkForStatementDeclaration(
  node: ts.ForInStatement | ts.ForOfStatement,
): void {
  const { initializer, kind } = node;
  const loop = kind === SyntaxKind.ForInStatement ? 'for...in' : 'for...of';
  if (ts.isVariableDeclarationList(initializer)) {
    if (initializer.declarations.length !== 1) {
      throw createError(
        initializer,
        `Only a single variable declaration is allowed in a '${loop}' statement.`,
      );
    }
    const declaration = initializer.declarations[0];
    if (declaration.initializer) {
      throw createError(
        declaration,
        `The variable declaration of a '${loop}' statement cannot have an initializer.`,
      );
    } else if (declaration.type) {
      throw createError(
        declaration,
        `The variable declaration of a '${loop}' statement cannot have a type annotation.`,
      );
    }
    if (
      kind === SyntaxKind.ForInStatement &&
      initializer.flags & ts.NodeFlags.Using
    ) {
      throw createError(
        initializer,
        "The left-hand side of a 'for...in' statement cannot be a 'using' declaration.",
      );
    }
  } else if (
    !isValidAssignmentTarget(initializer) &&
    initializer.kind !== SyntaxKind.ObjectLiteralExpression &&
    initializer.kind !== SyntaxKind.ArrayLiteralExpression
  ) {
    throw createError(
      initializer,
      `The left-hand side of a '${loop}' statement must be a variable or a property access.`,
    );
  }
}

function assertModuleSpecifier(
  node: ts.ExportDeclaration | ts.ImportDeclaration,
  allowNull: boolean,
) {
  if (!allowNull && node.moduleSpecifier == null) {
    throw createError(node, 'Module specifier must be a string literal.');
  }

  if (
    node.moduleSpecifier &&
    node.moduleSpecifier.kind !== SyntaxKind.StringLiteral
  ) {
    throw createError(
      node.moduleSpecifier,
      'Module specifier must be a string literal.',
    );
  }
}
