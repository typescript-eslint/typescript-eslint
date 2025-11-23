import * as ts from 'typescript';

import type { TSNode } from './ts-estree';

import { getDecorators, getModifiers } from './getModifiers';
import {
  getDeclarationKind,
  hasModifier,
  isThisIdentifier,
  createError,
} from './node-utils';

const SyntaxKind = ts.SyntaxKind;

// `ts.nodeIsMissing`
function nodeIsMissing(node: ts.Node | undefined): boolean {
  if (node == null) {
    return true;
  }
  return (
    node.pos === node.end &&
    node.pos >= 0 &&
    node.kind !== SyntaxKind.EndOfFileToken
  );
}

// `ts.nodeIsPresent`
function nodeIsPresent(node: ts.Node | undefined): node is ts.Node {
  return !nodeIsMissing(node);
}

// `ts.hasAbstractModifier`
function hasAbstractModifier(node: ts.Node): boolean {
  return hasModifier(SyntaxKind.AbstractKeyword, node);
}

// `ts.getThisParameter`
function getThisParameter(
  signature: ts.SignatureDeclaration,
): ts.ParameterDeclaration | null {
  if (signature.parameters.length && !ts.isJSDocSignature(signature)) {
    const thisParameter = signature.parameters[0];
    if (parameterIsThisKeyword(thisParameter)) {
      return thisParameter;
    }
  }

  return null;
}

// `ts.parameterIsThisKeyword`
function parameterIsThisKeyword(parameter: ts.ParameterDeclaration): boolean {
  return isThisIdentifier(parameter.name);
}

// `ts.getContainingFunction`
function getContainingFunction(
  node: ts.Node,
): ts.SignatureDeclaration | undefined {
  return ts.findAncestor(node.parent, ts.isFunctionLike);
}

// Rewrite version of `ts.nodeCanBeDecorated`
// Returns `true` for both `useLegacyDecorators: true` and `useLegacyDecorators: false`
function nodeCanBeDecorated(node: TSNode): boolean {
  switch (node.kind) {
    case SyntaxKind.ClassDeclaration:
      return true;
    case SyntaxKind.ClassExpression:
      // `ts.nodeCanBeDecorated` returns `false` if `useLegacyDecorators: true`
      return true;
    case SyntaxKind.PropertyDeclaration: {
      const { parent } = node;

      // `ts.nodeCanBeDecorated` uses this if `useLegacyDecorators: true`
      if (ts.isClassDeclaration(parent)) {
        return true;
      }

      // `ts.nodeCanBeDecorated` uses this if `useLegacyDecorators: false`
      if (ts.isClassLike(parent) && !hasAbstractModifier(node)) {
        return true;
      }

      return false;
    }
    case SyntaxKind.GetAccessor:
    case SyntaxKind.SetAccessor:
    case SyntaxKind.MethodDeclaration: {
      const { parent } = node;
      // In `ts.nodeCanBeDecorated`
      // when `useLegacyDecorators: true` uses `ts.isClassDeclaration`
      // when `useLegacyDecorators: true` uses `ts.isClassLike`
      return (
        Boolean(node.body) &&
        (ts.isClassDeclaration(parent) || ts.isClassLike(parent))
      );
    }
    case SyntaxKind.Parameter: {
      // `ts.nodeCanBeDecorated` returns `false` if `useLegacyDecorators: false`

      const { parent } = node;
      const grandparent = parent.parent;

      return (
        Boolean(parent) &&
        'body' in parent &&
        Boolean(parent.body) &&
        (parent.kind === SyntaxKind.Constructor ||
          parent.kind === SyntaxKind.MethodDeclaration ||
          parent.kind === SyntaxKind.SetAccessor) &&
        getThisParameter(parent) !== node &&
        Boolean(grandparent) &&
        grandparent.kind === SyntaxKind.ClassDeclaration
      );
    }
  }

  return false;
}

function nodeHasIllegalDecorators(
  node: ts.Node,
): node is { illegalDecorators: ts.Node[] } & ts.Node {
  return !!(
    'illegalDecorators' in node &&
    (node.illegalDecorators as unknown[] | undefined)?.length
  );
}

