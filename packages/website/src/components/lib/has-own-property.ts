export function hasOwnProperty<
  Container extends object,
  Key extends PropertyKey,
>(
  property: Key,
  object: Container,
): object is Container & Record<Key, unknown> {
  return property in object;
}
