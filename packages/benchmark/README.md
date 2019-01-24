# Benchmark TSLint - ESLint

## Single File: restrict-plus-operands

```
tslint x 2.46 ops/sec ±8.81% (11 runs sampled)
eslint x 2.44 ops/sec ±8.02% (11 runs sampled)
Fastest is tslint, eslint
```

## Multi File: restrict-plus-operands

```
tslint x 2.60 ops/sec ±7.01% (11 runs sampled)
eslint x 0.82 ops/sec ±6.36% (7 runs sampled)
Fastest is tslint
```

## Single File: no-empty-interface

```
tslint x 1,679 ops/sec ±0.68% (90 runs sampled)
eslint x 389 ops/sec ±1.23% (89 runs sampled)
Fastest is tslint
```

## Multi File: no-empty-interface

```
tslint x 1,286 ops/sec ±1.01% (90 runs sampled)
eslint x 216 ops/sec ±1.10% (84 runs sampled)
Fastest is tslint
```
