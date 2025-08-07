import type { DeprecatedInfo } from '@typescript-eslint/utils/ts-eslint';

export function isRuleFrozen(
  deprecated: boolean | DeprecatedInfo | undefined,
): boolean {
  return (
    typeof deprecated === 'object' &&
    // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish, eqeqeq
    deprecated.availableUntil === null
  );
}
