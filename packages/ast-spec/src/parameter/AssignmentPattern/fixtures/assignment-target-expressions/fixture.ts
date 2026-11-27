declare let value: { count: number };
declare let values: number[];
declare let count: number;

[value.count = 1] = values;
({ count: count! = 2 } = { count: 3 });
