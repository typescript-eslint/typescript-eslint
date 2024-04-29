/**
 * Check if a value is a primitive or plain object created by the Object constructor.
 */
function isSerializablePrimitiveOrPlainObject(val: unknown): boolean {
  return (
    // eslint-disable-next-line eqeqeq
    val === null ||
    typeof val === 'string' ||
    typeof val === 'boolean' ||
    typeof val === 'number' ||
    (typeof val === 'object' && val.constructor === Object) ||
    Array.isArray(val)
  );
}

/**
 * Check if a value is serializable.
 * Functions or objects like RegExp cannot be serialized by JSON.stringify().
 * Inspired by: https://stackoverflow.com/questions/30579940/reliable-way-to-check-if-objects-is-serializable-in-javascript
 */
export function isSerializable(val: unknown): boolean {
  if (!isSerializablePrimitiveOrPlainObject(val)) {
    return false;
  }
  if (typeof val === 'object') {
    const valAsObj = val as Record<string, unknown>;
    for (const property in valAsObj) {
      // TODO: use `Object.hasOwn` (used in eslint@9) once we upgrade to eslint@9
      if (Object.prototype.hasOwnProperty.call(valAsObj, property)) {
        if (!isSerializablePrimitiveOrPlainObject(valAsObj[property])) {
          return false;
        }
        if (typeof valAsObj[property] === 'object') {
          if (!isSerializable(valAsObj[property])) {
            return false;
          }
        }
      }
    }
  }
  return true;
}
