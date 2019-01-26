# Benchmark TSLint - ESLint

## Single File: restrict-plus-operands

```
tslint x 2.67 ops/sec ±7.60% (11 runs sampled)
eslint x 2.70 ops/sec ±6.17% (11 runs sampled)
Fastest is eslint, tslint
```

## Multi File: restrict-plus-operands

```
tslint x 2.87 ops/sec ±3.78% (12 runs sampled)
eslint x 0.94 ops/sec ±6.10% (7 runs sampled)
Fastest is tslint
```

## Single File: no-empty-interface

```
tslint x 1,408 ops/sec ±0.62% (91 runs sampled)
eslint x 2,660 ops/sec ±3.96% (79 runs sampled)
Fastest is eslint
```

## Multi File: no-empty-interface

```
tslint x 1,100 ops/sec ±1.08% (91 runs sampled)
eslint x 1,073 ops/sec ±3.46% (85 runs sampled)
Fastest is tslint
```
