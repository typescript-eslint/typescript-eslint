import * as ts from 'typescript';

import { typescriptVersionIsAtLeast } from './version-check';

const isAtLeast48 = typescriptVersionIsAtLeast['4.8'];

export function getModifiers(
  node: ts.Node | null | undefined,
): undefined | ts.Modifier[] {
  if (node == null) {
    return undefined;
  }

  if (isAtLeast48) {
    // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
    if (ts.canHaveModifiers(node)) {
      // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
      const modifiers = ts.getModifiers(node);
      return modifiers ? Array.from(modifiers) : undefined;
    }

    return undefined;
  }

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore intentional fallback for older TS versions
    (node.modifiers as ts.Modifier[])?.filter(
      (m): m is ts.Modifier => !ts.isDecorator(m),
    )
  );
}

export function getDecorators(
  node: ts.Node | null | undefined,
): undefined | ts.Decorator[] {
  if (node == null) {
    return undefined;
  }

  if (isAtLeast48) {
    // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
    if (ts.canHaveDecorators(node)) {
      // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
      const decorators = ts.getDecorators(node);
      return decorators ? Array.from(decorators) : undefined;
    }

    return undefined;
  }

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore intentional fallback for older TS versions
    (node.decorators as ts.Node[])?.filter(ts.isDecorator)
  );
}