export function checkModifiers(node: ts.Node): void {
  // typescript<5.0.0
  if (nodeHasIllegalDecorators(node)) {
    throw createError(
      node.illegalDecorators[0],
      'Decorators are not valid here.',
    );
  }

  for (const decorator of getDecorators(
    node,
    /* includeIllegalDecorators */ true,
  ) ?? []) {
    // `checkGrammarModifiers` function in typescript
    if (!nodeCanBeDecorated(node as TSNode)) {
      if (ts.isMethodDeclaration(node) && !nodeIsPresent(node.body)) {
        throw createError(
          decorator,
          'A decorator can only decorate a method implementation, not an overload.',
        );
      } else {
        throw createError(decorator, 'Decorators are not valid here.');
      }
    }
  }

  for (const modifier of getModifiers(
    node,
    /* includeIllegalModifiers */ true,
  ) ?? []) {
    if (modifier.kind !== SyntaxKind.ReadonlyKeyword) {
      if (
        node.kind === SyntaxKind.PropertySignature ||
        node.kind === SyntaxKind.MethodSignature
      ) {
        throw createError(
          modifier,
          `'${ts.tokenToString(
            modifier.kind,
          )}' modifier cannot appear on a type member`,
        );
      }

      if (
        node.kind === SyntaxKind.IndexSignature &&
        (modifier.kind !== SyntaxKind.StaticKeyword ||
          !ts.isClassLike(node.parent))
      ) {
        throw createError(
          modifier,
          `'${ts.tokenToString(
            modifier.kind,
          )}' modifier cannot appear on an index signature`,
        );
      }
    }

    if (
      modifier.kind !== SyntaxKind.InKeyword &&
      modifier.kind !== SyntaxKind.OutKeyword &&
      modifier.kind !== SyntaxKind.ConstKeyword &&
      node.kind === SyntaxKind.TypeParameter
    ) {
      throw createError(
        modifier,
        `'${ts.tokenToString(
          modifier.kind,
        )}' modifier cannot appear on a type parameter`,
      );
    }

    if (
      (modifier.kind === SyntaxKind.InKeyword ||
        modifier.kind === SyntaxKind.OutKeyword) &&
      (node.kind !== SyntaxKind.TypeParameter ||
        !(
          ts.isInterfaceDeclaration(node.parent) ||
          ts.isClassLike(node.parent) ||
          ts.isTypeAliasDeclaration(node.parent)
        ))
    ) {
      throw createError(
        modifier,
        `'${ts.tokenToString(
          modifier.kind,
        )}' modifier can only appear on a type parameter of a class, interface or type alias`,
      );
    }

    if (
      modifier.kind === SyntaxKind.ReadonlyKeyword &&
      node.kind !== SyntaxKind.PropertyDeclaration &&
      node.kind !== SyntaxKind.PropertySignature &&
      node.kind !== SyntaxKind.IndexSignature &&
      node.kind !== SyntaxKind.Parameter
    ) {
      throw createError(
        modifier,
        "'readonly' modifier can only appear on a property declaration or index signature.",
      );
    }

    if (
      modifier.kind === SyntaxKind.DeclareKeyword &&
      ts.isClassLike(node.parent) &&
      !ts.isPropertyDeclaration(node)
    ) {
      throw createError(
        modifier,
        `'${ts.tokenToString(
          modifier.kind,
        )}' modifier cannot appear on class elements of this kind.`,
      );
    }

    if (
      modifier.kind === SyntaxKind.DeclareKeyword &&
      ts.isVariableStatement(node)
    ) {
      const declarationKind = getDeclarationKind(node.declarationList);
      if (declarationKind === 'using' || declarationKind === 'await using') {
        throw createError(
          modifier,
          `'declare' modifier cannot appear on a '${declarationKind}' declaration.`,
        );
      }
    }

    if (
      modifier.kind === SyntaxKind.AbstractKeyword &&
      node.kind !== SyntaxKind.ClassDeclaration &&
      node.kind !== SyntaxKind.ConstructorType &&
      node.kind !== SyntaxKind.MethodDeclaration &&
      node.kind !== SyntaxKind.PropertyDeclaration &&
      node.kind !== SyntaxKind.GetAccessor &&
      node.kind !== SyntaxKind.SetAccessor
    ) {
      throw createError(
        modifier,
        `'${ts.tokenToString(
          modifier.kind,
        )}' modifier can only appear on a class, method, or property declaration.`,
      );
    }

    if (
      (modifier.kind === SyntaxKind.StaticKeyword ||
        modifier.kind === SyntaxKind.PublicKeyword ||
        modifier.kind === SyntaxKind.ProtectedKeyword ||
        modifier.kind === SyntaxKind.PrivateKeyword) &&
      (node.parent.kind === SyntaxKind.ModuleBlock ||
        node.parent.kind === SyntaxKind.SourceFile)
    ) {
      throw createError(
        modifier,
        `'${ts.tokenToString(
          modifier.kind,
        )}' modifier cannot appear on a module or namespace element.`,
      );
    }

    if (
      modifier.kind === SyntaxKind.AccessorKeyword &&
      node.kind !== SyntaxKind.PropertyDeclaration
    ) {
      throw createError(
        modifier,
        "'accessor' modifier can only appear on a property declaration.",
      );
    }

    // `checkGrammarAsyncModifier` function in `typescript`
    if (
      modifier.kind === SyntaxKind.AsyncKeyword &&
      node.kind !== SyntaxKind.MethodDeclaration &&
      node.kind !== SyntaxKind.FunctionDeclaration &&
      node.kind !== SyntaxKind.FunctionExpression &&
      node.kind !== SyntaxKind.ArrowFunction
    ) {
      throw createError(modifier, "'async' modifier cannot be used here.");
    }

    // `checkGrammarModifiers` function in `typescript`
    if (
      node.kind === SyntaxKind.Parameter &&
      (modifier.kind === SyntaxKind.StaticKeyword ||
        modifier.kind === SyntaxKind.ExportKeyword ||
        modifier.kind === SyntaxKind.DeclareKeyword ||
        modifier.kind === SyntaxKind.AsyncKeyword)
    ) {
      throw createError(
        modifier,
        `'${ts.tokenToString(
          modifier.kind,
        )}' modifier cannot appear on a parameter.`,
      );
    }

    // `checkGrammarModifiers` function in `typescript`
    if (
      modifier.kind === SyntaxKind.PublicKeyword ||
      modifier.kind === SyntaxKind.ProtectedKeyword ||
      modifier.kind === SyntaxKind.PrivateKeyword
    ) {
      for (const anotherModifier of getModifiers(node) ?? []) {
        if (
          anotherModifier !== modifier &&
          (anotherModifier.kind === SyntaxKind.PublicKeyword ||
            anotherModifier.kind === SyntaxKind.ProtectedKeyword ||
            anotherModifier.kind === SyntaxKind.PrivateKeyword)
        ) {
          throw createError(
            anotherModifier,
            `Accessibility modifier already seen.`,
          );
        }
      }
    }

    // `checkParameter` function in `typescript`
    if (
      node.kind === SyntaxKind.Parameter &&
      // In `typescript` package, it's `ts.hasSyntacticModifier(node, ts.ModifierFlags.ParameterPropertyModifier)`
      // https://github.com/typescript-eslint/typescript-eslint/pull/6615#discussion_r1136489935
      (modifier.kind === SyntaxKind.PublicKeyword ||
        modifier.kind === SyntaxKind.PrivateKeyword ||
        modifier.kind === SyntaxKind.ProtectedKeyword ||
        modifier.kind === SyntaxKind.ReadonlyKeyword ||
        modifier.kind === SyntaxKind.OverrideKeyword)
    ) {
      const func = getContainingFunction(node);

      if (
        !(func?.kind === SyntaxKind.Constructor && nodeIsPresent(func.body))
      ) {
        throw createError(
          modifier,
          'A parameter property is only allowed in a constructor implementation.',
        );
      }
    }

    // There are more cases in `checkGrammarObjectLiteralExpression` in TypeScript.
    // We may add more validations for them here in the future.
    if (
      modifier.kind !== SyntaxKind.AsyncKeyword &&
      node.kind === SyntaxKind.MethodDeclaration &&
      node.parent.kind === SyntaxKind.ObjectLiteralExpression
    ) {
      throw createError(
        modifier,
        `'${ts.tokenToString(modifier.kind)}' modifier cannot be used here.`,
      );
    }
  }
}
