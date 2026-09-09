export function select(value = 0) {
  return value;
}

export const arrow = (value = 0) => value;

// prettier-ignore
export const parenthesizedArrow = (((value = 0) => value));

// prettier-ignore
export const parenthesizedExpression = (function (value = 0) { return value; });

export const expression = function (value = 0) {
  return value;
};

export function options({ value = 0 }: { value?: number }) {
  return value;
}

export let mutable = (value = 0) => value;
mutable = (value = 1) => value;

export const conditional = Math.random() ? select : mutable;

export default function defaultFunction(value = 0) {
  return value;
}
