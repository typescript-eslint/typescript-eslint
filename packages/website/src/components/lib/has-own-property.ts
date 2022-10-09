export function hasOwnProperty<Container extends object, Key extends PropertyKey>(
  property: Y,
  object: X,
): object is X & Record<Y, unknown> {
  return property in object;
}
