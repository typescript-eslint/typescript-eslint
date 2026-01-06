import * as ts from 'typescript';

import type { TSNode } from './ts-estree';

import { checkModifiers } from './check-modifiers';
import {
  isValidAssignmentTarget,
  createError,
  hasModifier,
  getDeclarationKind,
  getTextForTokenKind,
  isEntityNameExpression,
  declarationNameToString,
} from './node-utils';

const SyntaxKind = ts.SyntaxKind;

export function checkSyntaxError(
  tsNode: ts.Node,
  parent: TSNode,
  allowPattern: boolean,
): void {
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

        if (kind === 'using' || kind === 'await using') {
          if (
            variableDeclarationList.parent.kind === SyntaxKind.ForInStatement
          ) {
            throw createError(
              variableDeclarationList,
              `The left-hand side of a 'for...in' statement cannot be a '${kind}' declaration.`,
            );
          }

          if (
            variableDeclarationList.parent.kind === SyntaxKind.ForStatement ||
            variableDeclarationList.parent.kind === SyntaxKind.VariableStatement
          ) {
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
        }

        if (
          variableDeclarationList.parent.kind === SyntaxKind.VariableStatement
        ) {
          const variableStatement = variableDeclarationList.parent;
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

    case SyntaxKind.ImportDeclaration: {
      const { importClause } = node;
      if (
        // TODO swap to `phaseModifier` once we add support for `import defer`
        // https://github.com/estree/estree/issues/328
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        importClause?.isTypeOnly &&
        importClause.name &&
        importClause.namedBindings
      ) {
        throw createError(
          importClause,
          'A type-only import can specify a default import or named bindings, but not both.',
        );
      }

      assertModuleSpecifier(node, false);

      break;
    }

    case SyntaxKind.ExportDeclaration:
      assertModuleSpecifier(
        node,
        node.exportClause?.kind === SyntaxKind.NamedExports,
      );
      break;

    case SyntaxKind.ExportSpecifier: {
      const local = node.propertyName ?? node.name;
      if (
        local.kind === SyntaxKind.StringLiteral &&
        parent.kind === SyntaxKind.ExportDeclaration &&
        parent.moduleSpecifier?.kind !== SyntaxKind.StringLiteral
      ) {
        throw createError(
          local,
          'A string literal cannot be used as a local exported binding without `from`.',
        );
      }
      break;
    }

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
    // intentional fallthrough
    case SyntaxKind.ClassExpression: {
      const heritageClauses = node.heritageClauses ?? [];
      let seenExtendsClause = false;
      let seenImplementsClause = false;
      for (const heritageClause of heritageClauses) {
        const { token, types } = heritageClause;

        if (types.length === 0) {
          throw createError(
            heritageClause,
            `'${ts.tokenToString(token)}' list cannot be empty.`,
          );
        }

        if (token === SyntaxKind.ExtendsKeyword) {
          if (seenExtendsClause) {
            throw createError(heritageClause, "'extends' clause already seen.");
          }

          if (seenImplementsClause) {
            throw createError(
              heritageClause,
              "'extends' clause must precede 'implements' clause.",
            );
          }

          if (types.length > 1) {
            throw createError(
              types[1],
              'Classes can only extend a single class.',
            );
          }

          seenExtendsClause = true;
        } else {
          // `implements`
          if (seenImplementsClause) {
            throw createError(
              heritageClause,
              "'implements' clause already seen.",
            );
          }

          seenImplementsClause = true;
        }
      }
      break;
    }

    case SyntaxKind.InterfaceDeclaration: {
      const interfaceHeritageClauses = node.heritageClauses ?? [];
      let seenExtendsClause = false;
      for (const heritageClause of interfaceHeritageClauses) {
        if (heritageClause.token !== SyntaxKind.ExtendsKeyword) {
          throw createError(
            heritageClause,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            heritageClause.token === SyntaxKind.ImplementsKeyword
              ? "Interface declaration cannot have 'implements' clause."
              : 'Unexpected token.',
          );
        }
        if (seenExtendsClause) {
          throw createError(heritageClause, "'extends' clause already seen.");
        }
        seenExtendsClause = true;

        for (const heritageType of heritageClause.types) {
          if (
            !isEntityNameExpression(heritageType.expression) ||
            ts.isOptionalChain(heritageType.expression)
          ) {
            throw createError(
              heritageType,
              'Interface declaration can only extend an identifier/qualified name with optional type arguments.',
            );
          }
        }
      }
      break;
    }

    case SyntaxKind.GetAccessor:
    case SyntaxKind.SetAccessor:
      if (
        node.parent.kind === SyntaxKind.InterfaceDeclaration ||
        node.parent.kind === SyntaxKind.TypeLiteral
      ) {
        return;
      }
    // otherwise, it is a non-type accessor - intentional fallthrough
    case SyntaxKind.MethodDeclaration: {
      const isAbstract = hasModifier(SyntaxKind.AbstractKeyword, node);
      if (isAbstract && node.body) {
        throw createError(
          node.name,
          node.kind === SyntaxKind.GetAccessor ||
            node.kind === SyntaxKind.SetAccessor
            ? 'An abstract accessor cannot have an implementation.'
            : `Method '${declarationNameToString(node.name)}' cannot have an implementation because it is marked abstract.`,
        );
      }
      break;
    }

    case SyntaxKind.ObjectLiteralExpression: {
      if (!allowPattern) {
        for (const property of node.properties) {
          if (
            (property.kind === SyntaxKind.GetAccessor ||
              property.kind === SyntaxKind.SetAccessor ||
              property.kind === SyntaxKind.MethodDeclaration) &&
            !property.body
          ) {
            throw createError(
              property.end - 1,
              "'{' expected.",
              node.getSourceFile(),
            );
          }
        }
      }
      break;
    }

    case SyntaxKind.ImportEqualsDeclaration:
      if (
        node.isTypeOnly &&
        node.moduleReference.kind !== SyntaxKind.ExternalModuleReference
      ) {
        throw createError(node, "An import alias cannot use 'import type'");
      }
      break;

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
