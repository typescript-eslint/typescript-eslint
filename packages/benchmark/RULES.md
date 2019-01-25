# Benchmark TSLint - ESLint

## Single File: restrict-plus-operands

```
tslint x 2.42 ops/sec ±8.40% (11 runs sampled)
eslint x 2.47 ops/sec ±6.46% (11 runs sampled)
Fastest is eslint, tslint
```

## Multi File: restrict-plus-operands

```
tslint x 2.54 ops/sec ±7.02% (11 runs sampled)
eslint x 0.80 ops/sec ±3.96% (7 runs sampled)
Fastest is tslint
```

## Single File: no-empty-interface

```
tslint x 1,647 ops/sec ±1.04% (91 runs sampled)
eslint x 385 ops/sec ±1.13% (88 runs sampled)
Fastest is tslint
```

## Multi File: no-empty-interface

```
tslint x 1,269 ops/sec ±0.91% (90 runs sampled)
eslint x 212 ops/sec ±1.13% (83 runs sampled)
Fastest is tslint
```
