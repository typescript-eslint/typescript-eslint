declare const identity: <Value extends object>(value: Value) => Value;

export const instantiated = identity<{ x: 1 }>;
