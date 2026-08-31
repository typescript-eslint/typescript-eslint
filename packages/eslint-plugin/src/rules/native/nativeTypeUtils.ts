import type { NativeParserServices, TSESTree } from '@typescript-eslint/utils';
import type {
  Type as NativeType,
  TypeFlags,
} from '@typescript/native/unstable/sync';

export const isTypeFlagSet = (type: NativeType, flags: TypeFlags): boolean =>
  (type.flags & flags) !== 0;

export const unionConstituents = (type: NativeType): readonly NativeType[] =>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The native API declares this as optional.
  type.isUnionType() ? (type.getTypes() ?? [type]) : [type];

export const getConstrainedTypeAtLocation = (
  services: NativeParserServices,
  node: TSESTree.Node,
): NativeType => {
  const type = services.getTypeAtLocation(node);
  return services.native.checker.getBaseConstraintOfType(type) ?? type;
};
