export function connect(retries = 3): number {
  return retries;
}

export function withOptions({ retries = 3 }: { retries?: number }): number {
  return retries;
}

export function Button({ disabled = false }: { disabled?: boolean }): null {
  return null;
}

export let mutable = (value = 3): number => value;
mutable = (value = 4): number => value;

export function reassigned(value = 3): number {
  return value;
}
reassigned = (value = 4): number => value;

export function choose(value: 3): 3;
export function choose(): 4;
export function choose(value = 4): number {
  return value;
}

export function byArray(value = 3): number {
  return value;
}
[byArray] = [(value = 4): number => value];
export function byProperty(value = 3): number {
  return value;
}
({ changed: byProperty } = { changed: (value = 4): number => value });
export function byShorthand(value = 3): number {
  return value;
}
({ byShorthand } = { byShorthand: (value = 4): number => value });
export function byDefault(value = 3): number {
  return value;
}
({ changed: byDefault = (value = 4): number => value } = {});
export const union = Math.random() ? connect : byArray;

export function withUnrelatedAssignments(value = 3): number {
  let values: number[];
  let count: number;
  let remaining: { other?: number };
  [...values] = [1, 2];
  ({ count, ...remaining } = { count: 1, other: 2 });
  [count = 0] = [];
  for (const item of values) {
    count = item;
  }
  for (const key in remaining) {
    count += key.length;
  }
  const box = { count };
  box.count = count;
  return value;
}
