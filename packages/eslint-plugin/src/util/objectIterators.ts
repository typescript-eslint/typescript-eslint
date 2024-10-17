function objectForEachKey<T extends Record<string, unknown>>(
  obj: T,
  callback: (key: keyof T) => void,
): void {
  const keys = Object.keys(obj);
  for (const key of keys) {
    callback(key);
  }
}

function objectMapKey<T extends Record<string, unknown>, Return>(
  obj: T,
  callback: (key: keyof T) => Return,
): Return[] {
  const values: Return[] = [];
  objectForEachKey(obj, key => {
    values.push(callback(key));
  });
  return values;
}

function objectReduceKey<T extends Record<string, unknown>, Accumulator>(
  obj: T,
  callback: (acc: Accumulator, key: keyof T) => Accumulator,
  initial: Accumulator,
): Accumulator {
  let accumulator = initial;
  objectForEachKey(obj, key => {
    accumulator = callback(accumulator, key);
  });
  return accumulator;
}

export { objectForEachKey, objectMapKey, objectReduceKey };
