function objectForEachKey<T extends Record<string, unknown>>(
  obj: T,
  callback: (key: keyof T) => void,
): void {
  const keys = Object.keys(obj);
  for (const key of keys) {
    callback(key);
  }
}

function objectMapKey<T extends Record<string, unknown>, TReturn>(
  obj: T,
  callback: (key: keyof T) => TReturn,
): TReturn[] {
  const values: TReturn[] = [];
  objectForEachKey(obj, key => {
    values.push(callback(key));
  });
  return values;
}

function objectReduceKey<T extends Record<string, unknown>, TAccumulator>(
  obj: T,
  callback: (acc: TAccumulator, key: keyof T) => TAccumulator,
  initial: TAccumulator,
): TAccumulator {
  let accumulator = initial;
  objectForEachKey(obj, key => {
    accumulator = callback(accumulator, key);
  });
  return accumulator;
}

export { objectForEachKey, objectMapKey, objectReduceKey };
