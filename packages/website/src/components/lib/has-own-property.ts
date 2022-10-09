export function hasOwnProperty<X extends object, Y extends PropertyKey>(
  property: Y,
  object: X,
): object is X & Record<Y, unknown> {
  return property in object;
}
