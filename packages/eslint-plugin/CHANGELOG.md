# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.3.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.2.0...v2.3.0) (2019-09-16)


### Bug Fixes

* **typescript-estree:** ImportDeclaration.specifier to Literal ([#974](https://github.com/typescript-eslint/typescript-eslint/issues/974)) ([2bf8231](https://github.com/typescript-eslint/typescript-eslint/commit/2bf8231))


### Features

* **eslint-plugin:** [explicit-member-accessibility] add support of "ignoredMethodNames" ([#895](https://github.com/typescript-eslint/typescript-eslint/issues/895)) ([46ee4c9](https://github.com/typescript-eslint/typescript-eslint/commit/46ee4c9))
* **eslint-plugin:** [no-floating-promises] Add ignoreVoid option ([#796](https://github.com/typescript-eslint/typescript-eslint/issues/796)) ([6a55921](https://github.com/typescript-eslint/typescript-eslint/commit/6a55921))
* **eslint-plugin:** [no-magic-numbers] add ignoreReadonlyClassProperties option ([#938](https://github.com/typescript-eslint/typescript-eslint/issues/938)) ([aeea4cd](https://github.com/typescript-eslint/typescript-eslint/commit/aeea4cd))
* **eslint-plugin:** [strict-boolean-expressions] Add allowNullable option ([#794](https://github.com/typescript-eslint/typescript-eslint/issues/794)) ([c713ca4](https://github.com/typescript-eslint/typescript-eslint/commit/c713ca4))
* **eslint-plugin:** add no-unnecessary-condition rule ([#699](https://github.com/typescript-eslint/typescript-eslint/issues/699)) ([5715482](https://github.com/typescript-eslint/typescript-eslint/commit/5715482))





# [2.2.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.1.0...v2.2.0) (2019-09-09)


### Bug Fixes

* **eslint-plugin:** [efrt] allowExpressions - check functions in class field properties ([#952](https://github.com/typescript-eslint/typescript-eslint/issues/952)) ([f1059d8](https://github.com/typescript-eslint/typescript-eslint/commit/f1059d8))
* **eslint-plugin:** [expl-member-a11y] fix parameter properties ([#912](https://github.com/typescript-eslint/typescript-eslint/issues/912)) ([ccb98d8](https://github.com/typescript-eslint/typescript-eslint/commit/ccb98d8))
* **eslint-plugin:** [prefer-readonly] add handling for destructuring assignments ([e011e90](https://github.com/typescript-eslint/typescript-eslint/commit/e011e90))


### Features

* **eslint-plugin:** add brace-style [extension] ([#810](https://github.com/typescript-eslint/typescript-eslint/issues/810)) ([e01dc5f](https://github.com/typescript-eslint/typescript-eslint/commit/e01dc5f))





# [2.1.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.0.0...v2.1.0) (2019-09-02)


### Bug Fixes

* **eslint-plugin:** [member-naming] should match constructor args ([#771](https://github.com/typescript-eslint/typescript-eslint/issues/771)) ([b006667](https://github.com/typescript-eslint/typescript-eslint/commit/b006667))
* **eslint-plugin:** [no-inferrable-types] ignore optional props ([#918](https://github.com/typescript-eslint/typescript-eslint/issues/918)) ([a4e625f](https://github.com/typescript-eslint/typescript-eslint/commit/a4e625f))
* **eslint-plugin:** [promise-function-async] Allow async get/set ([#820](https://github.com/typescript-eslint/typescript-eslint/issues/820)) ([cddfdca](https://github.com/typescript-eslint/typescript-eslint/commit/cddfdca))
* **eslint-plugin:** [require-await] Allow concise arrow function bodies ([#826](https://github.com/typescript-eslint/typescript-eslint/issues/826)) ([29fddfd](https://github.com/typescript-eslint/typescript-eslint/commit/29fddfd))
* **eslint-plugin:** [typedef] don't flag destructuring when variables is disabled ([#819](https://github.com/typescript-eslint/typescript-eslint/issues/819)) ([5603473](https://github.com/typescript-eslint/typescript-eslint/commit/5603473))
* **eslint-plugin:** [typedef] handle AssignmentPattern inside TSParameterProperty ([#923](https://github.com/typescript-eslint/typescript-eslint/issues/923)) ([6bd7f2d](https://github.com/typescript-eslint/typescript-eslint/commit/6bd7f2d))
* **eslint-plugin:** [unbound-method] Allow typeof expressions (Fixes [#692](https://github.com/typescript-eslint/typescript-eslint/issues/692)) ([#904](https://github.com/typescript-eslint/typescript-eslint/issues/904)) ([344bafe](https://github.com/typescript-eslint/typescript-eslint/commit/344bafe))
* **eslint-plugin:** [unbound-method] false positive in equality comparisons ([#914](https://github.com/typescript-eslint/typescript-eslint/issues/914)) ([29a01b8](https://github.com/typescript-eslint/typescript-eslint/commit/29a01b8))
* **eslint-plugin:** [unified-signatures] type comparison and exported nodes ([#839](https://github.com/typescript-eslint/typescript-eslint/issues/839)) ([580eceb](https://github.com/typescript-eslint/typescript-eslint/commit/580eceb))
* **eslint-plugin:** readme typo ([#867](https://github.com/typescript-eslint/typescript-eslint/issues/867)) ([5eb40dc](https://github.com/typescript-eslint/typescript-eslint/commit/5eb40dc))
* **typescript-estree:** improve missing project file error msg ([#866](https://github.com/typescript-eslint/typescript-eslint/issues/866)) ([8f3b0a8](https://github.com/typescript-eslint/typescript-eslint/commit/8f3b0a8)), closes [#853](https://github.com/typescript-eslint/typescript-eslint/issues/853)


### Features

* [no-unnecessary-type-assertion] allow `as const` arrow functions ([#876](https://github.com/typescript-eslint/typescript-eslint/issues/876)) ([14c6f80](https://github.com/typescript-eslint/typescript-eslint/commit/14c6f80))
* **eslint-plugin:** [expl-func-ret-type] make error loc smaller ([#919](https://github.com/typescript-eslint/typescript-eslint/issues/919)) ([65eb993](https://github.com/typescript-eslint/typescript-eslint/commit/65eb993))
* **eslint-plugin:** [no-type-alias] support tuples ([#775](https://github.com/typescript-eslint/typescript-eslint/issues/775)) ([c68e033](https://github.com/typescript-eslint/typescript-eslint/commit/c68e033))
* **eslint-plugin:** add quotes [extension] ([#762](https://github.com/typescript-eslint/typescript-eslint/issues/762)) ([9f82099](https://github.com/typescript-eslint/typescript-eslint/commit/9f82099))





# [2.0.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.13.0...v2.0.0) (2019-08-13)


### Bug Fixes

* **eslint-plugin:** [efrt] flag default export w/allowExpressions ([#831](https://github.com/typescript-eslint/typescript-eslint/issues/831)) ([ebbcc01](https://github.com/typescript-eslint/typescript-eslint/commit/ebbcc01))
* **eslint-plugin:** [no-explicit-any] Fix ignoreRestArgs for interfaces ([#777](https://github.com/typescript-eslint/typescript-eslint/issues/777)) ([22e9ae5](https://github.com/typescript-eslint/typescript-eslint/commit/22e9ae5))
* **eslint-plugin:** [no-useless-constructor] handle bodyless constructor ([#685](https://github.com/typescript-eslint/typescript-eslint/issues/685)) ([55e788c](https://github.com/typescript-eslint/typescript-eslint/commit/55e788c))
* **eslint-plugin:** [prefer-readonly] TypeError when having comp… ([#761](https://github.com/typescript-eslint/typescript-eslint/issues/761)) ([211b1b5](https://github.com/typescript-eslint/typescript-eslint/commit/211b1b5))
* **eslint-plugin:** [typedef] support "for..in", "for..of" ([#787](https://github.com/typescript-eslint/typescript-eslint/issues/787)) ([39e41b5](https://github.com/typescript-eslint/typescript-eslint/commit/39e41b5))
* **eslint-plugin:** [typedef] support default value for parameter ([#785](https://github.com/typescript-eslint/typescript-eslint/issues/785)) ([84916e6](https://github.com/typescript-eslint/typescript-eslint/commit/84916e6))


* feat(eslint-plugin)!: recommended-requiring-type-checking config (#846) ([d3470c9](https://github.com/typescript-eslint/typescript-eslint/commit/d3470c9)), closes [#846](https://github.com/typescript-eslint/typescript-eslint/issues/846)
* feat(eslint-plugin)!: change recommended config (#729) ([428567d](https://github.com/typescript-eslint/typescript-eslint/commit/428567d)), closes [#729](https://github.com/typescript-eslint/typescript-eslint/issues/729)
* feat(typescript-estree)!: throw error on file not in project when `project` set (#760) ([3777b77](https://github.com/typescript-eslint/typescript-eslint/commit/3777b77)), closes [#760](https://github.com/typescript-eslint/typescript-eslint/issues/760)
* feat(eslint-plugin)!: add rule `consistent-type-assertions` (#731) ([92e98de](https://github.com/typescript-eslint/typescript-eslint/commit/92e98de)), closes [#731](https://github.com/typescript-eslint/typescript-eslint/issues/731)
* feat(eslint-plugin)!: [array-type] rework options (#654) ([1389393](https://github.com/typescript-eslint/typescript-eslint/commit/1389393)), closes [#654](https://github.com/typescript-eslint/typescript-eslint/issues/654) [#635](https://github.com/typescript-eslint/typescript-eslint/issues/635)


### Features

* explicitly support eslint v6 ([#645](https://github.com/typescript-eslint/typescript-eslint/issues/645)) ([34a7cf6](https://github.com/typescript-eslint/typescript-eslint/commit/34a7cf6))
* **eslint-plugin:** [interface-name-prefix, class-name-casing] Add allowUnderscorePrefix option to support private declarations ([#790](https://github.com/typescript-eslint/typescript-eslint/issues/790)) ([0c4f474](https://github.com/typescript-eslint/typescript-eslint/commit/0c4f474))
* **eslint-plugin:** [no-var-requires] report on foo(require('')) ([#725](https://github.com/typescript-eslint/typescript-eslint/issues/725)) ([b2ca20d](https://github.com/typescript-eslint/typescript-eslint/commit/b2ca20d)), closes [#665](https://github.com/typescript-eslint/typescript-eslint/issues/665)
* **eslint-plugin:** [promise-function-async] make allowAny default true ([#733](https://github.com/typescript-eslint/typescript-eslint/issues/733)) ([590ca50](https://github.com/typescript-eslint/typescript-eslint/commit/590ca50))
* **eslint-plugin:** [strict-boolean-expressions] add ignoreRhs option ([#691](https://github.com/typescript-eslint/typescript-eslint/issues/691)) ([fd6be42](https://github.com/typescript-eslint/typescript-eslint/commit/fd6be42))
* **eslint-plugin:** add support for object props in CallExpressions ([#728](https://github.com/typescript-eslint/typescript-eslint/issues/728)) ([8141f01](https://github.com/typescript-eslint/typescript-eslint/commit/8141f01))
* **eslint-plugin:** added new rule typedef ([#581](https://github.com/typescript-eslint/typescript-eslint/issues/581)) ([35cc99b](https://github.com/typescript-eslint/typescript-eslint/commit/35cc99b))
* **eslint-plugin:** added new rule use-default-type-parameter ([#562](https://github.com/typescript-eslint/typescript-eslint/issues/562)) ([2b942ba](https://github.com/typescript-eslint/typescript-eslint/commit/2b942ba))
* **eslint-plugin:** move opinionated rules between configs ([#595](https://github.com/typescript-eslint/typescript-eslint/issues/595)) ([4893aec](https://github.com/typescript-eslint/typescript-eslint/commit/4893aec))
* **eslint-plugin:** remove deprecated rules ([#739](https://github.com/typescript-eslint/typescript-eslint/issues/739)) ([e32c7ad](https://github.com/typescript-eslint/typescript-eslint/commit/e32c7ad))


### BREAKING CHANGES

* removed some rules from recommended config
* recommended config changes are considered breaking
* by default we will now throw when a file is not in the `project` provided
* Merges both no-angle-bracket-type-assertion and no-object-literal-type-assertion into one rule
* **eslint-plugin:** both 'eslint-recommended' and 'recommended' have changed.
* **eslint-plugin:** removing rules
* changes config structure

```ts
type ArrayOption = 'array' | 'generic' | 'array-simple';
type Options = [
  {
    // default case for all arrays
    default: ArrayOption,
    // optional override for readonly arrays
    readonly?: ArrayOption,
  },
];
```
* **eslint-plugin:** changing default rule config
* Node 6 is no longer supported





# [1.13.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.12.0...v1.13.0) (2019-07-21)


### Bug Fixes

* Correct `@types/json-schema` dependency ([#675](https://github.com/typescript-eslint/typescript-eslint/issues/675)) ([a5398ce](https://github.com/typescript-eslint/typescript-eslint/commit/a5398ce))
* **eslint-plugin:** remove imports from typescript-estree ([#706](https://github.com/typescript-eslint/typescript-eslint/issues/706)) ([ceb2d32](https://github.com/typescript-eslint/typescript-eslint/commit/ceb2d32)), closes [#705](https://github.com/typescript-eslint/typescript-eslint/issues/705)
* **eslint-plugin:** undo breaking changes to recommended config ([93f72e3](https://github.com/typescript-eslint/typescript-eslint/commit/93f72e3))


### Features

* **eslint-plugin:** add new rule no-misused-promises ([#612](https://github.com/typescript-eslint/typescript-eslint/issues/612)) ([28a131d](https://github.com/typescript-eslint/typescript-eslint/commit/28a131d))
* **eslint-plugin:** add new rule require-await ([#674](https://github.com/typescript-eslint/typescript-eslint/issues/674)) ([807bc2d](https://github.com/typescript-eslint/typescript-eslint/commit/807bc2d))





# [1.12.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.11.0...v1.12.0) (2019-07-12)


### Bug Fixes

* **eslint-plugin:** handle `const;` ([#633](https://github.com/typescript-eslint/typescript-eslint/issues/633)) ([430d628](https://github.com/typescript-eslint/typescript-eslint/commit/430d628)), closes [#441](https://github.com/typescript-eslint/typescript-eslint/issues/441)


### Features

* **eslint-plugin:** [ban-types] Support namespaced type ([#616](https://github.com/typescript-eslint/typescript-eslint/issues/616)) ([e325b72](https://github.com/typescript-eslint/typescript-eslint/commit/e325b72))
* **eslint-plugin:** [explicit-function-return-type] add handling for usage as arguments ([#680](https://github.com/typescript-eslint/typescript-eslint/issues/680)) ([e0aeb18](https://github.com/typescript-eslint/typescript-eslint/commit/e0aeb18))
* **eslint-plugin:** [no-explicit-any] Add an optional fixer ([#609](https://github.com/typescript-eslint/typescript-eslint/issues/609)) ([606fc70](https://github.com/typescript-eslint/typescript-eslint/commit/606fc70))
* **eslint-plugin:** Add rule no-reference-import ([#625](https://github.com/typescript-eslint/typescript-eslint/issues/625)) ([af70a59](https://github.com/typescript-eslint/typescript-eslint/commit/af70a59))
* **eslint-plugin:** add rule strict-boolean-expressions ([#579](https://github.com/typescript-eslint/typescript-eslint/issues/579)) ([34e7d1e](https://github.com/typescript-eslint/typescript-eslint/commit/34e7d1e))
* **eslint-plugin:** added new rule prefer-readonly ([#555](https://github.com/typescript-eslint/typescript-eslint/issues/555)) ([76b89a5](https://github.com/typescript-eslint/typescript-eslint/commit/76b89a5))





# [1.11.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.10.2...v1.11.0) (2019-06-23)


### Bug Fixes

* **eslint-plugin:** [no-magic-numbers] add support for enums ([#543](https://github.com/typescript-eslint/typescript-eslint/issues/543)) ([5c40d01](https://github.com/typescript-eslint/typescript-eslint/commit/5c40d01))
* **eslint-plugin:** [promise-function-async] allow any as return value ([#553](https://github.com/typescript-eslint/typescript-eslint/issues/553)) ([9a387b0](https://github.com/typescript-eslint/typescript-eslint/commit/9a387b0))


### Features

* **eslint-plugin:** [no-explicit-any] ignoreRestArgs ([#548](https://github.com/typescript-eslint/typescript-eslint/issues/548)) ([753ad75](https://github.com/typescript-eslint/typescript-eslint/commit/753ad75))
* **eslint-plugin:** add `consistent-type-definitions` rule ([#463](https://github.com/typescript-eslint/typescript-eslint/issues/463)) ([ec87d06](https://github.com/typescript-eslint/typescript-eslint/commit/ec87d06))
* **eslint-plugin:** add new rule no-empty-function ([#626](https://github.com/typescript-eslint/typescript-eslint/issues/626)) ([747bfcb](https://github.com/typescript-eslint/typescript-eslint/commit/747bfcb))
* **eslint-plugin:** add new rule no-floating-promises ([#495](https://github.com/typescript-eslint/typescript-eslint/issues/495)) ([61e6385](https://github.com/typescript-eslint/typescript-eslint/commit/61e6385))





## [1.10.2](https://github.com/typescript-eslint/typescript-eslint/compare/v1.10.1...v1.10.2) (2019-06-10)

### Bug Fixes

- **eslint-plugin:** peerDep should specify semver major range ([#602](https://github.com/typescript-eslint/typescript-eslint/issues/602)) ([5589938](https://github.com/typescript-eslint/typescript-eslint/commit/5589938))

## [1.10.1](https://github.com/typescript-eslint/typescript-eslint/compare/v1.10.0...v1.10.1) (2019-06-09)

**Note:** Version bump only for package @typescript-eslint/eslint-plugin

# [1.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.9.0...v1.10.0) (2019-06-09)

### Bug Fixes

- **eslint-plugin:** [explicit-function-return-type] Fix obj setter prop ([8c8497c](https://github.com/typescript-eslint/typescript-eslint/commit/8c8497c)), closes [#525](https://github.com/typescript-eslint/typescript-eslint/issues/525)
- **eslint-plugin:** [no-extra-parens] Fix crash default switch case crash ([5ec2b32](https://github.com/typescript-eslint/typescript-eslint/commit/5ec2b32)), closes [#509](https://github.com/typescript-eslint/typescript-eslint/issues/509)
- **eslint-plugin:** [no-type-alias] Fix parenthesized type handling ([#576](https://github.com/typescript-eslint/typescript-eslint/issues/576)) ([6489293](https://github.com/typescript-eslint/typescript-eslint/commit/6489293))
- **eslint-plugin:** [NUTA] false positive for null assign to undefined ([#536](https://github.com/typescript-eslint/typescript-eslint/issues/536)) ([b16409a](https://github.com/typescript-eslint/typescript-eslint/commit/b16409a)), closes [#529](https://github.com/typescript-eslint/typescript-eslint/issues/529)
- **eslint-plugin:** Remove `no-dupe-class-members` from eslint-recommended ([#520](https://github.com/typescript-eslint/typescript-eslint/issues/520)) ([1a0e60b](https://github.com/typescript-eslint/typescript-eslint/commit/1a0e60b))

### Features

- make utils/TSESLint export typed classes instead of just types ([#526](https://github.com/typescript-eslint/typescript-eslint/issues/526)) ([370ac72](https://github.com/typescript-eslint/typescript-eslint/commit/370ac72))
- support TypeScript versions >=3.2.1 <3.6.0 ([#597](https://github.com/typescript-eslint/typescript-eslint/issues/597)) ([5d2b962](https://github.com/typescript-eslint/typescript-eslint/commit/5d2b962))
- **eslint-plugin:** [explicit-function-return-type] allowHigherOrderFunctions ([#193](https://github.com/typescript-eslint/typescript-eslint/issues/193)) ([#538](https://github.com/typescript-eslint/typescript-eslint/issues/538)) ([50a493e](https://github.com/typescript-eslint/typescript-eslint/commit/50a493e))
- **eslint-plugin:** add config all.json ([#313](https://github.com/typescript-eslint/typescript-eslint/issues/313)) ([67537b8](https://github.com/typescript-eslint/typescript-eslint/commit/67537b8))

# [1.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.8.0...v1.9.0) (2019-05-12)

### Bug Fixes

- **eslint-plugin:** Add missing dependency ([89c87cc](https://github.com/typescript-eslint/typescript-eslint/commit/89c87cc)), closes [#516](https://github.com/typescript-eslint/typescript-eslint/issues/516)
- **eslint-plugin:** Fix exported name of eslint-recommended ([#513](https://github.com/typescript-eslint/typescript-eslint/issues/513)) ([5c65350](https://github.com/typescript-eslint/typescript-eslint/commit/5c65350))

### Features

- **eslint-plugin:** add prefer-regexp-exec rule ([#305](https://github.com/typescript-eslint/typescript-eslint/issues/305)) ([f61d421](https://github.com/typescript-eslint/typescript-eslint/commit/f61d421))

# [1.8.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.7.0...v1.8.0) (2019-05-10)

### Bug Fixes

- **eslint-plugin:** [array-type] support readonly operator ([#429](https://github.com/typescript-eslint/typescript-eslint/issues/429)) ([8e2d2f5](https://github.com/typescript-eslint/typescript-eslint/commit/8e2d2f5))
- **eslint-plugin:** [explicit-function-return-type] Add handling for class properties ([#502](https://github.com/typescript-eslint/typescript-eslint/issues/502)) ([2c36325](https://github.com/typescript-eslint/typescript-eslint/commit/2c36325))
- **eslint-plugin:** [no-extra-parens] Fix build error ([298d66c](https://github.com/typescript-eslint/typescript-eslint/commit/298d66c))
- **eslint-plugin:** [unbound-method] Work around class prototype bug ([#499](https://github.com/typescript-eslint/typescript-eslint/issues/499)) ([3219aa7](https://github.com/typescript-eslint/typescript-eslint/commit/3219aa7))
- **eslint-plugin:** correct eslint-recommended settings ([d52a683](https://github.com/typescript-eslint/typescript-eslint/commit/d52a683))
- **eslint-plugin:** explicit-func-return-type: support object types and as expressions ([#459](https://github.com/typescript-eslint/typescript-eslint/issues/459)) ([d19e512](https://github.com/typescript-eslint/typescript-eslint/commit/d19e512))
- **eslint-plugin:** restrict-plus-operands: generic constraint support ([#440](https://github.com/typescript-eslint/typescript-eslint/issues/440)) ([3f305b1](https://github.com/typescript-eslint/typescript-eslint/commit/3f305b1))
- **eslint-plugin:** Support more nodes [no-extra-parens](<[#465](https://github.com/typescript-eslint/typescript-eslint/issues/465)>) ([2d15644](https://github.com/typescript-eslint/typescript-eslint/commit/2d15644))
- **eslint-plugin:** support switch statement [unbound-method](<[#485](https://github.com/typescript-eslint/typescript-eslint/issues/485)>) ([e99ca81](https://github.com/typescript-eslint/typescript-eslint/commit/e99ca81))

### Features

- **eslint-plugin:** (EXPERIMENTAL) begin indent rewrite ([#439](https://github.com/typescript-eslint/typescript-eslint/issues/439)) ([6eb97d4](https://github.com/typescript-eslint/typescript-eslint/commit/6eb97d4))
- **eslint-plugin:** Add better non-null handling [no-unnecessary-type-assertion](<[#478](https://github.com/typescript-eslint/typescript-eslint/issues/478)>) ([4cd5590](https://github.com/typescript-eslint/typescript-eslint/commit/4cd5590))
- **eslint-plugin:** Add func-call-spacing ([#448](https://github.com/typescript-eslint/typescript-eslint/issues/448)) ([92e65ec](https://github.com/typescript-eslint/typescript-eslint/commit/92e65ec))
- **eslint-plugin:** Add new config "eslint-recommended" ([#488](https://github.com/typescript-eslint/typescript-eslint/issues/488)) ([2600a9f](https://github.com/typescript-eslint/typescript-eslint/commit/2600a9f))
- **eslint-plugin:** add no-magic-numbers rule ([#373](https://github.com/typescript-eslint/typescript-eslint/issues/373)) ([43fa09c](https://github.com/typescript-eslint/typescript-eslint/commit/43fa09c))
- **eslint-plugin:** Add semi [extension](<[#461](https://github.com/typescript-eslint/typescript-eslint/issues/461)>) ([0962017](https://github.com/typescript-eslint/typescript-eslint/commit/0962017))
- **eslint-plugin:** no-inferrable-types: Support more primitives ([#442](https://github.com/typescript-eslint/typescript-eslint/issues/442)) ([4e193ca](https://github.com/typescript-eslint/typescript-eslint/commit/4e193ca))
- Move shared types into their own package ([#425](https://github.com/typescript-eslint/typescript-eslint/issues/425)) ([a7a03ce](https://github.com/typescript-eslint/typescript-eslint/commit/a7a03ce))

# [1.7.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.6.0...v1.7.0) (2019-04-20)

### Bug Fixes

- **eslint-plugin:** indent: fix false positive on type parameters ([#385](https://github.com/typescript-eslint/typescript-eslint/issues/385)) ([d476f15](https://github.com/typescript-eslint/typescript-eslint/commit/d476f15))
- **eslint-plugin:** no-object-literal-type-assertion: fix `as const` is reported ([#390](https://github.com/typescript-eslint/typescript-eslint/issues/390)) ([2521b85](https://github.com/typescript-eslint/typescript-eslint/commit/2521b85))
- **eslint-plugin:** support BigInt in restrict-plus-operands rule ([#344](https://github.com/typescript-eslint/typescript-eslint/issues/344)) ([eee6d49](https://github.com/typescript-eslint/typescript-eslint/commit/eee6d49)), closes [#309](https://github.com/typescript-eslint/typescript-eslint/issues/309)

### Features

- **eslint-plugin:** [member-accessibility] add more options ([#322](https://github.com/typescript-eslint/typescript-eslint/issues/322)) ([4b3d820](https://github.com/typescript-eslint/typescript-eslint/commit/4b3d820))
- **eslint-plugin:** add prefer-for-of rule ([#338](https://github.com/typescript-eslint/typescript-eslint/issues/338)) ([3e26ab6](https://github.com/typescript-eslint/typescript-eslint/commit/3e26ab6))
- **eslint-plugin:** add prefer-includes rule ([#294](https://github.com/typescript-eslint/typescript-eslint/issues/294)) ([01c4dae](https://github.com/typescript-eslint/typescript-eslint/commit/01c4dae)), closes [#284](https://github.com/typescript-eslint/typescript-eslint/issues/284)
- **eslint-plugin:** add prefer-string-starts-ends-with rule ([#289](https://github.com/typescript-eslint/typescript-eslint/issues/289)) ([5592a2c](https://github.com/typescript-eslint/typescript-eslint/commit/5592a2c)), closes [#285](https://github.com/typescript-eslint/typescript-eslint/issues/285)
- **eslint-plugin:** added new rule await-promise ([#192](https://github.com/typescript-eslint/typescript-eslint/issues/192)) ([5311342](https://github.com/typescript-eslint/typescript-eslint/commit/5311342))
- **eslint-plugin:** added new rule unbound-method ([#204](https://github.com/typescript-eslint/typescript-eslint/issues/204)) ([6718906](https://github.com/typescript-eslint/typescript-eslint/commit/6718906))
- **eslint-plugin:** support type assertions in no-extra-parens rule ([#311](https://github.com/typescript-eslint/typescript-eslint/issues/311)) ([116ca75](https://github.com/typescript-eslint/typescript-eslint/commit/116ca75))

# [1.6.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.5.0...v1.6.0) (2019-04-03)

### Bug Fixes

- **eslint-plugin:** explicit-function-return-type: ensure class arrow methods are validated ([#377](https://github.com/typescript-eslint/typescript-eslint/issues/377)) ([643a223](https://github.com/typescript-eslint/typescript-eslint/commit/643a223)), closes [#348](https://github.com/typescript-eslint/typescript-eslint/issues/348)
- **eslint-plugin:** Fix `allowExpressions` false positives in explicit-function-return-type and incorrect documentation ([#388](https://github.com/typescript-eslint/typescript-eslint/issues/388)) ([f29d1c9](https://github.com/typescript-eslint/typescript-eslint/commit/f29d1c9)), closes [#387](https://github.com/typescript-eslint/typescript-eslint/issues/387)
- **eslint-plugin:** member-naming false flagging constructors ([#376](https://github.com/typescript-eslint/typescript-eslint/issues/376)) ([ad0f2be](https://github.com/typescript-eslint/typescript-eslint/commit/ad0f2be)), closes [#359](https://github.com/typescript-eslint/typescript-eslint/issues/359)
- **eslint-plugin:** no-type-alias: fix typeof alias erroring ([#380](https://github.com/typescript-eslint/typescript-eslint/issues/380)) ([cebcfe6](https://github.com/typescript-eslint/typescript-eslint/commit/cebcfe6))

### Features

- change TypeScript version range to >=3.2.1 <3.5.0 ([#399](https://github.com/typescript-eslint/typescript-eslint/issues/399)) ([a4f95d3](https://github.com/typescript-eslint/typescript-eslint/commit/a4f95d3))
- **eslint-plugin:** allow explicit variable type with arrow functions ([#260](https://github.com/typescript-eslint/typescript-eslint/issues/260)) ([bea6b92](https://github.com/typescript-eslint/typescript-eslint/commit/bea6b92)), closes [#149](https://github.com/typescript-eslint/typescript-eslint/issues/149)

# [1.5.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.4.2...v1.5.0) (2019-03-20)

### Bug Fixes

- **eslint-plugin:** [interface-name-prefix] correct error message in always mode ([#333](https://github.com/typescript-eslint/typescript-eslint/issues/333)) ([097262f](https://github.com/typescript-eslint/typescript-eslint/commit/097262f))
- **eslint-plugin:** fix false positives for adjacent-overload-signatures regarding computed property names ([#340](https://github.com/typescript-eslint/typescript-eslint/issues/340)) ([f6e5118](https://github.com/typescript-eslint/typescript-eslint/commit/f6e5118))
- **eslint-plugin:** fix incorrect rule name ([#357](https://github.com/typescript-eslint/typescript-eslint/issues/357)) ([0a5146b](https://github.com/typescript-eslint/typescript-eslint/commit/0a5146b))

### Features

- **eslint-plugin:** Add unified-signature rule ([#178](https://github.com/typescript-eslint/typescript-eslint/issues/178)) ([6ffaa0b](https://github.com/typescript-eslint/typescript-eslint/commit/6ffaa0b))

## [1.4.2](https://github.com/typescript-eslint/typescript-eslint/compare/v1.4.1...v1.4.2) (2019-02-25)

**Note:** Version bump only for package @typescript-eslint/eslint-plugin

## [1.4.1](https://github.com/typescript-eslint/typescript-eslint/compare/v1.4.0...v1.4.1) (2019-02-23)

### Bug Fixes

- **eslint-plugin:** out-of-bounds access in member-ordering rule ([#304](https://github.com/typescript-eslint/typescript-eslint/issues/304)) ([4526f27](https://github.com/typescript-eslint/typescript-eslint/commit/4526f27))
- **eslint-plugin:** support BigInt in restrict-plus-operands rule ([#309](https://github.com/typescript-eslint/typescript-eslint/issues/309)) ([#310](https://github.com/typescript-eslint/typescript-eslint/issues/310)) ([9a88363](https://github.com/typescript-eslint/typescript-eslint/commit/9a88363))

# [1.4.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.3.0...v1.4.0) (2019-02-19)

### Bug Fixes

- **parser:** fix crash when visiting decorators in parameters ([#237](https://github.com/typescript-eslint/typescript-eslint/issues/237)) ([225fc26](https://github.com/typescript-eslint/typescript-eslint/commit/225fc26))
- **parser:** fix visiting props of TSDeclareFunction ([#244](https://github.com/typescript-eslint/typescript-eslint/issues/244)) ([b40def8](https://github.com/typescript-eslint/typescript-eslint/commit/b40def8))
- **ts-estree:** make sure that every node can be converted to tsNode ([#287](https://github.com/typescript-eslint/typescript-eslint/issues/287)) ([9f1d314](https://github.com/typescript-eslint/typescript-eslint/commit/9f1d314))
- **typescript-estree, eslint-plugin:** stop adding ParenthesizedExpressions to node maps ([#226](https://github.com/typescript-eslint/typescript-eslint/issues/226)) ([317405a](https://github.com/typescript-eslint/typescript-eslint/commit/317405a))

### Features

- **eslint-plugin:** add 'no-unnecessary-qualifier' rule ([#231](https://github.com/typescript-eslint/typescript-eslint/issues/231)) ([cc8f906](https://github.com/typescript-eslint/typescript-eslint/commit/cc8f906))
- **eslint-plugin:** add ban-ts-ignore rule ([#276](https://github.com/typescript-eslint/typescript-eslint/issues/276)) ([859ab29](https://github.com/typescript-eslint/typescript-eslint/commit/859ab29))
- **eslint-plugin:** add prefer-function-type rule ([#222](https://github.com/typescript-eslint/typescript-eslint/issues/222)) ([b95c4cf](https://github.com/typescript-eslint/typescript-eslint/commit/b95c4cf))
- **eslint-plugin:** add require-array-sort-compare rule ([#261](https://github.com/typescript-eslint/typescript-eslint/issues/261)) ([2a4aaaa](https://github.com/typescript-eslint/typescript-eslint/commit/2a4aaaa)), closes [#247](https://github.com/typescript-eslint/typescript-eslint/issues/247)
- **eslint-plugin:** Migrate plugin to ts ([#120](https://github.com/typescript-eslint/typescript-eslint/issues/120)) ([61c60dc](https://github.com/typescript-eslint/typescript-eslint/commit/61c60dc))
- **eslint-plugin:** update types to allow parameter type inferrence ([#272](https://github.com/typescript-eslint/typescript-eslint/issues/272)) ([80bd72c](https://github.com/typescript-eslint/typescript-eslint/commit/80bd72c))
- **no-empty-interface:** add allowSingleExtend option ([#215](https://github.com/typescript-eslint/typescript-eslint/issues/215)) ([bf46f8c](https://github.com/typescript-eslint/typescript-eslint/commit/bf46f8c))

# [1.3.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.2.0...v1.3.0) (2019-02-07)

### Bug Fixes

- **eslint-plugin:** fix false positive from adjacent-overload-signatures ([#206](https://github.com/typescript-eslint/typescript-eslint/issues/206)) ([07e950e](https://github.com/typescript-eslint/typescript-eslint/commit/07e950e))

### Features

- change TypeScript version range to >=3.2.1 <3.4.0 ([#184](https://github.com/typescript-eslint/typescript-eslint/issues/184)) ([f513a14](https://github.com/typescript-eslint/typescript-eslint/commit/f513a14))
- **eslint-plugin:** add new rule no-for-in-array ([#155](https://github.com/typescript-eslint/typescript-eslint/issues/155)) ([84162ba](https://github.com/typescript-eslint/typescript-eslint/commit/84162ba))
- **eslint-plugin:** add new rule no-require-imports ([#199](https://github.com/typescript-eslint/typescript-eslint/issues/199)) ([683e5bc](https://github.com/typescript-eslint/typescript-eslint/commit/683e5bc))
- **eslint-plugin:** added new rule promise-function-async ([#194](https://github.com/typescript-eslint/typescript-eslint/issues/194)) ([5f3aec9](https://github.com/typescript-eslint/typescript-eslint/commit/5f3aec9))

# [1.2.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.1.1...v1.2.0) (2019-02-01)

### Bug Fixes

- **eslint-plugin:** fix no-extraneous-class for class without name ([#174](https://github.com/typescript-eslint/typescript-eslint/issues/174)) ([b1dbb64](https://github.com/typescript-eslint/typescript-eslint/commit/b1dbb64))
- **eslint-plugin:** fix wrong URL ([#180](https://github.com/typescript-eslint/typescript-eslint/issues/180)) ([00d020d](https://github.com/typescript-eslint/typescript-eslint/commit/00d020d))
- **eslint-plugin:** use bracket for infer type in array-type rule ([#173](https://github.com/typescript-eslint/typescript-eslint/issues/173)) ([1f868ce](https://github.com/typescript-eslint/typescript-eslint/commit/1f868ce))
- **parser:** fix regression with no-unused-vars for jsx attributes ([#161](https://github.com/typescript-eslint/typescript-eslint/issues/161)) ([6147de1](https://github.com/typescript-eslint/typescript-eslint/commit/6147de1))

### Features

- **eslint-plugin:** add eslint rule no-useless-constructor ([#167](https://github.com/typescript-eslint/typescript-eslint/issues/167)) ([3fb57a5](https://github.com/typescript-eslint/typescript-eslint/commit/3fb57a5))
- **eslint-plugin:** add no-unnecessary-type-assertion rule ([#157](https://github.com/typescript-eslint/typescript-eslint/issues/157)) ([38abc28](https://github.com/typescript-eslint/typescript-eslint/commit/38abc28))

## [1.1.1](https://github.com/typescript-eslint/typescript-eslint/compare/v1.1.0...v1.1.1) (2019-01-29)

### Bug Fixes

- **eslint-plugin:** make parser services error clearer ([#132](https://github.com/typescript-eslint/typescript-eslint/issues/132)) ([aa9d1e1](https://github.com/typescript-eslint/typescript-eslint/commit/aa9d1e1))
- **parser:** add visiting of type parameters in JSXOpeningElement ([#150](https://github.com/typescript-eslint/typescript-eslint/issues/150)) ([5e16003](https://github.com/typescript-eslint/typescript-eslint/commit/5e16003))

# [1.1.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.0.0...v1.1.0) (2019-01-23)

### Bug Fixes

- **eslint-plugin:** don’t mark `declare class` as unused ([#110](https://github.com/typescript-eslint/typescript-eslint/issues/110)) ([5841cd2](https://github.com/typescript-eslint/typescript-eslint/commit/5841cd2)), closes [#106](https://github.com/typescript-eslint/typescript-eslint/issues/106)
- **eslint-plugin:** improve detection of used vars in heritage ([#102](https://github.com/typescript-eslint/typescript-eslint/issues/102)) ([193b434](https://github.com/typescript-eslint/typescript-eslint/commit/193b434))

### Features

- **eslint-plugin:** add new rule restrict-plus-operands ([#70](https://github.com/typescript-eslint/typescript-eslint/issues/70)) ([c541ede](https://github.com/typescript-eslint/typescript-eslint/commit/c541ede))
- **eslint-plugin:** add option to no-object-literal-type-assertion rule ([#87](https://github.com/typescript-eslint/typescript-eslint/issues/87)) ([9f501a1](https://github.com/typescript-eslint/typescript-eslint/commit/9f501a1))

# [1.0.0](https://github.com/typescript-eslint/typescript-eslint/compare/v0.2.1...v1.0.0) (2019-01-20)

### Bug Fixes

- **eslint-plugin:** fix crash in rule indent for eslint 5.12.1 ([#89](https://github.com/typescript-eslint/typescript-eslint/issues/89)) ([3f51d51](https://github.com/typescript-eslint/typescript-eslint/commit/3f51d51))
- **eslint-plugin:** no-unused-vars: mark declared statements as used ([#88](https://github.com/typescript-eslint/typescript-eslint/issues/88)) ([2df5e0c](https://github.com/typescript-eslint/typescript-eslint/commit/2df5e0c))
- **eslint-plugin:** update remaining parser refs ([#97](https://github.com/typescript-eslint/typescript-eslint/issues/97)) ([055c3fc](https://github.com/typescript-eslint/typescript-eslint/commit/055c3fc))

### Features

- **eslint-plugin:** remove exported parser ([#94](https://github.com/typescript-eslint/typescript-eslint/issues/94)) ([0ddb93c](https://github.com/typescript-eslint/typescript-eslint/commit/0ddb93c))

## [0.2.1](https://github.com/typescript-eslint/typescript-eslint/compare/v0.2.0...v0.2.1) (2019-01-20)

**Note:** Version bump only for package @typescript-eslint/eslint-plugin
