import * as ts from 'typescript';

import { typescriptVersionIsAtLeast } from './version-check';

const isAtLeast48 = typescriptVersionIsAtLeast['4.8'];

export function getModifiers(
  node: ts.Node | null | undefined,
  includeIllegalModifiers = false,
): ts.Modifier[] | undefined {
  if (node == null) {
    return undefined;
  }

  if (isAtLeast48) {
    // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
    if (includeIllegalModifiers || ts.canHaveModifiers(node)) {
      // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
      const modifiers = ts.getModifiers(node as ts.HasModifiers);
      return modifiers ? Array.from(modifiers) : undefined;
    }

    return undefined;
  }

  return (
    // @ts-expect-error intentional fallback for older TS versions
    (node.modifiers as ts.Modifier[])?.filter(
      (m): m is ts.Modifier => !ts.isDecorator(m),
    )
  );
}

export function getDecorators(
  node: ts.Node | null | undefined,
  includeIllegalDecorators = false,
): ts.Decorator[] | undefined {
  if (node == null) {
    return undefined;
  }

  if (isAtLeast48) {
    // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
    if (includeIllegalDecorators || ts.canHaveDecorators(node)) {
      // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
      const decorators = ts.getDecorators(node as ts.HasDecorators);
      return decorators ? Array.from(decorators) : undefined;
    }

    return undefined;
  }

  return (
    // @ts-expect-error intentional fallback for older TS versions
    (node.decorators as ts.Node[])?.filter(ts.isDecorator)
  );
}
