# Benchmark TSLint - ESLint

## Single File: restrict-plus-operands

```
tslint x 2.58 ops/sec ±7.49% (11 runs sampled)
eslint x 2.60 ops/sec ±4.57% (11 runs sampled)
Fastest is eslint, tslint
```

## Multi File: restrict-plus-operands

```
tslint x 2.70 ops/sec ±2.67% (11 runs sampled)
eslint x 0.81 ops/sec ±5.28% (7 runs sampled)
Fastest is tslint
```

## Single File: no-empty-interface

```
tslint x 1,624 ops/sec ±0.97% (88 runs sampled)
eslint x 2,134 ops/sec ±3.56% (80 runs sampled)
Fastest is eslint
```

## Multi File: no-empty-interface

```
tslint x 1,241 ops/sec ±1.17% (89 runs sampled)
eslint x 823 ops/sec ±2.81% (83 runs sampled)
Fastest is tslint
```
