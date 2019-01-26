# Benchmark TSLint - ESLint

## Single File: restrict-plus-operands

```
tslint x 2.72 ops/sec ±9.39% (12 runs sampled)
eslint x 2.48 ops/sec ±2.95% (11 runs sampled)
Fastest is tslint
```

## Multi File: restrict-plus-operands

```
tslint x 2.78 ops/sec ±3.98% (12 runs sampled)
eslint x 0.91 ops/sec ±6.49% (7 runs sampled)
Fastest is tslint
```

## Single File: no-empty-interface

```
tslint x 1,757 ops/sec ±0.91% (91 runs sampled)
eslint x 2,295 ops/sec ±3.73% (76 runs sampled)
Fastest is eslint
```

## Multi File: no-empty-interface

```
tslint x 1,359 ops/sec ±0.79% (91 runs sampled)
eslint x 885 ops/sec ±2.86% (83 runs sampled)
Fastest is tslint
```
