import * as ts from 'typescript';
import { typescriptVersionIsAtLeast } from './version-check';

const isAtLeast48 = typescriptVersionIsAtLeast['4.8'];

export function getModifiers(
  node: ts.Node | null | undefined,
): undefined | readonly ts.Modifier[] {
  if (node == null) {
    return undefined;
  }

  if (isAtLeast48) {
    // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
    if (ts.canHaveModifiers(node)) {
      // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
      return ts.getModifiers(node);
    }

    return undefined;
  }

  return (
    // eslint-disable-next-line deprecation/deprecation -- intentional fallback for older TS versions
    node.modifiers?.filter((m): m is ts.Modifier => !ts.isDecorator(m))
  );
}

export function getDecorators(
  node: ts.Node | null | undefined,
): undefined | readonly ts.Decorator[] {
  if (node == undefined) {
    return undefined;
  }

  if (isAtLeast48) {
    // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
    if (ts.canHaveDecorators(node)) {
      // eslint-disable-next-line deprecation/deprecation -- this is safe as it's guarded
      return ts.getDecorators(node);
    }

    return undefined;
  }

  return (
    // eslint-disable-next-line deprecation/deprecation -- intentional fallback for older TS versions
    node.modifiers?.filter(ts.isDecorator)
  );
}
