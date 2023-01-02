# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.48.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.47.1...v5.48.0) (2023-01-02)

### Bug Fixes

- **website:** fix typo ([#6285](https://github.com/typescript-eslint/typescript-eslint/issues/6285)) ([3f8d105](https://github.com/typescript-eslint/typescript-eslint/commit/3f8d105e9ee500428774b498083c4bc02bfd81b8))

### Features

- **eslint-plugin:** specify which method is unbound and added test case ([#6281](https://github.com/typescript-eslint/typescript-eslint/issues/6281)) ([cf3ffdd](https://github.com/typescript-eslint/typescript-eslint/commit/cf3ffdd49aceb734ce18dc44ed6a11f7701f178e))

## [5.47.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.47.0...v5.47.1) (2022-12-26)

### Bug Fixes

- **ast-spec:** correct some incorrect ast types ([#6257](https://github.com/typescript-eslint/typescript-eslint/issues/6257)) ([0f3f645](https://github.com/typescript-eslint/typescript-eslint/commit/0f3f64571ea5d938081b1a9f3fd1495765201700))
- **eslint-plugin:** [member-ordering] correctly invert optionalityOrder ([#6256](https://github.com/typescript-eslint/typescript-eslint/issues/6256)) ([ccd45d4](https://github.com/typescript-eslint/typescript-eslint/commit/ccd45d4a998946b7be1161f8c8216bc458e50b4e))

# [5.47.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.46.1...v5.47.0) (2022-12-19)

### Features

- **eslint-plugin:** [no-floating-promises] add suggestion fixer to add an 'await' ([#5943](https://github.com/typescript-eslint/typescript-eslint/issues/5943)) ([9e35ef9](https://github.com/typescript-eslint/typescript-eslint/commit/9e35ef9af3ec51ab2dd49336699f3a94528bb4b1))

## [5.46.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.46.0...v5.46.1) (2022-12-12)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

# [5.46.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.45.1...v5.46.0) (2022-12-08)

### Bug Fixes

- **eslint-plugin:** [ban-types] update message to suggest `object` instead of `Record<string, unknown>` ([#6079](https://github.com/typescript-eslint/typescript-eslint/issues/6079)) ([d91a5fc](https://github.com/typescript-eslint/typescript-eslint/commit/d91a5fc41be5bc2a0625574e9c9496f61fb7471d))

### Features

- **eslint-plugin:** [prefer-nullish-coalescing] logic and test for strict null checks ([#6174](https://github.com/typescript-eslint/typescript-eslint/issues/6174)) ([8a91cbd](https://github.com/typescript-eslint/typescript-eslint/commit/8a91cbd9fbe5bc4cf750cd949d2b8d48ff4c311d))

## [5.45.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.45.0...v5.45.1) (2022-12-05)

### Bug Fixes

- **eslint-plugin:** [keyword-spacing] unexpected space before/after in `import type` ([#6095](https://github.com/typescript-eslint/typescript-eslint/issues/6095)) ([98caa92](https://github.com/typescript-eslint/typescript-eslint/commit/98caa92ca89bdf0ca6ba6e4ff1f13c60221579e8))
- **eslint-plugin:** [no-shadow] add call and method signatures to `ignoreFunctionTypeParameterNameValueShadow` ([#6129](https://github.com/typescript-eslint/typescript-eslint/issues/6129)) ([9d58b6b](https://github.com/typescript-eslint/typescript-eslint/commit/9d58b6be246507d20af67c84a5e9bb592d97cff5))
- **eslint-plugin:** [prefer-optional-chain] collect MetaProperty type ([#6083](https://github.com/typescript-eslint/typescript-eslint/issues/6083)) ([d7114d3](https://github.com/typescript-eslint/typescript-eslint/commit/d7114d3ab09d1b93627d3b3dbb9862e37ee29c97))
- **eslint-plugin:** [sort-type-constituents, sort-type-union-intersection-members] handle some required parentheses cases in the fixer ([#6118](https://github.com/typescript-eslint/typescript-eslint/issues/6118)) ([5d49d5d](https://github.com/typescript-eslint/typescript-eslint/commit/5d49d5dbee4425fc8bc01c5e748d161f3619477b))
- **parser:** remove the jsx option requirement for automatic jsx pragma resolution ([#6134](https://github.com/typescript-eslint/typescript-eslint/issues/6134)) ([e777f5e](https://github.com/typescript-eslint/typescript-eslint/commit/e777f5e225b9ddfb6bb1eaa74cbc5171a17ac017))

# [5.45.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.44.0...v5.45.0) (2022-11-28)

### Bug Fixes

- **eslint-plugin:** [array-type] --fix flag removes parentheses from type ([#5997](https://github.com/typescript-eslint/typescript-eslint/issues/5997)) ([42b33af](https://github.com/typescript-eslint/typescript-eslint/commit/42b33af256e5269feb214c7bb161079f770964fa))
- **eslint-plugin:** [keyword-spacing] prevent crash on no options ([#6073](https://github.com/typescript-eslint/typescript-eslint/issues/6073)) ([1f19998](https://github.com/typescript-eslint/typescript-eslint/commit/1f19998e3ec6d592fc679a7490708e2e96816f4c))
- **eslint-plugin:** [member-ordering] support private fields ([#5859](https://github.com/typescript-eslint/typescript-eslint/issues/5859)) ([f02761a](https://github.com/typescript-eslint/typescript-eslint/commit/f02761af19848a84b8d1832bd00fd6c95d38fa0c))
- **eslint-plugin:** [prefer-readonly] report if a member's property is reassigned ([#6043](https://github.com/typescript-eslint/typescript-eslint/issues/6043)) ([6e079eb](https://github.com/typescript-eslint/typescript-eslint/commit/6e079eb35cfec79ba9965627477117f026d161ac))
- **scope-manager:** add support for TS4.9 satisfies expression ([#6059](https://github.com/typescript-eslint/typescript-eslint/issues/6059)) ([44027db](https://github.com/typescript-eslint/typescript-eslint/commit/44027db379e6e074a16cda2755ef554c2b0a4c5a))
- **typescript-estree:** stub out `ts.SatisfiesExpression` on old TS versions ([#6076](https://github.com/typescript-eslint/typescript-eslint/issues/6076)) ([1302b30](https://github.com/typescript-eslint/typescript-eslint/commit/1302b30ecad9eb55aa9f1daa5068d9fb72c3688e))

### Features

- **eslint-plugin:** [member-ordering] add a required option for required vs. optional member ordering ([#5965](https://github.com/typescript-eslint/typescript-eslint/issues/5965)) ([2abadc6](https://github.com/typescript-eslint/typescript-eslint/commit/2abadc6c26cd6300764157d405a2462b754d050b))
- support Auto Accessor syntax ([#5926](https://github.com/typescript-eslint/typescript-eslint/issues/5926)) ([becd1f8](https://github.com/typescript-eslint/typescript-eslint/commit/becd1f8581c0013399dfe71be6c265e96cedb57a))

# [5.44.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.43.0...v5.44.0) (2022-11-21)

### Bug Fixes

- **eslint-plugin:** [no-empty-interface] disable autofix for declaration merging with class ([#5920](https://github.com/typescript-eslint/typescript-eslint/issues/5920)) ([a4f85b8](https://github.com/typescript-eslint/typescript-eslint/commit/a4f85b8cfe38ba8ea2a2ac4a56d9b11a81a8a15a))
- **eslint-plugin:** [no-unnecessary-condition] handle index signature type ([#5912](https://github.com/typescript-eslint/typescript-eslint/issues/5912)) ([5baad08](https://github.com/typescript-eslint/typescript-eslint/commit/5baad0893f9a90633d57fffac69af7523bd1501e))
- **eslint-plugin:** [prefer-optional-chain] handle binary expressions in negated or ([#5992](https://github.com/typescript-eslint/typescript-eslint/issues/5992)) ([2778ff0](https://github.com/typescript-eslint/typescript-eslint/commit/2778ff0c3db011148be93ed3bea5ce07af3c81ef))
- **typescript-estree:** don't consider a cached program unless it's specified in the current `parserOptions.project` config ([#5999](https://github.com/typescript-eslint/typescript-eslint/issues/5999)) ([530e0e6](https://github.com/typescript-eslint/typescript-eslint/commit/530e0e618cdf4bb956149bf8a8484848e1b9a1f5))

### Features

- **eslint-plugin:** [adjacent-overload-signatures] check BlockStatement nodes ([#5998](https://github.com/typescript-eslint/typescript-eslint/issues/5998)) ([97d3e56](https://github.com/typescript-eslint/typescript-eslint/commit/97d3e56709ee19fdec39fd8b99d080db90b306e9))
- **eslint-plugin:** [keyword-spacing] Support spacing in import-type syntax ([#5977](https://github.com/typescript-eslint/typescript-eslint/issues/5977)) ([6a735e1](https://github.com/typescript-eslint/typescript-eslint/commit/6a735e142ef67f3af6497f922cf83706867eb6b7))
- support parsing `satisfies` operators ([#5717](https://github.com/typescript-eslint/typescript-eslint/issues/5717)) ([20d7cae](https://github.com/typescript-eslint/typescript-eslint/commit/20d7caee35ab84ae6381fdf04338c9e2b9e2bc48))
- update to TypeScript 4.9 ([#5716](https://github.com/typescript-eslint/typescript-eslint/issues/5716)) ([4d744ea](https://github.com/typescript-eslint/typescript-eslint/commit/4d744ea10ba03c66eebcb63e8722e9f0165fbeed))

# [5.43.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.42.1...v5.43.0) (2022-11-14)

### Bug Fixes

- **eslint-plugin:** [no-shadow] handle false positives on generics and parameters ([#5902](https://github.com/typescript-eslint/typescript-eslint/issues/5902)) ([769e8c8](https://github.com/typescript-eslint/typescript-eslint/commit/769e8c8b9a51cd3448e47d13c7b0dab0468ee23c))
- **eslint-plugin:** [promise-function-async] handle keyword token ([#5907](https://github.com/typescript-eslint/typescript-eslint/issues/5907)) ([f25a94f](https://github.com/typescript-eslint/typescript-eslint/commit/f25a94fa75e497a6b9ec29a008bcc89818eed60d))

### Features

- **eslint-plugin:** [consistent-type-imports] support fixing to inline types ([#5050](https://github.com/typescript-eslint/typescript-eslint/issues/5050)) ([75dcdf1](https://github.com/typescript-eslint/typescript-eslint/commit/75dcdf164d206c5530ba7cc095c4599ec90abe35))
- **eslint-plugin:** [naming-convention] add support for "override" and "async" modifiers ([#5310](https://github.com/typescript-eslint/typescript-eslint/issues/5310)) ([#5610](https://github.com/typescript-eslint/typescript-eslint/issues/5610)) ([c759da1](https://github.com/typescript-eslint/typescript-eslint/commit/c759da169390ba490eee9ef773cc9edc88a32817))
- **eslint-plugin:** [prefer-optional-chain] support suggesting `!foo || !foo.bar` as a valid match for the rule ([#5594](https://github.com/typescript-eslint/typescript-eslint/issues/5594)) ([923d486](https://github.com/typescript-eslint/typescript-eslint/commit/923d486c8c9c9096deac425e7a6cb0b6457eacbd))

## [5.42.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.42.0...v5.42.1) (2022-11-07)

### Bug Fixes

- **ast-spec:** correct misnamed ExportNamedDeclaration AST type ([#5913](https://github.com/typescript-eslint/typescript-eslint/issues/5913)) ([e88f4fa](https://github.com/typescript-eslint/typescript-eslint/commit/e88f4fa1d0127ba0ddeff578ec67f2e66a1de68b))
- **eslint-plugin:** isTypeReadonly stack overflow ([#5875](https://github.com/typescript-eslint/typescript-eslint/issues/5875)) ([#5876](https://github.com/typescript-eslint/typescript-eslint/issues/5876)) ([2d9a33c](https://github.com/typescript-eslint/typescript-eslint/commit/2d9a33cfb2db53d76246a59253daaf2abb19ee57))

# [5.42.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.41.0...v5.42.0) (2022-10-31)

### Bug Fixes

- **ast-spec:** add TSQualifiedName to TypeNode union ([#5906](https://github.com/typescript-eslint/typescript-eslint/issues/5906)) ([5c316c1](https://github.com/typescript-eslint/typescript-eslint/commit/5c316c12f09d58aee6ee634a8055533f361f1589))
- **eslint-plugin:** [no-extra-parens] handle type assertion in extends clause ([#5901](https://github.com/typescript-eslint/typescript-eslint/issues/5901)) ([8ed7219](https://github.com/typescript-eslint/typescript-eslint/commit/8ed72192c274249d26628fb125796e71318b857a))
- **eslint-plugin:** enable react/jsx-curly-brace-presence lint rule in website package ([#5894](https://github.com/typescript-eslint/typescript-eslint/issues/5894)) ([344322a](https://github.com/typescript-eslint/typescript-eslint/commit/344322add846d03c6c9981e486b09e6ba1196555))
- **typescript-estree:** don't allow single-run unless we're in type-aware linting mode ([#5893](https://github.com/typescript-eslint/typescript-eslint/issues/5893)) ([891b087](https://github.com/typescript-eslint/typescript-eslint/commit/891b0879ba9c64a4722b8c0bf9e599a725b6d6df))

### Features

- **eslint-plugin:** [member-ordering] add natural sort order ([#5662](https://github.com/typescript-eslint/typescript-eslint/issues/5662)) ([1eaae09](https://github.com/typescript-eslint/typescript-eslint/commit/1eaae09ecca359f366b94f6a04665403f48b05c7))
- **eslint-plugin:** [no-invalid-void-type] better report message for void used as a constituent inside a function return type ([#5274](https://github.com/typescript-eslint/typescript-eslint/issues/5274)) ([d806bda](https://github.com/typescript-eslint/typescript-eslint/commit/d806bda82343712a24e3c78b9b34d4345dd1de3b))
- **scope-manager:** ignore ECMA version ([#5881](https://github.com/typescript-eslint/typescript-eslint/issues/5881)) ([3b8d449](https://github.com/typescript-eslint/typescript-eslint/commit/3b8d449696c319690536a18a48ef32749dc2f559))
- **typescript-estree:** clarify docs and error for program project without matching TSConfig ([#5762](https://github.com/typescript-eslint/typescript-eslint/issues/5762)) ([67744db](https://github.com/typescript-eslint/typescript-eslint/commit/67744db31f61acab14b5fe027fbc2844ba198c97))
- **utils:** add `RuleTester` API for top-level dependency constraints ([#5896](https://github.com/typescript-eslint/typescript-eslint/issues/5896)) ([0520d53](https://github.com/typescript-eslint/typescript-eslint/commit/0520d53536af411d66ce2ce0dd478365e67adbac))
- **website:** Add a happy message to playground output pane when no errors or AST ([#5868](https://github.com/typescript-eslint/typescript-eslint/issues/5868)) ([#5873](https://github.com/typescript-eslint/typescript-eslint/issues/5873)) ([c4e0d86](https://github.com/typescript-eslint/typescript-eslint/commit/c4e0d8678e0398f3ab85510f40ad6f97832b9e6d))

### Reverts

- Revert "feat(scope-manager): ignore ECMA version" (#5888) ([2ee81df](https://github.com/typescript-eslint/typescript-eslint/commit/2ee81df5a365d82ef4b3dfc124d4ec39c7bcb725)), closes [#5888](https://github.com/typescript-eslint/typescript-eslint/issues/5888) [#5881](https://github.com/typescript-eslint/typescript-eslint/issues/5881)

# [5.41.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.40.1...v5.41.0) (2022-10-24)

### Bug Fixes

- **eslint-plugin:** [no-base-to-string] ignore Error, URL, and URLSearchParams by default ([#5839](https://github.com/typescript-eslint/typescript-eslint/issues/5839)) ([96e1c6c](https://github.com/typescript-eslint/typescript-eslint/commit/96e1c6c171a34b0793c50c3dba853c3999a6bd49))
- **type-utils:** prevent stack overflow in `isTypeReadonly` ([#5860](https://github.com/typescript-eslint/typescript-eslint/issues/5860)) ([a6d8f7e](https://github.com/typescript-eslint/typescript-eslint/commit/a6d8f7edb84f9f6dd59a76faf53bf686756e2aed)), closes [#4476](https://github.com/typescript-eslint/typescript-eslint/issues/4476)

### Features

- **eslint-plugin:** [no-unsafe-declaration-merging] switch to use scope analysis instead of type information ([#5865](https://github.com/typescript-eslint/typescript-eslint/issues/5865)) ([e70a10a](https://github.com/typescript-eslint/typescript-eslint/commit/e70a10aea684bc6bca05b69bfce3bae769a5f5ab))
- **eslint-plugin:** add no-unsafe-declaration-merging ([#5840](https://github.com/typescript-eslint/typescript-eslint/issues/5840)) ([3728031](https://github.com/typescript-eslint/typescript-eslint/commit/3728031c659dabde7658cd54184951d4be9aabcb))

## [5.40.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.40.0...v5.40.1) (2022-10-17)

### Bug Fixes

- **eslint-plugin:** Skip missing 'rest' tuple type arguments in no-misused-promises ([#5809](https://github.com/typescript-eslint/typescript-eslint/issues/5809)) ([c5beaa2](https://github.com/typescript-eslint/typescript-eslint/commit/c5beaa2ea340985211ca5c12821842c54f5170f0)), closes [#5807](https://github.com/typescript-eslint/typescript-eslint/issues/5807)
- **utils:** add missing dependency on `@types/semver` ([#5825](https://github.com/typescript-eslint/typescript-eslint/issues/5825)) ([17b8879](https://github.com/typescript-eslint/typescript-eslint/commit/17b887933a0640d6fe843622e0520c0315144bb7))

# [5.40.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.39.0...v5.40.0) (2022-10-10)

### Bug Fixes

- **eslint-plugin:** [consistent-indexed-object-style] handle interface generic ([#5746](https://github.com/typescript-eslint/typescript-eslint/issues/5746)) ([7a8a0a3](https://github.com/typescript-eslint/typescript-eslint/commit/7a8a0a3c500ca726d2ab3bee0ae9f3fb9d8d39b8))
- **eslint-plugin:** [no-unnecessary-condition] handle void ([#5766](https://github.com/typescript-eslint/typescript-eslint/issues/5766)) ([ac8f06b](https://github.com/typescript-eslint/typescript-eslint/commit/ac8f06b68dca7666bfb78fb38d6ccc07f676e435))

### Features

- **eslint-plugin:** Check 'rest' parameters in no-misused-promises ([#5731](https://github.com/typescript-eslint/typescript-eslint/issues/5731)) ([6477f38](https://github.com/typescript-eslint/typescript-eslint/commit/6477f3855627cc257edc021b859711d4a5847a12)), closes [#4015](https://github.com/typescript-eslint/typescript-eslint/issues/4015)
- **utils:** add dependency constraint filtering for `RuleTester` ([#5750](https://github.com/typescript-eslint/typescript-eslint/issues/5750)) ([121f4c0](https://github.com/typescript-eslint/typescript-eslint/commit/121f4c0e7252def95d917e4734e933e53e29d501))
- **website:** store options TypeScript, Enable jsx and AST Viewer in browser's local storage ([#5769](https://github.com/typescript-eslint/typescript-eslint/issues/5769)) ([77d2336](https://github.com/typescript-eslint/typescript-eslint/commit/77d2336594ca10b47c0f7978ae64f87d24a25d33))

# [5.39.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.38.1...v5.39.0) (2022-10-03)

### Features

- **eslint-plugin:** allow using void as a default type for a generic argument if allowInGenericTypeArguments is specified ([#5671](https://github.com/typescript-eslint/typescript-eslint/issues/5671)) ([bb46ef0](https://github.com/typescript-eslint/typescript-eslint/commit/bb46ef0817fe03ef71f8e0f3df0cf96bc355e068))

## [5.38.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.38.0...v5.38.1) (2022-09-26)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

# [5.38.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.37.0...v5.38.0) (2022-09-19)

### Features

- **website:** add warning on top of formatting rule docs pages ([#5598](https://github.com/typescript-eslint/typescript-eslint/issues/5598)) ([5dfa2e9](https://github.com/typescript-eslint/typescript-eslint/commit/5dfa2e9a33491905e99d8940dbdac0b31ada4858))

# [5.37.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.36.2...v5.37.0) (2022-09-12)

### Bug Fixes

- **eslint-plugin:** [strict-boolean-expressions] check all conditions in a logical operator chain ([#5539](https://github.com/typescript-eslint/typescript-eslint/issues/5539)) ([77d76e2](https://github.com/typescript-eslint/typescript-eslint/commit/77d76e21cdc2e100c729c839c292e82ab7c554c5))
- **website:** Use extended base rule name from file's meta ([#5621](https://github.com/typescript-eslint/typescript-eslint/issues/5621)) ([7fd2f89](https://github.com/typescript-eslint/typescript-eslint/commit/7fd2f89ae732ca12ec83fad278362032473ff3ca))

### Features

- **docs:** always expanding collapsible sidebar menus under docs ([#5608](https://github.com/typescript-eslint/typescript-eslint/issues/5608)) ([8176fb1](https://github.com/typescript-eslint/typescript-eslint/commit/8176fb15299943cbf20385eb0ea7ba877e193285))

## [5.36.2](https://github.com/typescript-eslint/typescript-eslint/compare/v5.36.1...v5.36.2) (2022-09-05)

### Bug Fixes

- **eslint-plugin:** [no-extra-parens] handle generic ts array type. ([#5550](https://github.com/typescript-eslint/typescript-eslint/issues/5550)) ([0d6a190](https://github.com/typescript-eslint/typescript-eslint/commit/0d6a190c56fb3489f9f554b9035a008e29cc08ec))
- **scope-manager:** correct handling for class static blocks ([#5580](https://github.com/typescript-eslint/typescript-eslint/issues/5580)) ([35bb8dd](https://github.com/typescript-eslint/typescript-eslint/commit/35bb8ddac1b46397f6447c1a6e1e4e1774dd7957))
- **typescript-estree:** don't double add decorators to a parameter property's parameter ([#5582](https://github.com/typescript-eslint/typescript-eslint/issues/5582)) ([863694c](https://github.com/typescript-eslint/typescript-eslint/commit/863694cbc71b5158ca6a018de8707c9f9fbc22c3))

## [5.36.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.36.0...v5.36.1) (2022-08-30)

### Bug Fixes

- **typescript-estree:** fix decorator regression for pre TS4.8 ([#5574](https://github.com/typescript-eslint/typescript-eslint/issues/5574)) ([a603015](https://github.com/typescript-eslint/typescript-eslint/commit/a603015c93a6ea96d500c57bec1e284340141b1f))

# [5.36.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.35.1...v5.36.0) (2022-08-30)

### Bug Fixes

- **eslint-plugin:** revert [#5266](https://github.com/typescript-eslint/typescript-eslint/issues/5266) ([#5564](https://github.com/typescript-eslint/typescript-eslint/issues/5564)) ([7a8afe2](https://github.com/typescript-eslint/typescript-eslint/commit/7a8afe29039c6c80fe584acaf5d933424a4452a9))

### Features

- support TypeScript 4.8 ([#5551](https://github.com/typescript-eslint/typescript-eslint/issues/5551)) ([81450ed](https://github.com/typescript-eslint/typescript-eslint/commit/81450ed7eaede74b384e9a91a84e9b4d34513866))

## [5.35.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.35.0...v5.35.1) (2022-08-24)

### Bug Fixes

- **eslint-plugin:** correct rule schemas to pass ajv validation ([#5531](https://github.com/typescript-eslint/typescript-eslint/issues/5531)) ([dbf8b56](https://github.com/typescript-eslint/typescript-eslint/commit/dbf8b569dbada29e4a295d6c265976e55de1b2aa))

# [5.35.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.34.0...v5.35.0) (2022-08-24)

### Features

- **eslint-plugin:** [explicit-member-accessibility] suggest adding explicit accessibility specifiers ([#5492](https://github.com/typescript-eslint/typescript-eslint/issues/5492)) ([0edb94a](https://github.com/typescript-eslint/typescript-eslint/commit/0edb94aee55e1ec6afa7f46f99a9b308bbb66301))

# [5.34.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.33.1...v5.34.0) (2022-08-22)

### Bug Fixes

- **ast-spec:** NewExpression argument can be SpreadElement now ([#5422](https://github.com/typescript-eslint/typescript-eslint/issues/5422)) ([3ced62f](https://github.com/typescript-eslint/typescript-eslint/commit/3ced62fb8474ed377c1336ac3e855f0270ce9beb))
- **eslint-plugin:** [no-useless-constructor] handle parameter decorator ([#5450](https://github.com/typescript-eslint/typescript-eslint/issues/5450)) ([864dbcf](https://github.com/typescript-eslint/typescript-eslint/commit/864dbcfccba274fe1b26eac8aeeaf2a2355b5969))
- **scope-manager:** visit static blocks ([#5489](https://github.com/typescript-eslint/typescript-eslint/issues/5489)) ([78745c2](https://github.com/typescript-eslint/typescript-eslint/commit/78745c2092064446837b5683892001030a8bb4e2))

### Features

- **eslint-plugin:** [prefer-optional-chain] support suggesting `!foo || !foo.bar` as a valid match for the rule ([#5266](https://github.com/typescript-eslint/typescript-eslint/issues/5266)) ([aca935c](https://github.com/typescript-eslint/typescript-eslint/commit/aca935c9696712d4aff18144c4690db4d6ba9bf9))
- **types:** add unbound property in parser options ([#5419](https://github.com/typescript-eslint/typescript-eslint/issues/5419)) ([e08a9dd](https://github.com/typescript-eslint/typescript-eslint/commit/e08a9dd79365c1b1f5d0145ab69377f7d45f8a4f))

## [5.33.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.33.0...v5.33.1) (2022-08-15)

### Bug Fixes

- missing placeholders in violation messages for `no-unnecessary-type-constraint` and `no-unsafe-argument` (and enable `eslint-plugin/recommended` rules internally) ([#5453](https://github.com/typescript-eslint/typescript-eslint/issues/5453)) ([d023910](https://github.com/typescript-eslint/typescript-eslint/commit/d0239104f4dbffd2b5ecdb19e520c7d4b71962e0))

# [5.33.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.32.0...v5.33.0) (2022-08-08)

### Bug Fixes

- **eslint-plugin:** [no-extra-parens] handle await with type assertion ([#5428](https://github.com/typescript-eslint/typescript-eslint/issues/5428)) ([e03826f](https://github.com/typescript-eslint/typescript-eslint/commit/e03826f08ce8bfdd6d6702025d975cfb7d867097))
- **website:** add explicit frontmatter description to rule docs ([#5429](https://github.com/typescript-eslint/typescript-eslint/issues/5429)) ([63cba5f](https://github.com/typescript-eslint/typescript-eslint/commit/63cba5f4c1884e102927b3b14b18a00e96ac63a1))

### Features

- **eslint-plugin:** [member-ordering] support static blocks ([#5417](https://github.com/typescript-eslint/typescript-eslint/issues/5417)) ([5983e5a](https://github.com/typescript-eslint/typescript-eslint/commit/5983e5ab3bfb94fec782bea54a37457fe31db545))
- **eslint-plugin:** [prefer-as-const] adds support for class properties ([#5413](https://github.com/typescript-eslint/typescript-eslint/issues/5413)) ([d2394f8](https://github.com/typescript-eslint/typescript-eslint/commit/d2394f810960fda07b9c8affd47b769d16f4b8cb))

# [5.32.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.31.0...v5.32.0) (2022-08-01)

### Features

- **eslint-plugin:** [no-use-before-define] add "allowNamedExports" option ([#5397](https://github.com/typescript-eslint/typescript-eslint/issues/5397)) ([ad412cd](https://github.com/typescript-eslint/typescript-eslint/commit/ad412cdd74dc5619fbe4bf27c0a5eb5c5a4b65ca))

# [5.31.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.30.7...v5.31.0) (2022-07-25)

### Bug Fixes

- **eslint-plugin:** [typedef] Support nested array destructuring with type annotation ([#5311](https://github.com/typescript-eslint/typescript-eslint/issues/5311)) ([6d19efe](https://github.com/typescript-eslint/typescript-eslint/commit/6d19efed16d1cf0357ad363b6373d2021c49a8c8))
- **scope-manager:** handle typeParameters of TSInstantiationExpression ([#5355](https://github.com/typescript-eslint/typescript-eslint/issues/5355)) ([2595ccf](https://github.com/typescript-eslint/typescript-eslint/commit/2595ccf67cd5158edbd6bebd9ac2dbd8bbd8b99c))

### Features

- **eslint-plugin:** [consistent-generic-ctors] check class field declaration ([#5288](https://github.com/typescript-eslint/typescript-eslint/issues/5288)) ([48f996e](https://github.com/typescript-eslint/typescript-eslint/commit/48f996e8dda79c9c865e8ca6552069902836648b))
- **eslint-plugin:** [prefer-nullish-coalescing] add ignoreTernaryTests option ([#4965](https://github.com/typescript-eslint/typescript-eslint/issues/4965)) ([f82727f](https://github.com/typescript-eslint/typescript-eslint/commit/f82727ffeb97475c07773ca1d1e5b9609fcc5e68))

## [5.30.7](https://github.com/typescript-eslint/typescript-eslint/compare/v5.30.6...v5.30.7) (2022-07-18)

### Bug Fixes

- **eslint-plugin:** [no-inferrable] fix optional param to valid code ([#5342](https://github.com/typescript-eslint/typescript-eslint/issues/5342)) ([98f6d5e](https://github.com/typescript-eslint/typescript-eslint/commit/98f6d5e6d08d1eb9789da52a15f337f5f53438bd))
- **eslint-plugin:** [no-unused-vars] highlight last write reference ([#5267](https://github.com/typescript-eslint/typescript-eslint/issues/5267)) ([c3f199a](https://github.com/typescript-eslint/typescript-eslint/commit/c3f199a65a16aa72f5bb83e81a1ce0ffb5f69772))
- expose types supporting old versions of typescript ([#5339](https://github.com/typescript-eslint/typescript-eslint/issues/5339)) ([4ba9bdb](https://github.com/typescript-eslint/typescript-eslint/commit/4ba9bdb93f87e6bc370f13aa1de48f435abe3f88))
- **scope-manager:** allow visiting of constraint in infer type ([#5331](https://github.com/typescript-eslint/typescript-eslint/issues/5331)) ([b2846a1](https://github.com/typescript-eslint/typescript-eslint/commit/b2846a16777a3aea7b1e6ac9d81b9b6dce0bb874))

## [5.30.6](https://github.com/typescript-eslint/typescript-eslint/compare/v5.30.5...v5.30.6) (2022-07-11)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [5.30.5](https://github.com/typescript-eslint/typescript-eslint/compare/v5.30.4...v5.30.5) (2022-07-04)

### Bug Fixes

- **eslint-plugin:** [consistent-indexed-object-style] fix record mode fixer for generics with a default value ([#5280](https://github.com/typescript-eslint/typescript-eslint/issues/5280)) ([57f032c](https://github.com/typescript-eslint/typescript-eslint/commit/57f032c2e6a822c049177713778d0077ee138d9a))

## [5.30.4](https://github.com/typescript-eslint/typescript-eslint/compare/v5.30.3...v5.30.4) (2022-07-03)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [5.30.3](https://github.com/typescript-eslint/typescript-eslint/compare/v5.30.2...v5.30.3) (2022-07-01)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [5.30.2](https://github.com/typescript-eslint/typescript-eslint/compare/v5.30.1...v5.30.2) (2022-07-01)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [5.30.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.30.0...v5.30.1) (2022-07-01)

### Bug Fixes

- **eslint-plugin:** [no-base-to-string] add missing apostrophe to message ([#5270](https://github.com/typescript-eslint/typescript-eslint/issues/5270)) ([d320174](https://github.com/typescript-eslint/typescript-eslint/commit/58034e343a167ca7751b54d2b2a0e7d3852aabec))

# [5.30.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.29.0...v5.30.0) (2022-06-27)

### Features

- **eslint-plugin:** [no-shadow] add shadowed variable location to the error message ([#5183](https://github.com/typescript-eslint/typescript-eslint/issues/5183)) ([8ca08e9](https://github.com/typescript-eslint/typescript-eslint/commit/8ca08e9f18d59b29715c667fbb7d237f6e9a96ba))
- treat `this` in `typeof this` as a `ThisExpression` ([#4382](https://github.com/typescript-eslint/typescript-eslint/issues/4382)) ([b04b2ce](https://github.com/typescript-eslint/typescript-eslint/commit/b04b2ce1ba90d94718891f2562dd210a6d7b8609))

# [5.29.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.28.0...v5.29.0) (2022-06-20)

### Features

- **website:** open issue with rule name if only one rule is enabled ([#5190](https://github.com/typescript-eslint/typescript-eslint/issues/5190)) ([b229ee4](https://github.com/typescript-eslint/typescript-eslint/commit/b229ee4ace1417d2d4f7d6cafa039f073e845c3a))

# [5.28.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.27.1...v5.28.0) (2022-06-13)

### Bug Fixes

- [TS4.7] allow visiting of typeParameters in TSTypeQuery ([#5166](https://github.com/typescript-eslint/typescript-eslint/issues/5166)) ([dc1f930](https://github.com/typescript-eslint/typescript-eslint/commit/dc1f9309cf04aa7314e758980ac687558482f47f))
- **eslint-plugin:** [space-infix-ops] support for optional property without type ([#5155](https://github.com/typescript-eslint/typescript-eslint/issues/5155)) ([1f25daf](https://github.com/typescript-eslint/typescript-eslint/commit/1f25daf74e5d45077199f9ee9fa9bf31107f4089))

### Features

- **ast-spec:** extract `AssignmentOperatorToText` ([#3570](https://github.com/typescript-eslint/typescript-eslint/issues/3570)) ([45f75e6](https://github.com/typescript-eslint/typescript-eslint/commit/45f75e6b869f4160a45a6890d794aba004356ad7))
- **eslint-plugin:** [consistent-generic-constructors] add rule ([#4924](https://github.com/typescript-eslint/typescript-eslint/issues/4924)) ([921cdf1](https://github.com/typescript-eslint/typescript-eslint/commit/921cdf17e548845311d0591249616ec844503926))

## [5.27.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.27.0...v5.27.1) (2022-06-06)

### Bug Fixes

- **eslint-plugin:** [space-infix-ops] correct PropertyDefinition with typeAnnotation ([#5113](https://github.com/typescript-eslint/typescript-eslint/issues/5113)) ([d320174](https://github.com/typescript-eslint/typescript-eslint/commit/d320174f40a74b34e6b6e4c88128ef6e736311d8))
- **eslint-plugin:** [space-infix-ops] regression fix for conditional types ([#5135](https://github.com/typescript-eslint/typescript-eslint/issues/5135)) ([e5238c8](https://github.com/typescript-eslint/typescript-eslint/commit/e5238c84e56e7c34174b2c6f1e3ea59456797c2f))
- **eslint-plugin:** [space-infix-ops] regression fix for type aliases ([#5138](https://github.com/typescript-eslint/typescript-eslint/issues/5138)) ([4e13deb](https://github.com/typescript-eslint/typescript-eslint/commit/4e13deb05fbd8724996156b15b65f6a66794a7cc))

# [5.27.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.26.0...v5.27.0) (2022-05-30)

### Bug Fixes

- **eslint-plugin:** [no-type-alias] handle Template Literal Types ([#5092](https://github.com/typescript-eslint/typescript-eslint/issues/5092)) ([8febf11](https://github.com/typescript-eslint/typescript-eslint/commit/8febf11a9296d1c0d7ccdf91ef9ab92ec8dfc39c))
- **types:** remove leftovers from removal of useJSXTextNode ([#5091](https://github.com/typescript-eslint/typescript-eslint/issues/5091)) ([f9c3647](https://github.com/typescript-eslint/typescript-eslint/commit/f9c3647cb637c8d1ee461b471da9d817ccbde77c))

### Features

- [4.7] support new extensions ([#5027](https://github.com/typescript-eslint/typescript-eslint/issues/5027)) ([efc147b](https://github.com/typescript-eslint/typescript-eslint/commit/efc147b04dce52ab17415b6a4ae4076b944b9036))
- [TS4.7] support type parameters for `typeof` ([#5067](https://github.com/typescript-eslint/typescript-eslint/issues/5067)) ([836de79](https://github.com/typescript-eslint/typescript-eslint/commit/836de79e8d1bff43149168cc913a4c2b60e79bf6))
- bump dependency ranges to TypeScript 4.7 ([#5082](https://github.com/typescript-eslint/typescript-eslint/issues/5082)) ([c4310b1](https://github.com/typescript-eslint/typescript-eslint/commit/c4310b1aac35c7d31b826f0602eca6a5900a09ee))
- **eslint-plugin:** [ban-ts-comment] add descriptionFormat option ([#5026](https://github.com/typescript-eslint/typescript-eslint/issues/5026)) ([1fb31a4](https://github.com/typescript-eslint/typescript-eslint/commit/1fb31a4b3e05734f801ade0450fea33494e4d5e6))
- **eslint-plugin:** [no-misused-promises] warn when spreading promises ([#5053](https://github.com/typescript-eslint/typescript-eslint/issues/5053)) ([61ffa9e](https://github.com/typescript-eslint/typescript-eslint/commit/61ffa9ed70e3cac6eca50a6c3cc5a0f1e7dec11c))
- **eslint-plugin:** [space-infix-ops] missing error report for conditional types ([#5041](https://github.com/typescript-eslint/typescript-eslint/issues/5041)) ([0bfab6c](https://github.com/typescript-eslint/typescript-eslint/commit/0bfab6c9f5c5e243268200cf9368acf39ea099f8))

# [5.26.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.25.0...v5.26.0) (2022-05-23)

### Bug Fixes

- **ast-spec:** add `SpreadElement` to `ArrayExpression.elements` ([#5025](https://github.com/typescript-eslint/typescript-eslint/issues/5025)) ([9f3121b](https://github.com/typescript-eslint/typescript-eslint/commit/9f3121b228b9c066bff7a6011aecf269ac55f17c))
- **eslint-plugin:** [member-delimiter-style] autofixer result is not as expected when comments after the delimiter with option `delimiter: 'none'` ([#5029](https://github.com/typescript-eslint/typescript-eslint/issues/5029)) ([ed7b5f6](https://github.com/typescript-eslint/typescript-eslint/commit/ed7b5f61d93799fec3e38a87935ab9caa3abe279))
- **eslint-plugin:** [member-delimiter-style] autofixer result is not as expected with option `delimiter: 'none'` ([#5023](https://github.com/typescript-eslint/typescript-eslint/issues/5023)) ([9e97a11](https://github.com/typescript-eslint/typescript-eslint/commit/9e97a11ecd80be5c63c980bfe8d8e57400221cec))
- **eslint-plugin:** [prefer-readonly] correct issue with anonymus functions ([#4974](https://github.com/typescript-eslint/typescript-eslint/issues/4974)) ([952e2f0](https://github.com/typescript-eslint/typescript-eslint/commit/952e2f068862dde089ec03d3eb5452d1ee3e9271)), closes [#2590](https://github.com/typescript-eslint/typescript-eslint/issues/2590)

### Features

- [4.7] support instantiation expressions ([#4938](https://github.com/typescript-eslint/typescript-eslint/issues/4938)) ([79fbc77](https://github.com/typescript-eslint/typescript-eslint/commit/79fbc7743ae5dce3190f8168776e0204755390ad))
- [4.7] support optional variance annotation ([#4831](https://github.com/typescript-eslint/typescript-eslint/issues/4831)) ([7e7b24c](https://github.com/typescript-eslint/typescript-eslint/commit/7e7b24c196e6d968e48f97f46feae5e7027e22d2))
- **typescript-estree:** `extends` constraints for `infer` ([#4830](https://github.com/typescript-eslint/typescript-eslint/issues/4830)) ([8cbbcc3](https://github.com/typescript-eslint/typescript-eslint/commit/8cbbcc3d317779e0dcba15d3835137f38383de34))

# [5.25.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.24.0...v5.25.0) (2022-05-17)

### Bug Fixes

- **eslint-plugin:** [typedef] stop enforcing rule for assignment expressions ([#4958](https://github.com/typescript-eslint/typescript-eslint/issues/4958)) ([04a216c](https://github.com/typescript-eslint/typescript-eslint/commit/04a216c39c02085fe5d555ce81bdced0e563a7c4))
- **eslint-plugin:** strict config should not extend recommended ([#5005](https://github.com/typescript-eslint/typescript-eslint/issues/5005)) ([05d71c2](https://github.com/typescript-eslint/typescript-eslint/commit/05d71c2ebd8e072aa4e8ee3ea8521de00e47d4ca))
- **website:** correct Presets link to be Configs ([#5004](https://github.com/typescript-eslint/typescript-eslint/issues/5004)) ([e18e91c](https://github.com/typescript-eslint/typescript-eslint/commit/e18e91c6cfb1ee93bfff3770ea4d8f807d5ced0b))

### Features

- **eslint-plugin:** [no-empty-function] new allow option overrideMethods ([#4923](https://github.com/typescript-eslint/typescript-eslint/issues/4923)) ([13c05ae](https://github.com/typescript-eslint/typescript-eslint/commit/13c05aefb0e6531d320629e04b7207a3baebacb0))
- **eslint-plugin:** deprecate `no-duplicate-imports` in favour of `import/no-duplicates` ([#4973](https://github.com/typescript-eslint/typescript-eslint/issues/4973)) ([1d2e41a](https://github.com/typescript-eslint/typescript-eslint/commit/1d2e41ada1979c081130d19b229c82bf1a69b7b4))
- update to TypeScript 4.7-rc ([#4829](https://github.com/typescript-eslint/typescript-eslint/issues/4829)) ([6fe783c](https://github.com/typescript-eslint/typescript-eslint/commit/6fe783c20aebe26ef42b526e4a59a9be84dd5643))

# [5.24.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.23.0...v5.24.0) (2022-05-16)

### Bug Fixes

- **eslint-plugin:** [array-type] in fixer add missing parens for constructor types [#4756](https://github.com/typescript-eslint/typescript-eslint/issues/4756) ([#4971](https://github.com/typescript-eslint/typescript-eslint/issues/4971)) ([0377070](https://github.com/typescript-eslint/typescript-eslint/commit/03770708900da663eb64c19465b3f937bab55b3d))
- **website:** missing colon before tip notes in configs.md ([#4982](https://github.com/typescript-eslint/typescript-eslint/issues/4982)) ([f3a1aba](https://github.com/typescript-eslint/typescript-eslint/commit/f3a1aba6704c5978c9f6002d6b1fc076421103d1))

### Features

- **eslint-plugin:** Add BigInt object type to default ban-types list ([#4970](https://github.com/typescript-eslint/typescript-eslint/issues/4970)) ([1867728](https://github.com/typescript-eslint/typescript-eslint/commit/1867728ba104a6a21941ed300828110964a43b96))
- **eslint-plugin:** add new 'strict' config ([#4706](https://github.com/typescript-eslint/typescript-eslint/issues/4706)) ([4a500b2](https://github.com/typescript-eslint/typescript-eslint/commit/4a500b2d92a91873dbb729793d1ee1c36ef06ed8))

# [5.23.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.22.0...v5.23.0) (2022-05-09)

### Bug Fixes

- **ast-spec:** correct `AwaitExpression.argument` type ([#4880](https://github.com/typescript-eslint/typescript-eslint/issues/4880)) ([3ec5f53](https://github.com/typescript-eslint/typescript-eslint/commit/3ec5f53bad79b133ef5dee71c402160b3acf13cf))
- **eslint-plugin:** [no-restricted-imports] allow type import as long as there's one matching pattern ([#4898](https://github.com/typescript-eslint/typescript-eslint/issues/4898)) ([0419d28](https://github.com/typescript-eslint/typescript-eslint/commit/0419d287b637e805c33036a45760badc2498e19b))
- **eslint-plugin:** [no-unnecessary-type-constraint] change to suggestion fix, fix multiple trailing comma failures ([#4901](https://github.com/typescript-eslint/typescript-eslint/issues/4901)) ([4507ac8](https://github.com/typescript-eslint/typescript-eslint/commit/4507ac84c76da0ced43b6679305afe1891e7afca))

### Features

- **utils:** update eslint types ([#4896](https://github.com/typescript-eslint/typescript-eslint/issues/4896)) ([da48527](https://github.com/typescript-eslint/typescript-eslint/commit/da485279f13cb95db1ee131a4f9c5367d54020fe))

# [5.22.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.21.0...v5.22.0) (2022-05-02)

### Bug Fixes

- add rule to vscode settings ([#4881](https://github.com/typescript-eslint/typescript-eslint/issues/4881)) ([3eab889](https://github.com/typescript-eslint/typescript-eslint/commit/3eab889022c9d1617f275017d6951f663ea57f24))
- **eslint-plugin:** [comma-spacing] verify `nextToken` exists ([#4868](https://github.com/typescript-eslint/typescript-eslint/issues/4868)) ([23746f8](https://github.com/typescript-eslint/typescript-eslint/commit/23746f8babace7c2354368d6fb0881be26e19c41))

### Features

- **ast-spec:** add fixture test framework and some initial fixtures ([#3258](https://github.com/typescript-eslint/typescript-eslint/issues/3258)) ([f3cf87b](https://github.com/typescript-eslint/typescript-eslint/commit/f3cf87bf20fd0542f92a96a318aa9ee5bf23c1f6))
- **eslint-plugin:** [no-duplicate-enum-values] add rule ([#4833](https://github.com/typescript-eslint/typescript-eslint/issues/4833)) ([5899164](https://github.com/typescript-eslint/typescript-eslint/commit/5899164b35d91106512a2720b23ba92e1893132f))

# [5.21.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.20.0...v5.21.0) (2022-04-25)

### Bug Fixes

- **eslint-plugin:** [no-misused-promises] prioritize false returns when checking whether a function returns only void ([#4841](https://github.com/typescript-eslint/typescript-eslint/issues/4841)) ([ccadb60](https://github.com/typescript-eslint/typescript-eslint/commit/ccadb6075d6977c4921ffc09fa40f515f4d497c5))
- **eslint-plugin:** [no-namespace] fix false positive for exported namespaces when allowDeclarations=true ([#4844](https://github.com/typescript-eslint/typescript-eslint/issues/4844)) ([4e7c9be](https://github.com/typescript-eslint/typescript-eslint/commit/4e7c9be6ff7e2448f4151563d7921cd285c2e349))
- **eslint-plugin:** [space-infix-ops] fix no error when right type is function ([#4848](https://github.com/typescript-eslint/typescript-eslint/issues/4848)) ([d74d559](https://github.com/typescript-eslint/typescript-eslint/commit/d74d559c25e336c3ebe917bf5c43e14ffa2de694))

### Features

- **eslint-plugin:** [parameter-properties] add rule to replace `no-parameter-properties` ([#4622](https://github.com/typescript-eslint/typescript-eslint/issues/4622)) ([88ed9ec](https://github.com/typescript-eslint/typescript-eslint/commit/88ed9ec9d6b971a9533565920fdcd6890ea941e9))

# [5.20.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.19.0...v5.20.0) (2022-04-18)

### Features

- **eslint-plugin:** [no-magic-numbers] ignoreTypeIndexes option ([#4789](https://github.com/typescript-eslint/typescript-eslint/issues/4789)) ([5e79451](https://github.com/typescript-eslint/typescript-eslint/commit/5e794512bf124c39de76d4e2cf8a3d6cfb08f1a8))

# [5.19.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.18.0...v5.19.0) (2022-04-11)

### Bug Fixes

- **eslint-plugin:** update code to use estree range instead of ts pos/end [#4723](https://github.com/typescript-eslint/typescript-eslint/issues/4723) ([#4790](https://github.com/typescript-eslint/typescript-eslint/issues/4790)) ([a1e9fc4](https://github.com/typescript-eslint/typescript-eslint/commit/a1e9fc4cb19e7655613ebe6f4dd911b5427b0367))

### Features

- **eslint-plugin:** [unified-signatures] add `ignoreDifferentlyNamedParameters` option ([#4659](https://github.com/typescript-eslint/typescript-eslint/issues/4659)) ([fdf95e0](https://github.com/typescript-eslint/typescript-eslint/commit/fdf95e02c45e137325c9ddd9d30e7f6b404f4514))
- **eslint-plugin:** add support for valid number and bigint intersections in restrict-plus-operands rule ([#4795](https://github.com/typescript-eslint/typescript-eslint/issues/4795)) ([19c600a](https://github.com/typescript-eslint/typescript-eslint/commit/19c600a3dd485669cb87ae8f81b010e65eee1df8))

# [5.18.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.17.0...v5.18.0) (2022-04-04)

### Bug Fixes

- **eslint-plugin:** method-signature-style respect getter signature ([#4777](https://github.com/typescript-eslint/typescript-eslint/issues/4777)) ([12dd670](https://github.com/typescript-eslint/typescript-eslint/commit/12dd670bc8621867c5105d8892dba9f9550a2f35))
- **visitor-keys:** add missing visitor keys ([#4731](https://github.com/typescript-eslint/typescript-eslint/issues/4731)) ([bb575a0](https://github.com/typescript-eslint/typescript-eslint/commit/bb575a0763f39b9b988a7c20afee7b5eeb64cba7))

### Features

- **eslint-plugin:** [no-shadow] ignoreOnInitialization option ([#4603](https://github.com/typescript-eslint/typescript-eslint/issues/4603)) ([068ea9b](https://github.com/typescript-eslint/typescript-eslint/commit/068ea9b8eb3072fb46a6035f29c68ce96a69008d))
- **eslint-plugin:** [no-this-alias] report on assignment expressions ([#4718](https://github.com/typescript-eslint/typescript-eslint/issues/4718)) ([8329498](https://github.com/typescript-eslint/typescript-eslint/commit/83294989dad543351a26e95be8d11a91d348679a))

# [5.17.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.16.0...v5.17.0) (2022-03-28)

### Bug Fixes

- code container hiding navigation menu ([#4707](https://github.com/typescript-eslint/typescript-eslint/issues/4707)) ([96bc69a](https://github.com/typescript-eslint/typescript-eslint/commit/96bc69a652c7f6f474a39f1e9783e7fbd446696a))
- revert "chore: Bump cypress from 8.3.0 to 9.5.2", and ignore cypress for now ([#4740](https://github.com/typescript-eslint/typescript-eslint/issues/4740)) ([cf5f5c4](https://github.com/typescript-eslint/typescript-eslint/commit/cf5f5c441ab0c4fb056bd688795ffc55e026627a)), closes [#4710](https://github.com/typescript-eslint/typescript-eslint/issues/4710)

### Features

- **eslint-plugin:** [no-unused-vars] add destructuredArrayIgnorePattern options ([#4748](https://github.com/typescript-eslint/typescript-eslint/issues/4748)) ([6f8db8b](https://github.com/typescript-eslint/typescript-eslint/commit/6f8db8b64821d280fff408c1704a9adde682ed69))

# [5.16.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.15.0...v5.16.0) (2022-03-21)

### Bug Fixes

- **eslint-plugin:** [consistent-type-assertions] enforce assertionStyle for `const` assertions ([#4685](https://github.com/typescript-eslint/typescript-eslint/issues/4685)) ([8ec05be](https://github.com/typescript-eslint/typescript-eslint/commit/8ec05bed0fed0dcd48b087acd5ab5a6132bf3b09))
- **scope-manager:** incorrect reference for this within a jsx identifier ([#4535](https://github.com/typescript-eslint/typescript-eslint/issues/4535)) ([dd49280](https://github.com/typescript-eslint/typescript-eslint/commit/dd49280e50cb2f5bd26dc07210551bc1fda120af))
- **utils:** RuleTester: Only call afterAll if defined ([#4656](https://github.com/typescript-eslint/typescript-eslint/issues/4656)) ([0fe0683](https://github.com/typescript-eslint/typescript-eslint/commit/0fe0683effe4c7390806a72c6aa7795445a67929))

### Features

- **eslint-plugin:** [prefer-optional-chain] support logical with empty object ([#4430](https://github.com/typescript-eslint/typescript-eslint/issues/4430)) ([d21cfe0](https://github.com/typescript-eslint/typescript-eslint/commit/d21cfe0f4b7d3041948b1b6e0cd56c5ec34b2b3f))

# [5.15.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.14.0...v5.15.0) (2022-03-14)

### Features

- **parser:** add `parserOptions.emitDecoratorMetadata` ([#4646](https://github.com/typescript-eslint/typescript-eslint/issues/4646)) ([e3dd343](https://github.com/typescript-eslint/typescript-eslint/commit/e3dd343e51e3b7772e825a609735a04c921c1ec5))

# [5.14.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.13.0...v5.14.0) (2022-03-07)

### Bug Fixes

- **eslint-plugin:** [naming-convention] cover case that requires quotes ([#4582](https://github.com/typescript-eslint/typescript-eslint/issues/4582)) ([3ea0947](https://github.com/typescript-eslint/typescript-eslint/commit/3ea09477debec9f1593e4d3857e153570b488f4d))
- **eslint-plugin:** [no-misused-promises] factor thenable returning function overload signatures ([#4620](https://github.com/typescript-eslint/typescript-eslint/issues/4620)) ([56a09e9](https://github.com/typescript-eslint/typescript-eslint/commit/56a09e98f171662d25ae2692be703a8bbbd3a3a5))
- **eslint-plugin:** [prefer-readonly-parameter-types] handle class sharp private field and member without throwing error ([#4343](https://github.com/typescript-eslint/typescript-eslint/issues/4343)) ([a65713a](https://github.com/typescript-eslint/typescript-eslint/commit/a65713ae138e56555d01a9e8e5179221a2f39e75))
- **eslint-plugin:** [return-await] correct autofixer in binary expression ([#4401](https://github.com/typescript-eslint/typescript-eslint/issues/4401)) ([5fa2fad](https://github.com/typescript-eslint/typescript-eslint/commit/5fa2fade385cc526a962212b94410c58e4c31078))

### Features

- **eslint-plugin:** [no-misused-promises] add granular options within `checksVoidReturns` ([#4623](https://github.com/typescript-eslint/typescript-eslint/issues/4623)) ([1085177](https://github.com/typescript-eslint/typescript-eslint/commit/10851772696f982b585e0dade728f7980fdc6cc0))
- TypeScript 4.6 ([#4615](https://github.com/typescript-eslint/typescript-eslint/issues/4615)) ([a02c63a](https://github.com/typescript-eslint/typescript-eslint/commit/a02c63a264e5a6c3557468a8eff48d34ca2b718a))

# [5.13.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.12.1...v5.13.0) (2022-02-28)

### Bug Fixes

- **eslint-plugin:** [sort-type-union-intersection-members] Wrap the constructorType in parentheses ([#4590](https://github.com/typescript-eslint/typescript-eslint/issues/4590)) ([851bb90](https://github.com/typescript-eslint/typescript-eslint/commit/851bb90216e20b7679efc891dc445e6152d4837f))

### Features

- **eslint-plugin:** [no-misused-promises] check more places for checksVoidReturn ([#4541](https://github.com/typescript-eslint/typescript-eslint/issues/4541)) ([052cf51](https://github.com/typescript-eslint/typescript-eslint/commit/052cf51fe663283afe89dc7bf97c947e750df095))
- **eslint-plugin:** add `no-redundant-type-constituents` rule ([#4378](https://github.com/typescript-eslint/typescript-eslint/issues/4378)) ([63d051e](https://github.com/typescript-eslint/typescript-eslint/commit/63d051eed29dcf71015a23992feac0a8f92717a0))
- **eslint-plugin:** add `no-useless-empty-export` rule ([#4380](https://github.com/typescript-eslint/typescript-eslint/issues/4380)) ([823b945](https://github.com/typescript-eslint/typescript-eslint/commit/823b945c8f9e83d0246a2a5d07519f01e1a64518))
- **eslint-plugin:** add extension rule `space-before-blocks` ([#1606](https://github.com/typescript-eslint/typescript-eslint/issues/1606)) ([#4184](https://github.com/typescript-eslint/typescript-eslint/issues/4184)) ([208b6d0](https://github.com/typescript-eslint/typescript-eslint/commit/208b6d02252dff2bf272329d3e4a4a82e56c52c0))
- **eslint-plugin:** added member group support to member-ordering rule ([#4538](https://github.com/typescript-eslint/typescript-eslint/issues/4538)) ([6afcaea](https://github.com/typescript-eslint/typescript-eslint/commit/6afcaea0160a1ccd1c6483ca677c544ca1b8cb4f))
- **utils:** expose `ast-utils`' helpers ([#4503](https://github.com/typescript-eslint/typescript-eslint/issues/4503)) ([f106e4b](https://github.com/typescript-eslint/typescript-eslint/commit/f106e4b95e824ebb68141bce3d3207448d50c860))
- **utils:** extract `isNotTokenOfTypeWithConditions` out of `ast-utils`' `predicates` ([#4502](https://github.com/typescript-eslint/typescript-eslint/issues/4502)) ([66501d6](https://github.com/typescript-eslint/typescript-eslint/commit/66501d6dd7e97c22c671efaa6d1ba8237907e417))

## [5.12.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.12.0...v5.12.1) (2022-02-21)

### Bug Fixes

- **eslint-plugin:** [no-unnecessary-type-arguments] fix comparison of types ([#4555](https://github.com/typescript-eslint/typescript-eslint/issues/4555)) ([fc3936e](https://github.com/typescript-eslint/typescript-eslint/commit/fc3936e99712374a707ce9e0101bc641807b9ea6))

# [5.12.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.11.0...v5.12.0) (2022-02-14)

### Bug Fixes

- **eslint-plugin:** [init-declarations] fix nested namespace ([#4544](https://github.com/typescript-eslint/typescript-eslint/issues/4544)) ([fe910e6](https://github.com/typescript-eslint/typescript-eslint/commit/fe910e61ca4bb42be3be9acb8ddcec73206754c2))
- **eslint-plugin:** [no-unnecessary-type-arguments] Use Symbol to check if it's the same type ([#4543](https://github.com/typescript-eslint/typescript-eslint/issues/4543)) ([5b7d8df](https://github.com/typescript-eslint/typescript-eslint/commit/5b7d8df149be6554c863cdd5b73c0b0b0a7960db))
- support nested object deconstructuring with type annotation ([#4548](https://github.com/typescript-eslint/typescript-eslint/issues/4548)) ([4da9278](https://github.com/typescript-eslint/typescript-eslint/commit/4da9278c80706f420d4c15a71c11c7b11d935643))

### Features

- add checking property definition for allowNames option ([#4542](https://github.com/typescript-eslint/typescript-eslint/issues/4542)) ([e32bef6](https://github.com/typescript-eslint/typescript-eslint/commit/e32bef6f6b74228c95e54a5cba1cde53d5e40623))

# [5.11.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.10.2...v5.11.0) (2022-02-07)

### Bug Fixes

- **eslint-plugin:** [no-magic-numbers] fix invalid schema merging ([#4517](https://github.com/typescript-eslint/typescript-eslint/issues/4517)) ([b95f796](https://github.com/typescript-eslint/typescript-eslint/commit/b95f79697acdd16347dc102bcb8311fe83746779))
- **eslint-plugin:** [non-nullable-type-assertion-style] fix false positive when asserting to a generic type that might be nullish ([#4509](https://github.com/typescript-eslint/typescript-eslint/issues/4509)) ([4209362](https://github.com/typescript-eslint/typescript-eslint/commit/420936274603d8fee0631cdb3b58874cb3cc59d7))

### Features

- **eslint-plugin:** [explicit-function-return-type] add allowedNames ([#4440](https://github.com/typescript-eslint/typescript-eslint/issues/4440)) ([936e252](https://github.com/typescript-eslint/typescript-eslint/commit/936e252e30cfcebdaf971cf0f66a3031e236a41c))

## [5.10.2](https://github.com/typescript-eslint/typescript-eslint/compare/v5.10.1...v5.10.2) (2022-01-31)

### Bug Fixes

- **eslint-plugin:** [no-restricted-imports] allow relative type imports with patterns configured ([#4494](https://github.com/typescript-eslint/typescript-eslint/issues/4494)) ([4a6d217](https://github.com/typescript-eslint/typescript-eslint/commit/4a6d217ae8a8f5fa1dd4bd3e3e66ba7519b4a287))

## [5.10.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.10.0...v5.10.1) (2022-01-24)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

# [5.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.9.1...v5.10.0) (2022-01-17)

### Bug Fixes

- **eslint-plugin:** [explicit-function-return-type] support AllowTypedFunctionExpression within AllowHigherOrderFunction ([#4250](https://github.com/typescript-eslint/typescript-eslint/issues/4250)) ([d053cde](https://github.com/typescript-eslint/typescript-eslint/commit/d053cde3e8b5bf9ba1c22fd64a7456d672ef77ca))
- **eslint-plugin:** [no-extra-semi] false negatives when used with eslint 8.3.0 ([#4458](https://github.com/typescript-eslint/typescript-eslint/issues/4458)) ([f4016c2](https://github.com/typescript-eslint/typescript-eslint/commit/f4016c24f9023e8a42def9501b68c4a908cbfede))
- **eslint-plugin:** [no-invalid-this] crash when used with eslint 8.7.0 ([#4448](https://github.com/typescript-eslint/typescript-eslint/issues/4448)) ([e56f1e5](https://github.com/typescript-eslint/typescript-eslint/commit/e56f1e5d52fcbf3caae43034872e0b3181871689))
- **eslint-plugin:** [no-magic-numbers] handle bigint in class props ([#4411](https://github.com/typescript-eslint/typescript-eslint/issues/4411)) ([c8e650f](https://github.com/typescript-eslint/typescript-eslint/commit/c8e650f0c124d24b24beaeb376eaf61ee8d9e6fb))
- **type-utils:** check IndexSignature internals when checking isTypeReadonly ([#4417](https://github.com/typescript-eslint/typescript-eslint/issues/4417)) ([ef3147c](https://github.com/typescript-eslint/typescript-eslint/commit/ef3147cf73767ddece91ce57f6028a83ce074b60)), closes [#4410](https://github.com/typescript-eslint/typescript-eslint/issues/4410) [#3714](https://github.com/typescript-eslint/typescript-eslint/issues/3714)
- **type-utils:** intersection types involving readonly arrays are now handled in most cases ([#4429](https://github.com/typescript-eslint/typescript-eslint/issues/4429)) ([5046882](https://github.com/typescript-eslint/typescript-eslint/commit/5046882025e3bc8cb122ecef703aebd0b5e79017))
- **type-utils:** isTypeReadonly now handles conditional types ([#4421](https://github.com/typescript-eslint/typescript-eslint/issues/4421)) ([39a6806](https://github.com/typescript-eslint/typescript-eslint/commit/39a6806c61a48bbca93f9ffb965dd8b3fe0575b3))
- **type-utils:** union types always being marked as readonly ([#4419](https://github.com/typescript-eslint/typescript-eslint/issues/4419)) ([99ab193](https://github.com/typescript-eslint/typescript-eslint/commit/99ab193bb02f181bed4ed917b1d121ed189d3fe4))

### Features

- rename `experimental-utils` to `utils` and make `experimental-utils` an alias to the new package ([#4172](https://github.com/typescript-eslint/typescript-eslint/issues/4172)) ([1d55a75](https://github.com/typescript-eslint/typescript-eslint/commit/1d55a7511b38d8e2b2eabe59f639e0a865e6c93f))
- **type-utils:** make isTypeReadonly's options param optional ([#4415](https://github.com/typescript-eslint/typescript-eslint/issues/4415)) ([3a07a56](https://github.com/typescript-eslint/typescript-eslint/commit/3a07a563c987ff25f6cd8925eeeb2ede47cc19e8))

## [5.9.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.9.0...v5.9.1) (2022-01-10)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

# [5.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.8.1...v5.9.0) (2022-01-03)

### Features

- **experimental-utils:** move isTypeReadonly from eslint-plugin to experimental-utils ([#3658](https://github.com/typescript-eslint/typescript-eslint/issues/3658)) ([a9eb0b9](https://github.com/typescript-eslint/typescript-eslint/commit/a9eb0b9eb2db291ea36065ec34f84bf5c5504b43))

## [5.8.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.8.0...v5.8.1) (2021-12-27)

### Bug Fixes

- **eslint-plugin:** [consistent-indexed-object-style] do not report for circular references ([#4347](https://github.com/typescript-eslint/typescript-eslint/issues/4347)) ([6edebcd](https://github.com/typescript-eslint/typescript-eslint/commit/6edebcda00053eecf7b3e55eeb3fe5d7fb9e7db7))
- **eslint-plugin:** [consistent-type-definitions] correct fixer with declare keyword ([#4334](https://github.com/typescript-eslint/typescript-eslint/issues/4334)) ([0cd911a](https://github.com/typescript-eslint/typescript-eslint/commit/0cd911a916805d3b1f8043584e4685f3edd5c427))
- **eslint-plugin:** [padding-line-between-statements] make function overloading is also processed ([#4345](https://github.com/typescript-eslint/typescript-eslint/issues/4345)) ([d31ec26](https://github.com/typescript-eslint/typescript-eslint/commit/d31ec264fe5f5cd27e8f522a485e106889f2d380))

# [5.8.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.7.0...v5.8.0) (2021-12-20)

### Bug Fixes

- **eslint-plugin:** [no-implied-eval] improve performance ([#4313](https://github.com/typescript-eslint/typescript-eslint/issues/4313)) ([e344596](https://github.com/typescript-eslint/typescript-eslint/commit/e3445967de6ed73e6b2334380236aed8a0ee6e4f))
- **eslint-plugin:** [padding-line-between-statements] `type` StatementTypes can't differenciate from variable ([#4270](https://github.com/typescript-eslint/typescript-eslint/issues/4270)) ([bfc4324](https://github.com/typescript-eslint/typescript-eslint/commit/bfc4324f4cda24e30b2d39d5b70f7554f2b6bf81))
- **eslint-plugin:** [strict-boolean-expression] false positive for truthy boolean ([#4275](https://github.com/typescript-eslint/typescript-eslint/issues/4275)) ([72c2e41](https://github.com/typescript-eslint/typescript-eslint/commit/72c2e418a4180f6db5795ebb42cbc095f5c53c37))
- **eslint-plugin:** `array-type` mark `AST_NODE_TYPES.TSBigIntKeyword` as simple ([#4274](https://github.com/typescript-eslint/typescript-eslint/issues/4274)) ([74e544e](https://github.com/typescript-eslint/typescript-eslint/commit/74e544e487328e56fcb7aef048a78beaad593ea0))
- **eslint-plugin:** handle method overloading in `semi` ([#4318](https://github.com/typescript-eslint/typescript-eslint/issues/4318)) ([3b87b49](https://github.com/typescript-eslint/typescript-eslint/commit/3b87b49ea8d62c2f4f3bee7494500b5ad44fcbc1))
- **experimental-utils:** support immutable members ([#3844](https://github.com/typescript-eslint/typescript-eslint/issues/3844)) ([3d33a77](https://github.com/typescript-eslint/typescript-eslint/commit/3d33a77c57e5b752edf6f35ed152038bdb230b79))

### Features

- **eslint-plugin:** [no-throw-literal] add options to to disallow `any`/`unknown` ([#4207](https://github.com/typescript-eslint/typescript-eslint/issues/4207)) ([ff0adf9](https://github.com/typescript-eslint/typescript-eslint/commit/ff0adf9e0bfbf71667c51de0a84038586e4cbfd1))
- **eslint-plugin:** [restrict-plus-operand] add allowAny option ([#4260](https://github.com/typescript-eslint/typescript-eslint/issues/4260)) ([2788545](https://github.com/typescript-eslint/typescript-eslint/commit/27885456c577dfada52d298857f406f0f332c405))

# [5.7.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.6.0...v5.7.0) (2021-12-13)

### Bug Fixes

- **typescript-estree:** type-only regression for consumers not yet on TS 4.5 ([#4272](https://github.com/typescript-eslint/typescript-eslint/issues/4272)) ([550b61e](https://github.com/typescript-eslint/typescript-eslint/commit/550b61ee1096113b234bf035dd267ba385809961))

### Features

- **eslint-plugin:** [consistent-type-exports] support TS4.5 inline export specifiers ([#4236](https://github.com/typescript-eslint/typescript-eslint/issues/4236)) ([be4d976](https://github.com/typescript-eslint/typescript-eslint/commit/be4d976215614cc032730ae596d2f6e47df67730))
- **eslint-plugin:** [consistent-type-imports] support TS4.5 inline import specifiers ([#4237](https://github.com/typescript-eslint/typescript-eslint/issues/4237)) ([f61af7c](https://github.com/typescript-eslint/typescript-eslint/commit/f61af7c53cca52f81e77b4334c7d6ad100609af6))
- **eslint-plugin:** [no-shadow] support TS4.5 inline import specifiers ([#4239](https://github.com/typescript-eslint/typescript-eslint/issues/4239)) ([96b7e8e](https://github.com/typescript-eslint/typescript-eslint/commit/96b7e8ee0f5280cab50a7205ae592e1d983a111a))

# [5.6.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.5.0...v5.6.0) (2021-12-06)

### Features

- **scope-manager:** support TS4.5 import/export specifier kind ([#4234](https://github.com/typescript-eslint/typescript-eslint/issues/4234)) ([833f822](https://github.com/typescript-eslint/typescript-eslint/commit/833f8221ce00aecb7d08c519bab9568353850f48))
- **scope-manager:** update lib types ([#4240](https://github.com/typescript-eslint/typescript-eslint/issues/4240)) ([8377e6e](https://github.com/typescript-eslint/typescript-eslint/commit/8377e6ea422ee2d52455da8955ff055e09c238d3))

# [5.5.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.4.0...v5.5.0) (2021-11-29)

### Bug Fixes

- **eslint-plugin:** [member-ordering] order literal names correctly in ([#4054](https://github.com/typescript-eslint/typescript-eslint/issues/4054)) ([d57141a](https://github.com/typescript-eslint/typescript-eslint/commit/d57141a3d13fad30a93ed99a6a15f4b0b369246a))
- **eslint-plugin:** [no-duplicate-imports] remove unnecessary type checking for `node.source` ([#4196](https://github.com/typescript-eslint/typescript-eslint/issues/4196)) ([637722a](https://github.com/typescript-eslint/typescript-eslint/commit/637722a77667f6ed1e0cf1f0e752d61622ae8546))
- **eslint-plugin:** [no-var-requires] do not report require created from createRequire ([#4221](https://github.com/typescript-eslint/typescript-eslint/issues/4221)) ([0040186](https://github.com/typescript-eslint/typescript-eslint/commit/0040186aa23692724986df22a71926e8a7ff9e02))
- **eslint-plugin:** [prefer-for-of] do nor error when iterating over this ([#4176](https://github.com/typescript-eslint/typescript-eslint/issues/4176)) ([258ddb0](https://github.com/typescript-eslint/typescript-eslint/commit/258ddb0708b7a44959bd3ac399cbde912c8021c8))
- **eslint-plugin:** [require-await] treat yield\* asynciterable as an await ([#4125](https://github.com/typescript-eslint/typescript-eslint/issues/4125)) ([5a4ce6a](https://github.com/typescript-eslint/typescript-eslint/commit/5a4ce6a241b1d6c6caad87cad85c3741f0953e39))
- **eslint-plugin:** remove all whitespaces in comparison [#4220](https://github.com/typescript-eslint/typescript-eslint/issues/4220) ([#4223](https://github.com/typescript-eslint/typescript-eslint/issues/4223)) ([853d799](https://github.com/typescript-eslint/typescript-eslint/commit/853d799428a061d9bf6a2e74b01dc49a1e4f3134))
- **experimental-utils:** export RuleCreator interfaces ([#4199](https://github.com/typescript-eslint/typescript-eslint/issues/4199)) ([7821e4c](https://github.com/typescript-eslint/typescript-eslint/commit/7821e4c515ca2f11a14dcfa94dc77370da0287c5))
- **experimental-utils:** fix types for eslint-utils ([#4173](https://github.com/typescript-eslint/typescript-eslint/issues/4173)) ([7079de2](https://github.com/typescript-eslint/typescript-eslint/commit/7079de26877a2313a7019845d4c33d0fc4d4b4a9))
- **scope-manager:** support static class blocks ([#4211](https://github.com/typescript-eslint/typescript-eslint/issues/4211)) ([f8e9125](https://github.com/typescript-eslint/typescript-eslint/commit/f8e91256e0a721aaa906a5c40a92784da9433b53))
- **visitor-keys:** add missing import assertion keys ([#4178](https://github.com/typescript-eslint/typescript-eslint/issues/4178)) ([9c38b7f](https://github.com/typescript-eslint/typescript-eslint/commit/9c38b7f7fc3ce471a8f720c4a2fbce01f3ee12a4))

### Features

- **eslint-plugin:** [member-ordering] add option to sort case insensitive ([#3896](https://github.com/typescript-eslint/typescript-eslint/issues/3896)) ([e3533d5](https://github.com/typescript-eslint/typescript-eslint/commit/e3533d5a6293a358b5eb0a6ed17da961a09b0ed3))
- **eslint-plugin:** `array-type` distinguish whether readonly or not ([#4066](https://github.com/typescript-eslint/typescript-eslint/issues/4066)) ([314af44](https://github.com/typescript-eslint/typescript-eslint/commit/314af44bde3ccbebc620625b2931d77688525976))

# [5.4.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.3.1...v5.4.0) (2021-11-15)

### Bug Fixes

- correct issues with circular imports ([#4140](https://github.com/typescript-eslint/typescript-eslint/issues/4140)) ([4c87b24](https://github.com/typescript-eslint/typescript-eslint/commit/4c87b2486a9c90794d972a4d093c1dc22ffb418b))
- **eslint-plugin:** [explicit-member-accessibility] private fields cannot have accessibility modifiers ([#4117](https://github.com/typescript-eslint/typescript-eslint/issues/4117)) ([81b25c1](https://github.com/typescript-eslint/typescript-eslint/commit/81b25c12eceae89e181a7bdb3c8298d820cfe3e3))
- **eslint-plugin:** [no-implied-eval] ignore locally declared functions ([#4049](https://github.com/typescript-eslint/typescript-eslint/issues/4049)) ([d97140e](https://github.com/typescript-eslint/typescript-eslint/commit/d97140ecf4aeb0a1f8b391f46a31881f21ad93c3))
- **eslint-plugin:** check optional chaining for floating promises ([#4096](https://github.com/typescript-eslint/typescript-eslint/issues/4096)) ([d724777](https://github.com/typescript-eslint/typescript-eslint/commit/d7247770886c619263482c3e083bed9f97b22688))
- landing page title duplication ([#4123](https://github.com/typescript-eslint/typescript-eslint/issues/4123)) ([844c25e](https://github.com/typescript-eslint/typescript-eslint/commit/844c25e7b6ef9d79aec99d538252e82557f012d3))

### Features

- add RuleCreator.withoutDocs ([#4136](https://github.com/typescript-eslint/typescript-eslint/issues/4136)) ([87cfc6a](https://github.com/typescript-eslint/typescript-eslint/commit/87cfc6ad3e3312d7b6f98a592fb37e69d5d6880a))
- **experimental-utils:** add default [] for RuleModule TOptions generic ([#4135](https://github.com/typescript-eslint/typescript-eslint/issues/4135)) ([62b8098](https://github.com/typescript-eslint/typescript-eslint/commit/62b8098fa7d361954c170ee6c190e47e95194b13))
- **typescript-estree:** support Import Assertions ([#4074](https://github.com/typescript-eslint/typescript-eslint/issues/4074)) ([ae0fb5a](https://github.com/typescript-eslint/typescript-eslint/commit/ae0fb5a591958216b7df656e66b1dfe464898167))
- **typescript-estree:** support private fields in-in syntax ([#4075](https://github.com/typescript-eslint/typescript-eslint/issues/4075)) ([939d8ea](https://github.com/typescript-eslint/typescript-eslint/commit/939d8eac547fb1734aa00f1ea01cc6eae0b4280a))
- **typescript-estree:** support type-only module specifiers ([#4076](https://github.com/typescript-eslint/typescript-eslint/issues/4076)) ([77baa92](https://github.com/typescript-eslint/typescript-eslint/commit/77baa9203638e888a76e21003a278a8da386e133))

## [5.3.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.3.0...v5.3.1) (2021-11-08)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

# [5.3.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.2.0...v5.3.0) (2021-11-01)

### Bug Fixes

- **eslint-plugin:** ignore private identifiers in explicit-module-boundary-types ([#4046](https://github.com/typescript-eslint/typescript-eslint/issues/4046)) ([80b853d](https://github.com/typescript-eslint/typescript-eslint/commit/80b853db90ae3d4e32c4b7ec9d45a5c41dc459c9))
- **eslint-plugin:** skip seenTypes for unions in isTypeReadonly ([#4043](https://github.com/typescript-eslint/typescript-eslint/issues/4043)) ([6af7ca7](https://github.com/typescript-eslint/typescript-eslint/commit/6af7ca7d9fde230342d27ad5a75a09a58c022974))
- **experimental-utils:** add `name` property to test case interface ([#4067](https://github.com/typescript-eslint/typescript-eslint/issues/4067)) ([f3021c9](https://github.com/typescript-eslint/typescript-eslint/commit/f3021c94460e8d06e4169335bcc1a23854531f2a))

### Features

- **eslint-plugin:** [no-shadow] exclude external type declaration merging ([#3959](https://github.com/typescript-eslint/typescript-eslint/issues/3959)) ([a93cebf](https://github.com/typescript-eslint/typescript-eslint/commit/a93cebfc0f2026c50972bcb110bcd3295ba9a44d))
- **experimental-utils:** extract `isTokenOfTypeWithConditions` out of `ast-utils`' `predicates` ([#3977](https://github.com/typescript-eslint/typescript-eslint/issues/3977)) ([5229597](https://github.com/typescript-eslint/typescript-eslint/commit/5229597d9bfc998852c4b4fb421859e8f3d3d688))

# [5.2.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.1.0...v5.2.0) (2021-10-25)

### Bug Fixes

- **eslint-plugin:** [typedef] fix regression with class properties ([#4034](https://github.com/typescript-eslint/typescript-eslint/issues/4034)) ([fe53d22](https://github.com/typescript-eslint/typescript-eslint/commit/fe53d22f57ad418397fb31fa89c97db0ab4cd6c0)), closes [#4033](https://github.com/typescript-eslint/typescript-eslint/issues/4033)

### Features

- **eslint-plugin:** adding `consistent-type-exports` rule ([#3936](https://github.com/typescript-eslint/typescript-eslint/issues/3936)) ([1971a3f](https://github.com/typescript-eslint/typescript-eslint/commit/1971a3f8027416cd1fb33b1d50faa035599917de))

# [5.1.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.0.0...v5.1.0) (2021-10-18)

### Bug Fixes

- **eslint-plugin:** [no-restricted-imports]: report type-only imports properly ([#3996](https://github.com/typescript-eslint/typescript-eslint/issues/3996)) ([283cdf2](https://github.com/typescript-eslint/typescript-eslint/commit/283cdf26e6b32985531ff6416cd13ef4cb0a3c8c))
- **eslint-plugin:** [strict-bool-expr] treat unconstrained generic as any ([#3981](https://github.com/typescript-eslint/typescript-eslint/issues/3981)) ([9b29ca7](https://github.com/typescript-eslint/typescript-eslint/commit/9b29ca751f496c25240c0c14b8fa432bf4443d39))
- **typescript-estree:** support private optional property definition ([#3997](https://github.com/typescript-eslint/typescript-eslint/issues/3997)) ([8605e08](https://github.com/typescript-eslint/typescript-eslint/commit/8605e080a4dac4a277e6108cd9ed1e5a707302fa))

### Features

- **experimental-utils:** extract `ast-utils`' `predicates`' helpers ([#3976](https://github.com/typescript-eslint/typescript-eslint/issues/3976)) ([154ec9a](https://github.com/typescript-eslint/typescript-eslint/commit/154ec9aea8e81732cafe36af97c4822f1591b077))

# [5.0.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.33.0...v5.0.0) (2021-10-11)

### Bug Fixes

- **eslint-plugin:** [explicit-member-accessibility] report `TSAbstractPropertyDefinition` and `TSAbstractMethodDefinition` properly ([#3901](https://github.com/typescript-eslint/typescript-eslint/issues/3901)) ([82016f9](https://github.com/typescript-eslint/typescript-eslint/commit/82016f99b14825c9c60e1f7eb3b4efcc492bba86))
- **eslint-plugin:** update new rules from master ([#3840](https://github.com/typescript-eslint/typescript-eslint/issues/3840)) ([d88a6b4](https://github.com/typescript-eslint/typescript-eslint/commit/d88a6b44eedcf9dd59569160570aa118851aa86b))
- update new rules from master ([b34fb7e](https://github.com/typescript-eslint/typescript-eslint/commit/b34fb7eb3102ea603bb4aef0dbbf9885b3d47557))
- **eslint-plugin:** crash in no-dupe-class-members (v5) ([#3813](https://github.com/typescript-eslint/typescript-eslint/issues/3813)) ([4b09644](https://github.com/typescript-eslint/typescript-eslint/commit/4b096442f731c0a60926ac0391a4f2c4208aa8d4))
- **experimental-utils:** fix `isSetter`'s return type ([#3975](https://github.com/typescript-eslint/typescript-eslint/issues/3975)) ([d256856](https://github.com/typescript-eslint/typescript-eslint/commit/d2568561d0417fdfbdfd964ad942f9d00434af73))
- **typescript-estree:** change `source` of ExportNamedDeclaration to Literal from Expression ([#3763](https://github.com/typescript-eslint/typescript-eslint/issues/3763)) ([dc5a0f5](https://github.com/typescript-eslint/typescript-eslint/commit/dc5a0f5104b400f4422b8d67ecfc6cc7a32613a2))

### Features

- **ast-spec:** bring `Node` objects in line with ESTree ([#3771](https://github.com/typescript-eslint/typescript-eslint/issues/3771)) ([dd14064](https://github.com/typescript-eslint/typescript-eslint/commit/dd140643b457aa515cc21fcda2b3cd4acc2a1c5c))
- **eslint-plugin:** remove `object` from `ban-types`' default types ([#3818](https://github.com/typescript-eslint/typescript-eslint/issues/3818)) ([ae3fa90](https://github.com/typescript-eslint/typescript-eslint/commit/ae3fa900d5b4e1f557a52ca58d35a7d098d9efaf))
- **eslint-plugin:** removed value from abstract property nodes ([#3765](https://github.com/typescript-eslint/typescript-eslint/issues/3765)) ([5823524](https://github.com/typescript-eslint/typescript-eslint/commit/58235241714596b641a1e8b39c569e561e0039b4)), closes [#3748](https://github.com/typescript-eslint/typescript-eslint/issues/3748)
- **eslint-plugin:** update recommended configs ([#3809](https://github.com/typescript-eslint/typescript-eslint/issues/3809)) ([deeb7bb](https://github.com/typescript-eslint/typescript-eslint/commit/deeb7bb9334d301c6af56aefd37d318231af11ef))
- align class property representation with ESTree ([#3806](https://github.com/typescript-eslint/typescript-eslint/issues/3806)) ([22fa5c0](https://github.com/typescript-eslint/typescript-eslint/commit/22fa5c0c4705ed2898f00b7cacc5dd642d859275)), closes [#3430](https://github.com/typescript-eslint/typescript-eslint/issues/3430) [#3077](https://github.com/typescript-eslint/typescript-eslint/issues/3077)
- remove `meta.docs.category` from rules ([#3800](https://github.com/typescript-eslint/typescript-eslint/issues/3800)) ([71c9370](https://github.com/typescript-eslint/typescript-eslint/commit/71c93706e55f5f92a1285102b93c6ab1950c6df4))
- remove `TSParenthesizedType` ([#3340](https://github.com/typescript-eslint/typescript-eslint/issues/3340)) ([c8ee432](https://github.com/typescript-eslint/typescript-eslint/commit/c8ee43269faea4c04ec02eaa2b81a0aa6eec5d3e)), closes [#3136](https://github.com/typescript-eslint/typescript-eslint/issues/3136)
- support `PrivateIdentifier` ([#3808](https://github.com/typescript-eslint/typescript-eslint/issues/3808)) ([0eefe5e](https://github.com/typescript-eslint/typescript-eslint/commit/0eefe5e49d21af3f1e3e2d9a90c2e49929863ac2)), closes [#3430](https://github.com/typescript-eslint/typescript-eslint/issues/3430) [#2933](https://github.com/typescript-eslint/typescript-eslint/issues/2933)
- **eslint-plugin:** [comma-dangle] align schema with ESLint v8 ([#3768](https://github.com/typescript-eslint/typescript-eslint/issues/3768)) ([0acfafc](https://github.com/typescript-eslint/typescript-eslint/commit/0acfafcc655e28dcfc05a5caa567c0d0217ee7ad))
- **eslint-plugin:** [member-ordering] add support for getters and setters ([#3611](https://github.com/typescript-eslint/typescript-eslint/issues/3611)) ([e264124](https://github.com/typescript-eslint/typescript-eslint/commit/e2641246571b69df36cde5cb7bce7c4fffc43f98))
- **eslint-plugin:** remove `no-unused-vars-experimental` ([79ae03b](https://github.com/typescript-eslint/typescript-eslint/commit/79ae03b8adbae2b0a86276711a9c834af01bbb61))
- **experimental-utils:** extract `isNodeOfTypes` out of `ast-utils`' `predicates` ([#3836](https://github.com/typescript-eslint/typescript-eslint/issues/3836)) ([0cc509b](https://github.com/typescript-eslint/typescript-eslint/commit/0cc509b61df248cfb4b42fe64ec800f3cac69c69))
- **typescript-estree:** remove legacy `useJSXTextNode` option ([#3109](https://github.com/typescript-eslint/typescript-eslint/issues/3109)) ([5b84b98](https://github.com/typescript-eslint/typescript-eslint/commit/5b84b98fb3cf68d944b7d4e970f39f4e88f0b2d5))
- support ESLint v8 ([#3737](https://github.com/typescript-eslint/typescript-eslint/issues/3737)) ([4ca62ae](https://github.com/typescript-eslint/typescript-eslint/commit/4ca62aee6681d706e762a8db727541ca204364f2))
- **experimental-utils:** remove `getComments` from `ESLint` `SourceCode` types ([#3766](https://github.com/typescript-eslint/typescript-eslint/issues/3766)) ([165a507](https://github.com/typescript-eslint/typescript-eslint/commit/165a507970d8e4a0ed12abdd5f0d892f7de83ffe))

### BREAKING CHANGES

- **eslint-plugin:** `ban-types` no longer reports `object` by default

# [4.33.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.32.0...v4.33.0) (2021-10-04)

### Bug Fixes

- **eslint-plugin:** [lines-between-class-members] fix `exceptAfterOverload` for abstract methods ([#3943](https://github.com/typescript-eslint/typescript-eslint/issues/3943)) ([240fc65](https://github.com/typescript-eslint/typescript-eslint/commit/240fc65c307769eae9b35e611fca74ba4c35a025))
- **eslint-plugin:** [no-confusing-void-expression] support optional chaining ([#3937](https://github.com/typescript-eslint/typescript-eslint/issues/3937)) ([c40dd13](https://github.com/typescript-eslint/typescript-eslint/commit/c40dd13df76b77052c85254622df5533307dc07e))
- **eslint-plugin:** [no-restricted-imports] fix crash when no options given ([#3947](https://github.com/typescript-eslint/typescript-eslint/issues/3947)) ([edaa3c1](https://github.com/typescript-eslint/typescript-eslint/commit/edaa3c10eb67bb89f9c6a78bd1ed593925c33f16))
- **eslint-plugin:** [non-nullable-type-assertion-style] false-positive with non-nullish `as` assertions and types ([#3940](https://github.com/typescript-eslint/typescript-eslint/issues/3940)) ([40760f9](https://github.com/typescript-eslint/typescript-eslint/commit/40760f98da0d23c7bce3da04cf37a56c10447bde))
- **eslint-plugin:** [padding-line-between-statements] TSModuleBlock should change scope ([#3944](https://github.com/typescript-eslint/typescript-eslint/issues/3944)) ([f8f534e](https://github.com/typescript-eslint/typescript-eslint/commit/f8f534e42b0ec517274442422c37ab019cf3c200))
- **eslint-plugin:** [prefer-regexp-exec] check `RegExp` without flags ([#3946](https://github.com/typescript-eslint/typescript-eslint/issues/3946)) ([0868725](https://github.com/typescript-eslint/typescript-eslint/commit/0868725713e8102e8932303d4c680340688e1fa9))
- **experimental-utils:** add `getPhysicalFilename()` to `RuleContext` ([#3934](https://github.com/typescript-eslint/typescript-eslint/issues/3934)) ([ee5dfd4](https://github.com/typescript-eslint/typescript-eslint/commit/ee5dfd4989ab465d65ba3424e36b7f0964558191))
- **experimental-utils:** require fix in suggestions ([#3949](https://github.com/typescript-eslint/typescript-eslint/issues/3949)) ([f022fb1](https://github.com/typescript-eslint/typescript-eslint/commit/f022fb14c71dad25be2314252eb751964f34fcb8))

### Features

- **experimental-utils:** extract `isNodeOfTypeWithConditions` out of `ast-utils`' `predicates` ([#3837](https://github.com/typescript-eslint/typescript-eslint/issues/3837)) ([214f898](https://github.com/typescript-eslint/typescript-eslint/commit/214f898178ba593146d06a444487d32ec3363854))

# [4.32.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.31.2...v4.32.0) (2021-09-27)

### Bug Fixes

- **eslint-plugin:** [consistent-type-definitions] correct fix for `export default` ([#3899](https://github.com/typescript-eslint/typescript-eslint/issues/3899)) ([ebb33ed](https://github.com/typescript-eslint/typescript-eslint/commit/ebb33ed8bc29f69ca2a657ec5b31857c0aeb4b56))
- **eslint-plugin:** [no-require-imports] report only global `require` ([#3871](https://github.com/typescript-eslint/typescript-eslint/issues/3871)) ([8aa87a1](https://github.com/typescript-eslint/typescript-eslint/commit/8aa87a136e7cd7b40fbf09fcfa26bf04d1c6d5fe))
- **eslint-plugin:** [no-shadow] ignore type-only imports properly ([#3868](https://github.com/typescript-eslint/typescript-eslint/issues/3868)) ([dda9cee](https://github.com/typescript-eslint/typescript-eslint/commit/dda9cee68a5cd78b358a854027999c739ac623e9))
- **eslint-plugin:** [no-var-requires] report problems within `NewExpression` ([#3884](https://github.com/typescript-eslint/typescript-eslint/issues/3884)) ([ed5e459](https://github.com/typescript-eslint/typescript-eslint/commit/ed5e45983fa052accf3a7b5fcdbfcb15ed09490f))
- **eslint-plugin:** [padding-line-between-statements] problems within namespaces not being reported ([#3869](https://github.com/typescript-eslint/typescript-eslint/issues/3869)) ([1861356](https://github.com/typescript-eslint/typescript-eslint/commit/186135698b40b510ffff6a2402aa34f2726596ea))
- **eslint-plugin:** [prefer-regexp-exec] respect flags when using `RegExp` ([#3855](https://github.com/typescript-eslint/typescript-eslint/issues/3855)) ([ffdb5ff](https://github.com/typescript-eslint/typescript-eslint/commit/ffdb5ff9900e07374a2f3686447e3e2c78fbc38a))
- **eslint-plugin:** [prefer-return-this-type] handle generics properly in fixer ([#3852](https://github.com/typescript-eslint/typescript-eslint/issues/3852)) ([9e98b8f](https://github.com/typescript-eslint/typescript-eslint/commit/9e98b8f43ca6aadc9758a4e9a0d1d3c250af6cca))
- **eslint-plugin:** false-positive/negative with array index in no-unnecessary-condition ([#3805](https://github.com/typescript-eslint/typescript-eslint/issues/3805)) ([bdb8f0b](https://github.com/typescript-eslint/typescript-eslint/commit/bdb8f0be1466e4a4b713e91199be91030650ed01))
- **experimental-utils:** add missing signature for `isParenthesized` ([#3887](https://github.com/typescript-eslint/typescript-eslint/issues/3887)) ([806eaac](https://github.com/typescript-eslint/typescript-eslint/commit/806eaac6af5325664634690e9ebd7ffaed276549))

### Features

- **eslint-plugin:** [no-type-alias]: add allowGenerics option ([#3865](https://github.com/typescript-eslint/typescript-eslint/issues/3865)) ([4195919](https://github.com/typescript-eslint/typescript-eslint/commit/41959199735a6d4fe3ae7825f3087e8fb249be9f))
- **eslint-plugin:** add `no-non-null-asserted-nullish-coalescing` rule ([#3349](https://github.com/typescript-eslint/typescript-eslint/issues/3349)) ([4e99961](https://github.com/typescript-eslint/typescript-eslint/commit/4e999614e9761f6dc7e5aa0c5bad76ab164ab3fb))
- **eslint-plugin:** add new extended rule `no-restricted-imports` ([#3775](https://github.com/typescript-eslint/typescript-eslint/issues/3775)) ([ec5d506](https://github.com/typescript-eslint/typescript-eslint/commit/ec5d50696b249a207d322e4a2fc66582122eb010))
- **eslint-plugin-internal:** [prefer-ast-types-enum] add `DefinitionType` enum ([#3916](https://github.com/typescript-eslint/typescript-eslint/issues/3916)) ([13b7de5](https://github.com/typescript-eslint/typescript-eslint/commit/13b7de508e0f8eac492879ff9ab99acd8d3e977e))
- Support `'latest'` as `ecmaVersion` ([#3873](https://github.com/typescript-eslint/typescript-eslint/issues/3873)) ([25a42c0](https://github.com/typescript-eslint/typescript-eslint/commit/25a42c0bbe92d1ecbc2e8ff9ef3a3ef413f728b0))

## [4.31.2](https://github.com/typescript-eslint/typescript-eslint/compare/v4.31.1...v4.31.2) (2021-09-20)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [4.31.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.31.0...v4.31.1) (2021-09-13)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

# [4.31.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.30.0...v4.31.0) (2021-09-06)

### Bug Fixes

- **ast-spec:** remove duplicate union types from `Expression` ([#3770](https://github.com/typescript-eslint/typescript-eslint/issues/3770)) ([463e768](https://github.com/typescript-eslint/typescript-eslint/commit/463e768978731d019345f6552d7fd7a073a80192))
- **utils:** support immutable arrays in `ReportFixFunction` ([#3830](https://github.com/typescript-eslint/typescript-eslint/issues/3830)) ([8218055](https://github.com/typescript-eslint/typescript-eslint/commit/8218055d6dfd94c9e6c8645848f981d9d51ce08c))

### Features

- **eslint-plugin:** [prefer-readonly-parameter-types] add option treatMethodsAsReadonly ([#3733](https://github.com/typescript-eslint/typescript-eslint/issues/3733)) ([a46e318](https://github.com/typescript-eslint/typescript-eslint/commit/a46e3182c8a0b07c914605d6d9fe28ef36a7c32a))
- **eslint-plugin:** [restrict-template-expressions] add option to allow RegExp ([#3709](https://github.com/typescript-eslint/typescript-eslint/issues/3709)) ([363b3dc](https://github.com/typescript-eslint/typescript-eslint/commit/363b3dc4dd0dc343311c729d75935b10f9d2fd5e))
- **eslint-plugin:** add `no-meaningless-void-operator` rule ([#3641](https://github.com/typescript-eslint/typescript-eslint/issues/3641)) ([ea40ab6](https://github.com/typescript-eslint/typescript-eslint/commit/ea40ab659351ae7cf7235ea063d42ac155b11e5f))
- **eslint-plugin:** add extension rule `padding-line-between-statements` ([#3418](https://github.com/typescript-eslint/typescript-eslint/issues/3418)) ([f79ae9b](https://github.com/typescript-eslint/typescript-eslint/commit/f79ae9b58e82f4fddef640a34a1d7ff92b763e65))
- **experimental-utils:** extract `isNodeOfType` out of `ast-utils`' `predicates` ([#3677](https://github.com/typescript-eslint/typescript-eslint/issues/3677)) ([4bfa437](https://github.com/typescript-eslint/typescript-eslint/commit/4bfa4375aff8f65057d4aa116e435803cbc6b464))

# [4.30.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.29.3...v4.30.0) (2021-08-30)

### Bug Fixes

- **eslint-plugin:** [dot-notation] false positive with optional chaining ([#3711](https://github.com/typescript-eslint/typescript-eslint/issues/3711)) ([c19fc6e](https://github.com/typescript-eslint/typescript-eslint/commit/c19fc6e03072ed549bc9b35ebe6961e10f8f9b43)), closes [#3510](https://github.com/typescript-eslint/typescript-eslint/issues/3510)
- **eslint-plugin:** [prefer-reduce-type-parameter] handle already existing type params ([#3706](https://github.com/typescript-eslint/typescript-eslint/issues/3706)) ([71dd273](https://github.com/typescript-eslint/typescript-eslint/commit/71dd27361a1bc93b5d5eb2279d805922b10002fd))
- **eslint-plugin:** isTypeReadonly error with <TS3.7 ([#3731](https://github.com/typescript-eslint/typescript-eslint/issues/3731)) ([5696407](https://github.com/typescript-eslint/typescript-eslint/commit/569640739999d85111def13ac7ba1d16e02f10b8))
- **visitor-keys:** add key to StaticBlock (v5) ([#3812](https://github.com/typescript-eslint/typescript-eslint/issues/3812)) ([fa35e22](https://github.com/typescript-eslint/typescript-eslint/commit/fa35e22702207baf07acb3eec11d3383721bf6b6))

### Features

- **experimental-utils:** add literal types to `global` option ([#3634](https://github.com/typescript-eslint/typescript-eslint/issues/3634)) ([820965c](https://github.com/typescript-eslint/typescript-eslint/commit/820965c41c58be918770ff6bbae313c0cfc75d3c))
- **typescript-estree:** add support for class static blocks ([#3730](https://github.com/typescript-eslint/typescript-eslint/issues/3730)) ([f81831b](https://github.com/typescript-eslint/typescript-eslint/commit/f81831bd279a32da6dbab0f1c061053ea43965f6))

## [4.29.3](https://github.com/typescript-eslint/typescript-eslint/compare/v4.29.2...v4.29.3) (2021-08-23)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [4.29.2](https://github.com/typescript-eslint/typescript-eslint/compare/v4.29.1...v4.29.2) (2021-08-16)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [4.29.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.29.0...v4.29.1) (2021-08-09)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

# [4.29.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.28.5...v4.29.0) (2021-08-02)

### Bug Fixes

- **eslint-plugin:** [no-implied-eval] handle bind on nested member expressions ([#3598](https://github.com/typescript-eslint/typescript-eslint/issues/3598)) ([f5a6806](https://github.com/typescript-eslint/typescript-eslint/commit/f5a6806ae4291f540eef73cd5c182c985c5059e7))
- **eslint-plugin:** [no-implied-eval] permit more expression types ([#3624](https://github.com/typescript-eslint/typescript-eslint/issues/3624)) ([ca7c549](https://github.com/typescript-eslint/typescript-eslint/commit/ca7c549426d885ecb43cc8fe99518e58041ad152))
- **eslint-plugin:** [no-unnecessary-boolean-literal-compare] incorrect fix when condition is reversed ([#3581](https://github.com/typescript-eslint/typescript-eslint/issues/3581)) ([b595575](https://github.com/typescript-eslint/typescript-eslint/commit/b595575ccef7bceb04c6317fb903f4bedeb19a69))
- **eslint-plugin:** [return-await] handle nested functions correctly ([#3601](https://github.com/typescript-eslint/typescript-eslint/issues/3601)) ([4a196b5](https://github.com/typescript-eslint/typescript-eslint/commit/4a196b5818bb8557a7d3c5abae81fbd8021d9cb9))
- **eslint-plugin:** [return-await] properly handle fixes for `TSAsExpression` ([#3631](https://github.com/typescript-eslint/typescript-eslint/issues/3631)) ([00a4369](https://github.com/typescript-eslint/typescript-eslint/commit/00a436986ceb2520fdeb7efed9ad8b2d866700b7))
- **experimental-utils:** simplify `eslint-utils`' `findVariable`'s signature in `ast-utils` ([#3574](https://github.com/typescript-eslint/typescript-eslint/issues/3574)) ([3ef5267](https://github.com/typescript-eslint/typescript-eslint/commit/3ef5267b850e1ffb7115e263e89a98c455fd2532))
- **typescript-estree:** correct tty check ([#3635](https://github.com/typescript-eslint/typescript-eslint/issues/3635)) ([62bcc93](https://github.com/typescript-eslint/typescript-eslint/commit/62bcc937f08cd18296ffbe96a3551ec1fb87aecd))
- **typescript-estree:** ensure --fix works with singleRun mode ([#3655](https://github.com/typescript-eslint/typescript-eslint/issues/3655)) ([99eca0d](https://github.com/typescript-eslint/typescript-eslint/commit/99eca0d428187d4c29ded9ddd1b57b40ab463c01))

### Features

- **ast-spec:** extract `ExportKind` & `ImportKind` ([#3564](https://github.com/typescript-eslint/typescript-eslint/issues/3564)) ([120d566](https://github.com/typescript-eslint/typescript-eslint/commit/120d566c980c61d3823fbe8b2db30d76b8c31140))
- **ast-spec:** make `BaseNode` & `BaseToken` more type-safe ([#3560](https://github.com/typescript-eslint/typescript-eslint/issues/3560)) ([a6c5604](https://github.com/typescript-eslint/typescript-eslint/commit/a6c5604b65b6330d047aa016fc46b8a597a6ae58))
- **eslint-plugin:** [no-redeclare] ignoreDeclarationMerge of enum+namespace ([#3572](https://github.com/typescript-eslint/typescript-eslint/issues/3572)) ([18e30cb](https://github.com/typescript-eslint/typescript-eslint/commit/18e30cb601ee4e990d6becdfb9d98ae8119b7919))
- **eslint-plugin:** [prefer-return-this-type] add a new rule ([#3228](https://github.com/typescript-eslint/typescript-eslint/issues/3228)) ([5e1a615](https://github.com/typescript-eslint/typescript-eslint/commit/5e1a61500472ff186eede686b2257464476d3d87))
- **eslint-plugin:** Catch unused React import with new JSX transform ([#3577](https://github.com/typescript-eslint/typescript-eslint/issues/3577)) ([02998ea](https://github.com/typescript-eslint/typescript-eslint/commit/02998eac510665758b9a093d43afc310f3ac980d))
- **typescript-estree:** add support for custom module resolution ([#3516](https://github.com/typescript-eslint/typescript-eslint/issues/3516)) ([d48429d](https://github.com/typescript-eslint/typescript-eslint/commit/d48429d97326545bb727f88ce9056270b1599a31))

## [4.28.5](https://github.com/typescript-eslint/typescript-eslint/compare/v4.28.4...v4.28.5) (2021-07-26)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [4.28.4](https://github.com/typescript-eslint/typescript-eslint/compare/v4.28.3...v4.28.4) (2021-07-19)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [4.28.3](https://github.com/typescript-eslint/typescript-eslint/compare/v4.28.2...v4.28.3) (2021-07-12)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [4.28.2](https://github.com/typescript-eslint/typescript-eslint/compare/v4.28.1...v4.28.2) (2021-07-05)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [4.28.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.28.0...v4.28.1) (2021-06-28)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

# [4.28.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.27.0...v4.28.0) (2021-06-21)

### Bug Fixes

- **eslint-plugin:** [prefer-regexp-exec] factor in union types ([#3434](https://github.com/typescript-eslint/typescript-eslint/issues/3434)) ([ac86a79](https://github.com/typescript-eslint/typescript-eslint/commit/ac86a79bd416f031beccc7bdac28a938cb354ba5))
- **experimental-utils:** expand `RuleTester` config properties ([#3557](https://github.com/typescript-eslint/typescript-eslint/issues/3557)) ([ffbb3cf](https://github.com/typescript-eslint/typescript-eslint/commit/ffbb3cff18bc78467e70e794f9b1f0e79be4aff7))
- **experimental-utils:** fix `eslint-utils`' negative predicates' return types ([#3462](https://github.com/typescript-eslint/typescript-eslint/issues/3462)) ([1e6016b](https://github.com/typescript-eslint/typescript-eslint/commit/1e6016b356ae40e4636a3cbe41fa02b6a61403ee))
- **experimental-utils:** fix `eslint-utils`' negative predicates' return types in `ast-utils` ([#3461](https://github.com/typescript-eslint/typescript-eslint/issues/3461)) ([614b0a3](https://github.com/typescript-eslint/typescript-eslint/commit/614b0a38b4163eb4667cce7a415d534222d15dd3))
- **experimental-utils:** make keys for `ReferenceTracker` options optional ([#3531](https://github.com/typescript-eslint/typescript-eslint/issues/3531)) ([a7fd7bb](https://github.com/typescript-eslint/typescript-eslint/commit/a7fd7bb25584cb3f72f0339025dc76efa6cccceb))

### Features

- **experimental-utils:** add `only` property to `RuleTester` types ([#3555](https://github.com/typescript-eslint/typescript-eslint/issues/3555)) ([2a36e3e](https://github.com/typescript-eslint/typescript-eslint/commit/2a36e3e737f935cc6b967befb022d10a83c8bc9b))
- **experimental-utils:** expose ReferenceTracker.ESM ([#3532](https://github.com/typescript-eslint/typescript-eslint/issues/3532)) ([4ac67c4](https://github.com/typescript-eslint/typescript-eslint/commit/4ac67c4c9401c5ce0e947a6409efbc11afe1eb3b))
- **experimental-utils:** use mergable interface for `settings` property ([#3556](https://github.com/typescript-eslint/typescript-eslint/issues/3556)) ([abfc19b](https://github.com/typescript-eslint/typescript-eslint/commit/abfc19bf9364d881bdf594ee166a1deb23240630))

# [4.27.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.26.1...v4.27.0) (2021-06-14)

### Bug Fixes

- **eslint-plugin:** allow explicit any for no-unsafe-return ([#3498](https://github.com/typescript-eslint/typescript-eslint/issues/3498)) ([b15a2b2](https://github.com/typescript-eslint/typescript-eslint/commit/b15a2b2a02dc9af2b47b77eb3aede73ffa85ac66))
- **typescript-estree:** allow providing more one than one existing program in config ([#3508](https://github.com/typescript-eslint/typescript-eslint/issues/3508)) ([4f1806e](https://github.com/typescript-eslint/typescript-eslint/commit/4f1806e548affb7265da360d1fc8d033e25de325))
- **typescript-estree:** support override modifier for parameter property ([#3485](https://github.com/typescript-eslint/typescript-eslint/issues/3485)) ([33b9f69](https://github.com/typescript-eslint/typescript-eslint/commit/33b9f69a681cd3219a2acca5b0b2fa67609f099e))

### Features

- **ast-spec:** specify `LogicalExpression`'s `operator` type ([#3497](https://github.com/typescript-eslint/typescript-eslint/issues/3497)) ([9e343fd](https://github.com/typescript-eslint/typescript-eslint/commit/9e343fdaa0b04ed007b873c781e8cc98fc1fb7f5))
- **ast-spec:** specify `PunctuatorToken`'s `value` type ([#3496](https://github.com/typescript-eslint/typescript-eslint/issues/3496)) ([fdb1d81](https://github.com/typescript-eslint/typescript-eslint/commit/fdb1d81f0fcf75a9216e6a90469f18c24c91f718))
- **eslint-plugin:** [prefer-literal-enum-member] add allowBitwiseExpressions option ([#3515](https://github.com/typescript-eslint/typescript-eslint/issues/3515)) ([288092a](https://github.com/typescript-eslint/typescript-eslint/commit/288092a085fdd9abaffe0aa1d0b37a8844dd86ff))
- **typescript-estree:** add opt-in inference for single runs and create programs for projects up front ([#3512](https://github.com/typescript-eslint/typescript-eslint/issues/3512)) ([06c2d9b](https://github.com/typescript-eslint/typescript-eslint/commit/06c2d9ba5442330f56637ecb14fae7e41696699c))
- allow user to provide TS program instance in parser options ([#3484](https://github.com/typescript-eslint/typescript-eslint/issues/3484)) ([e855b18](https://github.com/typescript-eslint/typescript-eslint/commit/e855b18b8feee0edb5c617c11006861426a6f530))

## [4.26.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.26.0...v4.26.1) (2021-06-07)

### Bug Fixes

- **eslint-plugin:** [prefer-includes] ignore option chaining before indexOfs ([#3432](https://github.com/typescript-eslint/typescript-eslint/issues/3432)) ([bf0cddb](https://github.com/typescript-eslint/typescript-eslint/commit/bf0cddbe5291bbc03e2d79aa680f93680222b67f))
- **eslint-plugin:** fix doc url generation ([#3475](https://github.com/typescript-eslint/typescript-eslint/issues/3475)) ([fc5f171](https://github.com/typescript-eslint/typescript-eslint/commit/fc5f171b1ade2b45a1a4268b6d22926d420282a6)), closes [#3473](https://github.com/typescript-eslint/typescript-eslint/issues/3473)

# [4.26.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.25.0...v4.26.0) (2021-05-31)

### Bug Fixes

- **eslint-plugin:** [no-type-alias] consider type imports as alias types ([#3433](https://github.com/typescript-eslint/typescript-eslint/issues/3433)) ([d4f0774](https://github.com/typescript-eslint/typescript-eslint/commit/d4f077473afb04f7c4d377dd87318749632b4404))
- generate library types for TypeScript v4.3 ([#3460](https://github.com/typescript-eslint/typescript-eslint/issues/3460)) ([ed4776a](https://github.com/typescript-eslint/typescript-eslint/commit/ed4776afa1374279027b9b7d82aa4b453b334998)), closes [#3449](https://github.com/typescript-eslint/typescript-eslint/issues/3449)

### Features

- **eslint-plugin:** [member-ordering] add callback as an ordering type of node ([#3354](https://github.com/typescript-eslint/typescript-eslint/issues/3354)) ([d134b1f](https://github.com/typescript-eslint/typescript-eslint/commit/d134b1fa2540dec7094728f3dec1bbb8c644fe58))
- **eslint-plugin:** [space-infix-ops] Add support for Union and intersection of type declarations ([#3360](https://github.com/typescript-eslint/typescript-eslint/issues/3360)) ([3d29323](https://github.com/typescript-eslint/typescript-eslint/commit/3d2932390cc335ab2cf80ae7a7fad066fd2eb22b))
- **scope-manager:** reduce generated lib file size ([#3468](https://github.com/typescript-eslint/typescript-eslint/issues/3468)) ([258116b](https://github.com/typescript-eslint/typescript-eslint/commit/258116ba7b0dd4ac7a1cc3876fab12f2556bda74))

# [4.25.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.24.0...v4.25.0) (2021-05-24)

### Bug Fixes

- corrected no-unsupported-browser-code in roadmap as unimplemented ([#3407](https://github.com/typescript-eslint/typescript-eslint/issues/3407)) ([2319b0e](https://github.com/typescript-eslint/typescript-eslint/commit/2319b0e1847991b8b8902ff4a3b779f1a27c7a45))
- **experimental-utils:** fix `isAwaitKeyword` predicate in ast-utils ([#3290](https://github.com/typescript-eslint/typescript-eslint/issues/3290)) ([c15da67](https://github.com/typescript-eslint/typescript-eslint/commit/c15da67b939b615ed063291cde12c55c0d6d236e))

### Features

- **typescript-estree:** [TS4.3] support overrides on class members ([#3429](https://github.com/typescript-eslint/typescript-eslint/issues/3429)) ([21d1b62](https://github.com/typescript-eslint/typescript-eslint/commit/21d1b62a0b84b502d2cf12674b3d141994a3ffd4))
- **typescript-estree:** add support for getter/setter signatures on types ([#3427](https://github.com/typescript-eslint/typescript-eslint/issues/3427)) ([b830b7f](https://github.com/typescript-eslint/typescript-eslint/commit/b830b7f4e8a99affc8af8b53cb83371ef81d7032)), closes [#3272](https://github.com/typescript-eslint/typescript-eslint/issues/3272) [#3272](https://github.com/typescript-eslint/typescript-eslint/issues/3272)

# [4.24.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.23.0...v4.24.0) (2021-05-17)

### Bug Fixes

- **eslint-plugin:** [no-shadow] fix static class method generics shadowing class generics ([#3393](https://github.com/typescript-eslint/typescript-eslint/issues/3393)) ([b1e1c8a](https://github.com/typescript-eslint/typescript-eslint/commit/b1e1c8a44695a58d29d19cf32ce35a8267bf506f)), closes [#2592](https://github.com/typescript-eslint/typescript-eslint/issues/2592)
- **eslint-plugin:** [no-unsafe-*] special case handling for the empty map constructor with no generics ([#3394](https://github.com/typescript-eslint/typescript-eslint/issues/3394)) ([cae4f4a](https://github.com/typescript-eslint/typescript-eslint/commit/cae4f4a0f33f8c954b1670d0abcfc8edd6193a06)), closes [#2109](https://github.com/typescript-eslint/typescript-eslint/issues/2109)

### Features

- **eslint-plugin:** [dot-notation] optionally allow square bracket notation where an index signature exists in conjunction with `noPropertyAccessFromIndexSignature` ([#3361](https://github.com/typescript-eslint/typescript-eslint/issues/3361)) ([37ec2c2](https://github.com/typescript-eslint/typescript-eslint/commit/37ec2c2264add3e6ce20ac4e02d48644afda3fa8))

# [4.23.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.22.1...v4.23.0) (2021-05-10)

### Bug Fixes

- **scope-manager:** fix visiting TSAsExpression in assignment ([#3355](https://github.com/typescript-eslint/typescript-eslint/issues/3355)) ([87521a0](https://github.com/typescript-eslint/typescript-eslint/commit/87521a024103bc5fc643861649bee9a288f55b7b))

### Features

- **experimental-utils:** Include `getCwd()` in `RuleContext` type ([#3308](https://github.com/typescript-eslint/typescript-eslint/issues/3308)) ([2b75c11](https://github.com/typescript-eslint/typescript-eslint/commit/2b75c11d69bee88ca0cb77d7efd32b8d0387e6b3))
- refactor to split AST specification out as its own module ([#2911](https://github.com/typescript-eslint/typescript-eslint/issues/2911)) ([25ea953](https://github.com/typescript-eslint/typescript-eslint/commit/25ea953cc60b118bd385c71e0a9b61c286c26fcf))

## [4.22.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.22.0...v4.22.1) (2021-05-04)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

# [4.22.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.21.0...v4.22.0) (2021-04-12)

### Bug Fixes

- **eslint-plugin:** [no-unsafe-argument] handle tuple types on rest arguments ([#3269](https://github.com/typescript-eslint/typescript-eslint/issues/3269)) ([6f8cfe6](https://github.com/typescript-eslint/typescript-eslint/commit/6f8cfe6f83ee26b66b2146cc17b1205100a54a9c))

### Features

- **eslint-plugin:** [prefer-regexp-exec] add autofix ([#3207](https://github.com/typescript-eslint/typescript-eslint/issues/3207)) ([e2cbeef](https://github.com/typescript-eslint/typescript-eslint/commit/e2cbeefb3d9a7cce257b5675f7f19f1b159a9d26))

# [4.21.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.20.0...v4.21.0) (2021-04-05)

### Bug Fixes

- **eslint-plugin:** [no-type-alias] consider `keyof` as an alias ([#3242](https://github.com/typescript-eslint/typescript-eslint/issues/3242)) ([329ef02](https://github.com/typescript-eslint/typescript-eslint/commit/329ef023090c004694b5996ddb04fdde5b05ebb0))
- **eslint-plugin:** [no-unnecessary-type-assertion] correct bad fix for angle bracket assertion ([#3244](https://github.com/typescript-eslint/typescript-eslint/issues/3244)) ([265a039](https://github.com/typescript-eslint/typescript-eslint/commit/265a039c7e728b719143e09ee61066039d721f62))
- **eslint-plugin:** [restrict-plus-operands] consider template literal types as strings ([#3234](https://github.com/typescript-eslint/typescript-eslint/issues/3234)) ([ccfd68e](https://github.com/typescript-eslint/typescript-eslint/commit/ccfd68e365391b3f117df96792355f9c3655288c))
- **eslint-plugin:** [strict-boolean-expressions] account for truthy literals ([#3236](https://github.com/typescript-eslint/typescript-eslint/issues/3236)) ([0913f40](https://github.com/typescript-eslint/typescript-eslint/commit/0913f40c87762de198b05a5473b4fb79aeb46967))
- **eslint-plugin:** always ignore assignments in no-unnecessary-type-assertion ([#3235](https://github.com/typescript-eslint/typescript-eslint/issues/3235)) ([0221476](https://github.com/typescript-eslint/typescript-eslint/commit/02214768a3721d8514c70e00546e861da6581e4d))

### Features

- **eslint-plugin:** [no-unsafe-argument] add rule ([#3256](https://github.com/typescript-eslint/typescript-eslint/issues/3256)) ([b1aa7dc](https://github.com/typescript-eslint/typescript-eslint/commit/b1aa7dc6971ee8409b729dffb8b69478455734ed)), closes [#791](https://github.com/typescript-eslint/typescript-eslint/issues/791)
- **eslint-plugin:** [no-unsafe-call][no-unsafe-member-access] improve report messages for `this` for `noImplicitThis` ([#3199](https://github.com/typescript-eslint/typescript-eslint/issues/3199)) ([b1b26c4](https://github.com/typescript-eslint/typescript-eslint/commit/b1b26c4843a4cfa209a0c9c3d8bea1de37333b48))

# [4.20.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.19.0...v4.20.0) (2021-03-29)

### Features

- **eslint-plugin:** [space-infix-ops] support for class properties and type aliases ([#3231](https://github.com/typescript-eslint/typescript-eslint/issues/3231)) ([5414bf2](https://github.com/typescript-eslint/typescript-eslint/commit/5414bf27a81311099d001808475d9cf832ce3bfe))
- **eslint-plugin:** [type-annotation-spacing] handle space between ? and : ([#3138](https://github.com/typescript-eslint/typescript-eslint/issues/3138)) ([40bdb0b](https://github.com/typescript-eslint/typescript-eslint/commit/40bdb0b27b21de511f0ecd151cb8282a625ca6e1))

# [4.19.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.18.0...v4.19.0) (2021-03-22)

### Bug Fixes

- **eslint-plugin:** [member-delimiter-style] correct invalid fix for multiline with params on the same line ([#3177](https://github.com/typescript-eslint/typescript-eslint/issues/3177)) ([7ad343b](https://github.com/typescript-eslint/typescript-eslint/commit/7ad343b067040f6ea816b129323d110d4bc2e830))
- **eslint-plugin:** [promise-function-async] bad fixer with computed and literal methods ([#3163](https://github.com/typescript-eslint/typescript-eslint/issues/3163)) ([e3a3ea0](https://github.com/typescript-eslint/typescript-eslint/commit/e3a3ea04757464aa2dded1ef46af8ad4e05246f2))
- **typescript-estree:** [ts 4.2] add support for import type equal declaration ([#3189](https://github.com/typescript-eslint/typescript-eslint/issues/3189)) ([6a25faf](https://github.com/typescript-eslint/typescript-eslint/commit/6a25faf5cfa4d21a7546d9866819f4e017308fb2))

### Features

- **eslint-plugin:** [object-curly-spacing] support MappedType ([#3176](https://github.com/typescript-eslint/typescript-eslint/issues/3176)) ([0557a43](https://github.com/typescript-eslint/typescript-eslint/commit/0557a439327557f4c0369ae2dddc8282ba45bfe6))
- **eslint-plugin:** [unbound-method] improve error message ([#3203](https://github.com/typescript-eslint/typescript-eslint/issues/3203)) ([5cc5d2e](https://github.com/typescript-eslint/typescript-eslint/commit/5cc5d2ef6d924d301e87f7bcf599352310e74b2c)), closes [#3201](https://github.com/typescript-eslint/typescript-eslint/issues/3201)

# [4.18.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.17.0...v4.18.0) (2021-03-15)

### Bug Fixes

- **eslint-plugin:** [explicit-module-boundary-types] fixes [#2864](https://github.com/typescript-eslint/typescript-eslint/issues/2864) related to functions in nested object properties ([#3178](https://github.com/typescript-eslint/typescript-eslint/issues/3178)) ([55e1fba](https://github.com/typescript-eslint/typescript-eslint/commit/55e1fbaca985b500cad1cc9ec25717b18cf5a17b))
- **eslint-plugin:** [no-extran-class] allowWithDecorator should ignore other errors ([#3160](https://github.com/typescript-eslint/typescript-eslint/issues/3160)) ([a148673](https://github.com/typescript-eslint/typescript-eslint/commit/a1486736d8ef3555832ddfb27fd0980368b363f5))

### Features

- **eslint-plugin:** add package type declaration ([#3164](https://github.com/typescript-eslint/typescript-eslint/issues/3164)) ([08b058a](https://github.com/typescript-eslint/typescript-eslint/commit/08b058a7a6db3b59c28753bb322717e1fee44d1f))

# [4.17.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.16.1...v4.17.0) (2021-03-08)

### Bug Fixes

- **eslint-plugin:** [no-unnecessary-type-assertion] handle assignment ([#3133](https://github.com/typescript-eslint/typescript-eslint/issues/3133)) ([cb22561](https://github.com/typescript-eslint/typescript-eslint/commit/cb2256168c67e0383083673a5afe77076de49da5))

### Features

- **eslint-plugin:** [strict-bool-expr] add fixes and suggestions ([#2847](https://github.com/typescript-eslint/typescript-eslint/issues/2847)) ([3f9e9a1](https://github.com/typescript-eslint/typescript-eslint/commit/3f9e9a1e9fc3e507bd01d1913ef642cd129de402))

## [4.16.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.16.0...v4.16.1) (2021-03-01)

### Bug Fixes

- **typescript-estree:** update TS version range ([#3127](https://github.com/typescript-eslint/typescript-eslint/issues/3127)) ([0473674](https://github.com/typescript-eslint/typescript-eslint/commit/0473674c58df5039a2de3c63ad7494fc6be7487e))

# [4.16.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.15.2...v4.16.0) (2021-03-01)

### Bug Fixes

- **eslint-plugin:** [consistent-indexed-object-style] do not autofix if interface has extends ([#3009](https://github.com/typescript-eslint/typescript-eslint/issues/3009)) ([b0475af](https://github.com/typescript-eslint/typescript-eslint/commit/b0475aff3920d748fa74b5a6d8a7ad5dd731aec4))
- **eslint-plugin:** [no-implied-eval] handle conditional expression ([#3125](https://github.com/typescript-eslint/typescript-eslint/issues/3125)) ([8c65d30](https://github.com/typescript-eslint/typescript-eslint/commit/8c65d30a225a3b99e80326961d0cb0c8189b039c))
- **eslint-plugin:** [no-unused-vars] don't report nested module declaration ([#3119](https://github.com/typescript-eslint/typescript-eslint/issues/3119)) ([4ca5888](https://github.com/typescript-eslint/typescript-eslint/commit/4ca58886adf3fc0fe31c263559990c8a534205f9))
- **eslint-plugin:** [prefer-function-type] apply existing comments to the fixed code ([#3094](https://github.com/typescript-eslint/typescript-eslint/issues/3094)) ([c32f803](https://github.com/typescript-eslint/typescript-eslint/commit/c32f803d4480acf5ffc88e308b4243e5185c4f48))
- **eslint-plugin:** [unbound-method] allow `super` expressions in `this` assignments ([#3010](https://github.com/typescript-eslint/typescript-eslint/issues/3010)) ([c65a139](https://github.com/typescript-eslint/typescript-eslint/commit/c65a1391be15bbcf3ae293b1c53686703883d546))
- **scope-manager:** update libs for typescript 4.2 ([#3118](https://github.com/typescript-eslint/typescript-eslint/issues/3118)) ([0336c79](https://github.com/typescript-eslint/typescript-eslint/commit/0336c798c9502fc250d2eaa045661950da55e52f))

### Features

- TypeScript 4.2 syntax support ([#3112](https://github.com/typescript-eslint/typescript-eslint/issues/3112)) ([2ebfb21](https://github.com/typescript-eslint/typescript-eslint/commit/2ebfb21ba6c88c793cfbd0e231e5803b2381694c))
- **eslint-plugin:** [member-delimiter-style] Add an option 'multilineDetection' to treat types and interfaces as single line if the last member ends on the same line as the closing bracket ([#2970](https://github.com/typescript-eslint/typescript-eslint/issues/2970)) ([cf86f42](https://github.com/typescript-eslint/typescript-eslint/commit/cf86f427186d58b0fce4bb3ff9571c4301babeb3))
- **eslint-plugin:** [prom-func-async] report only function head ([#2872](https://github.com/typescript-eslint/typescript-eslint/issues/2872)) ([25f459c](https://github.com/typescript-eslint/typescript-eslint/commit/25f459cdc4f38d44b48554e04cfa1676538ccdfb))
- **typescript-estree:** throw custom error instead of plain object ([#3011](https://github.com/typescript-eslint/typescript-eslint/issues/3011)) ([ae14bf5](https://github.com/typescript-eslint/typescript-eslint/commit/ae14bf55fe31b0eb982ba17333e4aac550d10342))

## [4.15.2](https://github.com/typescript-eslint/typescript-eslint/compare/v4.15.1...v4.15.2) (2021-02-22)

### Bug Fixes

- **typescript-estree:** correct issues in AST definition ([#3083](https://github.com/typescript-eslint/typescript-eslint/issues/3083)) ([509a117](https://github.com/typescript-eslint/typescript-eslint/commit/509a11749f85400a01e9fecfecd12871ce562d3d))
- add missing intrinsic keyword node to AST ([#3081](https://github.com/typescript-eslint/typescript-eslint/issues/3081)) ([409bf0b](https://github.com/typescript-eslint/typescript-eslint/commit/409bf0bb3e2ac4d8782408d436ebdefb42dba38b))
- **eslint-plugin:** [no-var-requires] report when used in type assertion ([#3074](https://github.com/typescript-eslint/typescript-eslint/issues/3074)) ([763a252](https://github.com/typescript-eslint/typescript-eslint/commit/763a2520bfea09c3b6252ea36bc3ff10b05eca6c))
- correct test names on windows for semantic-diagnostics-enabled ([#3060](https://github.com/typescript-eslint/typescript-eslint/issues/3060)) ([885780d](https://github.com/typescript-eslint/typescript-eslint/commit/885780d4a2b07e418256b7323d76b18453c14a50))

## [4.15.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.15.0...v4.15.1) (2021-02-15)

### Bug Fixes

- **eslint-plugin:** [explicit-module-boundary-types] check allowNames on function declarations and property methods ([#3051](https://github.com/typescript-eslint/typescript-eslint/issues/3051)) ([0ade469](https://github.com/typescript-eslint/typescript-eslint/commit/0ade469dc1cf17d79c36a9c985630d60491ed847))

# [4.15.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.14.2...v4.15.0) (2021-02-08)

### Bug Fixes

- **eslint-plugin:** [no-extra-parens] handle ESLint 7.19.0 ([#2993](https://github.com/typescript-eslint/typescript-eslint/issues/2993)) ([4615048](https://github.com/typescript-eslint/typescript-eslint/commit/4615048d24359e0fc57b90a96acf4d8ded1dc7bf))
- **eslint-plugin:** [prefer-function-type] correct fixer when signature ends with a semi ([#3002](https://github.com/typescript-eslint/typescript-eslint/issues/3002)) ([898dd39](https://github.com/typescript-eslint/typescript-eslint/commit/898dd3961944a5da3a129e9eba02634286e7aee4))
- **scope-manager:** fix visiting of TSImportType ([#3008](https://github.com/typescript-eslint/typescript-eslint/issues/3008)) ([ce4fcbf](https://github.com/typescript-eslint/typescript-eslint/commit/ce4fcbf4401098387a2cf19ae8457c89c509239a)), closes [#3006](https://github.com/typescript-eslint/typescript-eslint/issues/3006)

### Features

- **typescript-estree:** improve logic used to escape string literals in jsx ([#2995](https://github.com/typescript-eslint/typescript-eslint/issues/2995)) ([3cb3aad](https://github.com/typescript-eslint/typescript-eslint/commit/3cb3aade2864bab15ed1ff8d7cd32766aa57152f))

## [4.14.2](https://github.com/typescript-eslint/typescript-eslint/compare/v4.14.1...v4.14.2) (2021-02-01)

### Bug Fixes

- **eslint-plugin:** [consistent-type-imports] incorrect handling of computed property type signatures ([#2990](https://github.com/typescript-eslint/typescript-eslint/issues/2990)) ([58f2655](https://github.com/typescript-eslint/typescript-eslint/commit/58f26555f62b5f59f13260306638d3148cde6079)), closes [#2989](https://github.com/typescript-eslint/typescript-eslint/issues/2989)
- **scope-manager:** correctly reference generic parameters when decorator metadata is enabled ([#2975](https://github.com/typescript-eslint/typescript-eslint/issues/2975)) ([7695ef3](https://github.com/typescript-eslint/typescript-eslint/commit/7695ef318f1cc8688acaabf4f2730769622f083f)), closes [#2972](https://github.com/typescript-eslint/typescript-eslint/issues/2972)

## [4.14.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.14.0...v4.14.1) (2021-01-25)

### Bug Fixes

- **eslint-plugin:** [sort-type-union-intersection-members] consider `void` as a `nullish` ([#2944](https://github.com/typescript-eslint/typescript-eslint/issues/2944)) ([a241b25](https://github.com/typescript-eslint/typescript-eslint/commit/a241b25863eb063986fab76b511f478bbba91f47)), closes [#2940](https://github.com/typescript-eslint/typescript-eslint/issues/2940)
- **scope-manager:** fix incorrect handling of class decorators and class method default params ([#2943](https://github.com/typescript-eslint/typescript-eslint/issues/2943)) ([e1eac83](https://github.com/typescript-eslint/typescript-eslint/commit/e1eac8312268d1855a2ed7784b4d190ecb9c9fa4)), closes [#2941](https://github.com/typescript-eslint/typescript-eslint/issues/2941) [#2942](https://github.com/typescript-eslint/typescript-eslint/issues/2942) [#2751](https://github.com/typescript-eslint/typescript-eslint/issues/2751)

# [4.14.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.13.0...v4.14.0) (2021-01-18)

### Features

- add support for decorator metadata in scope analysis and in consistent-type-imports ([#2751](https://github.com/typescript-eslint/typescript-eslint/issues/2751)) ([445e416](https://github.com/typescript-eslint/typescript-eslint/commit/445e416878b27a54bf07c2d3b84dabd7b06e51bc)), closes [#2559](https://github.com/typescript-eslint/typescript-eslint/issues/2559)
- **eslint-plugin:** add `object-curly-spacing` rule ([#2892](https://github.com/typescript-eslint/typescript-eslint/issues/2892)) ([32bd18d](https://github.com/typescript-eslint/typescript-eslint/commit/32bd18de80f4f8388717d0f0c16d493234362aa5))

# [4.13.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.12.0...v4.13.0) (2021-01-11)

### Bug Fixes

- **eslint-plugin:** support eslint@5 ([#2917](https://github.com/typescript-eslint/typescript-eslint/issues/2917)) ([f606846](https://github.com/typescript-eslint/typescript-eslint/commit/f606846af2617a0d8ee3ad5ce7c10864161ebf53))

### Features

- **eslint-plugin:** [sort-type-union-intersection-members] add nullish group ([#2919](https://github.com/typescript-eslint/typescript-eslint/issues/2919)) ([5558f41](https://github.com/typescript-eslint/typescript-eslint/commit/5558f410007da58a3f4726bbf9501c924ef166a1))

# [4.12.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.11.1...v4.12.0) (2021-01-04)

### Bug Fixes

- **eslint-plugin:** [comma-spacing] handle empty type params ([#2915](https://github.com/typescript-eslint/typescript-eslint/issues/2915)) ([4d69fbb](https://github.com/typescript-eslint/typescript-eslint/commit/4d69fbba91ea3161213a0ab093e398fed091168c))

### Features

- **eslint-plugin:** add rule `sort-type-union-intersection-members` ([#2913](https://github.com/typescript-eslint/typescript-eslint/issues/2913)) ([9092c04](https://github.com/typescript-eslint/typescript-eslint/commit/9092c0494ebd3486e38852198c1930f1432ef21f))

## [4.11.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.11.0...v4.11.1) (2020-12-28)

### Bug Fixes

- **eslint-plugin:** [naming-convention] fix precedence of method and property meta selectors ([#2877](https://github.com/typescript-eslint/typescript-eslint/issues/2877)) ([2f10e1a](https://github.com/typescript-eslint/typescript-eslint/commit/2f10e1a5c795cac28a6e0a1a3a0adb5bd6be7f1c))

# [4.11.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.10.0...v4.11.0) (2020-12-21)

### Bug Fixes

- **eslint-plugin:** [non-nullable-type-assertion-style] handle const assertion ([#2881](https://github.com/typescript-eslint/typescript-eslint/issues/2881)) ([53dc34d](https://github.com/typescript-eslint/typescript-eslint/commit/53dc34d3917b90c8ab0324fe8054619ddee98003))

### Features

- **eslint-plugin:** [prom-func-async] add automatic fix ([#2845](https://github.com/typescript-eslint/typescript-eslint/issues/2845)) ([717e718](https://github.com/typescript-eslint/typescript-eslint/commit/717e718e91df2165422228c02dfa248cf55f65a1))

# [4.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.9.1...v4.10.0) (2020-12-14)

### Bug Fixes

- **eslint-plugin:** [naming-convention] fix wrong member of `method` and `property` meta selectors ([#2856](https://github.com/typescript-eslint/typescript-eslint/issues/2856)) ([9a6c362](https://github.com/typescript-eslint/typescript-eslint/commit/9a6c3628a2f3a7748b7a4b9b0c55400c8d7dfeae))

### Features

- **eslint-plugin:** add rule `non-nullable-type-assertion-style` ([#2624](https://github.com/typescript-eslint/typescript-eslint/issues/2624)) ([7eee44f](https://github.com/typescript-eslint/typescript-eslint/commit/7eee44fff3041a9725d34bf2fcbfc6fd40a60c61))

## [4.9.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.9.0...v4.9.1) (2020-12-07)

### Bug Fixes

- **eslint-plugin:** [method-signature-style] fix crash with methods without a return type ([#2836](https://github.com/typescript-eslint/typescript-eslint/issues/2836)) ([fed89f2](https://github.com/typescript-eslint/typescript-eslint/commit/fed89f24ebe42a6412f0eb19949d5d4771656189)), closes [#2834](https://github.com/typescript-eslint/typescript-eslint/issues/2834)
- **eslint-plugin:** [no-unused-vars] false-positive with class expressions ([#2833](https://github.com/typescript-eslint/typescript-eslint/issues/2833)) ([aadb39f](https://github.com/typescript-eslint/typescript-eslint/commit/aadb39f0ff500ee99ea80e9009ab61283ca9c8cd)), closes [#2831](https://github.com/typescript-eslint/typescript-eslint/issues/2831)
- **eslint-plugin:** [no-unused-vars] fix race condition between naming-convention and no-unused-vars ([#2848](https://github.com/typescript-eslint/typescript-eslint/issues/2848)) ([ccb6b94](https://github.com/typescript-eslint/typescript-eslint/commit/ccb6b9499a4a4077f2e3d81d0844860a25244a0f)), closes [#2844](https://github.com/typescript-eslint/typescript-eslint/issues/2844)

# [4.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.8.2...v4.9.0) (2020-11-30)

### Bug Fixes

- **eslint-plugin:** [consistent-indexed-object-style] convert readonly index signature to readonly record ([#2798](https://github.com/typescript-eslint/typescript-eslint/issues/2798)) ([29428a4](https://github.com/typescript-eslint/typescript-eslint/commit/29428a4dbef133563f2ee54b22908a01ab9a9472))
- **eslint-plugin:** [consistent-type-imports] crash when using both default and namespace in one import ([#2778](https://github.com/typescript-eslint/typescript-eslint/issues/2778)) ([c816b84](https://github.com/typescript-eslint/typescript-eslint/commit/c816b84814214f7504a0d89a5cd3b08c595bfb50))
- **eslint-plugin:** [explicit-module-boundary-types] ignore functions exported within typed object/array literals ([#2805](https://github.com/typescript-eslint/typescript-eslint/issues/2805)) ([73a63ee](https://github.com/typescript-eslint/typescript-eslint/commit/73a63ee9ea00b2db0a29f148d7863c3778e4a483))
- **eslint-plugin:** [no-use-before-define] allow class references if they're within a class decorator ([#2827](https://github.com/typescript-eslint/typescript-eslint/issues/2827)) ([050023a](https://github.com/typescript-eslint/typescript-eslint/commit/050023aa7bd791d0be7b5788a9dcd8e61a00ce79)), closes [#2842](https://github.com/typescript-eslint/typescript-eslint/issues/2842)
- **eslint-plugin:** [triple-slash-reference] fix crash with external module reference ([#2788](https://github.com/typescript-eslint/typescript-eslint/issues/2788)) ([32b1b68](https://github.com/typescript-eslint/typescript-eslint/commit/32b1b6839fb32d93b7faa8fec74c9cb68ea587bb))
- **scope-manager:** fix assertion assignments not being marked as write references ([#2809](https://github.com/typescript-eslint/typescript-eslint/issues/2809)) ([fa68492](https://github.com/typescript-eslint/typescript-eslint/commit/fa6849245ca55ca407dc031afbad456f2925a8e9)), closes [#2804](https://github.com/typescript-eslint/typescript-eslint/issues/2804)
- **typescript-estree:** add default value for `parserOptions.projectFolderIgnoreList` and deduplicate resolved projects ([#2819](https://github.com/typescript-eslint/typescript-eslint/issues/2819)) ([bf904ec](https://github.com/typescript-eslint/typescript-eslint/commit/bf904ec72db57174fec531f61e9427230662553e)), closes [#2418](https://github.com/typescript-eslint/typescript-eslint/issues/2418) [#2814](https://github.com/typescript-eslint/typescript-eslint/issues/2814)

### Features

- **eslint-plugin:** [naming-convention] add `requireDouble`, `allowDouble`, `allowSingleOrDouble` options for underscores ([#2812](https://github.com/typescript-eslint/typescript-eslint/issues/2812)) ([dd0576a](https://github.com/typescript-eslint/typescript-eslint/commit/dd0576a66c34810bc60e0958948c9a8104a3f1a3))
- **eslint-plugin:** [naming-convention] add `requiresQuotes` modifier ([#2813](https://github.com/typescript-eslint/typescript-eslint/issues/2813)) ([6fc8409](https://github.com/typescript-eslint/typescript-eslint/commit/6fc84094928c3645a0e04c31bd4d759fdfbdcb74)), closes [#2761](https://github.com/typescript-eslint/typescript-eslint/issues/2761) [#1483](https://github.com/typescript-eslint/typescript-eslint/issues/1483)
- **eslint-plugin:** [naming-convention] add modifier `unused` ([#2810](https://github.com/typescript-eslint/typescript-eslint/issues/2810)) ([6a06944](https://github.com/typescript-eslint/typescript-eslint/commit/6a06944e60677a402e7ab432e6ac1209737a7027))
- **eslint-plugin:** [naming-convention] add modifiers `exported`, `global`, and `destructured` ([#2808](https://github.com/typescript-eslint/typescript-eslint/issues/2808)) ([fb254a1](https://github.com/typescript-eslint/typescript-eslint/commit/fb254a1036b89f9b78f927d607358e65e81a2250)), closes [#2239](https://github.com/typescript-eslint/typescript-eslint/issues/2239) [#2512](https://github.com/typescript-eslint/typescript-eslint/issues/2512) [#2318](https://github.com/typescript-eslint/typescript-eslint/issues/2318) [#2802](https://github.com/typescript-eslint/typescript-eslint/issues/2802)
- **eslint-plugin:** [naming-convention] allow `destructured` modifier for `parameter` selector ([#2829](https://github.com/typescript-eslint/typescript-eslint/issues/2829)) ([525d2ff](https://github.com/typescript-eslint/typescript-eslint/commit/525d2ff9292d89e1445b273b5378159bca323a1e)), closes [#2828](https://github.com/typescript-eslint/typescript-eslint/issues/2828)
- **eslint-plugin:** [naming-convention] split `property` and `method` selectors into more granular `classXXX`, `objectLiteralXXX`, `typeXXX` ([#2807](https://github.com/typescript-eslint/typescript-eslint/issues/2807)) ([665b6d4](https://github.com/typescript-eslint/typescript-eslint/commit/665b6d4023fb9d821f348c39aefff0d7571a98bf)), closes [#1477](https://github.com/typescript-eslint/typescript-eslint/issues/1477) [#2802](https://github.com/typescript-eslint/typescript-eslint/issues/2802)
- **eslint-plugin:** [no-unused-vars] fork the base rule ([#2768](https://github.com/typescript-eslint/typescript-eslint/issues/2768)) ([a8227a6](https://github.com/typescript-eslint/typescript-eslint/commit/a8227a6185dd24de4bfc7d766931643871155021)), closes [#2782](https://github.com/typescript-eslint/typescript-eslint/issues/2782) [#2714](https://github.com/typescript-eslint/typescript-eslint/issues/2714) [#2648](https://github.com/typescript-eslint/typescript-eslint/issues/2648)
- **eslint-plugin:** [unbound-method] add support for methods with a `this: void` parameter ([#2796](https://github.com/typescript-eslint/typescript-eslint/issues/2796)) ([878dd4a](https://github.com/typescript-eslint/typescript-eslint/commit/878dd4ae8c408f1eb42790a8fac37f85040b7f3c))

## [4.8.2](https://github.com/typescript-eslint/typescript-eslint/compare/v4.8.1...v4.8.2) (2020-11-23)

### Bug Fixes

- **eslint-plugin:** [prefer-literal-enum-member] allow pure template literal strings ([#2786](https://github.com/typescript-eslint/typescript-eslint/issues/2786)) ([f3bf6a1](https://github.com/typescript-eslint/typescript-eslint/commit/f3bf6a1791c9dc64bb18d45712f07767c9f96cbd))
- **typescript-estree:** fix type-only regression for consumers not yet on TS 4.1 ([#2789](https://github.com/typescript-eslint/typescript-eslint/issues/2789)) ([50a46c6](https://github.com/typescript-eslint/typescript-eslint/commit/50a46c60fb81d8434aa4268a13d17d8fcf499e21))

## [4.8.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.8.0...v4.8.1) (2020-11-17)

### Bug Fixes

- **eslint-plugin:** [no-unnecessary-condition] false positive when array predicate returns unknown ([#2772](https://github.com/typescript-eslint/typescript-eslint/issues/2772)) ([111c244](https://github.com/typescript-eslint/typescript-eslint/commit/111c244c3eb157efeb5c43ff39f12633b27f091e))
- **typescript-estree:** parseWithNodeMaps returning empty maps ([#2773](https://github.com/typescript-eslint/typescript-eslint/issues/2773)) ([3e4a0ed](https://github.com/typescript-eslint/typescript-eslint/commit/3e4a0ed0d615fd22a2f28c7c8af6179673e195f8))

# [4.8.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.7.0...v4.8.0) (2020-11-16)

### Bug Fixes

- **eslint-plugin:** [consistent-type-definitions] remove fixer when the interface is within a global module declaration ([#2739](https://github.com/typescript-eslint/typescript-eslint/issues/2739)) ([2326238](https://github.com/typescript-eslint/typescript-eslint/commit/2326238738c95acfc14c17f9b16798f1de6d267f))
- **eslint-plugin:** [no-unsafe-member-access] ignore MemberExpression's whose parents are either TSClassImplements or TSInterfaceHeritage ([#2753](https://github.com/typescript-eslint/typescript-eslint/issues/2753)) ([535db3b](https://github.com/typescript-eslint/typescript-eslint/commit/535db3bf27ee1d7824ada9acd91d1b7833064628))

### Features

- **typescript-estree:** add `parseWithNodeMaps` API ([#2760](https://github.com/typescript-eslint/typescript-eslint/issues/2760)) ([9441d50](https://github.com/typescript-eslint/typescript-eslint/commit/9441d5030211f1c32f5ae8e61d5565cab8bb6823)), closes [#1852](https://github.com/typescript-eslint/typescript-eslint/issues/1852)

# [4.7.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.6.1...v4.7.0) (2020-11-09)

### Bug Fixes

- **eslint-plugin:** [array-type] parenthesize ReadonlyArray fix ([#2747](https://github.com/typescript-eslint/typescript-eslint/issues/2747)) ([83385ac](https://github.com/typescript-eslint/typescript-eslint/commit/83385ac351f45d3bcbd19f72711838e9a8473827))
- **eslint-plugin:** [no-extra-non-null-assertion] false positive with non-nullable computed key ([#2737](https://github.com/typescript-eslint/typescript-eslint/issues/2737)) ([e82698c](https://github.com/typescript-eslint/typescript-eslint/commit/e82698c0ec796e460e40c3dd90a30bd100db05c2))

### Features

- **eslint-plugin:** add rule `no-confusing-void-expression` ([#2605](https://github.com/typescript-eslint/typescript-eslint/issues/2605)) ([c8a4dad](https://github.com/typescript-eslint/typescript-eslint/commit/c8a4dadeab8a64fb4768deda8f65475435dd2cad))
- support TS4.1 features ([#2748](https://github.com/typescript-eslint/typescript-eslint/issues/2748)) ([2be354b](https://github.com/typescript-eslint/typescript-eslint/commit/2be354bb15f9013a2da1b13a0c0836e9ef057e16)), closes [#2583](https://github.com/typescript-eslint/typescript-eslint/issues/2583)

## [4.6.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.6.0...v4.6.1) (2020-11-02)

### Bug Fixes

- **eslint-plugin:** [consistent-indexed-object-style] fix wrong autofix behaviour with generics ([#2722](https://github.com/typescript-eslint/typescript-eslint/issues/2722)) ([73d9713](https://github.com/typescript-eslint/typescript-eslint/commit/73d97130afe79b8a458c215581ce86c62009ad8b))
- **eslint-plugin:** [no-shadow] ignore global module augmentation ([#2729](https://github.com/typescript-eslint/typescript-eslint/issues/2729)) ([d8c67a5](https://github.com/typescript-eslint/typescript-eslint/commit/d8c67a564a4cada5add8587f655aee2305cbc562))

# [4.6.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.5.0...v4.6.0) (2020-10-26)

### Bug Fixes

- **eslint-plugin:** [method-signature-style] correct fixer for overloads in an object literal type ([#2708](https://github.com/typescript-eslint/typescript-eslint/issues/2708)) ([0763913](https://github.com/typescript-eslint/typescript-eslint/commit/0763913c4a0d1061465ae3329704f1a7de4b9326))
- **eslint-plugin:** [method-signature-style] don't auto-fix interfaces within namespaces ([#2678](https://github.com/typescript-eslint/typescript-eslint/issues/2678)) ([e012049](https://github.com/typescript-eslint/typescript-eslint/commit/e01204931e460f5e6731abc443c88d666ca0b07a))
- **eslint-plugin:** [prefer-string-starts-ends-with] Check negative indices in the second position for slice ([#2696](https://github.com/typescript-eslint/typescript-eslint/issues/2696)) ([66e9c6e](https://github.com/typescript-eslint/typescript-eslint/commit/66e9c6e29f9f56bbd178ba6405f47053be591258))

### Features

- **eslint-plugin:** [ban-types] support banning `[]` ([#2704](https://github.com/typescript-eslint/typescript-eslint/issues/2704)) ([ef8b5a7](https://github.com/typescript-eslint/typescript-eslint/commit/ef8b5a7e09cca4bdacf205da28f99f2b1a419d00)), closes [#2582](https://github.com/typescript-eslint/typescript-eslint/issues/2582)
- **eslint-plugin:** add `no-unnecessary-type-constraint` rule ([#2516](https://github.com/typescript-eslint/typescript-eslint/issues/2516)) ([880ac75](https://github.com/typescript-eslint/typescript-eslint/commit/880ac753b90d63034f0a33f8f512d9fabc17c8f9))
- **eslint-plugin:** add extension rule `space-infix-ops` ([#2593](https://github.com/typescript-eslint/typescript-eslint/issues/2593)) ([343d20d](https://github.com/typescript-eslint/typescript-eslint/commit/343d20db23a1640e3bca8cf52b7db1fa46e092e6))

# [4.5.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.4.1...v4.5.0) (2020-10-19)

### Bug Fixes

- **eslint-plugin:** [array-type] fix issues with readonly option ([#2667](https://github.com/typescript-eslint/typescript-eslint/issues/2667)) ([63d1d81](https://github.com/typescript-eslint/typescript-eslint/commit/63d1d8189c829c6543c7966a864b62c07fbd61a0))
- **eslint-plugin:** [lines-between-class-members] fix typo in schema ([#2681](https://github.com/typescript-eslint/typescript-eslint/issues/2681)) ([a2a2514](https://github.com/typescript-eslint/typescript-eslint/commit/a2a2514f8a8eee478c8697c4ce42d3c586599b14))
- **eslint-plugin:** [naming-convention] check bodyless function parameters ([#2675](https://github.com/typescript-eslint/typescript-eslint/issues/2675)) ([c505863](https://github.com/typescript-eslint/typescript-eslint/commit/c505863ac41755383e08893ba0bc4c0fd937eb1d))
- **eslint-plugin:** [no-invalid-this] allow "this" in class property definitions ([#2685](https://github.com/typescript-eslint/typescript-eslint/issues/2685)) ([dccb6ee](https://github.com/typescript-eslint/typescript-eslint/commit/dccb6ee9f1cd9519c26808d10a5bed8291d0a8e4))
- **eslint-plugin:** [no-misused-promises] False negative in LogicalExpression ([#2682](https://github.com/typescript-eslint/typescript-eslint/issues/2682)) ([30a6951](https://github.com/typescript-eslint/typescript-eslint/commit/30a695103e99d214fd40847aaa51c1631981c226)), closes [#2544](https://github.com/typescript-eslint/typescript-eslint/issues/2544)
- **eslint-plugin:** [no-unnecessary-type-assertion] correct fixer for vue files ([#2680](https://github.com/typescript-eslint/typescript-eslint/issues/2680)) ([55111af](https://github.com/typescript-eslint/typescript-eslint/commit/55111afd7819d29d65da4f41cc6a129f34aaeb3e))
- **eslint-plugin:** [return-await] do not auto-fix when type is `any`/`unknown` ([#2671](https://github.com/typescript-eslint/typescript-eslint/issues/2671)) ([d690c8d](https://github.com/typescript-eslint/typescript-eslint/commit/d690c8dff3636d8c8a9a38bd422e0bedbd1d72cb))
- **parser:** minor fix regexp, map-filter to reduce ([#2684](https://github.com/typescript-eslint/typescript-eslint/issues/2684)) ([f1329f6](https://github.com/typescript-eslint/typescript-eslint/commit/f1329f6c4e3d1de21b1dc59c30ce16503c346eee))

### Features

- **eslint-plugin:** [dot-notation] add `allowProtectedClassPropertyAccess` option ([#2622](https://github.com/typescript-eslint/typescript-eslint/issues/2622)) ([bbc9e35](https://github.com/typescript-eslint/typescript-eslint/commit/bbc9e3540576891552dc2dc54b2acbc54104be9d))
- **eslint-plugin:** [prefer-readonly-parameter-types] add `ignoreInferredTypes` option ([#2668](https://github.com/typescript-eslint/typescript-eslint/issues/2668)) ([91010e8](https://github.com/typescript-eslint/typescript-eslint/commit/91010e88258bf47a0438e842c8ddca19e0414b48))
- **eslint-plugin:** [restrict-plus-operands] add intersection type determination logic ([#2628](https://github.com/typescript-eslint/typescript-eslint/issues/2628)) ([da71362](https://github.com/typescript-eslint/typescript-eslint/commit/da713627c88354229f245866ccf1018fb56b6e53))
- **typescript-estree:** add flag EXPERIMENTAL_useSourceOfProjectReferenceRedirect ([#2669](https://github.com/typescript-eslint/typescript-eslint/issues/2669)) ([90a5878](https://github.com/typescript-eslint/typescript-eslint/commit/90a587845088da1b205e4d7d77dbc3f9447b1c5a))

## [4.4.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.4.0...v4.4.1) (2020-10-12)

### Bug Fixes

- **eslint-plugin:** [ban-ts-comment] support block comments ([#2644](https://github.com/typescript-eslint/typescript-eslint/issues/2644)) ([9c3c686](https://github.com/typescript-eslint/typescript-eslint/commit/9c3c686b59b4b8fd02c479a534b5ca9b33c5ff40))
- **eslint-plugin:** [ban-types] allow banning types with specific parameters ([#2662](https://github.com/typescript-eslint/typescript-eslint/issues/2662)) ([77732a2](https://github.com/typescript-eslint/typescript-eslint/commit/77732a2f3979f638e471b6de327b2ea0e976d568))
- **eslint-plugin:** [consistent-type-assertions] check type assertion in jsx props ([#2653](https://github.com/typescript-eslint/typescript-eslint/issues/2653)) ([393e925](https://github.com/typescript-eslint/typescript-eslint/commit/393e92573fbde849369af1d10b9f25299ec92eaf))
- **eslint-plugin:** [no-duplicate-imports] distinguish member, default ([#2637](https://github.com/typescript-eslint/typescript-eslint/issues/2637)) ([c71f423](https://github.com/typescript-eslint/typescript-eslint/commit/c71f423b89bf034caf2a4f1bb3ed0389b72f3aa9))
- **eslint-plugin:** [no-throw-literal] false positive with logical expressions ([#2645](https://github.com/typescript-eslint/typescript-eslint/issues/2645)) ([57aa6c7](https://github.com/typescript-eslint/typescript-eslint/commit/57aa6c7642320074ed2b6a15e7f38e66a2fb13d1))
- **eslint-plugin:** [no-unused-vars] fix false positives for duplicated names in namespaces ([#2659](https://github.com/typescript-eslint/typescript-eslint/issues/2659)) ([0d696c7](https://github.com/typescript-eslint/typescript-eslint/commit/0d696c72c5c9c3446902a63509d499ee95483e81))
- **eslint-plugin:** [no-use-before-define] correctly handle typeof type references ([#2623](https://github.com/typescript-eslint/typescript-eslint/issues/2623)) ([8e44c78](https://github.com/typescript-eslint/typescript-eslint/commit/8e44c78a20410457851e5b7fe9a24777876c0aaf))
- **scope-manager:** don't create a variable for global augmentation ([#2639](https://github.com/typescript-eslint/typescript-eslint/issues/2639)) ([6bc9325](https://github.com/typescript-eslint/typescript-eslint/commit/6bc93257ec876214743a165093b6666d713379f6))

# [4.4.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.3.0...v4.4.0) (2020-10-05)

### Features

- **eslint-plugin:** add `consistent-indexed-object-style` rule ([#2401](https://github.com/typescript-eslint/typescript-eslint/issues/2401)) ([d7dc108](https://github.com/typescript-eslint/typescript-eslint/commit/d7dc108580cdcb9890ac0539e7223aedbff4a0ed))
- **eslint-plugin:** add extension rule `no-duplicate-imports` ([#2609](https://github.com/typescript-eslint/typescript-eslint/issues/2609)) ([498f397](https://github.com/typescript-eslint/typescript-eslint/commit/498f397ff3898dde631f37311615b555f38a414e))

# [4.3.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.2.0...v4.3.0) (2020-09-28)

### Bug Fixes

- **eslint-plugin:** added safe getTypeOfPropertyOfType wrapper ([#2567](https://github.com/typescript-eslint/typescript-eslint/issues/2567)) ([7cba2de](https://github.com/typescript-eslint/typescript-eslint/commit/7cba2de138542563d678fbfc738cd1b3ebf01e07))
- **experimental-utils:** treat RuleTester arrays as readonly ([#2601](https://github.com/typescript-eslint/typescript-eslint/issues/2601)) ([8025777](https://github.com/typescript-eslint/typescript-eslint/commit/80257776b78bd2b2b4389d6bd530b009a75fb520))

### Features

- **eslint-plugin:** [no-invalid-void-type] add option to allow `this: void` ([#2481](https://github.com/typescript-eslint/typescript-eslint/issues/2481)) ([ddf5660](https://github.com/typescript-eslint/typescript-eslint/commit/ddf5660846784003cab4b10ae7a5e510b9dd562b))

# [4.2.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.1.1...v4.2.0) (2020-09-21)

### Bug Fixes

- **eslint-plugin:** [naming-convention] ignore properties inside object patterns ([#2566](https://github.com/typescript-eslint/typescript-eslint/issues/2566)) ([53a3cbc](https://github.com/typescript-eslint/typescript-eslint/commit/53a3cbc6f002e55135efbdf4982a3ad308ac708b))
- **eslint-plugin:** [prefer-ts-expect-error] support block comments ([#2541](https://github.com/typescript-eslint/typescript-eslint/issues/2541)) ([c6f72fb](https://github.com/typescript-eslint/typescript-eslint/commit/c6f72fbd3ccc19e39954cfe3d36d358ef43b7daa))
- **scope-manager:** correct analysis of inferred types in conditional types ([#2537](https://github.com/typescript-eslint/typescript-eslint/issues/2537)) ([4f660fd](https://github.com/typescript-eslint/typescript-eslint/commit/4f660fd31acbb88b30719f925dcb2b3022cc2bab))

### Features

- **eslint-plugin:** add extension rule `comma-dangle` ([#2416](https://github.com/typescript-eslint/typescript-eslint/issues/2416)) ([f7babcf](https://github.com/typescript-eslint/typescript-eslint/commit/f7babcf4e6da3e5cba8f2c75d57abf8089432d05))

## [4.1.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.1.0...v4.1.1) (2020-09-14)

### Bug Fixes

- **eslint-plugin:** [naming-convention] allow an array of selectors with types and modifiers ([#2415](https://github.com/typescript-eslint/typescript-eslint/issues/2415)) ([7ca54c3](https://github.com/typescript-eslint/typescript-eslint/commit/7ca54c3e4601ad07db5b882a67965cd67a18c4b3))
- **eslint-plugin:** [no-implied-eval] handle the `Function` type ([#2435](https://github.com/typescript-eslint/typescript-eslint/issues/2435)) ([e1401dc](https://github.com/typescript-eslint/typescript-eslint/commit/e1401dc5897d01da516802cfb2333cf4bc6d0e93))
- **eslint-plugin:** [no-unused-vars] better handling for declared modules ([#2553](https://github.com/typescript-eslint/typescript-eslint/issues/2553)) ([02d72d4](https://github.com/typescript-eslint/typescript-eslint/commit/02d72d480be7a8f7ddc66a028338cfb996886f3c)), closes [#2523](https://github.com/typescript-eslint/typescript-eslint/issues/2523)
- **eslint-plugin:** [no-use-before-define] false positive for function type arguments ([#2554](https://github.com/typescript-eslint/typescript-eslint/issues/2554)) ([189162d](https://github.com/typescript-eslint/typescript-eslint/commit/189162d46ecb116c420232937a7f86df913f4e79)), closes [#2527](https://github.com/typescript-eslint/typescript-eslint/issues/2527)
- **eslint-plugin:** [prefer-function-type] handle `this` return ([#2437](https://github.com/typescript-eslint/typescript-eslint/issues/2437)) ([7c6fcee](https://github.com/typescript-eslint/typescript-eslint/commit/7c6fcee657dffd041e389e0aeaa4f3e278e92986))
- **eslint-plugin:** [return-await] don't error for `in-try-catch` if the return is in a `catch` without a `finally` ([#2356](https://github.com/typescript-eslint/typescript-eslint/issues/2356)) ([efdd521](https://github.com/typescript-eslint/typescript-eslint/commit/efdd5213ceaef332cf0b2c26573176f844d22a09))
- **types:** artificial fix needed to trigger release ([b577daf](https://github.com/typescript-eslint/typescript-eslint/commit/b577daf27cd87870b6e095e4e995519f96d321dd))
- **types:** artificial fix needed to trigger release ([fc62ba8](https://github.com/typescript-eslint/typescript-eslint/commit/fc62ba8622ed634e4c2d8399a4e880f983747181))

# [4.1.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.0.1...v4.1.0) (2020-09-07)

### Bug Fixes

- **eslint-plugin:** [explicit-module-boundary-types] cyclical reference infinite recursion crash ([#2482](https://github.com/typescript-eslint/typescript-eslint/issues/2482)) ([8693653](https://github.com/typescript-eslint/typescript-eslint/commit/86936537bd6f1075cbceeb8d2d4e254d75188409))
- **eslint-plugin:** [no-unused-vars] correct detection of unused vars in a declared module with `export =` ([#2505](https://github.com/typescript-eslint/typescript-eslint/issues/2505)) ([3d07a99](https://github.com/typescript-eslint/typescript-eslint/commit/3d07a99faa0a5fc1b44acdb43ddbfc90a5105833))
- **eslint-plugin:** [no-unused-vars] properly handle ambient declaration exports ([#2496](https://github.com/typescript-eslint/typescript-eslint/issues/2496)) ([4d3ce5f](https://github.com/typescript-eslint/typescript-eslint/commit/4d3ce5f696985389bf53a31d62766041c703c70c))
- **eslint-plugin:** [no-use-before-define] false positive with jsx pragma reference ([#2503](https://github.com/typescript-eslint/typescript-eslint/issues/2503)) ([5afeeab](https://github.com/typescript-eslint/typescript-eslint/commit/5afeeab24ad013142f2431750f24e6085d0a6f3a)), closes [#2502](https://github.com/typescript-eslint/typescript-eslint/issues/2502)
- **eslint-plugin:** [typedef] false positive for rest parameter with array destructuring ([#2441](https://github.com/typescript-eslint/typescript-eslint/issues/2441)) ([2ada5af](https://github.com/typescript-eslint/typescript-eslint/commit/2ada5aff1ef37bc260d7a0eaafe9ff04f8a08fe4))
- **eslint-plugin:** handle missing message IDs in eslint v5/v6 ([#2461](https://github.com/typescript-eslint/typescript-eslint/issues/2461)) ([ffdfade](https://github.com/typescript-eslint/typescript-eslint/commit/ffdfade106d602bcc12b074bdfa489e9f661491e))
- **scope-manager:** add `const` as a global type variable ([#2499](https://github.com/typescript-eslint/typescript-eslint/issues/2499)) ([eb3f6e3](https://github.com/typescript-eslint/typescript-eslint/commit/eb3f6e39391d62ac424baa305a15e61806b2fd65))
- **scope-manager:** correctly handle inferred types in nested type scopes ([#2497](https://github.com/typescript-eslint/typescript-eslint/issues/2497)) ([95f6bf4](https://github.com/typescript-eslint/typescript-eslint/commit/95f6bf4818cdec48a0583bf82f928c598af22736))
- **scope-manager:** don't create references for intrinsic JSX elements ([#2504](https://github.com/typescript-eslint/typescript-eslint/issues/2504)) ([cdb9807](https://github.com/typescript-eslint/typescript-eslint/commit/cdb9807a5a368a136856cd03048b68e0f2dfb405))
- **scope-manager:** fallback to lib 'esnext' or 'es5' when ecma version is unsupported ([#2474](https://github.com/typescript-eslint/typescript-eslint/issues/2474)) ([20a7dcc](https://github.com/typescript-eslint/typescript-eslint/commit/20a7dcc808a39cd447d6e52fc5a1e1373d7122e9))
- **scope-manager:** support rest function type parameters ([#2491](https://github.com/typescript-eslint/typescript-eslint/issues/2491)) ([9d8b4c4](https://github.com/typescript-eslint/typescript-eslint/commit/9d8b4c479c98623e4198aa07639321929a8a876f)), closes [#2449](https://github.com/typescript-eslint/typescript-eslint/issues/2449)
- **scope-manager:** support tagged template string generic type parameters ([#2492](https://github.com/typescript-eslint/typescript-eslint/issues/2492)) ([a2686c0](https://github.com/typescript-eslint/typescript-eslint/commit/a2686c04293ab9070c1500a0dab7e205bd1fa9d2))
- **scope-manager:** support type predicates ([#2493](https://github.com/typescript-eslint/typescript-eslint/issues/2493)) ([a40f54c](https://github.com/typescript-eslint/typescript-eslint/commit/a40f54c39d59096a0d12a492807dcd52fbcdc384)), closes [#2462](https://github.com/typescript-eslint/typescript-eslint/issues/2462)
- **scope-manager:** treat type imports as both values and types ([#2494](https://github.com/typescript-eslint/typescript-eslint/issues/2494)) ([916e95a](https://github.com/typescript-eslint/typescript-eslint/commit/916e95a505689746dda38a67148c95cc7d207d9f)), closes [#2453](https://github.com/typescript-eslint/typescript-eslint/issues/2453)

### Features

- **eslint-plugin:** [no-shadow] add option `ignoreFunctionTypeParameterNameValueShadow` ([#2470](https://github.com/typescript-eslint/typescript-eslint/issues/2470)) ([bfe255f](https://github.com/typescript-eslint/typescript-eslint/commit/bfe255fde0cb5fe5e32c02eb5ba35d27fb23d9ea))
- **eslint-plugin:** add extension rule `no-loop-func` ([#2490](https://github.com/typescript-eslint/typescript-eslint/issues/2490)) ([36305df](https://github.com/typescript-eslint/typescript-eslint/commit/36305df74b3c26b60364f7ec13390be492b4b2ec))
- **scope-manager:** add support for JSX scope analysis ([#2498](https://github.com/typescript-eslint/typescript-eslint/issues/2498)) ([f887ab5](https://github.com/typescript-eslint/typescript-eslint/commit/f887ab51f58c1b3571f9a14832864bc0ca59623f)), closes [#2455](https://github.com/typescript-eslint/typescript-eslint/issues/2455) [#2477](https://github.com/typescript-eslint/typescript-eslint/issues/2477)

## [4.0.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.0.0...v4.0.1) (2020-08-31)

### Bug Fixes

- **eslint-plugin:** update parser dependency range ([#2445](https://github.com/typescript-eslint/typescript-eslint/issues/2445)) ([2cb6620](https://github.com/typescript-eslint/typescript-eslint/commit/2cb66205de797479d9b2d362652c42fe032e913b)), closes [#2444](https://github.com/typescript-eslint/typescript-eslint/issues/2444)

# [4.0.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.10.1...v4.0.0) (2020-08-31)

## [Please see the release notes for v4.0.0](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v4.0.0)

### Bug Fixes

- **eslint-plugin:** [no-shadow] fix false-positive on enum declaration ([#2374](https://github.com/typescript-eslint/typescript-eslint/issues/2374)) ([9de669f](https://github.com/typescript-eslint/typescript-eslint/commit/9de669f339fef62a98f745dc08b833aa5c632e62))
- **eslint-plugin:** [no-unused-vars] handle TSCallSignature ([#2336](https://github.com/typescript-eslint/typescript-eslint/issues/2336)) ([c70f54f](https://github.com/typescript-eslint/typescript-eslint/commit/c70f54fd3a46a12060ae3aec0faae872c431dd88))
- correct decorator traversal for AssignmentPattern ([#2375](https://github.com/typescript-eslint/typescript-eslint/issues/2375)) ([d738fa4](https://github.com/typescript-eslint/typescript-eslint/commit/d738fa4eff0a5c4cfc9b30b1c0502f8d1e78d7b6))
- **scope-manager:** correct analysis of abstract class properties ([#2420](https://github.com/typescript-eslint/typescript-eslint/issues/2420)) ([cd84549](https://github.com/typescript-eslint/typescript-eslint/commit/cd84549beba3cf471d75cfd9ba26f80366842ed5))
- **typescript-estree:** correct ChainExpression interaction with parentheses and non-nulls ([#2380](https://github.com/typescript-eslint/typescript-eslint/issues/2380)) ([762bc99](https://github.com/typescript-eslint/typescript-eslint/commit/762bc99584ede4d0b8099a743991e957aec86aa8))

### Features

- consume new scope analysis package ([#2039](https://github.com/typescript-eslint/typescript-eslint/issues/2039)) ([3be125d](https://github.com/typescript-eslint/typescript-eslint/commit/3be125d9bdbee1984ac6037874edf619213bd3d0))
- support ESTree optional chaining representation ([#2308](https://github.com/typescript-eslint/typescript-eslint/issues/2308)) ([e9d2ab6](https://github.com/typescript-eslint/typescript-eslint/commit/e9d2ab638b6767700b52797e74b814ea059beaae))
- **eslint-plugin:** [ban-ts-comment] change default for `ts-expect-error` to `allow-with-description` ([#2351](https://github.com/typescript-eslint/typescript-eslint/issues/2351)) ([a3f163a](https://github.com/typescript-eslint/typescript-eslint/commit/a3f163abc03f0fefc6dca1f205b728a4425209e4)), closes [#2146](https://github.com/typescript-eslint/typescript-eslint/issues/2146)
- **eslint-plugin:** [no-unnecessary-condition][strict-boolean-expressions] add option to make the rules error on files without `strictNullChecks` turned on ([#2345](https://github.com/typescript-eslint/typescript-eslint/issues/2345)) ([9273441](https://github.com/typescript-eslint/typescript-eslint/commit/9273441f7592b52620e10432cb2dd4dc5c3b4db1))
- **eslint-plugin:** [typedef] remove all defaults ([#2352](https://github.com/typescript-eslint/typescript-eslint/issues/2352)) ([a9cd6fb](https://github.com/typescript-eslint/typescript-eslint/commit/a9cd6fb893074e4f2ca9ad3497eaddfacb3cfd25))
- **eslint-plugin:** add `consistent-type-imports` rule ([#2367](https://github.com/typescript-eslint/typescript-eslint/issues/2367)) ([58b1c2d](https://github.com/typescript-eslint/typescript-eslint/commit/58b1c2d463f34895798b9a61340e49ffc3ec4f1a))
- **typescript-estree:** switch to globby ([#2418](https://github.com/typescript-eslint/typescript-eslint/issues/2418)) ([3a7ec9b](https://github.com/typescript-eslint/typescript-eslint/commit/3a7ec9bcf1873a99c6da2f19ade8ab4763b4793c)), closes [#2398](https://github.com/typescript-eslint/typescript-eslint/issues/2398)

### BREAKING CHANGES

- **typescript-estree:** - removes the ability to supply a `RegExp` to `projectFolderIgnoreList`, and changes the meaning of the string value from a regex to a glob.
- - Removed decorators property from several Nodes that could never semantically have them (FunctionDeclaration, TSEnumDeclaration, and TSInterfaceDeclaration)

* Removed AST_NODE_TYPES.Import. This is a minor breaking change as the node type that used this was removed ages ago.

- **eslint-plugin:** Default rule options is a breaking change.

## [3.10.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.10.0...v3.10.1) (2020-08-25)

### Bug Fixes

- **eslint-plugin:** [no-unnecessary-condition] correct regression with unary negations ([#2422](https://github.com/typescript-eslint/typescript-eslint/issues/2422)) ([d1f0887](https://github.com/typescript-eslint/typescript-eslint/commit/d1f08879338c825a1a20406fe47c051a287d6519)), closes [#2421](https://github.com/typescript-eslint/typescript-eslint/issues/2421)

# [3.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.9.1...v3.10.0) (2020-08-24)

### Bug Fixes

- **eslint-plugin:** [explicit-module-boundary-types] ignore abstract setters ([#2410](https://github.com/typescript-eslint/typescript-eslint/issues/2410)) ([3764248](https://github.com/typescript-eslint/typescript-eslint/commit/3764248084455409f085c5bc4706079405cef618))
- **eslint-plugin:** [explicit-module-boundary-types] ignore all bodyless setters ([#2413](https://github.com/typescript-eslint/typescript-eslint/issues/2413)) ([a53f8c6](https://github.com/typescript-eslint/typescript-eslint/commit/a53f8c6ff37aa47b3fc1b729e359d81ea079ff75))
- **eslint-plugin:** [no-unnecessary-condition] better handling for unary negation ([#2382](https://github.com/typescript-eslint/typescript-eslint/issues/2382)) ([32fe2bb](https://github.com/typescript-eslint/typescript-eslint/commit/32fe2bb4fe5524355eef4f3a9bd85c824e9d7f46))
- **typescript-estree:** ts.NamedTupleMember workaround for <TS4.0 ([#2405](https://github.com/typescript-eslint/typescript-eslint/issues/2405)) ([b62331a](https://github.com/typescript-eslint/typescript-eslint/commit/b62331ad02dcff3236e18f10eb92d59e7371d4c3))

### Features

- **eslint-plugin:** add `no-implicit-any-catch` rule ([#2202](https://github.com/typescript-eslint/typescript-eslint/issues/2202)) ([fde89d4](https://github.com/typescript-eslint/typescript-eslint/commit/fde89d4d392ef35cac2bc09f2774bfe397b20100))
- **typescript-estree:** update allowed TS version range ([#2419](https://github.com/typescript-eslint/typescript-eslint/issues/2419)) ([e6be621](https://github.com/typescript-eslint/typescript-eslint/commit/e6be62128b3a98541fe590512892c4b501914e46))

## [3.9.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.9.0...v3.9.1) (2020-08-17)

### Bug Fixes

- **eslint-plugin:** [no-unnecessary-condition] fix false positive with nullish coalescing ([#2385](https://github.com/typescript-eslint/typescript-eslint/issues/2385)) ([092c969](https://github.com/typescript-eslint/typescript-eslint/commit/092c96967fd9b58fb2d8d325e1dbc750ccbeb746))
- **eslint-plugin:** [prefer-includes] don't auto fix when `test` method's argument type doesn't have an 'includes' method ([#2391](https://github.com/typescript-eslint/typescript-eslint/issues/2391)) ([71c4c72](https://github.com/typescript-eslint/typescript-eslint/commit/71c4c729e90e308e0afd70af7db5e9d9ff238527))

# [3.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.8.0...v3.9.0) (2020-08-10)

### Bug Fixes

- **eslint-plugin:** [no-throw-literal] support type assertions ([#2354](https://github.com/typescript-eslint/typescript-eslint/issues/2354)) ([470174a](https://github.com/typescript-eslint/typescript-eslint/commit/470174ad51fdb12d82129a896559075513f6c912))

### Features

- **eslint-plugin:** [no-unsafe-assignment/return] allow assigning any => unknown ([#2371](https://github.com/typescript-eslint/typescript-eslint/issues/2371)) ([e7528e6](https://github.com/typescript-eslint/typescript-eslint/commit/e7528e686f5fe5cce8504fc15d3cd06b8733712e))
- **typescript-estree:** support TSv4 labelled tuple members ([#2378](https://github.com/typescript-eslint/typescript-eslint/issues/2378)) ([00d84ff](https://github.com/typescript-eslint/typescript-eslint/commit/00d84ffbcbe9d0ec98bdb2f2ce59959a27ce4dbe))

# [3.8.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.7.1...v3.8.0) (2020-08-03)

### Bug Fixes

- **eslint-plugin:** [no-implied-eval] don't report when `Function` is imported ([#2348](https://github.com/typescript-eslint/typescript-eslint/issues/2348)) ([fa169e7](https://github.com/typescript-eslint/typescript-eslint/commit/fa169e79661821f0e0e64a56d6db9da42c3c8654))
- **eslint-plugin:** [no-unsafe-assignment] fix typo in message ([#2347](https://github.com/typescript-eslint/typescript-eslint/issues/2347)) ([2027bb1](https://github.com/typescript-eslint/typescript-eslint/commit/2027bb11689b76c297f93ba8a918b35fe68e5b9d))

### Features

- **eslint-plugin:** [naming-convention] allow specifying an array of selectors ([#2335](https://github.com/typescript-eslint/typescript-eslint/issues/2335)) ([3ef6bd5](https://github.com/typescript-eslint/typescript-eslint/commit/3ef6bd5cadc225e42ef1330d15919a39f53f2a2b))
- **eslint-plugin:** add `prefer-enum-initializers` rule ([#2326](https://github.com/typescript-eslint/typescript-eslint/issues/2326)) ([4f38ea3](https://github.com/typescript-eslint/typescript-eslint/commit/4f38ea39c97289db11501d6368d01db8c5787257))

## [3.7.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.7.0...v3.7.1) (2020-07-27)

### Bug Fixes

- **eslint-plugin:** [adjacent-overload-signatures] fix false positive on call signatures and a method named `call` ([#2313](https://github.com/typescript-eslint/typescript-eslint/issues/2313)) ([30fafb0](https://github.com/typescript-eslint/typescript-eslint/commit/30fafb09422b3aca881f4785d89b0536092d4952))
- **eslint-plugin:** [no-extra-parens] stop reporting on calling generic functions with one argument and type parameters containing parentheses ([#2319](https://github.com/typescript-eslint/typescript-eslint/issues/2319)) ([616a841](https://github.com/typescript-eslint/typescript-eslint/commit/616a841032bec310d9f31f1c987888273df27008))
- **typescript-estree:** correct AST regression introduced by TS4.0 upgrade ([#2316](https://github.com/typescript-eslint/typescript-eslint/issues/2316)) ([d7fefba](https://github.com/typescript-eslint/typescript-eslint/commit/d7fefba3741a526ff2b58dd713995c3ee5603962))

# [3.7.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.6.1...v3.7.0) (2020-07-20)

### Features

- **eslint-plugin:** [naming-convention] allow selecting only `const` variables ([#2291](https://github.com/typescript-eslint/typescript-eslint/issues/2291)) ([156d058](https://github.com/typescript-eslint/typescript-eslint/commit/156d058fee835fdf1ed827a5ad4a80d57190cc54))
- **eslint-plugin:** [no-empty-function] add `decoratedFunctions` option ([#2295](https://github.com/typescript-eslint/typescript-eslint/issues/2295)) ([88f08f4](https://github.com/typescript-eslint/typescript-eslint/commit/88f08f410760f58fdc2de58ecd9dab9610821642))
- **typescript-estree:** support short-circuiting assignment operators ([#2307](https://github.com/typescript-eslint/typescript-eslint/issues/2307)) ([2c90d9f](https://github.com/typescript-eslint/typescript-eslint/commit/2c90d9fa3aa5ebd7db697dddb7762bca2dd0e06b))
- **typescript-estree:** support type annotations on catch clauses ([#2306](https://github.com/typescript-eslint/typescript-eslint/issues/2306)) ([b5afe9c](https://github.com/typescript-eslint/typescript-eslint/commit/b5afe9c560b9f38c8dffc312a600db30944129c8))

## [3.6.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.6.0...v3.6.1) (2020-07-13)

### Bug Fixes

- **eslint-plugin:** [no-unnecessary-condition] handle computed member access ([#2288](https://github.com/typescript-eslint/typescript-eslint/issues/2288)) ([3a187ca](https://github.com/typescript-eslint/typescript-eslint/commit/3a187cafb7302a3c05de0e6a236dd142a5e2d741))
- **eslint-plugin:** [prefer-literal-enum-member] allow negative numbers ([#2277](https://github.com/typescript-eslint/typescript-eslint/issues/2277)) ([00ac9c3](https://github.com/typescript-eslint/typescript-eslint/commit/00ac9c3ccaad27bab08ec3c3a104f612bb593df5))
- **eslint-plugin:** [space-before-function-paren] incorrect handling of abstract methods ([#2275](https://github.com/typescript-eslint/typescript-eslint/issues/2275)) ([ced6591](https://github.com/typescript-eslint/typescript-eslint/commit/ced65918b16f46c383496a9b4bd43eca8a76baf6)), closes [#2274](https://github.com/typescript-eslint/typescript-eslint/issues/2274)
- **eslint-plugin:** [switch-exhaustiveness-check] handle special characters in enum keys ([#2207](https://github.com/typescript-eslint/typescript-eslint/issues/2207)) ([98ab010](https://github.com/typescript-eslint/typescript-eslint/commit/98ab010fb7fca884984bb4200fd806ecee8071b6))

# [3.6.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.5.0...v3.6.0) (2020-07-06)

### Bug Fixes

- **eslint-plugin:** [no-namespace] allow namespaces in nested declarations with `allowDeclarations` ([#2238](https://github.com/typescript-eslint/typescript-eslint/issues/2238)) ([c1df669](https://github.com/typescript-eslint/typescript-eslint/commit/c1df6694f7866d3ef7ede0b1c6c9dd6f3955e682))
- **eslint-plugin:** [space-before-function-paren] handle abstract functions ([#2199](https://github.com/typescript-eslint/typescript-eslint/issues/2199)) ([88a3edf](https://github.com/typescript-eslint/typescript-eslint/commit/88a3edfce8349f871b7b660d2b76508b67c94eda))

### Features

- **eslint-plugin:** add rule `prefer-literal-enum-member` ([#1898](https://github.com/typescript-eslint/typescript-eslint/issues/1898)) ([fe2b2ec](https://github.com/typescript-eslint/typescript-eslint/commit/fe2b2ec39ef04ac8b73eef9d29d12fd1b24fa183))

# [3.5.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.4.0...v3.5.0) (2020-06-29)

### Bug Fixes

- **eslint-plugin:** [naming-convention] support unicode in regex ([#2241](https://github.com/typescript-eslint/typescript-eslint/issues/2241)) ([5fdd21a](https://github.com/typescript-eslint/typescript-eslint/commit/5fdd21a1726fb6928098c4152aec55a30df960d4))
- **typescript-estree:** forward compatibility for new compound assignment operators ([#2253](https://github.com/typescript-eslint/typescript-eslint/issues/2253)) ([ba41680](https://github.com/typescript-eslint/typescript-eslint/commit/ba41680f2a25b1aa4d05c2d4b132ac73a6faefbd))

### Features

- add package scope-manager ([#1939](https://github.com/typescript-eslint/typescript-eslint/issues/1939)) ([682eb7e](https://github.com/typescript-eslint/typescript-eslint/commit/682eb7e009c3f22a542882dfd3602196a60d2a1e))
- split types into their own package ([#2229](https://github.com/typescript-eslint/typescript-eslint/issues/2229)) ([5f45918](https://github.com/typescript-eslint/typescript-eslint/commit/5f4591886f3438329fbf2229b03ac66174334a24))
- split visitor keys into their own package ([#2230](https://github.com/typescript-eslint/typescript-eslint/issues/2230)) ([689dae3](https://github.com/typescript-eslint/typescript-eslint/commit/689dae37392d527c64ae83db2a4c3e6b7fecece7))

# [3.4.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.3.0...v3.4.0) (2020-06-22)

### Bug Fixes

- **eslint-plugin:** [no-base-to-string] handle intersection types ([#2170](https://github.com/typescript-eslint/typescript-eslint/issues/2170)) ([9cca3a9](https://github.com/typescript-eslint/typescript-eslint/commit/9cca3a9584d5d5ef0536219c5a734f4e87efb543))
- **eslint-plugin:** [unbound-method] handling destructuring ([#2228](https://github.com/typescript-eslint/typescript-eslint/issues/2228)) ([c3753c2](https://github.com/typescript-eslint/typescript-eslint/commit/c3753c21768d355ecdb9e7ae8e0bfdfbbc1d3bbe))
- **experimental-utils:** correct types for TS versions older than 3.8 ([#2217](https://github.com/typescript-eslint/typescript-eslint/issues/2217)) ([5e4dda2](https://github.com/typescript-eslint/typescript-eslint/commit/5e4dda264a7d6a6a1626848e7599faea1ac34922))
- **experimental-utils:** getParserServices takes a readonly context ([#2235](https://github.com/typescript-eslint/typescript-eslint/issues/2235)) ([26da8de](https://github.com/typescript-eslint/typescript-eslint/commit/26da8de7fcde9eddec63212d79af781c4bb22991))

### Features

- **eslint-plugin:** [no-unnecessary-boolean-literal-compare] add option to check nullable booleans ([#1983](https://github.com/typescript-eslint/typescript-eslint/issues/1983)) ([c0b3057](https://github.com/typescript-eslint/typescript-eslint/commit/c0b3057b7f7d515891ad2efe32e4ef8c01e0478f))
- **eslint-plugin:** add extension rule `no-loss-of-precision` ([#2196](https://github.com/typescript-eslint/typescript-eslint/issues/2196)) ([535b0f2](https://github.com/typescript-eslint/typescript-eslint/commit/535b0f2ddd82efa6a2c40307a61c480f4b3cdea3))

# [3.3.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.2.0...v3.3.0) (2020-06-15)

### Bug Fixes

- **eslint-plugin:** [no-unused-expressions] handle ternary and short-circuit options ([#2194](https://github.com/typescript-eslint/typescript-eslint/issues/2194)) ([ee9f100](https://github.com/typescript-eslint/typescript-eslint/commit/ee9f100a2f9a874c2b361482742686eeaa9bdac7))
- **typescript-estree:** handle TS4.0 breaking change in TupleType ([#2197](https://github.com/typescript-eslint/typescript-eslint/issues/2197)) ([5d68129](https://github.com/typescript-eslint/typescript-eslint/commit/5d6812914831a386997b453b4db1e3283e26005d))

### Features

- **eslint-plugin:** [naming-convention] better error message and docs for prefix/suffix ([#2195](https://github.com/typescript-eslint/typescript-eslint/issues/2195)) ([a2ffe55](https://github.com/typescript-eslint/typescript-eslint/commit/a2ffe5568df0f7224bfe9141d298e538383d5f09))

# [3.2.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.1.0...v3.2.0) (2020-06-08)

### Bug Fixes

- **eslint-plugin:** [explicit-module-boundary-types] dont report return type errors on constructor overloads ([#2158](https://github.com/typescript-eslint/typescript-eslint/issues/2158)) ([53232d7](https://github.com/typescript-eslint/typescript-eslint/commit/53232d775ca0b808e2d75d9501f4411a868b2b48))
- **eslint-plugin:** [explicit-module-boundary-types] handle bodyless arrow functions with explicit return types that return functions ([#2169](https://github.com/typescript-eslint/typescript-eslint/issues/2169)) ([58db655](https://github.com/typescript-eslint/typescript-eslint/commit/58db655133aaae006efe3e3ceee971cf88dc348f))
- **eslint-plugin:** [explicit-module-boundary-types] handle nested functions and functions expressions in a typed variable declaration ([#2176](https://github.com/typescript-eslint/typescript-eslint/issues/2176)) ([6ff450d](https://github.com/typescript-eslint/typescript-eslint/commit/6ff450da3abec93223a33f6b52484c9ca99b7abe))
- **eslint-plugin:** [no-extra-non-null-assertion] dont report for assertions not followed by the optional chain ([#2167](https://github.com/typescript-eslint/typescript-eslint/issues/2167)) ([e4c1834](https://github.com/typescript-eslint/typescript-eslint/commit/e4c1834c7c5934332dd1d58c09018453568c4889))
- **eslint-plugin:** [no-unnecessary-conditionals] Handle comparison of generics and loose comparisons with undefined values ([#2152](https://github.com/typescript-eslint/typescript-eslint/issues/2152)) ([c86e2a2](https://github.com/typescript-eslint/typescript-eslint/commit/c86e2a235372149db9b1700d39c2145e0ce5221a))
- **eslint-plugin:** [prefer-optional-chain] handling first member expression ([#2156](https://github.com/typescript-eslint/typescript-eslint/issues/2156)) ([de18660](https://github.com/typescript-eslint/typescript-eslint/commit/de18660a8cf8f7033798646d8c5b0938d1accb12))
- **eslint-plugin:** [return-await] correct handling of ternaries ([#2168](https://github.com/typescript-eslint/typescript-eslint/issues/2168)) ([fe4c0bf](https://github.com/typescript-eslint/typescript-eslint/commit/fe4c0bf8c04f070d6642fbe86c5e5614bc88e8fd))

### Features

- **eslint-plugin:** [naming-convention] put identifiers in quotes in error messages ([#2182](https://github.com/typescript-eslint/typescript-eslint/issues/2182)) ([fc61932](https://github.com/typescript-eslint/typescript-eslint/commit/fc619326eedf7ef2efa51444ecdead81a36a204f)), closes [#2178](https://github.com/typescript-eslint/typescript-eslint/issues/2178)
- **eslint-plugin:** [require-array-sort-compare] add `ignoreStringArrays` option ([#1972](https://github.com/typescript-eslint/typescript-eslint/issues/1972)) ([6dee784](https://github.com/typescript-eslint/typescript-eslint/commit/6dee7840a3af1dfe4c38a128d1c4655bdac625df))
- **eslint-plugin:** add rule `ban-tslint-comment` ([#2140](https://github.com/typescript-eslint/typescript-eslint/issues/2140)) ([43ee226](https://github.com/typescript-eslint/typescript-eslint/commit/43ee226ffbaaa3e7126081db9476c24b89ec16e9))
- **eslint-plugin:** add rule `no-confusing-non-null-assertion` ([#1941](https://github.com/typescript-eslint/typescript-eslint/issues/1941)) ([9b51c44](https://github.com/typescript-eslint/typescript-eslint/commit/9b51c44f29d8b3e95a510985544e8ded8a14404d))

# [3.1.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.0.2...v3.1.0) (2020-06-01)

### Bug Fixes

- **eslint-plugin:** [explicit-module-boundary-types] don't check returned functions if parent function has return type ([#2084](https://github.com/typescript-eslint/typescript-eslint/issues/2084)) ([d7d4eeb](https://github.com/typescript-eslint/typescript-eslint/commit/d7d4eeb03f2918d5d9e361fdb47c2d42e83bd593))
- **eslint-plugin:** [no-unnecessary-condition] handle comparison of any, unknown and loose comparisons with nullish values ([#2123](https://github.com/typescript-eslint/typescript-eslint/issues/2123)) ([1ae1d01](https://github.com/typescript-eslint/typescript-eslint/commit/1ae1d01e5603ec7cef8051ed018c3c3c88b29867))
- **eslint-plugin:** [no-unnecessary-condition] improve optional chain handling ([#2111](https://github.com/typescript-eslint/typescript-eslint/issues/2111)) ([9ee399b](https://github.com/typescript-eslint/typescript-eslint/commit/9ee399b5906e82f346ff89141207a6630786de54))
- **eslint-plugin:** [no-unnecessary-condition] improve optional chain handling 2 - electric boogaloo ([#2138](https://github.com/typescript-eslint/typescript-eslint/issues/2138)) ([c87cfaf](https://github.com/typescript-eslint/typescript-eslint/commit/c87cfaf6746775bb8ad9eb45b0002f068a822dbe))
- **eslint-plugin:** [no-unused-expressions] ignore import expressions ([#2130](https://github.com/typescript-eslint/typescript-eslint/issues/2130)) ([e383691](https://github.com/typescript-eslint/typescript-eslint/commit/e3836910efdafd9edf04daed149c9e839c08047e))
- **eslint-plugin:** [no-var-requires] false negative for TSAsExpression and MemberExpression ([#2139](https://github.com/typescript-eslint/typescript-eslint/issues/2139)) ([df95338](https://github.com/typescript-eslint/typescript-eslint/commit/df953388913b22d45242e65ce231d92a8b8a0080))
- **experimental-utils:** downlevel type declarations for versions older than 3.8 ([#2133](https://github.com/typescript-eslint/typescript-eslint/issues/2133)) ([7925823](https://github.com/typescript-eslint/typescript-eslint/commit/792582326a8065270b69a0ffcaad5a7b4b103ff3))

### Features

- **eslint-plugin:** [ban-ts-comments] add "allow-with-description" option ([#2099](https://github.com/typescript-eslint/typescript-eslint/issues/2099)) ([8a0fd18](https://github.com/typescript-eslint/typescript-eslint/commit/8a0fd1899f544470a35afb3117f4c71aad7e4e42))
- **eslint-plugin:** [ban-types] allow selective disable of default options with `false` value ([#2137](https://github.com/typescript-eslint/typescript-eslint/issues/2137)) ([1cb8ca4](https://github.com/typescript-eslint/typescript-eslint/commit/1cb8ca483d029935310e6904580df8501837084d))
- **eslint-plugin:** [explicit-module-boundary-types] improve accuracy and coverage ([#2135](https://github.com/typescript-eslint/typescript-eslint/issues/2135)) ([caaa859](https://github.com/typescript-eslint/typescript-eslint/commit/caaa8599284d02ab3341e282cad35a52d0fb86c7))

## [3.0.2](https://github.com/typescript-eslint/typescript-eslint/compare/v3.0.1...v3.0.2) (2020-05-27)

### Bug Fixes

- regression for eslint v6 ([#2105](https://github.com/typescript-eslint/typescript-eslint/issues/2105)) ([31fc503](https://github.com/typescript-eslint/typescript-eslint/commit/31fc5039ed919e1515fda673c186d5c83eb5beb3))

## [3.0.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.0.0...v3.0.1) (2020-05-25)

### Bug Fixes

- **eslint-plugin:** [naming-convention] handle no options correctly ([#2095](https://github.com/typescript-eslint/typescript-eslint/issues/2095)) ([fd7d02b](https://github.com/typescript-eslint/typescript-eslint/commit/fd7d02b31ebd995b7fdd857d7c054042aa4f2001))
- **eslint-plugin:** [no-throw-literal] handle intersection and union types ([#2085](https://github.com/typescript-eslint/typescript-eslint/issues/2085)) ([cae037f](https://github.com/typescript-eslint/typescript-eslint/commit/cae037ff9b20363b970cc600a09505b98bf10a14))
- **eslint-plugin:** [unbound-method] fix crash due to missing `Intl` ([#2090](https://github.com/typescript-eslint/typescript-eslint/issues/2090)) ([f2fa82c](https://github.com/typescript-eslint/typescript-eslint/commit/f2fa82c532ae858ccfb064268cfcc9df657a54be))
- **experimental-utils:** export `CLIEngine` & `ESLint` ([#2083](https://github.com/typescript-eslint/typescript-eslint/issues/2083)) ([014341b](https://github.com/typescript-eslint/typescript-eslint/commit/014341bb23261f609fc2a6fe7fece191466a084a))
- **typescript-estree:** handle `BigInt` with `_` numeric separator ([#2067](https://github.com/typescript-eslint/typescript-eslint/issues/2067)) ([66f1627](https://github.com/typescript-eslint/typescript-eslint/commit/66f1627b11a566d5b925a577e800f99d5c808be2))
- **typescript-estree:** mark TS 3.8 and 3.9 as "supported" ([#2057](https://github.com/typescript-eslint/typescript-eslint/issues/2057)) ([5eedbff](https://github.com/typescript-eslint/typescript-eslint/commit/5eedbff01178ea33b98ab22e556df4c1a195f839)), closes [#1436](https://github.com/typescript-eslint/typescript-eslint/issues/1436) [#1436](https://github.com/typescript-eslint/typescript-eslint/issues/1436)

# [3.0.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.34.0...v3.0.0) (2020-05-21)

## [Please see the release notes for v3.0.0](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v3.0.0)

### Bug Fixes

- **eslint-plugin:** [dot-notation] fix typo in schema ([#2040](https://github.com/typescript-eslint/typescript-eslint/issues/2040)) ([242328f](https://github.com/typescript-eslint/typescript-eslint/commit/242328fa749ee4c72af93433a9bef95f329ac62f))
- **eslint-plugin:** correct parser peerDep version ([fe59f69](https://github.com/typescript-eslint/typescript-eslint/commit/fe59f69381a0915a4f5135e2e88637a5eea246ba))
- **experimental-utils:** add back SourceCode.isSpaceBetweenTokens ([ae82ea4](https://github.com/typescript-eslint/typescript-eslint/commit/ae82ea4a85a4ca332ebe6104e96c59dba30411be))
- **typescript-estree:** remove now defunct `Import` node type ([f199cbd](https://github.com/typescript-eslint/typescript-eslint/commit/f199cbdbbd892b5ba03bfff66f463f3d9c92ee9b))
- **typescript-estree:** use `TSEmptyBodyFunctionExpression` for body-less nodes ([#1289](https://github.com/typescript-eslint/typescript-eslint/issues/1289)) ([82e7163](https://github.com/typescript-eslint/typescript-eslint/commit/82e7163214b56ccde93ba97807b161669a50a60b))

### Features

- add index files to parser and typescript-estree ([3dfc46d](https://github.com/typescript-eslint/typescript-eslint/commit/3dfc46dccbbd28eed2d74c7b6cacddf1a0848598))
- **eslint-plugin:** [no-floating-promises] ignore void operator by default ([#2003](https://github.com/typescript-eslint/typescript-eslint/issues/2003)) ([3626a67](https://github.com/typescript-eslint/typescript-eslint/commit/3626a673cf8117cc995245cd86e466e2553e9b0e))
- **eslint-plugin:** [no-unnecessary-condition] remove `checkArrayPredicates` and always check it ([#1579](https://github.com/typescript-eslint/typescript-eslint/issues/1579)) ([bfd9b60](https://github.com/typescript-eslint/typescript-eslint/commit/bfd9b606d17d30d5694967a1f01e0e1501ba1022))
- **eslint-plugin:** [no-unnecessary-condition] report when non-nullish is compared to `null`/`undefined` ([#1659](https://github.com/typescript-eslint/typescript-eslint/issues/1659)) ([7fa9060](https://github.com/typescript-eslint/typescript-eslint/commit/7fa906073903c5eb70609c25f1a91ada14dcdc71))
- **eslint-plugin:** [prefer-nullish-coalescing][prefer-optional-chain] remove unsafe fixers ([52b6085](https://github.com/typescript-eslint/typescript-eslint/commit/52b60852d0ba6bb6abe519c9d3ec1b231793e91d))
- **eslint-plugin:** [restrict-template-expressions] `allowNumber: true` by default ([#2005](https://github.com/typescript-eslint/typescript-eslint/issues/2005)) ([643ec24](https://github.com/typescript-eslint/typescript-eslint/commit/643ec240bd901295d9e9ea5c43fc20109c33e982))
- **eslint-plugin:** [restrict-template-expressions] rename `allowNullable` to `allowNullish` ([#2006](https://github.com/typescript-eslint/typescript-eslint/issues/2006)) ([264b017](https://github.com/typescript-eslint/typescript-eslint/commit/264b017c11c2ab132fcbad18b42a9a0fe639386e))
- **experimental-utils:** upgrade eslint types for v7 ([#2023](https://github.com/typescript-eslint/typescript-eslint/issues/2023)) ([06869c9](https://github.com/typescript-eslint/typescript-eslint/commit/06869c9656fa37936126666845aee40aad546ebd))
- bump minimum required TS version ([#2004](https://github.com/typescript-eslint/typescript-eslint/issues/2004)) ([7ad4d7c](https://github.com/typescript-eslint/typescript-eslint/commit/7ad4d7c2db088b6f779b9d883a4acad13eee3775))
- upgrade to ESLint v7 ([#2022](https://github.com/typescript-eslint/typescript-eslint/issues/2022)) ([208de71](https://github.com/typescript-eslint/typescript-eslint/commit/208de71059746bf38e94bd460346ffb2698a3e12))
- **eslint-plugin:** [ban-types] rework default options ([#848](https://github.com/typescript-eslint/typescript-eslint/issues/848)) ([8e31d5d](https://github.com/typescript-eslint/typescript-eslint/commit/8e31d5dbe9fe5227fdbefcecfd50ce5dd51360c3))
- **eslint-plugin:** [no-unnecessary-condition] remove option `ignoreRHS` ([#1163](https://github.com/typescript-eslint/typescript-eslint/issues/1163)) ([ee8dd8f](https://github.com/typescript-eslint/typescript-eslint/commit/ee8dd8f8a9e6c25ac426ce9bb71c5f012c51f264))
- **eslint-plugin:** [strict-boolean-expression] rework options ([#1631](https://github.com/typescript-eslint/typescript-eslint/issues/1631)) ([cd14482](https://github.com/typescript-eslint/typescript-eslint/commit/cd1448240dca11762fcb9c10e18bb6541a840485))
- **eslint-plugin:** delete deprecated rules ([#2002](https://github.com/typescript-eslint/typescript-eslint/issues/2002)) ([da0aec2](https://github.com/typescript-eslint/typescript-eslint/commit/da0aec2cfa27902aae7c438a2fe91343c822e4ae))
- **eslint-plugin:** eslint-recommended: disable no-func-assign ([#984](https://github.com/typescript-eslint/typescript-eslint/issues/984)) ([ae9b8a9](https://github.com/typescript-eslint/typescript-eslint/commit/ae9b8a9c73c0328287de956466257d8bbfbdb20f))
- **eslint-plugin:** eslint-recommended: disable no-obj-calls ([#1000](https://github.com/typescript-eslint/typescript-eslint/issues/1000)) ([b9ca14c](https://github.com/typescript-eslint/typescript-eslint/commit/b9ca14c5f5ec28a3fde1a9b2d2f6a4dc74d903e4))
- **eslint-plugin:** update `eslint-recommended` set ([#1996](https://github.com/typescript-eslint/typescript-eslint/issues/1996)) ([9a96e18](https://github.com/typescript-eslint/typescript-eslint/commit/9a96e18400e0a0d738d159d9d01faf41d3586249))
- **eslint-plugin:** update recommended sets ([#2001](https://github.com/typescript-eslint/typescript-eslint/issues/2001)) ([0126b4f](https://github.com/typescript-eslint/typescript-eslint/commit/0126b4f56f9197d561e90b09962ccceb4f88bc41))
- **typescript-estree:** align nodes with estree 2020 ([#1389](https://github.com/typescript-eslint/typescript-eslint/issues/1389)) ([aff5b62](https://github.com/typescript-eslint/typescript-eslint/commit/aff5b62044f9b93f2087a1d261e9be3f8d6fd54d))
- **typescript-estree:** align optional fields ([#1429](https://github.com/typescript-eslint/typescript-eslint/issues/1429)) ([0e0010f](https://github.com/typescript-eslint/typescript-eslint/commit/0e0010f82952f9beeeb84136eea00cc5eecc9db6))
- drop support for node v8 ([#1997](https://github.com/typescript-eslint/typescript-eslint/issues/1997)) ([b6c3b7b](https://github.com/typescript-eslint/typescript-eslint/commit/b6c3b7b84b8d199fa75a46432febd4a364a63217))
- **typescript-estree:** always return parserServices ([#716](https://github.com/typescript-eslint/typescript-eslint/issues/716)) ([5b23443](https://github.com/typescript-eslint/typescript-eslint/commit/5b23443c48f3f62424db3e742243f3568080b946))
- **typescript-estree:** handle 3.9's non-null assertion changes ([#2036](https://github.com/typescript-eslint/typescript-eslint/issues/2036)) ([06bec63](https://github.com/typescript-eslint/typescript-eslint/commit/06bec63c56536db070608ab136d2ad57083f0c6a))

# [2.34.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.33.0...v2.34.0) (2020-05-18)

### Bug Fixes

- **typescript-estree:** fix handling of range/loc removal ([#2028](https://github.com/typescript-eslint/typescript-eslint/issues/2028)) ([ce344d9](https://github.com/typescript-eslint/typescript-eslint/commit/ce344d90e7c78b0c4b4b823494a3e78190f45c64))

### Features

- **eslint-plugin:** [no-invalid-void-type] allow union of void and `allowInGenericTypeArguments` ([#1960](https://github.com/typescript-eslint/typescript-eslint/issues/1960)) ([1bc105a](https://github.com/typescript-eslint/typescript-eslint/commit/1bc105a2c6ae3fde9596f0419fed0de699dc57c7))
- **eslint-plugin:** [restrict-template-expressions] improve error message ([#1926](https://github.com/typescript-eslint/typescript-eslint/issues/1926)) ([1af59ba](https://github.com/typescript-eslint/typescript-eslint/commit/1af59ba8ac0ceabb008d9c61556acf7db0a1d352))
- **experimental-utils:** add `suggestion` property for rule modules ([#2033](https://github.com/typescript-eslint/typescript-eslint/issues/2033)) ([f42a5b0](https://github.com/typescript-eslint/typescript-eslint/commit/f42a5b09ebfa173f418a99c552b0cbe221567194))

# [2.33.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.32.0...v2.33.0) (2020-05-12)

### Bug Fixes

- **experimental-utils:** remove accidental dep on json-schema ([#2010](https://github.com/typescript-eslint/typescript-eslint/issues/2010)) ([1875fba](https://github.com/typescript-eslint/typescript-eslint/commit/1875fbad41f2a3dda8f610f5dcd180c6205b73d3))

### Features

- **eslint-plugin:** add extension rule `lines-between-class-members` ([#1684](https://github.com/typescript-eslint/typescript-eslint/issues/1684)) ([08f93e6](https://github.com/typescript-eslint/typescript-eslint/commit/08f93e69347a8e7f3a7e8a1455bb5d069c2faeef))

# [2.32.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.31.0...v2.32.0) (2020-05-11)

### Bug Fixes

- **eslint-plugin:** [no-base-to-string] support boolean in unions ([#1979](https://github.com/typescript-eslint/typescript-eslint/issues/1979)) ([6987ecc](https://github.com/typescript-eslint/typescript-eslint/commit/6987ecc1dacfb45c0f8ed3e81d08aa708eb96ad1))
- **eslint-plugin:** [no-type-alias] handle readonly types in aliases ([#1990](https://github.com/typescript-eslint/typescript-eslint/issues/1990)) ([56d9870](https://github.com/typescript-eslint/typescript-eslint/commit/56d987070f83d1b6410b04750b20a761fd793073))
- **eslint-plugin:** [no-unused-expressions] inherit `messages` from base rule ([#1992](https://github.com/typescript-eslint/typescript-eslint/issues/1992)) ([51ca404](https://github.com/typescript-eslint/typescript-eslint/commit/51ca404af645eed194269ab7f8f67b97bd52e32d))

### Features

- bump dependencies and align AST ([#2007](https://github.com/typescript-eslint/typescript-eslint/issues/2007)) ([18668b7](https://github.com/typescript-eslint/typescript-eslint/commit/18668b78fd7d1e5281af7fc26c76e0ca53297f69))

# [2.31.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.30.0...v2.31.0) (2020-05-04)

### Bug Fixes

- **eslint-plugin:** [dot-notation] handle missing declarations ([#1947](https://github.com/typescript-eslint/typescript-eslint/issues/1947)) ([383f931](https://github.com/typescript-eslint/typescript-eslint/commit/383f93182599c00e231a0f0d36575ca0e19369a6))
- **eslint-plugin:** [method-signature-style] fix overloaded methods to an intersection type ([#1966](https://github.com/typescript-eslint/typescript-eslint/issues/1966)) ([7f3fba3](https://github.com/typescript-eslint/typescript-eslint/commit/7f3fba348d432d7637e1c737df943ee1f9105062))
- **eslint-plugin:** [return-await] await in a normal function ([#1962](https://github.com/typescript-eslint/typescript-eslint/issues/1962)) ([f82fd7b](https://github.com/typescript-eslint/typescript-eslint/commit/f82fd7bb81f986c4861d0b4e2ecdb0c496d7a602))
- **eslint-plugin:** [unbound-method] false positives for unary expressions ([#1964](https://github.com/typescript-eslint/typescript-eslint/issues/1964)) ([b35070e](https://github.com/typescript-eslint/typescript-eslint/commit/b35070ec6f84ad5ce606386cdb6eeb91488dfdd7))
- **eslint-plugin:** no-base-to-string boolean expression detect ([#1969](https://github.com/typescript-eslint/typescript-eslint/issues/1969)) ([f78f13a](https://github.com/typescript-eslint/typescript-eslint/commit/f78f13aedd59d5b5880903d48c779a6c50fd937e))

### Features

- **eslint-plugin:** [member-ordering] add decorators support ([#1870](https://github.com/typescript-eslint/typescript-eslint/issues/1870)) ([f7ec192](https://github.com/typescript-eslint/typescript-eslint/commit/f7ec1920607cb8eec8020b08cd7247de0bf19ce1))
- **eslint-plugin:** [prefer-optional-chain] added option to convert to suggestion fixer ([#1965](https://github.com/typescript-eslint/typescript-eslint/issues/1965)) ([2f0824b](https://github.com/typescript-eslint/typescript-eslint/commit/2f0824b0a41f3043b6242fc1d49faae540abaf22))
- **eslint-plugin:** new extended rule 'no-invalid-this' ([#1823](https://github.com/typescript-eslint/typescript-eslint/issues/1823)) ([b18bc35](https://github.com/typescript-eslint/typescript-eslint/commit/b18bc357507337b9725f8d9c1b549513075a0da5))
- **eslint-plugin-internal:** add rule no-poorly-typed-ts-props ([#1949](https://github.com/typescript-eslint/typescript-eslint/issues/1949)) ([56ea7c9](https://github.com/typescript-eslint/typescript-eslint/commit/56ea7c9581c0c99fe394bbcfc4128e8054c88ab2))
- **experimental-utils:** expose our RuleTester extension ([#1948](https://github.com/typescript-eslint/typescript-eslint/issues/1948)) ([2dd1638](https://github.com/typescript-eslint/typescript-eslint/commit/2dd1638aaa2658ba99b2341861146b586f489121))

# [2.30.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.29.0...v2.30.0) (2020-04-27)

### Bug Fixes

- **eslint-plugin:** [prefer-string-starts-ends-with] check for negative start index in slice ([#1920](https://github.com/typescript-eslint/typescript-eslint/issues/1920)) ([ed2bd60](https://github.com/typescript-eslint/typescript-eslint/commit/ed2bd6067f74ae33e36a084719bb91efedfba599))
- **eslint-plugin:** fix no-base-to-string boolean literal check ([#1850](https://github.com/typescript-eslint/typescript-eslint/issues/1850)) ([2f45e99](https://github.com/typescript-eslint/typescript-eslint/commit/2f45e9992a8f12b6233716e77a6159f9cea2c879))

### Features

- **eslint-plugin:** add extension rule `dot-notation` ([#1867](https://github.com/typescript-eslint/typescript-eslint/issues/1867)) ([a85c3e1](https://github.com/typescript-eslint/typescript-eslint/commit/a85c3e1515d735b6c245cc658cdaec6deb05d630))
- **eslint-plugin:** create `no-invalid-void-type` rule ([#1847](https://github.com/typescript-eslint/typescript-eslint/issues/1847)) ([f667ff1](https://github.com/typescript-eslint/typescript-eslint/commit/f667ff1708d4ed28b7ea5beea742889da69a76d9))
- **experimental-utils:** allow rule options to be a readonly tuple ([#1924](https://github.com/typescript-eslint/typescript-eslint/issues/1924)) ([4ef6788](https://github.com/typescript-eslint/typescript-eslint/commit/4ef67884962b6aac61cc895aaa3ba16aa892ecf4))

# [2.29.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.28.0...v2.29.0) (2020-04-20)

### Bug Fixes

- **eslint-plugin:** [no-base-to-string] soft remove `ignoreTaggedTemplateExpressions` option ([#1916](https://github.com/typescript-eslint/typescript-eslint/issues/1916)) ([369978e](https://github.com/typescript-eslint/typescript-eslint/commit/369978e9685bacb3e3882b0510ff06eaf8df4ca1))

### Features

- **eslint-plugin:** [no-floating-promise] add option to ignore IIFEs ([#1799](https://github.com/typescript-eslint/typescript-eslint/issues/1799)) ([cea51bf](https://github.com/typescript-eslint/typescript-eslint/commit/cea51bf130d6d3c2935f5e2dcc468196f2ad9d00))
- **eslint-plugin:** [restrict-template-expressions] add support for intersection types ([#1803](https://github.com/typescript-eslint/typescript-eslint/issues/1803)) ([cc70e4f](https://github.com/typescript-eslint/typescript-eslint/commit/cc70e4fbadd0b15fd6af913a2e1e2ddd346fa558))
- **eslint-plugin:** add extension rule `init-declarations` ([#1814](https://github.com/typescript-eslint/typescript-eslint/issues/1814)) ([b01f5e7](https://github.com/typescript-eslint/typescript-eslint/commit/b01f5e778ac28e0797a3734fc58d025bb224f418))
- **eslint-plugin:** add extension rule `keyword-spacing` ([#1739](https://github.com/typescript-eslint/typescript-eslint/issues/1739)) ([c5106dd](https://github.com/typescript-eslint/typescript-eslint/commit/c5106dd4bf2bc8846cc39aa8bb50c33bec026d4d))

# [2.28.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.27.0...v2.28.0) (2020-04-13)

### Bug Fixes

- **eslint-plugin:** [method-signature-style] handle multiline params ([#1861](https://github.com/typescript-eslint/typescript-eslint/issues/1861)) ([5832a86](https://github.com/typescript-eslint/typescript-eslint/commit/5832a8643bbe174ec02df5966bb333e506e45f5d))
- **eslint-plugin:** [no-empty-interface] use suggestion fixer for ambient contexts ([#1880](https://github.com/typescript-eslint/typescript-eslint/issues/1880)) ([62b2278](https://github.com/typescript-eslint/typescript-eslint/commit/62b2278aec0011c93eae17bed8b278114d3379a2))
- **eslint-plugin:** [unbound-method] false positive on property function initializer ([#1890](https://github.com/typescript-eslint/typescript-eslint/issues/1890)) ([f1c3b18](https://github.com/typescript-eslint/typescript-eslint/commit/f1c3b18f7aadc81f7dca7aa32aa1a8fe424e04e7))
- **eslint-plugin:** [unbound-method] ignore assignments _to_ methods ([#1736](https://github.com/typescript-eslint/typescript-eslint/issues/1736)) ([6b4680b](https://github.com/typescript-eslint/typescript-eslint/commit/6b4680b6e7343d9d98fa1de170f387a36d98b73e))
- **eslint-plugin:** no-empty-interface autofix ([#1865](https://github.com/typescript-eslint/typescript-eslint/issues/1865)) ([829a2f7](https://github.com/typescript-eslint/typescript-eslint/commit/829a2f728f876d356908e2338c2d6620e58f9943)), closes [#1864](https://github.com/typescript-eslint/typescript-eslint/issues/1864)
- **eslint-plugin:** use `isTypeArrayTypeOrUnionOfArrayTypes` util for checking if type is array ([#1728](https://github.com/typescript-eslint/typescript-eslint/issues/1728)) ([05030f8](https://github.com/typescript-eslint/typescript-eslint/commit/05030f8d2bd5a50e95053bc61380891da71cc567))

### Features

- **eslint-plugin:** [ban-ts-comment] support `ts-expect-error` ([#1706](https://github.com/typescript-eslint/typescript-eslint/issues/1706)) ([469cff3](https://github.com/typescript-eslint/typescript-eslint/commit/469cff332c041f38f60de052769287342455cff1))
- **eslint-plugin:** [consistent-type-assertions] always allow `const` assertions ([#1713](https://github.com/typescript-eslint/typescript-eslint/issues/1713)) ([af2c00d](https://github.com/typescript-eslint/typescript-eslint/commit/af2c00de62f7e31eaeb88996ebf3f330cc8473b9))
- **eslint-plugin:** [explicit-function-return-type] add option to allow concise arrows that start with void ([#1732](https://github.com/typescript-eslint/typescript-eslint/issues/1732)) ([2e9c202](https://github.com/typescript-eslint/typescript-eslint/commit/2e9c2028a8a0b226e0f87d4bcc997fa259ca3ebd))
- **eslint-plugin:** [explicit-module-boundary-types] add optio… ([#1778](https://github.com/typescript-eslint/typescript-eslint/issues/1778)) ([3eee804](https://github.com/typescript-eslint/typescript-eslint/commit/3eee804461d017ea6189cd7f64fcd473623684b4))
- **eslint-plugin:** [no-base-to-string] add option to ignore tagged templates ([#1763](https://github.com/typescript-eslint/typescript-eslint/issues/1763)) ([f5edb99](https://github.com/typescript-eslint/typescript-eslint/commit/f5edb9938c33f8b68f026eba00db3abe9359ced3))
- **eslint-plugin:** [restrict-template-expressions] add option `allowAny` ([#1762](https://github.com/typescript-eslint/typescript-eslint/issues/1762)) ([d44c0f9](https://github.com/typescript-eslint/typescript-eslint/commit/d44c0f9bed2404ca00b020b35fd825929e213398))
- **eslint-plugin:** add rule `prefer-reduce-type-parameter` ([#1707](https://github.com/typescript-eslint/typescript-eslint/issues/1707)) ([c92d240](https://github.com/typescript-eslint/typescript-eslint/commit/c92d240e49113779053eac32038382b282812afc))
- **eslint-plugin:** add rule `prefer-ts-expect-error` ([#1705](https://github.com/typescript-eslint/typescript-eslint/issues/1705)) ([7021f21](https://github.com/typescript-eslint/typescript-eslint/commit/7021f2151a25db2a8edf17e06cd6f21e90761ec8))
- **eslint-plugin:** add rule no-unsafe-assignment ([#1694](https://github.com/typescript-eslint/typescript-eslint/issues/1694)) ([a49b860](https://github.com/typescript-eslint/typescript-eslint/commit/a49b860cbbb2c7d718b99f561e2fb6eaadf16f17))

# [2.27.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.26.0...v2.27.0) (2020-04-06)

### Bug Fixes

- **eslint-plugin:** [no-throw-literal] fix crash caused by getBaseTypes ([#1830](https://github.com/typescript-eslint/typescript-eslint/issues/1830)) ([9d53c76](https://github.com/typescript-eslint/typescript-eslint/commit/9d53c761983dd964109b9f13eb9bfe20caf9defb))
- **eslint-plugin:** [no-unsafe-call] fix incorrect selector ([#1826](https://github.com/typescript-eslint/typescript-eslint/issues/1826)) ([8ec53a3](https://github.com/typescript-eslint/typescript-eslint/commit/8ec53a3579fcb59cdffea0c60fbb755d056f4c8a))
- **eslint-plugin:** [require-await] handle async generators ([#1782](https://github.com/typescript-eslint/typescript-eslint/issues/1782)) ([9642d9d](https://github.com/typescript-eslint/typescript-eslint/commit/9642d9dce693befac89a4e9d8bf8dd18f4361e2a))
- **eslint-plugin:** no-explicit-any constructor functions (& mo… ([#1711](https://github.com/typescript-eslint/typescript-eslint/issues/1711)) ([ab8572e](https://github.com/typescript-eslint/typescript-eslint/commit/ab8572e30e14ebda91c8437be5ee35e7dc9add2e))
- **typescript-estree:** add support for TS3.9 extra file extensions ([#1833](https://github.com/typescript-eslint/typescript-eslint/issues/1833)) ([1f0ff41](https://github.com/typescript-eslint/typescript-eslint/commit/1f0ff41aa1bc3b7c5330b2f5fe22e24bf578a6b2))

### Features

- **eslint-plugin:** new rule method-signature-style ([#1685](https://github.com/typescript-eslint/typescript-eslint/issues/1685)) ([c49d771](https://github.com/typescript-eslint/typescript-eslint/commit/c49d771ba62f1a21d3c1aec106341daddfcd3c9a))
- **eslint-plugin:** sort members alphabetically ([#263](https://github.com/typescript-eslint/typescript-eslint/issues/263)) ([485e902](https://github.com/typescript-eslint/typescript-eslint/commit/485e90213a0f8baac0587f7d56925448883fc5bd))
- **eslint-plugin-internal:** add plugin-test-formatting rule ([#1821](https://github.com/typescript-eslint/typescript-eslint/issues/1821)) ([9b0023a](https://github.com/typescript-eslint/typescript-eslint/commit/9b0023a4996ecdd7dfcb30abd1678091a78f3064))
- **experimental-utils:** add types for suggestions from CLIEngine ([#1844](https://github.com/typescript-eslint/typescript-eslint/issues/1844)) ([7c11bd6](https://github.com/typescript-eslint/typescript-eslint/commit/7c11bd66f2d0e5ea9d3943e6b8c66e6ddff50862))
- **experimental-utils:** update eslint types to match v6.8 ([#1846](https://github.com/typescript-eslint/typescript-eslint/issues/1846)) ([16ce74d](https://github.com/typescript-eslint/typescript-eslint/commit/16ce74d247781ac890dc0baa30c384f97e581b6b))

# [2.26.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.25.0...v2.26.0) (2020-03-30)

### Bug Fixes

- **eslint-plugin:** [no-explicit-any] error with ignoreRestArgs ([#1796](https://github.com/typescript-eslint/typescript-eslint/issues/1796)) ([638d84d](https://github.com/typescript-eslint/typescript-eslint/commit/638d84ddd77d07117b3ec7c5431f3b0e44b1995d))
- **eslint-plugin:** [no-unsafe-call] allow import expressions ([#1800](https://github.com/typescript-eslint/typescript-eslint/issues/1800)) ([4fa7107](https://github.com/typescript-eslint/typescript-eslint/commit/4fa710754ecc412b65ac3864fe0c7857c254ac1b))
- **eslint-plugin:** [no-unsafe-return] error with <TS3.7 ([#1815](https://github.com/typescript-eslint/typescript-eslint/issues/1815)) ([f3160b4](https://github.com/typescript-eslint/typescript-eslint/commit/f3160b471f8247e157555b6cf5b40a1f6ccdc233))

### Features

- **eslint-plugin-tslint:** support tslint 6 ([#1809](https://github.com/typescript-eslint/typescript-eslint/issues/1809)) ([7d963fd](https://github.com/typescript-eslint/typescript-eslint/commit/7d963fd846935acd91b7b0cd31c56a70a2b994d1))
- **typescript-estree:** add option to ignore certain folders from glob resolution ([#1802](https://github.com/typescript-eslint/typescript-eslint/issues/1802)) ([1e29e69](https://github.com/typescript-eslint/typescript-eslint/commit/1e29e69b289d61107a7de67592beae331ba50222))

# [2.25.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.24.0...v2.25.0) (2020-03-23)

### Bug Fixes

- only run publish_canary_version on master ([3814d4e](https://github.com/typescript-eslint/typescript-eslint/commit/3814d4e3b3c1552c7601b5d722b2a37c5a570841))
- **eslint-plugin:** [quotes] false positive with backtick in import equals statement ([#1769](https://github.com/typescript-eslint/typescript-eslint/issues/1769)) ([199863d](https://github.com/typescript-eslint/typescript-eslint/commit/199863d35cb36bdb7178b8116d146258506644c7))
- **eslint-plugin:** fix message of no-base-to-string ([#1755](https://github.com/typescript-eslint/typescript-eslint/issues/1755)) ([6646959](https://github.com/typescript-eslint/typescript-eslint/commit/6646959b255b08afe5175bba6621bad11b9e1d5e))
- **eslint-plugin-tslint:** fix tslintConfig memoization key ([#1719](https://github.com/typescript-eslint/typescript-eslint/issues/1719)) ([abf1a2f](https://github.com/typescript-eslint/typescript-eslint/commit/abf1a2fa5574e41af8070be3d79a886ea2f989cc)), closes [typescript-eslint#1692](https://github.com/typescript-eslint/issues/1692)
- **typescript-estree:** export \* regression from 133f622f ([#1751](https://github.com/typescript-eslint/typescript-eslint/issues/1751)) ([09d8afc](https://github.com/typescript-eslint/typescript-eslint/commit/09d8afca684635b5ac604bc1794240484a70ce91))

### Features

- **eslint-plugin:** [no-unnec-type-assertion] allow const assertions ([#1741](https://github.com/typescript-eslint/typescript-eslint/issues/1741)) ([f76a1b3](https://github.com/typescript-eslint/typescript-eslint/commit/f76a1b3e63afda9f239e46f4ad5b36c1d7a6e8da))
- **eslint-plugin:** [no-unnecessary-condition] ignore basic array indexing false positives ([#1534](https://github.com/typescript-eslint/typescript-eslint/issues/1534)) ([2b9603d](https://github.com/typescript-eslint/typescript-eslint/commit/2b9603d868c57556d8cd6087685e798d74cb6f26))
- **eslint-plugin:** add `class-literal-property-style` rule ([#1582](https://github.com/typescript-eslint/typescript-eslint/issues/1582)) ([b2dbd89](https://github.com/typescript-eslint/typescript-eslint/commit/b2dbd890a5bef81aa6978d68c166457838ee04a1))
- **experimental-utils:** expose ast utility functions ([#1670](https://github.com/typescript-eslint/typescript-eslint/issues/1670)) ([3eb5d45](https://github.com/typescript-eslint/typescript-eslint/commit/3eb5d4525e95c8ab990f55588b8d830a02ce5a9c))

# [2.24.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.23.0...v2.24.0) (2020-03-16)

### Bug Fixes

- **typescript-estree:** unnecessary program updates by removing timeout methods ([#1693](https://github.com/typescript-eslint/typescript-eslint/issues/1693)) ([2ccd66b](https://github.com/typescript-eslint/typescript-eslint/commit/2ccd66b920816d54cc1a639059f60410df665900))

### Features

- **typescript-estree:** support 3.8 `export * as ns` ([#1698](https://github.com/typescript-eslint/typescript-eslint/issues/1698)) ([133f622](https://github.com/typescript-eslint/typescript-eslint/commit/133f622f38a286eac45288a9789d2ee529d5e582))

# [2.23.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.22.0...v2.23.0) (2020-03-09)

### Bug Fixes

- **eslint-plugin:** [prefer-readonly-parameter-types] handle recursive types ([#1672](https://github.com/typescript-eslint/typescript-eslint/issues/1672)) ([e5db36f](https://github.com/typescript-eslint/typescript-eslint/commit/e5db36f140b6463965858ad4ed77f71a9a00c5a7)), closes [#1665](https://github.com/typescript-eslint/typescript-eslint/issues/1665)
- **eslint-plugin:** [type-annotation-spacing] handle constructor types ([#1664](https://github.com/typescript-eslint/typescript-eslint/issues/1664)) ([fbf1640](https://github.com/typescript-eslint/typescript-eslint/commit/fbf1640c5ab67770a1ace5a9bad2bddfa35bd88d)), closes [#1663](https://github.com/typescript-eslint/typescript-eslint/issues/1663)
- **eslint-plugin:** fix autofixer for computed properties ([#1662](https://github.com/typescript-eslint/typescript-eslint/issues/1662)) ([ba22ea7](https://github.com/typescript-eslint/typescript-eslint/commit/ba22ea7f604b236828ce4dcff75831ec1da01ec1))
- **eslint-plugin:** fix placeholder in `ban-ts-comment` ([#1703](https://github.com/typescript-eslint/typescript-eslint/issues/1703)) ([144345c](https://github.com/typescript-eslint/typescript-eslint/commit/144345c4774c0664752116ef2cf28f46cf52052f))

### Features

- **eslint-plugin:** [no-unsafe-call] support tagged templates ([#1680](https://github.com/typescript-eslint/typescript-eslint/issues/1680)) ([55a58ff](https://github.com/typescript-eslint/typescript-eslint/commit/55a58ff0ae0434970537657ec2cb0bc7ab64c13d))
- **eslint-plugin:** [no-unsafe-member-access] report any typed… ([#1683](https://github.com/typescript-eslint/typescript-eslint/issues/1683)) ([1543117](https://github.com/typescript-eslint/typescript-eslint/commit/1543117874047726a6bc1b71bd2f68779f266591))
- **eslint-plugin:** add rule no-unsafe-call ([#1647](https://github.com/typescript-eslint/typescript-eslint/issues/1647)) ([91423e4](https://github.com/typescript-eslint/typescript-eslint/commit/91423e49d19163fae7b03cbc79bb3cd3db8c2c6d))
- **eslint-plugin:** add rule no-unsafe-member-access ([#1643](https://github.com/typescript-eslint/typescript-eslint/issues/1643)) ([608a750](https://github.com/typescript-eslint/typescript-eslint/commit/608a750d53c39e892fdb982aeea9e4f9c5e2382d))
- **eslint-plugin:** add rule no-unsafe-return ([#1644](https://github.com/typescript-eslint/typescript-eslint/issues/1644)) ([cfc3ef1](https://github.com/typescript-eslint/typescript-eslint/commit/cfc3ef10941f46cdbc084e99e1d48d6d3a928903))
- **typescript-estree:** support 3.8 import/export type ([#1697](https://github.com/typescript-eslint/typescript-eslint/issues/1697)) ([625d603](https://github.com/typescript-eslint/typescript-eslint/commit/625d603f94bf0521f834313bf31c734ce4948b7a))

# [2.22.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.21.0...v2.22.0) (2020-03-02)

### Bug Fixes

- **eslint-plugin:** [ban-types] add option extendDefaults ([#1379](https://github.com/typescript-eslint/typescript-eslint/issues/1379)) ([ae7f7c5](https://github.com/typescript-eslint/typescript-eslint/commit/ae7f7c5637124b1167efd63755df92e219bbbb24))
- **eslint-plugin:** [default-param-last] handle param props ([#1650](https://github.com/typescript-eslint/typescript-eslint/issues/1650)) ([3534c6e](https://github.com/typescript-eslint/typescript-eslint/commit/3534c6ea09f0cb2162017660a90c6a4ad704da6b))
- **eslint-plugin:** [no-implied-eval] correct logic for ts3.8 ([#1652](https://github.com/typescript-eslint/typescript-eslint/issues/1652)) ([33e3e6f](https://github.com/typescript-eslint/typescript-eslint/commit/33e3e6f79ea21792ccb60b7f1ada74057ceb52e9))

### Features

- **eslint-plugin:** [explicit-member-accessibility] autofix no-public ([#1548](https://github.com/typescript-eslint/typescript-eslint/issues/1548)) ([dd233b5](https://github.com/typescript-eslint/typescript-eslint/commit/dd233b52dcd5a39d842123af6fc775574abf2bc2))
- **eslint-plugin:** [typedef] add variable-declaration-ignore-function ([#1578](https://github.com/typescript-eslint/typescript-eslint/issues/1578)) ([fc0a55e](https://github.com/typescript-eslint/typescript-eslint/commit/fc0a55e8b78203972d01a7c9b79ed6b470c5c1a0))
- **eslint-plugin:** add new no-base-to-string rule ([#1522](https://github.com/typescript-eslint/typescript-eslint/issues/1522)) ([8333d41](https://github.com/typescript-eslint/typescript-eslint/commit/8333d41d5d472ef338fb41a29ccbfc6b16e47627))
- **eslint-plugin:** add prefer-readonly-parameters ([#1513](https://github.com/typescript-eslint/typescript-eslint/issues/1513)) ([3be9854](https://github.com/typescript-eslint/typescript-eslint/commit/3be98542afd7553cbbec66c4be215173d7f7ffcf))
- **eslint-plugin:** additional annotation spacing rules for va… ([#1496](https://github.com/typescript-eslint/typescript-eslint/issues/1496)) ([b097245](https://github.com/typescript-eslint/typescript-eslint/commit/b097245df35114906b1f9c60c3ad4cd698d957b8))

# [2.21.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.20.0...v2.21.0) (2020-02-24)

### Bug Fixes

- **eslint-plugin:** [embt] ignore JSX callbacks ([#1630](https://github.com/typescript-eslint/typescript-eslint/issues/1630)) ([4d45b33](https://github.com/typescript-eslint/typescript-eslint/commit/4d45b331b920113c97a90df7dc703f8dfbcc04f3))
- **eslint-plugin:** [no-floating-promises] handle finally callback ([#1620](https://github.com/typescript-eslint/typescript-eslint/issues/1620)) ([1aa7135](https://github.com/typescript-eslint/typescript-eslint/commit/1aa7135bbfbf55cec52925fc0224188cd3c319e7))
- **eslint-plugin:** [typedef] allow array/object destructuring in for/of ([#1570](https://github.com/typescript-eslint/typescript-eslint/issues/1570)) ([660bace](https://github.com/typescript-eslint/typescript-eslint/commit/660bace4c3da569d71cf1e296ac4f6ed35bdfc44))
- **typescript-estree:** process.stdout can be undefined ([#1619](https://github.com/typescript-eslint/typescript-eslint/issues/1619)) ([0d8e87e](https://github.com/typescript-eslint/typescript-eslint/commit/0d8e87e09704588273bc94a740279b3e8af7474f))

### Features

- **eslint-plugin:** [require-await] add --fix support ([#1561](https://github.com/typescript-eslint/typescript-eslint/issues/1561)) ([9edd863](https://github.com/typescript-eslint/typescript-eslint/commit/9edd863b2a66ee44bd4a439903973e6c207480aa))

# [2.20.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.19.2...v2.20.0) (2020-02-17)

### Features

- **eslint-plugin:** [ban-types] allow banning null and undefined ([#821](https://github.com/typescript-eslint/typescript-eslint/issues/821)) ([0b2b887](https://github.com/typescript-eslint/typescript-eslint/commit/0b2b887c06f2582d812a45f7a8deb82f52d82a84))
- **eslint-plugin:** [strict-boolean-expressions] refactor, add clearer error messages ([#1480](https://github.com/typescript-eslint/typescript-eslint/issues/1480)) ([db4b530](https://github.com/typescript-eslint/typescript-eslint/commit/db4b530f3f049267d679e89d9e75acfcb86faaf2))

## [2.19.2](https://github.com/typescript-eslint/typescript-eslint/compare/v2.19.1...v2.19.2) (2020-02-10)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

## [2.19.1](https://github.com/typescript-eslint/typescript-eslint/compare/v2.19.0...v2.19.1) (2020-02-10)

### Bug Fixes

- **eslint-plugin:** [unbound-method] blacklist a few unbound natives ([#1562](https://github.com/typescript-eslint/typescript-eslint/issues/1562)) ([4670aab](https://github.com/typescript-eslint/typescript-eslint/commit/4670aabef31d9017ad302f206b9c2f18d53c8ee4))
- **typescript-estree:** ts returning wrong file with project references ([#1575](https://github.com/typescript-eslint/typescript-eslint/issues/1575)) ([4c12dac](https://github.com/typescript-eslint/typescript-eslint/commit/4c12dac075f774801a145cd29c4c7eff64f98fdc))

# [2.19.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.18.0...v2.19.0) (2020-02-03)

### Bug Fixes

- **eslint-plugin:** [embt] fix allowTypedFunctionExpressions ([#1553](https://github.com/typescript-eslint/typescript-eslint/issues/1553)) ([9e7d161](https://github.com/typescript-eslint/typescript-eslint/commit/9e7d1616d78a0f94521f4e6d4b48344e5df2d9f7))
- **eslint-plugin:** [require-await] improve performance ([#1536](https://github.com/typescript-eslint/typescript-eslint/issues/1536)) ([45ae0b9](https://github.com/typescript-eslint/typescript-eslint/commit/45ae0b9565ee6e9d01e82107d85ad7151a15af7b))
- **typescript-estree:** fix regression introduced in [#1525](https://github.com/typescript-eslint/typescript-eslint/issues/1525) ([#1543](https://github.com/typescript-eslint/typescript-eslint/issues/1543)) ([bec4572](https://github.com/typescript-eslint/typescript-eslint/commit/bec45722dfed8aeb49189d151252b83d4a34239c))
- **typescript-estree:** persisted parse and module none ([#1516](https://github.com/typescript-eslint/typescript-eslint/issues/1516)) ([7c70323](https://github.com/typescript-eslint/typescript-eslint/commit/7c7032322f55d9492e21d3bfa5da16da1f05cbce))

### Features

- **eslint-plugin:** [no-extra-non-null-assert] add fixer ([#1468](https://github.com/typescript-eslint/typescript-eslint/issues/1468)) ([54201ab](https://github.com/typescript-eslint/typescript-eslint/commit/54201aba37b2865c0ba4981be79d1fd989806133))
- **eslint-plugin:** [no-float-prom] fixer + msg for ignoreVoid ([#1473](https://github.com/typescript-eslint/typescript-eslint/issues/1473)) ([159b16e](https://github.com/typescript-eslint/typescript-eslint/commit/159b16ec3a66f05478080c397df5c3f6e29535e4))
- **eslint-plugin:** [unbound-method] support bound builtins ([#1526](https://github.com/typescript-eslint/typescript-eslint/issues/1526)) ([0a110eb](https://github.com/typescript-eslint/typescript-eslint/commit/0a110eb680749c8c4a2a3dc1375c1a83056e4c14))
- **eslint-plugin:** add extension [no-dupe-class-members] ([#1492](https://github.com/typescript-eslint/typescript-eslint/issues/1492)) ([b22424e](https://github.com/typescript-eslint/typescript-eslint/commit/b22424e7d4a16042a027557f44e9191e0722b38b))
- **eslint-plugin:** add no-unnecessary-boolean-literal-compare ([#242](https://github.com/typescript-eslint/typescript-eslint/issues/242)) ([6bebb1d](https://github.com/typescript-eslint/typescript-eslint/commit/6bebb1dc47897ee0e1f075d7e5dd89d8b0590f31))
- **eslint-plugin:** add switch-exhaustiveness-check rule ([#972](https://github.com/typescript-eslint/typescript-eslint/issues/972)) ([9e0f6dd](https://github.com/typescript-eslint/typescript-eslint/commit/9e0f6ddef7cd29f355f398c90f1986e51c4854f7))
- **eslint-plugin:** support negative matches for `filter` ([#1517](https://github.com/typescript-eslint/typescript-eslint/issues/1517)) ([b24fbe8](https://github.com/typescript-eslint/typescript-eslint/commit/b24fbe8790b540998e4085174251fb4d61bf96b0))

# [2.18.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.17.0...v2.18.0) (2020-01-27)

### Bug Fixes

- **eslint-plugin:** [explicit-module-boundary-types] false positive for returned fns ([#1490](https://github.com/typescript-eslint/typescript-eslint/issues/1490)) ([5562ad5](https://github.com/typescript-eslint/typescript-eslint/commit/5562ad5ed902102d7c09a7fd47ca4ea7e50d6654))
- improve token types and add missing type guards ([#1497](https://github.com/typescript-eslint/typescript-eslint/issues/1497)) ([ce41d7d](https://github.com/typescript-eslint/typescript-eslint/commit/ce41d7de33bcb7ccf96c03ac1438304c5a49ff54))
- **eslint-plugin:** [naming-convention] fix filter option ([#1482](https://github.com/typescript-eslint/typescript-eslint/issues/1482)) ([718cd88](https://github.com/typescript-eslint/typescript-eslint/commit/718cd889c155a75413c571ac006c33fbc271dcc5))
- **eslint-plugin:** fix property access on undefined error ([#1507](https://github.com/typescript-eslint/typescript-eslint/issues/1507)) ([d89e8e8](https://github.com/typescript-eslint/typescript-eslint/commit/d89e8e8a1114989e2727351bee7aadb6579f312b))
- **experimental-utils:** widen type of `settings` property ([#1527](https://github.com/typescript-eslint/typescript-eslint/issues/1527)) ([b515e47](https://github.com/typescript-eslint/typescript-eslint/commit/b515e47af2bc914c7ebcfa4be813409dcd86b1c3))
- **typescript-estree:** error on unexpected jsdoc nodes ([#1525](https://github.com/typescript-eslint/typescript-eslint/issues/1525)) ([c8dfac3](https://github.com/typescript-eslint/typescript-eslint/commit/c8dfac3d2f066e50fa9d2b5a86beffdaafddb643))
- **typescript-estree:** fix identifier tokens typed as `Keyword` ([#1487](https://github.com/typescript-eslint/typescript-eslint/issues/1487)) ([77a1caa](https://github.com/typescript-eslint/typescript-eslint/commit/77a1caa562638645b4717449800e410107d512c8))

### Features

- **eslint-plugin:** add comma-spacing ([#1495](https://github.com/typescript-eslint/typescript-eslint/issues/1495)) ([1fd86be](https://github.com/typescript-eslint/typescript-eslint/commit/1fd86befa6a940a0354c619dd2da08a5c5d69fb4))
- **eslint-plugin:** add new rule prefer-as-const ([#1431](https://github.com/typescript-eslint/typescript-eslint/issues/1431)) ([420db96](https://github.com/typescript-eslint/typescript-eslint/commit/420db96921435e8bf7fb484ae74552a912a6adde))
- **eslint-plugin:** create `ban-ts-comment` rule ([#1361](https://github.com/typescript-eslint/typescript-eslint/issues/1361)) ([2a83d13](https://github.com/typescript-eslint/typescript-eslint/commit/2a83d138a966cd5ce787d1eecf595b59b78232d4))
- **eslint-plugin-internal:** add `prefer-ast-types-enum` ([#1508](https://github.com/typescript-eslint/typescript-eslint/issues/1508)) ([c3d0a3a](https://github.com/typescript-eslint/typescript-eslint/commit/c3d0a3a6bdff0cae226a279f0a0a9b00952ca925))
- **experimental-utils:** make RuleMetaData.docs optional ([#1462](https://github.com/typescript-eslint/typescript-eslint/issues/1462)) ([cde97ac](https://github.com/typescript-eslint/typescript-eslint/commit/cde97aca24df5a0f28f37006ed130ebc217fb2ad))
- **parser:** clean up scope-analysis types ([#1481](https://github.com/typescript-eslint/typescript-eslint/issues/1481)) ([4a727fa](https://github.com/typescript-eslint/typescript-eslint/commit/4a727fa083d749dba9eaf39322856f5f69c28cd8))

# [2.17.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.16.0...v2.17.0) (2020-01-20)

### Bug Fixes

- **eslint-plugin:** [naming-convention] handle empty array-pattern ([#1450](https://github.com/typescript-eslint/typescript-eslint/issues/1450)) ([4726605](https://github.com/typescript-eslint/typescript-eslint/commit/4726605))
- **eslint-plugin:** [unbound-method] handling of logical expr ([#1440](https://github.com/typescript-eslint/typescript-eslint/issues/1440)) ([9c5b857](https://github.com/typescript-eslint/typescript-eslint/commit/9c5b857))
- **eslint-plugin:** set default-param-last as an extension rule ([#1445](https://github.com/typescript-eslint/typescript-eslint/issues/1445)) ([b5ef704](https://github.com/typescript-eslint/typescript-eslint/commit/b5ef704))
- **typescript-estree:** correct type of `ArrayPattern.elements` ([#1451](https://github.com/typescript-eslint/typescript-eslint/issues/1451)) ([62e4ca0](https://github.com/typescript-eslint/typescript-eslint/commit/62e4ca0))

### Features

- **eslint-plugin:** [naming-convention] allow not check format ([#1455](https://github.com/typescript-eslint/typescript-eslint/issues/1455)) ([61eb434](https://github.com/typescript-eslint/typescript-eslint/commit/61eb434))
- **eslint-plugin:** [naming-convention] correct example ([#1455](https://github.com/typescript-eslint/typescript-eslint/issues/1455)) ([60683d7](https://github.com/typescript-eslint/typescript-eslint/commit/60683d7))
- **eslint-plugin:** [no-extra-!-assert] flag ?. after !-assert ([#1460](https://github.com/typescript-eslint/typescript-eslint/issues/1460)) ([58c7c25](https://github.com/typescript-eslint/typescript-eslint/commit/58c7c25))
- **eslint-plugin:** add explicit-module-boundary-types rule ([#1020](https://github.com/typescript-eslint/typescript-eslint/issues/1020)) ([bb0a846](https://github.com/typescript-eslint/typescript-eslint/commit/bb0a846))
- **eslint-plugin:** add no-non-null-asserted-optional-chain ([#1469](https://github.com/typescript-eslint/typescript-eslint/issues/1469)) ([498aa24](https://github.com/typescript-eslint/typescript-eslint/commit/498aa24))
- **experimental-utils:** expose getParserServices from utils ([#1448](https://github.com/typescript-eslint/typescript-eslint/issues/1448)) ([982c8bc](https://github.com/typescript-eslint/typescript-eslint/commit/982c8bc))

# [2.16.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.15.0...v2.16.0) (2020-01-13)

### Bug Fixes

- **eslint-plugin:** [no-magic-numbers] handle UnaryExpression for enums ([#1415](https://github.com/typescript-eslint/typescript-eslint/issues/1415)) ([852fc31](https://github.com/typescript-eslint/typescript-eslint/commit/852fc31))
- **eslint-plugin:** [no-unnec-type-assert] handle JSX attributes ([#1002](https://github.com/typescript-eslint/typescript-eslint/issues/1002)) ([3c5659b](https://github.com/typescript-eslint/typescript-eslint/commit/3c5659b))
- **eslint-plugin:** handle error classes using generics ([#1428](https://github.com/typescript-eslint/typescript-eslint/issues/1428)) ([b139540](https://github.com/typescript-eslint/typescript-eslint/commit/b139540))
- **typescript-estree:** fix persisted parse for relative paths ([#1424](https://github.com/typescript-eslint/typescript-eslint/issues/1424)) ([9720d2c](https://github.com/typescript-eslint/typescript-eslint/commit/9720d2c))
- **typescript-estree:** parsing of deeply nested new files in new folder ([#1412](https://github.com/typescript-eslint/typescript-eslint/issues/1412)) ([206c94b](https://github.com/typescript-eslint/typescript-eslint/commit/206c94b))
- **typescript-estree:** resolve path relative to tsconfigRootDir ([#1439](https://github.com/typescript-eslint/typescript-eslint/issues/1439)) ([c709056](https://github.com/typescript-eslint/typescript-eslint/commit/c709056))

### Features

- **eslint-plugin:** [no-unnec-cond] array predicate callbacks ([#1206](https://github.com/typescript-eslint/typescript-eslint/issues/1206)) ([f7ad716](https://github.com/typescript-eslint/typescript-eslint/commit/f7ad716))
- **eslint-plugin:** add default-param-last rule ([#1418](https://github.com/typescript-eslint/typescript-eslint/issues/1418)) ([a37ff9f](https://github.com/typescript-eslint/typescript-eslint/commit/a37ff9f))
- **eslint-plugin:** add rule naming-conventions ([#1318](https://github.com/typescript-eslint/typescript-eslint/issues/1318)) ([9eab26f](https://github.com/typescript-eslint/typescript-eslint/commit/9eab26f))
- **typescript-estree:** add parserOption to turn on debug logs ([#1413](https://github.com/typescript-eslint/typescript-eslint/issues/1413)) ([25092fd](https://github.com/typescript-eslint/typescript-eslint/commit/25092fd))
- **typescript-estree:** add strict type mapping to esTreeNodeToTSNodeMap ([#1382](https://github.com/typescript-eslint/typescript-eslint/issues/1382)) ([d3d70a3](https://github.com/typescript-eslint/typescript-eslint/commit/d3d70a3))

# [2.15.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.14.0...v2.15.0) (2020-01-06)

### Bug Fixes

- **eslint-plugin:** crash in no-unnecessary-type-arguments ([#1401](https://github.com/typescript-eslint/typescript-eslint/issues/1401)) ([01c939f](https://github.com/typescript-eslint/typescript-eslint/commit/01c939f))
- **typescript-estree:** correct persisted parse for windows ([#1406](https://github.com/typescript-eslint/typescript-eslint/issues/1406)) ([1a42f3d](https://github.com/typescript-eslint/typescript-eslint/commit/1a42f3d))

### Features

- **eslint-plugin:** [strict-bool-expr] add allowSafe option ([#1385](https://github.com/typescript-eslint/typescript-eslint/issues/1385)) ([9344233](https://github.com/typescript-eslint/typescript-eslint/commit/9344233))
- **eslint-plugin:** add no-implied-eval ([#1375](https://github.com/typescript-eslint/typescript-eslint/issues/1375)) ([254d276](https://github.com/typescript-eslint/typescript-eslint/commit/254d276))

# [2.14.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.13.0...v2.14.0) (2019-12-30)

### Bug Fixes

- **eslint-plugin:** type assertion in rule no-extra-parens ([#1376](https://github.com/typescript-eslint/typescript-eslint/issues/1376)) ([f40639e](https://github.com/typescript-eslint/typescript-eslint/commit/f40639e))
- **typescript-estree:** visit typeParameters in OptionalCallExpr ([#1377](https://github.com/typescript-eslint/typescript-eslint/issues/1377)) ([cba6a2a](https://github.com/typescript-eslint/typescript-eslint/commit/cba6a2a))

### Features

- add internal eslint plugin for repo-specific lint rules ([#1373](https://github.com/typescript-eslint/typescript-eslint/issues/1373)) ([3a15413](https://github.com/typescript-eslint/typescript-eslint/commit/3a15413))

# [2.13.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.12.0...v2.13.0) (2019-12-23)

### Bug Fixes

- **eslint-plugin:** [quotes] ignore backticks for Enum members ([#1355](https://github.com/typescript-eslint/typescript-eslint/issues/1355)) ([e51048c](https://github.com/typescript-eslint/typescript-eslint/commit/e51048c))
- **eslint-plugin:** [type-annotation-spacing] typo in messages ([#1354](https://github.com/typescript-eslint/typescript-eslint/issues/1354)) ([82e0dbc](https://github.com/typescript-eslint/typescript-eslint/commit/82e0dbc))
- **eslint-plugin:** add isTypeAssertion utility function ([#1369](https://github.com/typescript-eslint/typescript-eslint/issues/1369)) ([bb1671e](https://github.com/typescript-eslint/typescript-eslint/commit/bb1671e))
- **eslint-plugin:** use AST_NODE_TYPES enum instead of strings ([#1366](https://github.com/typescript-eslint/typescript-eslint/issues/1366)) ([bd0276b](https://github.com/typescript-eslint/typescript-eslint/commit/bd0276b))
- **typescript-estree:** correct type of key for base nodes ([#1367](https://github.com/typescript-eslint/typescript-eslint/issues/1367)) ([099225a](https://github.com/typescript-eslint/typescript-eslint/commit/099225a))

### Features

- **eslint-plugin:** [ban-types] handle empty type literal {} ([#1348](https://github.com/typescript-eslint/typescript-eslint/issues/1348)) ([1c0ce9b](https://github.com/typescript-eslint/typescript-eslint/commit/1c0ce9b))
- **eslint-plugin:** [no-use-before-define] opt to ignore enum ([#1242](https://github.com/typescript-eslint/typescript-eslint/issues/1242)) ([6edd911](https://github.com/typescript-eslint/typescript-eslint/commit/6edd911))
- **eslint-plugin:** [pref-str-starts/ends-with] optional chain… ([#1357](https://github.com/typescript-eslint/typescript-eslint/issues/1357)) ([fd37bc3](https://github.com/typescript-eslint/typescript-eslint/commit/fd37bc3))
- **eslint-plugin:** add no-extra-semi [extension] ([#1237](https://github.com/typescript-eslint/typescript-eslint/issues/1237)) ([425f65c](https://github.com/typescript-eslint/typescript-eslint/commit/425f65c))
- **eslint-plugin:** add no-throw-literal [extension] ([#1331](https://github.com/typescript-eslint/typescript-eslint/issues/1331)) ([2aa696c](https://github.com/typescript-eslint/typescript-eslint/commit/2aa696c))
- **eslint-plugin:** more optional chain support in rules ([#1363](https://github.com/typescript-eslint/typescript-eslint/issues/1363)) ([3dd1b02](https://github.com/typescript-eslint/typescript-eslint/commit/3dd1b02))
- **eslint-plugin-tslint:** add fixer for config rule ([#1342](https://github.com/typescript-eslint/typescript-eslint/issues/1342)) ([c52c5c9](https://github.com/typescript-eslint/typescript-eslint/commit/c52c5c9))
- **typescript-estree:** computed members discriminated unions ([#1349](https://github.com/typescript-eslint/typescript-eslint/issues/1349)) ([013df9a](https://github.com/typescript-eslint/typescript-eslint/commit/013df9a))
- **typescript-estree:** tighten prop name and destructure types ([#1346](https://github.com/typescript-eslint/typescript-eslint/issues/1346)) ([f335c50](https://github.com/typescript-eslint/typescript-eslint/commit/f335c50))

# [2.12.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.11.0...v2.12.0) (2019-12-16)

### Bug Fixes

- **eslint-plugin:** [prefer-null-coal] fixer w/ mixed logicals ([#1326](https://github.com/typescript-eslint/typescript-eslint/issues/1326)) ([f9a9fbf](https://github.com/typescript-eslint/typescript-eslint/commit/f9a9fbf))
- **eslint-plugin:** [quotes] ignore backticks for interface properties ([#1311](https://github.com/typescript-eslint/typescript-eslint/issues/1311)) ([3923a09](https://github.com/typescript-eslint/typescript-eslint/commit/3923a09))

### Features

- **eslint-plugin:** [no-unnec-cond] check optional chaining ([#1315](https://github.com/typescript-eslint/typescript-eslint/issues/1315)) ([a2a8a0a](https://github.com/typescript-eslint/typescript-eslint/commit/a2a8a0a))

# [2.11.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.10.0...v2.11.0) (2019-12-09)

### Bug Fixes

- **eslint-plugin:** [brace-style] handle enum declarations ([#1281](https://github.com/typescript-eslint/typescript-eslint/issues/1281)) ([3ddf1a2](https://github.com/typescript-eslint/typescript-eslint/commit/3ddf1a2))

### Features

- **eslint-plugin:** [member-ordering] add index signature ([#1190](https://github.com/typescript-eslint/typescript-eslint/issues/1190)) ([b5a52a3](https://github.com/typescript-eslint/typescript-eslint/commit/b5a52a3))

# [2.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.9.0...v2.10.0) (2019-12-02)

### Bug Fixes

- **eslint-plugin:** [no-empty-function] add missed node types ([#1271](https://github.com/typescript-eslint/typescript-eslint/issues/1271)) ([e9d44f5](https://github.com/typescript-eslint/typescript-eslint/commit/e9d44f5))
- **eslint-plugin:** [no-untyped-pub-sig] ignore set return ([#1264](https://github.com/typescript-eslint/typescript-eslint/issues/1264)) ([6daff10](https://github.com/typescript-eslint/typescript-eslint/commit/6daff10))
- **eslint-plugin:** [no-unused-expressions] ignore directives ([#1285](https://github.com/typescript-eslint/typescript-eslint/issues/1285)) ([ce4c803](https://github.com/typescript-eslint/typescript-eslint/commit/ce4c803))
- **eslint-plugin:** [prefer-optional-chain] allow $ in identifiers ([c72c3c1](https://github.com/typescript-eslint/typescript-eslint/commit/c72c3c1))
- **eslint-plugin:** [prefer-optional-chain] handle more cases ([#1261](https://github.com/typescript-eslint/typescript-eslint/issues/1261)) ([57ddba3](https://github.com/typescript-eslint/typescript-eslint/commit/57ddba3))
- **eslint-plugin:** [return-await] allow Any and Unknown ([#1270](https://github.com/typescript-eslint/typescript-eslint/issues/1270)) ([ebf5e0a](https://github.com/typescript-eslint/typescript-eslint/commit/ebf5e0a))
- **eslint-plugin:** [strict-bool-expr] allow nullish coalescing ([#1275](https://github.com/typescript-eslint/typescript-eslint/issues/1275)) ([3b39340](https://github.com/typescript-eslint/typescript-eslint/commit/3b39340))
- **typescript-estree:** make FunctionDeclaration.body non-null ([#1288](https://github.com/typescript-eslint/typescript-eslint/issues/1288)) ([dc73510](https://github.com/typescript-eslint/typescript-eslint/commit/dc73510))

### Features

- **eslint-plugin:** [no-empty-func] private/protected construct ([#1267](https://github.com/typescript-eslint/typescript-eslint/issues/1267)) ([3b931ac](https://github.com/typescript-eslint/typescript-eslint/commit/3b931ac))
- **eslint-plugin:** [no-non-null-assert] add suggestion fixer ([#1260](https://github.com/typescript-eslint/typescript-eslint/issues/1260)) ([e350a21](https://github.com/typescript-eslint/typescript-eslint/commit/e350a21))
- **eslint-plugin:** [no-unnec-cond] support nullish coalescing ([#1148](https://github.com/typescript-eslint/typescript-eslint/issues/1148)) ([96ef1e7](https://github.com/typescript-eslint/typescript-eslint/commit/96ef1e7))
- **eslint-plugin:** [prefer-null-coal] opt for suggestion fixer ([#1272](https://github.com/typescript-eslint/typescript-eslint/issues/1272)) ([f84eb96](https://github.com/typescript-eslint/typescript-eslint/commit/f84eb96))
- **experimental-utils:** add isSpaceBetween declaration to Sou… ([#1268](https://github.com/typescript-eslint/typescript-eslint/issues/1268)) ([f83f04b](https://github.com/typescript-eslint/typescript-eslint/commit/f83f04b))

# [2.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.8.0...v2.9.0) (2019-11-25)

### Bug Fixes

- **eslint-plugin:** [no-dynamic-delete] correct invalid fixer for identifiers ([#1244](https://github.com/typescript-eslint/typescript-eslint/issues/1244)) ([5b1300d](https://github.com/typescript-eslint/typescript-eslint/commit/5b1300d))
- **eslint-plugin:** [no-untyped-pub-sig] constructor return ([#1231](https://github.com/typescript-eslint/typescript-eslint/issues/1231)) ([6cfd468](https://github.com/typescript-eslint/typescript-eslint/commit/6cfd468))
- **eslint-plugin:** [prefer-optional-chain] unhandled cases ([b1a065f](https://github.com/typescript-eslint/typescript-eslint/commit/b1a065f))
- **eslint-plugin:** [req-await] crash on nonasync promise return ([#1228](https://github.com/typescript-eslint/typescript-eslint/issues/1228)) ([56c00b3](https://github.com/typescript-eslint/typescript-eslint/commit/56c00b3))
- **typescript-estree:** fix synthetic default import ([#1245](https://github.com/typescript-eslint/typescript-eslint/issues/1245)) ([d97f809](https://github.com/typescript-eslint/typescript-eslint/commit/d97f809))

### Features

- **eslint-plugin:** [camelcase] add genericType option ([#925](https://github.com/typescript-eslint/typescript-eslint/issues/925)) ([d785c61](https://github.com/typescript-eslint/typescript-eslint/commit/d785c61))
- **eslint-plugin:** [no-empty-interface] noEmptyWithSuper fixer ([#1247](https://github.com/typescript-eslint/typescript-eslint/issues/1247)) ([b91b0ba](https://github.com/typescript-eslint/typescript-eslint/commit/b91b0ba))
- **eslint-plugin:** [no-extran-class] add allowWithDecorator opt ([#886](https://github.com/typescript-eslint/typescript-eslint/issues/886)) ([f1ab9a2](https://github.com/typescript-eslint/typescript-eslint/commit/f1ab9a2))
- **eslint-plugin:** [no-unnece-cond] Add allowConstantLoopConditions ([#1029](https://github.com/typescript-eslint/typescript-eslint/issues/1029)) ([ceb6f1c](https://github.com/typescript-eslint/typescript-eslint/commit/ceb6f1c))
- **eslint-plugin:** [restrict-plus-operands] check += ([#892](https://github.com/typescript-eslint/typescript-eslint/issues/892)) ([fa88cb9](https://github.com/typescript-eslint/typescript-eslint/commit/fa88cb9))
- suggestion types, suggestions for no-explicit-any ([#1250](https://github.com/typescript-eslint/typescript-eslint/issues/1250)) ([b16a4b6](https://github.com/typescript-eslint/typescript-eslint/commit/b16a4b6))
- **eslint-plugin:** add no-extra-non-null-assertion ([#1183](https://github.com/typescript-eslint/typescript-eslint/issues/1183)) ([2b3b5d6](https://github.com/typescript-eslint/typescript-eslint/commit/2b3b5d6))
- **eslint-plugin:** add no-unused-vars-experimental ([#688](https://github.com/typescript-eslint/typescript-eslint/issues/688)) ([05ebea5](https://github.com/typescript-eslint/typescript-eslint/commit/05ebea5))
- **eslint-plugin:** add prefer-nullish-coalescing ([#1069](https://github.com/typescript-eslint/typescript-eslint/issues/1069)) ([a9cd399](https://github.com/typescript-eslint/typescript-eslint/commit/a9cd399))
- **eslint-plugin:** add return-await rule ([#1050](https://github.com/typescript-eslint/typescript-eslint/issues/1050)) ([0ff4620](https://github.com/typescript-eslint/typescript-eslint/commit/0ff4620))
- **eslint-plugin:** add rule prefer-optional-chain ([#1213](https://github.com/typescript-eslint/typescript-eslint/issues/1213)) ([ad7e1a7](https://github.com/typescript-eslint/typescript-eslint/commit/ad7e1a7))
- **eslint-plugin:** optional chain support in rules (part 1) ([#1253](https://github.com/typescript-eslint/typescript-eslint/issues/1253)) ([f5c0e02](https://github.com/typescript-eslint/typescript-eslint/commit/f5c0e02))

# [2.8.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.7.0...v2.8.0) (2019-11-18)

### Bug Fixes

- **eslint-plugin:** [camelcase] handle optional member expr ([#1204](https://github.com/typescript-eslint/typescript-eslint/issues/1204)) ([9c8203f](https://github.com/typescript-eslint/typescript-eslint/commit/9c8203f))
- **eslint-plugin:** [indent] fix decorator type ([#1189](https://github.com/typescript-eslint/typescript-eslint/issues/1189)) ([e2008e3](https://github.com/typescript-eslint/typescript-eslint/commit/e2008e3))
- **eslint-plugin:** [indent] handle empty generic declarations ([#1211](https://github.com/typescript-eslint/typescript-eslint/issues/1211)) ([9aee06c](https://github.com/typescript-eslint/typescript-eslint/commit/9aee06c))
- **eslint-plugin:** [no-type-alias] handle constructor aliases ([#1198](https://github.com/typescript-eslint/typescript-eslint/issues/1198)) ([1bb4d63](https://github.com/typescript-eslint/typescript-eslint/commit/1bb4d63))
- **eslint-plugin:** [no-unnec-type-arg] throwing on call/new expr ([#1217](https://github.com/typescript-eslint/typescript-eslint/issues/1217)) ([42a48de](https://github.com/typescript-eslint/typescript-eslint/commit/42a48de))
- **eslint-plugin:** [no-unnecessary-cond] fix naked type param ([#1207](https://github.com/typescript-eslint/typescript-eslint/issues/1207)) ([4fac6c5](https://github.com/typescript-eslint/typescript-eslint/commit/4fac6c5))
- **eslint-plugin:** [nuta] correctly handle null/undefined separation ([#1201](https://github.com/typescript-eslint/typescript-eslint/issues/1201)) ([9829dd3](https://github.com/typescript-eslint/typescript-eslint/commit/9829dd3))
- **eslint-plugin:** [require-await] better handle nesting ([#1193](https://github.com/typescript-eslint/typescript-eslint/issues/1193)) ([eb83af1](https://github.com/typescript-eslint/typescript-eslint/commit/eb83af1))
- **eslint-plugin:** [unified-signatures] crash: cannot read pro… ([#1096](https://github.com/typescript-eslint/typescript-eslint/issues/1096)) ([d1de3a7](https://github.com/typescript-eslint/typescript-eslint/commit/d1de3a7))
- **eslint-plugin:** disable base no-unused-expressions in all config ([ecb3f4e](https://github.com/typescript-eslint/typescript-eslint/commit/ecb3f4e))
- **typescript-estree:** correctly account for trailing slash in… ([#1205](https://github.com/typescript-eslint/typescript-eslint/issues/1205)) ([ba89168](https://github.com/typescript-eslint/typescript-eslint/commit/ba89168))
- **typescript-estree:** options range loc being always true ([#704](https://github.com/typescript-eslint/typescript-eslint/issues/704)) ([db1aa18](https://github.com/typescript-eslint/typescript-eslint/commit/db1aa18))

### Features

- **eslint-plugin:** [no-type-alias] handle conditional types ([#953](https://github.com/typescript-eslint/typescript-eslint/issues/953)) ([259ff20](https://github.com/typescript-eslint/typescript-eslint/commit/259ff20))
- **eslint-plugin:** add rule restrict-template-expressions ([#850](https://github.com/typescript-eslint/typescript-eslint/issues/850)) ([46b58b4](https://github.com/typescript-eslint/typescript-eslint/commit/46b58b4))
- **eslint-plugin:** add space-before-function-paren [extension] ([#924](https://github.com/typescript-eslint/typescript-eslint/issues/924)) ([d8b07a7](https://github.com/typescript-eslint/typescript-eslint/commit/d8b07a7))
- **eslint-plugin:** added new rule no-dynamic-delete ([#565](https://github.com/typescript-eslint/typescript-eslint/issues/565)) ([864c811](https://github.com/typescript-eslint/typescript-eslint/commit/864c811))
- **eslint-plugin:** added new rule no-untyped-public-signature ([#801](https://github.com/typescript-eslint/typescript-eslint/issues/801)) ([c5835f3](https://github.com/typescript-eslint/typescript-eslint/commit/c5835f3))

# [2.7.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.6.1...v2.7.0) (2019-11-11)

### Bug Fixes

- **eslint-plugin:** crash fixing readonly arrays to generic ([#1172](https://github.com/typescript-eslint/typescript-eslint/issues/1172)) ([2b2f2d7](https://github.com/typescript-eslint/typescript-eslint/commit/2b2f2d7))
- **typescript-estree:** hash code to reduce update frequency ([#1179](https://github.com/typescript-eslint/typescript-eslint/issues/1179)) ([96d1cc3](https://github.com/typescript-eslint/typescript-eslint/commit/96d1cc3))
- **typescript-estree:** reduce bundle footprint of tsutils ([#1177](https://github.com/typescript-eslint/typescript-eslint/issues/1177)) ([c8fe515](https://github.com/typescript-eslint/typescript-eslint/commit/c8fe515))

### Features

- **eslint-plugin:** [no-unused-expressions] extend for optional chaining ([#1175](https://github.com/typescript-eslint/typescript-eslint/issues/1175)) ([57d63b7](https://github.com/typescript-eslint/typescript-eslint/commit/57d63b7))
- **parser:** handle optional chaining in scope analysis ([#1169](https://github.com/typescript-eslint/typescript-eslint/issues/1169)) ([026ceb9](https://github.com/typescript-eslint/typescript-eslint/commit/026ceb9))

## [2.6.1](https://github.com/typescript-eslint/typescript-eslint/compare/v2.6.0...v2.6.1) (2019-11-04)

### Bug Fixes

- **typescript-estree:** don't use typescript's synthetic default ([#1156](https://github.com/typescript-eslint/typescript-eslint/issues/1156)) ([17c956e](https://github.com/typescript-eslint/typescript-eslint/commit/17c956e)), closes [#1153](https://github.com/typescript-eslint/typescript-eslint/issues/1153)
- **typescript-estree:** fix filename handling for vue JSX + markdown ([#1127](https://github.com/typescript-eslint/typescript-eslint/issues/1127)) ([366518f](https://github.com/typescript-eslint/typescript-eslint/commit/366518f))
- **typescript-estree:** improve comment parsing code ([#1120](https://github.com/typescript-eslint/typescript-eslint/issues/1120)) ([e54998d](https://github.com/typescript-eslint/typescript-eslint/commit/e54998d))

# [2.6.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.5.0...v2.6.0) (2019-10-28)

### Bug Fixes

- **parser:** adds TTY check before logging the version mismatch warning ([#1121](https://github.com/typescript-eslint/typescript-eslint/issues/1121)) ([768ef63](https://github.com/typescript-eslint/typescript-eslint/commit/768ef63))
- **typescript-estree:** better handle canonical paths ([#1111](https://github.com/typescript-eslint/typescript-eslint/issues/1111)) ([8dcbf4c](https://github.com/typescript-eslint/typescript-eslint/commit/8dcbf4c))
- **typescript-estree:** correct parenthesized optional chain AST ([#1141](https://github.com/typescript-eslint/typescript-eslint/issues/1141)) ([5ae286e](https://github.com/typescript-eslint/typescript-eslint/commit/5ae286e))
- **typescript-estree:** ensure parent pointers are set ([#1129](https://github.com/typescript-eslint/typescript-eslint/issues/1129)) ([d4703e1](https://github.com/typescript-eslint/typescript-eslint/commit/d4703e1))
- **typescript-estree:** normalize paths to fix cache miss on windows ([#1128](https://github.com/typescript-eslint/typescript-eslint/issues/1128)) ([6d0f2ce](https://github.com/typescript-eslint/typescript-eslint/commit/6d0f2ce))

### Features

- **typescript-estree:** add support for declare class properties ([#1136](https://github.com/typescript-eslint/typescript-eslint/issues/1136)) ([1508670](https://github.com/typescript-eslint/typescript-eslint/commit/1508670))

# [2.5.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.4.0...v2.5.0) (2019-10-21)

### Bug Fixes

- **eslint-plugin:** [no-magic-numbers] Support negative numbers ([#1072](https://github.com/typescript-eslint/typescript-eslint/issues/1072)) ([0c85ac3](https://github.com/typescript-eslint/typescript-eslint/commit/0c85ac3))
- **typescript-estree:** correct semver check range ([#1109](https://github.com/typescript-eslint/typescript-eslint/issues/1109)) ([2fc9bd2](https://github.com/typescript-eslint/typescript-eslint/commit/2fc9bd2))
- **typescript-estree:** handle running out of fs watchers ([#1088](https://github.com/typescript-eslint/typescript-eslint/issues/1088)) ([ec62747](https://github.com/typescript-eslint/typescript-eslint/commit/ec62747))
- **typescript-estree:** parsing error for vue sfc ([#1083](https://github.com/typescript-eslint/typescript-eslint/issues/1083)) ([7a8cce6](https://github.com/typescript-eslint/typescript-eslint/commit/7a8cce6))
- **typescript-estree:** remove now unneeded dep on chokidar ([088a691](https://github.com/typescript-eslint/typescript-eslint/commit/088a691))

### Features

- **eslint-plugin:** Support abstract members in member-ordering rule ([#395](https://github.com/typescript-eslint/typescript-eslint/issues/395)) ([#1004](https://github.com/typescript-eslint/typescript-eslint/issues/1004)) ([5f093ac](https://github.com/typescript-eslint/typescript-eslint/commit/5f093ac))
- **typescript-estree:** support long running lint without watch ([#1106](https://github.com/typescript-eslint/typescript-eslint/issues/1106)) ([ed5564d](https://github.com/typescript-eslint/typescript-eslint/commit/ed5564d))

# [2.4.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.3.3...v2.4.0) (2019-10-14)

### Bug Fixes

- **eslint-plugin:** [promise-function-async] Should not report… ([#1023](https://github.com/typescript-eslint/typescript-eslint/issues/1023)) ([514bed9](https://github.com/typescript-eslint/typescript-eslint/commit/514bed9))
- support long running "watch" lint sessions ([#973](https://github.com/typescript-eslint/typescript-eslint/issues/973)) ([854620e](https://github.com/typescript-eslint/typescript-eslint/commit/854620e))

### Features

- **typescript-estree:** support for parsing 3.7 features ([#1045](https://github.com/typescript-eslint/typescript-eslint/issues/1045)) ([623febf](https://github.com/typescript-eslint/typescript-eslint/commit/623febf))

## [2.3.3](https://github.com/typescript-eslint/typescript-eslint/compare/v2.3.2...v2.3.3) (2019-10-07)

### Bug Fixes

- **eslint-plugin:** [class-name-casing] allow unicode letters ([#1043](https://github.com/typescript-eslint/typescript-eslint/issues/1043)) ([47895c0](https://github.com/typescript-eslint/typescript-eslint/commit/47895c0))
- **eslint-plugin:** [efrt] support constructor arguments ([#1021](https://github.com/typescript-eslint/typescript-eslint/issues/1021)) ([60943e6](https://github.com/typescript-eslint/typescript-eslint/commit/60943e6))
- **experimental-utils:** remove Rule.meta.extraDescription ([#1036](https://github.com/typescript-eslint/typescript-eslint/issues/1036)) ([192e23d](https://github.com/typescript-eslint/typescript-eslint/commit/192e23d))

## [2.3.2](https://github.com/typescript-eslint/typescript-eslint/compare/v2.3.1...v2.3.2) (2019-09-30)

### Bug Fixes

- **eslint-plugin:** [no-unnec-type-arg] undefined symbol crash ([#1007](https://github.com/typescript-eslint/typescript-eslint/issues/1007)) ([cdf9294](https://github.com/typescript-eslint/typescript-eslint/commit/cdf9294))
- **typescript-estree:** correct ClassDeclarationBase type ([#1008](https://github.com/typescript-eslint/typescript-eslint/issues/1008)) ([8ce3a81](https://github.com/typescript-eslint/typescript-eslint/commit/8ce3a81))
- **typescript-estree:** handle optional computed prop w/o type ([#1026](https://github.com/typescript-eslint/typescript-eslint/issues/1026)) ([95c13fe](https://github.com/typescript-eslint/typescript-eslint/commit/95c13fe))

## [2.3.1](https://github.com/typescript-eslint/typescript-eslint/compare/v2.3.0...v2.3.1) (2019-09-23)

### Bug Fixes

- **eslint-plugin:** [cons-type-assns] handle namespaced types ([#975](https://github.com/typescript-eslint/typescript-eslint/issues/975)) ([c3c8b86](https://github.com/typescript-eslint/typescript-eslint/commit/c3c8b86))
- **eslint-plugin:** [pfa] Allow async getter/setter in classes ([#980](https://github.com/typescript-eslint/typescript-eslint/issues/980)) ([e348cb2](https://github.com/typescript-eslint/typescript-eslint/commit/e348cb2))
- **typescript-estree:** parsing error for await in non-async func ([#988](https://github.com/typescript-eslint/typescript-eslint/issues/988)) ([19abbe0](https://github.com/typescript-eslint/typescript-eslint/commit/19abbe0))

# [2.3.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.2.0...v2.3.0) (2019-09-16)

### Bug Fixes

- **typescript-estree:** ImportDeclaration.specifier to Literal ([#974](https://github.com/typescript-eslint/typescript-eslint/issues/974)) ([2bf8231](https://github.com/typescript-eslint/typescript-eslint/commit/2bf8231))

### Features

- **eslint-plugin:** [explicit-member-accessibility] add support of "ignoredMethodNames" ([#895](https://github.com/typescript-eslint/typescript-eslint/issues/895)) ([46ee4c9](https://github.com/typescript-eslint/typescript-eslint/commit/46ee4c9))
- **eslint-plugin:** [no-floating-promises] Add ignoreVoid option ([#796](https://github.com/typescript-eslint/typescript-eslint/issues/796)) ([6a55921](https://github.com/typescript-eslint/typescript-eslint/commit/6a55921))
- **eslint-plugin:** [no-magic-numbers] add ignoreReadonlyClassProperties option ([#938](https://github.com/typescript-eslint/typescript-eslint/issues/938)) ([aeea4cd](https://github.com/typescript-eslint/typescript-eslint/commit/aeea4cd))
- **eslint-plugin:** [strict-boolean-expressions] Add allowNullable option ([#794](https://github.com/typescript-eslint/typescript-eslint/issues/794)) ([c713ca4](https://github.com/typescript-eslint/typescript-eslint/commit/c713ca4))
- **eslint-plugin:** add no-unnecessary-condition rule ([#699](https://github.com/typescript-eslint/typescript-eslint/issues/699)) ([5715482](https://github.com/typescript-eslint/typescript-eslint/commit/5715482))

# [2.2.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.1.0...v2.2.0) (2019-09-09)

### Bug Fixes

- **eslint-plugin:** [efrt] allowExpressions - check functions in class field properties ([#952](https://github.com/typescript-eslint/typescript-eslint/issues/952)) ([f1059d8](https://github.com/typescript-eslint/typescript-eslint/commit/f1059d8))
- **eslint-plugin:** [expl-member-a11y] fix parameter properties ([#912](https://github.com/typescript-eslint/typescript-eslint/issues/912)) ([ccb98d8](https://github.com/typescript-eslint/typescript-eslint/commit/ccb98d8))
- **eslint-plugin:** [prefer-readonly] add handling for destructuring assignments ([e011e90](https://github.com/typescript-eslint/typescript-eslint/commit/e011e90))

### Features

- **eslint-plugin:** add brace-style [extension] ([#810](https://github.com/typescript-eslint/typescript-eslint/issues/810)) ([e01dc5f](https://github.com/typescript-eslint/typescript-eslint/commit/e01dc5f))

# [2.1.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.0.0...v2.1.0) (2019-09-02)

### Bug Fixes

- **eslint-plugin:** [member-naming] should match constructor args ([#771](https://github.com/typescript-eslint/typescript-eslint/issues/771)) ([b006667](https://github.com/typescript-eslint/typescript-eslint/commit/b006667))
- **eslint-plugin:** [no-inferrable-types] ignore optional props ([#918](https://github.com/typescript-eslint/typescript-eslint/issues/918)) ([a4e625f](https://github.com/typescript-eslint/typescript-eslint/commit/a4e625f))
- **eslint-plugin:** [promise-function-async] Allow async get/set ([#820](https://github.com/typescript-eslint/typescript-eslint/issues/820)) ([cddfdca](https://github.com/typescript-eslint/typescript-eslint/commit/cddfdca))
- **eslint-plugin:** [require-await] Allow concise arrow function bodies ([#826](https://github.com/typescript-eslint/typescript-eslint/issues/826)) ([29fddfd](https://github.com/typescript-eslint/typescript-eslint/commit/29fddfd))
- **eslint-plugin:** [typedef] don't flag destructuring when variables is disabled ([#819](https://github.com/typescript-eslint/typescript-eslint/issues/819)) ([5603473](https://github.com/typescript-eslint/typescript-eslint/commit/5603473))
- **eslint-plugin:** [typedef] handle AssignmentPattern inside TSParameterProperty ([#923](https://github.com/typescript-eslint/typescript-eslint/issues/923)) ([6bd7f2d](https://github.com/typescript-eslint/typescript-eslint/commit/6bd7f2d))
- **eslint-plugin:** [unbound-method] Allow typeof expressions (Fixes [#692](https://github.com/typescript-eslint/typescript-eslint/issues/692)) ([#904](https://github.com/typescript-eslint/typescript-eslint/issues/904)) ([344bafe](https://github.com/typescript-eslint/typescript-eslint/commit/344bafe))
- **eslint-plugin:** [unbound-method] false positive in equality comparisons ([#914](https://github.com/typescript-eslint/typescript-eslint/issues/914)) ([29a01b8](https://github.com/typescript-eslint/typescript-eslint/commit/29a01b8))
- **eslint-plugin:** [unified-signatures] type comparison and exported nodes ([#839](https://github.com/typescript-eslint/typescript-eslint/issues/839)) ([580eceb](https://github.com/typescript-eslint/typescript-eslint/commit/580eceb))
- **eslint-plugin:** readme typo ([#867](https://github.com/typescript-eslint/typescript-eslint/issues/867)) ([5eb40dc](https://github.com/typescript-eslint/typescript-eslint/commit/5eb40dc))
- **typescript-estree:** improve missing project file error msg ([#866](https://github.com/typescript-eslint/typescript-eslint/issues/866)) ([8f3b0a8](https://github.com/typescript-eslint/typescript-eslint/commit/8f3b0a8)), closes [#853](https://github.com/typescript-eslint/typescript-eslint/issues/853)

### Features

- [no-unnecessary-type-assertion] allow `as const` arrow functions ([#876](https://github.com/typescript-eslint/typescript-eslint/issues/876)) ([14c6f80](https://github.com/typescript-eslint/typescript-eslint/commit/14c6f80))
- **eslint-plugin:** [expl-func-ret-type] make error loc smaller ([#919](https://github.com/typescript-eslint/typescript-eslint/issues/919)) ([65eb993](https://github.com/typescript-eslint/typescript-eslint/commit/65eb993))
- **eslint-plugin:** [no-type-alias] support tuples ([#775](https://github.com/typescript-eslint/typescript-eslint/issues/775)) ([c68e033](https://github.com/typescript-eslint/typescript-eslint/commit/c68e033))
- **eslint-plugin:** add quotes [extension] ([#762](https://github.com/typescript-eslint/typescript-eslint/issues/762)) ([9f82099](https://github.com/typescript-eslint/typescript-eslint/commit/9f82099))
- **typescript-estree:** Accept a glob pattern for `options.project` ([#806](https://github.com/typescript-eslint/typescript-eslint/issues/806)) ([9e5f21e](https://github.com/typescript-eslint/typescript-eslint/commit/9e5f21e))

# [2.0.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.13.0...v2.0.0) (2019-08-13)

- feat(eslint-plugin)!: recommended-requiring-type-checking config (#846) ([d3470c9](https://github.com/typescript-eslint/typescript-eslint/commit/d3470c9)), closes [#846](https://github.com/typescript-eslint/typescript-eslint/issues/846)
- feat(eslint-plugin)!: change recommended config (#729) ([428567d](https://github.com/typescript-eslint/typescript-eslint/commit/428567d)), closes [#729](https://github.com/typescript-eslint/typescript-eslint/issues/729)
- feat(typescript-estree)!: throw error on file not in project when `project` set (#760) ([3777b77](https://github.com/typescript-eslint/typescript-eslint/commit/3777b77)), closes [#760](https://github.com/typescript-eslint/typescript-eslint/issues/760)
- feat(eslint-plugin)!: add rule `consistent-type-assertions` (#731) ([92e98de](https://github.com/typescript-eslint/typescript-eslint/commit/92e98de)), closes [#731](https://github.com/typescript-eslint/typescript-eslint/issues/731)
- feat(eslint-plugin)!: [array-type] rework options (#654) ([1389393](https://github.com/typescript-eslint/typescript-eslint/commit/1389393)), closes [#654](https://github.com/typescript-eslint/typescript-eslint/issues/654) [#635](https://github.com/typescript-eslint/typescript-eslint/issues/635)

### Bug Fixes

- **eslint-plugin:** [efrt] flag default export w/allowExpressions ([#831](https://github.com/typescript-eslint/typescript-eslint/issues/831)) ([ebbcc01](https://github.com/typescript-eslint/typescript-eslint/commit/ebbcc01))
- **eslint-plugin:** [no-explicit-any] Fix ignoreRestArgs for interfaces ([#777](https://github.com/typescript-eslint/typescript-eslint/issues/777)) ([22e9ae5](https://github.com/typescript-eslint/typescript-eslint/commit/22e9ae5))
- **eslint-plugin:** [no-useless-constructor] handle bodyless constructor ([#685](https://github.com/typescript-eslint/typescript-eslint/issues/685)) ([55e788c](https://github.com/typescript-eslint/typescript-eslint/commit/55e788c))
- **eslint-plugin:** [prefer-readonly] TypeError when having comp… ([#761](https://github.com/typescript-eslint/typescript-eslint/issues/761)) ([211b1b5](https://github.com/typescript-eslint/typescript-eslint/commit/211b1b5))
- **eslint-plugin:** [typedef] support "for..in", "for..of" ([#787](https://github.com/typescript-eslint/typescript-eslint/issues/787)) ([39e41b5](https://github.com/typescript-eslint/typescript-eslint/commit/39e41b5))
- **eslint-plugin:** [typedef] support default value for parameter ([#785](https://github.com/typescript-eslint/typescript-eslint/issues/785)) ([84916e6](https://github.com/typescript-eslint/typescript-eslint/commit/84916e6))
- **eslint-plugin:** add `Literal` to `RuleListener` types ([#824](https://github.com/typescript-eslint/typescript-eslint/issues/824)) ([3c902a1](https://github.com/typescript-eslint/typescript-eslint/commit/3c902a1))
- **typescript-estree:** fix `is` token typed as `Keyword ([#750](https://github.com/typescript-eslint/typescript-eslint/issues/750)) ([35dec52](https://github.com/typescript-eslint/typescript-eslint/commit/35dec52))
- **typescript-estree:** jsx comment parsing ([#703](https://github.com/typescript-eslint/typescript-eslint/issues/703)) ([0cfc48e](https://github.com/typescript-eslint/typescript-eslint/commit/0cfc48e))
- **utils:** add ES2019 as valid `ecmaVersion` ([#746](https://github.com/typescript-eslint/typescript-eslint/issues/746)) ([d11fbbe](https://github.com/typescript-eslint/typescript-eslint/commit/d11fbbe))

### Features

- explicitly support eslint v6 ([#645](https://github.com/typescript-eslint/typescript-eslint/issues/645)) ([34a7cf6](https://github.com/typescript-eslint/typescript-eslint/commit/34a7cf6))
- **eslint-plugin:** [interface-name-prefix, class-name-casing] Add allowUnderscorePrefix option to support private declarations ([#790](https://github.com/typescript-eslint/typescript-eslint/issues/790)) ([0c4f474](https://github.com/typescript-eslint/typescript-eslint/commit/0c4f474))
- **eslint-plugin:** [no-var-requires] report on foo(require('')) ([#725](https://github.com/typescript-eslint/typescript-eslint/issues/725)) ([b2ca20d](https://github.com/typescript-eslint/typescript-eslint/commit/b2ca20d)), closes [#665](https://github.com/typescript-eslint/typescript-eslint/issues/665)
- **eslint-plugin:** [promise-function-async] make allowAny default true ([#733](https://github.com/typescript-eslint/typescript-eslint/issues/733)) ([590ca50](https://github.com/typescript-eslint/typescript-eslint/commit/590ca50))
- **eslint-plugin:** [strict-boolean-expressions] add ignoreRhs option ([#691](https://github.com/typescript-eslint/typescript-eslint/issues/691)) ([fd6be42](https://github.com/typescript-eslint/typescript-eslint/commit/fd6be42))
- **eslint-plugin:** add support for object props in CallExpressions ([#728](https://github.com/typescript-eslint/typescript-eslint/issues/728)) ([8141f01](https://github.com/typescript-eslint/typescript-eslint/commit/8141f01))
- **eslint-plugin:** added new rule typedef ([#581](https://github.com/typescript-eslint/typescript-eslint/issues/581)) ([35cc99b](https://github.com/typescript-eslint/typescript-eslint/commit/35cc99b))
- **eslint-plugin:** added new rule use-default-type-parameter ([#562](https://github.com/typescript-eslint/typescript-eslint/issues/562)) ([2b942ba](https://github.com/typescript-eslint/typescript-eslint/commit/2b942ba))
- **eslint-plugin:** move opinionated rules between configs ([#595](https://github.com/typescript-eslint/typescript-eslint/issues/595)) ([4893aec](https://github.com/typescript-eslint/typescript-eslint/commit/4893aec))
- **eslint-plugin:** remove deprecated rules ([#739](https://github.com/typescript-eslint/typescript-eslint/issues/739)) ([e32c7ad](https://github.com/typescript-eslint/typescript-eslint/commit/e32c7ad))

### BREAKING CHANGES

- removed some rules from recommended config
- recommended config changes are considered breaking
- by default we will now throw when a file is not in the `project` provided
- Merges both no-angle-bracket-type-assertion and no-object-literal-type-assertion into one rule
- **eslint-plugin:** both 'eslint-recommended' and 'recommended' have changed.
- **eslint-plugin:** removing rules
- changes config structure

```ts
type ArrayOption = 'array' | 'generic' | 'array-simple';
type Options = [
  {
    // default case for all arrays
    default: ArrayOption;
    // optional override for readonly arrays
    readonly?: ArrayOption;
  },
];
```

- **eslint-plugin:** changing default rule config
- Node 6 is no longer supported

# [1.13.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.12.0...v1.13.0) (2019-07-21)

### Bug Fixes

- Correct `@types/json-schema` dependency ([#675](https://github.com/typescript-eslint/typescript-eslint/issues/675)) ([a5398ce](https://github.com/typescript-eslint/typescript-eslint/commit/a5398ce))
- **eslint-plugin:** remove imports from typescript-estree ([#706](https://github.com/typescript-eslint/typescript-eslint/issues/706)) ([ceb2d32](https://github.com/typescript-eslint/typescript-eslint/commit/ceb2d32)), closes [#705](https://github.com/typescript-eslint/typescript-eslint/issues/705)
- **eslint-plugin:** undo breaking changes to recommended config ([93f72e3](https://github.com/typescript-eslint/typescript-eslint/commit/93f72e3))
- **utils:** move `typescript` from peer dep to dev dep ([#712](https://github.com/typescript-eslint/typescript-eslint/issues/712)) ([f949355](https://github.com/typescript-eslint/typescript-eslint/commit/f949355))
- **utils:** RuleTester should not require a parser ([#713](https://github.com/typescript-eslint/typescript-eslint/issues/713)) ([158a417](https://github.com/typescript-eslint/typescript-eslint/commit/158a417))

### Features

- **eslint-plugin:** add new rule no-misused-promises ([#612](https://github.com/typescript-eslint/typescript-eslint/issues/612)) ([28a131d](https://github.com/typescript-eslint/typescript-eslint/commit/28a131d))
- **eslint-plugin:** add new rule require-await ([#674](https://github.com/typescript-eslint/typescript-eslint/issues/674)) ([807bc2d](https://github.com/typescript-eslint/typescript-eslint/commit/807bc2d))

# [1.12.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.11.0...v1.12.0) (2019-07-12)

### Bug Fixes

- **eslint-plugin:** handle `const;` ([#633](https://github.com/typescript-eslint/typescript-eslint/issues/633)) ([430d628](https://github.com/typescript-eslint/typescript-eslint/commit/430d628)), closes [#441](https://github.com/typescript-eslint/typescript-eslint/issues/441)
- **typescript-estree:** fix `async` identifier token typed as `Keyword` ([#681](https://github.com/typescript-eslint/typescript-eslint/issues/681)) ([6de19d3](https://github.com/typescript-eslint/typescript-eslint/commit/6de19d3))

### Features

- **eslint-plugin:** [ban-types] Support namespaced type ([#616](https://github.com/typescript-eslint/typescript-eslint/issues/616)) ([e325b72](https://github.com/typescript-eslint/typescript-eslint/commit/e325b72))
- **eslint-plugin:** [explicit-function-return-type] add handling for usage as arguments ([#680](https://github.com/typescript-eslint/typescript-eslint/issues/680)) ([e0aeb18](https://github.com/typescript-eslint/typescript-eslint/commit/e0aeb18))
- **eslint-plugin:** [no-explicit-any] Add an optional fixer ([#609](https://github.com/typescript-eslint/typescript-eslint/issues/609)) ([606fc70](https://github.com/typescript-eslint/typescript-eslint/commit/606fc70))
- **eslint-plugin:** Add rule no-reference-import ([#625](https://github.com/typescript-eslint/typescript-eslint/issues/625)) ([af70a59](https://github.com/typescript-eslint/typescript-eslint/commit/af70a59))
- **eslint-plugin:** add rule strict-boolean-expressions ([#579](https://github.com/typescript-eslint/typescript-eslint/issues/579)) ([34e7d1e](https://github.com/typescript-eslint/typescript-eslint/commit/34e7d1e))
- **eslint-plugin:** added new rule prefer-readonly ([#555](https://github.com/typescript-eslint/typescript-eslint/issues/555)) ([76b89a5](https://github.com/typescript-eslint/typescript-eslint/commit/76b89a5))

# [1.11.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.10.2...v1.11.0) (2019-06-23)

### Bug Fixes

- **eslint-plugin:** [no-magic-numbers] add support for enums ([#543](https://github.com/typescript-eslint/typescript-eslint/issues/543)) ([5c40d01](https://github.com/typescript-eslint/typescript-eslint/commit/5c40d01))
- **eslint-plugin:** [promise-function-async] allow any as return value ([#553](https://github.com/typescript-eslint/typescript-eslint/issues/553)) ([9a387b0](https://github.com/typescript-eslint/typescript-eslint/commit/9a387b0))
- **eslint-plugin:** Remove duplicated code ([#611](https://github.com/typescript-eslint/typescript-eslint/issues/611)) ([c4df4ff](https://github.com/typescript-eslint/typescript-eslint/commit/c4df4ff))
- **parser:** add simpleTraverse, replaces private ESLint util ([#628](https://github.com/typescript-eslint/typescript-eslint/issues/628)) ([aa206c4](https://github.com/typescript-eslint/typescript-eslint/commit/aa206c4))
- **typescript-estree:** fix more cases with double slash in JSX text ([#607](https://github.com/typescript-eslint/typescript-eslint/issues/607)) ([34cfa53](https://github.com/typescript-eslint/typescript-eslint/commit/34cfa53))

### Features

- **eslint-plugin:** [no-explicit-any] ignoreRestArgs ([#548](https://github.com/typescript-eslint/typescript-eslint/issues/548)) ([753ad75](https://github.com/typescript-eslint/typescript-eslint/commit/753ad75))
- **eslint-plugin:** add `consistent-type-definitions` rule ([#463](https://github.com/typescript-eslint/typescript-eslint/issues/463)) ([ec87d06](https://github.com/typescript-eslint/typescript-eslint/commit/ec87d06))
- **eslint-plugin:** add new rule no-empty-function ([#626](https://github.com/typescript-eslint/typescript-eslint/issues/626)) ([747bfcb](https://github.com/typescript-eslint/typescript-eslint/commit/747bfcb))
- **eslint-plugin:** add new rule no-floating-promises ([#495](https://github.com/typescript-eslint/typescript-eslint/issues/495)) ([61e6385](https://github.com/typescript-eslint/typescript-eslint/commit/61e6385))

## [1.10.2](https://github.com/typescript-eslint/typescript-eslint/compare/v1.10.1...v1.10.2) (2019-06-10)

### Bug Fixes

- **eslint-plugin:** peerDep should specify semver major range ([#602](https://github.com/typescript-eslint/typescript-eslint/issues/602)) ([5589938](https://github.com/typescript-eslint/typescript-eslint/commit/5589938))

## [1.10.1](https://github.com/typescript-eslint/typescript-eslint/compare/v1.10.0...v1.10.1) (2019-06-09)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint

# [1.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.9.0...v1.10.0) (2019-06-09)

### Bug Fixes

- **eslint-plugin:** [explicit-function-return-type] Fix obj setter prop ([8c8497c](https://github.com/typescript-eslint/typescript-eslint/commit/8c8497c)), closes [#525](https://github.com/typescript-eslint/typescript-eslint/issues/525)
- **eslint-plugin:** [no-extra-parens] Fix crash default switch case crash ([5ec2b32](https://github.com/typescript-eslint/typescript-eslint/commit/5ec2b32)), closes [#509](https://github.com/typescript-eslint/typescript-eslint/issues/509)
- **eslint-plugin:** [no-type-alias] Fix parenthesized type handling ([#576](https://github.com/typescript-eslint/typescript-eslint/issues/576)) ([6489293](https://github.com/typescript-eslint/typescript-eslint/commit/6489293))
- **eslint-plugin:** [NUTA] false positive for null assign to undefined ([#536](https://github.com/typescript-eslint/typescript-eslint/issues/536)) ([b16409a](https://github.com/typescript-eslint/typescript-eslint/commit/b16409a)), closes [#529](https://github.com/typescript-eslint/typescript-eslint/issues/529)
- **eslint-plugin:** Remove `no-dupe-class-members` from eslint-recommended ([#520](https://github.com/typescript-eslint/typescript-eslint/issues/520)) ([1a0e60b](https://github.com/typescript-eslint/typescript-eslint/commit/1a0e60b))
- **experimental-utils:** add `endLine` and `endColumn` ([#517](https://github.com/typescript-eslint/typescript-eslint/issues/517)) ([d9e5f15](https://github.com/typescript-eslint/typescript-eslint/commit/d9e5f15))
- **experimental-utils:** Avoid typescript import at runtime ([#584](https://github.com/typescript-eslint/typescript-eslint/issues/584)) ([fac5c7d](https://github.com/typescript-eslint/typescript-eslint/commit/fac5c7d)), closes [/github.com/typescript-eslint/typescript-eslint/pull/425#issuecomment-498162293](https://github.com//github.com/typescript-eslint/typescript-eslint/pull/425/issues/issuecomment-498162293)
- **typescript-estree:** allow expressions in ExportDefaultDeclaration ([#593](https://github.com/typescript-eslint/typescript-eslint/issues/593)) ([861844d](https://github.com/typescript-eslint/typescript-eslint/commit/861844d))
- **typescript-estree:** stop ignoring comments in JSX with generic ([#596](https://github.com/typescript-eslint/typescript-eslint/issues/596)) ([31d5bd4](https://github.com/typescript-eslint/typescript-eslint/commit/31d5bd4))

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
- upgrade lockfile versions ([#487](https://github.com/typescript-eslint/typescript-eslint/issues/487)) ([f029dba](https://github.com/typescript-eslint/typescript-eslint/commit/f029dba))
- **eslint-plugin:** Support more nodes [no-extra-parens](<[#465](https://github.com/typescript-eslint/typescript-eslint/issues/465)>) ([2d15644](https://github.com/typescript-eslint/typescript-eslint/commit/2d15644))
- **eslint-plugin:** support switch statement [unbound-method](<[#485](https://github.com/typescript-eslint/typescript-eslint/issues/485)>) ([e99ca81](https://github.com/typescript-eslint/typescript-eslint/commit/e99ca81))
- **typescript-estree:** ensure parents are defined during subsequent parses ([#500](https://github.com/typescript-eslint/typescript-eslint/issues/500)) ([665278f](https://github.com/typescript-eslint/typescript-eslint/commit/665278f))

### Features

- **eslint-plugin:** (EXPERIMENTAL) begin indent rewrite ([#439](https://github.com/typescript-eslint/typescript-eslint/issues/439)) ([6eb97d4](https://github.com/typescript-eslint/typescript-eslint/commit/6eb97d4))
- **eslint-plugin:** Add better non-null handling [no-unnecessary-type-assertion](<[#478](https://github.com/typescript-eslint/typescript-eslint/issues/478)>) ([4cd5590](https://github.com/typescript-eslint/typescript-eslint/commit/4cd5590))
- **eslint-plugin:** Add func-call-spacing ([#448](https://github.com/typescript-eslint/typescript-eslint/issues/448)) ([92e65ec](https://github.com/typescript-eslint/typescript-eslint/commit/92e65ec))
- **eslint-plugin:** Add new config "eslint-recommended" ([#488](https://github.com/typescript-eslint/typescript-eslint/issues/488)) ([2600a9f](https://github.com/typescript-eslint/typescript-eslint/commit/2600a9f))
- **eslint-plugin:** add no-magic-numbers rule ([#373](https://github.com/typescript-eslint/typescript-eslint/issues/373)) ([43fa09c](https://github.com/typescript-eslint/typescript-eslint/commit/43fa09c))
- **eslint-plugin:** Add semi [extension](<[#461](https://github.com/typescript-eslint/typescript-eslint/issues/461)>) ([0962017](https://github.com/typescript-eslint/typescript-eslint/commit/0962017))
- **eslint-plugin:** no-inferrable-types: Support more primitives ([#442](https://github.com/typescript-eslint/typescript-eslint/issues/442)) ([4e193ca](https://github.com/typescript-eslint/typescript-eslint/commit/4e193ca))
- **ts-estree:** add preserveNodeMaps option ([#494](https://github.com/typescript-eslint/typescript-eslint/issues/494)) ([c3061f9](https://github.com/typescript-eslint/typescript-eslint/commit/c3061f9))
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
- **parser:** Make eslint traverse enum id ([#383](https://github.com/typescript-eslint/typescript-eslint/issues/383)) ([492b737](https://github.com/typescript-eslint/typescript-eslint/commit/492b737))
- **typescript-estree:** add ExportDefaultDeclaration to union DeclarationStatement ([#378](https://github.com/typescript-eslint/typescript-eslint/issues/378)) ([bf04398](https://github.com/typescript-eslint/typescript-eslint/commit/bf04398))

### Features

- change TypeScript version range to >=3.2.1 <3.5.0 ([#399](https://github.com/typescript-eslint/typescript-eslint/issues/399)) ([a4f95d3](https://github.com/typescript-eslint/typescript-eslint/commit/a4f95d3))
- **eslint-plugin:** allow explicit variable type with arrow functions ([#260](https://github.com/typescript-eslint/typescript-eslint/issues/260)) ([bea6b92](https://github.com/typescript-eslint/typescript-eslint/commit/bea6b92)), closes [#149](https://github.com/typescript-eslint/typescript-eslint/issues/149)

# [1.5.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.4.2...v1.5.0) (2019-03-20)

### Bug Fixes

- **eslint-plugin:** [interface-name-prefix] correct error message in always mode ([#333](https://github.com/typescript-eslint/typescript-eslint/issues/333)) ([097262f](https://github.com/typescript-eslint/typescript-eslint/commit/097262f))
- **eslint-plugin:** fix false positives for adjacent-overload-signatures regarding computed property names ([#340](https://github.com/typescript-eslint/typescript-eslint/issues/340)) ([f6e5118](https://github.com/typescript-eslint/typescript-eslint/commit/f6e5118))
- **eslint-plugin:** fix incorrect rule name ([#357](https://github.com/typescript-eslint/typescript-eslint/issues/357)) ([0a5146b](https://github.com/typescript-eslint/typescript-eslint/commit/0a5146b))
- **typescript-estree:** only call watch callback on new files ([#367](https://github.com/typescript-eslint/typescript-eslint/issues/367)) ([0ef07c4](https://github.com/typescript-eslint/typescript-eslint/commit/0ef07c4))

### Features

- **eslint-plugin:** Add unified-signature rule ([#178](https://github.com/typescript-eslint/typescript-eslint/issues/178)) ([6ffaa0b](https://github.com/typescript-eslint/typescript-eslint/commit/6ffaa0b))

## [1.4.2](https://github.com/typescript-eslint/typescript-eslint/compare/v1.4.1...v1.4.2) (2019-02-25)

### Bug Fixes

- trigger new release ([eaaa471](https://github.com/typescript-eslint/typescript-eslint/commit/eaaa471))

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
- **ts-estree:** fix parsing nested sequence expressions ([#286](https://github.com/typescript-eslint/typescript-eslint/issues/286)) ([ecc9631](https://github.com/typescript-eslint/typescript-eslint/commit/ecc9631))

# [1.3.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.2.0...v1.3.0) (2019-02-07)

### Bug Fixes

- **eslint-plugin:** fix false positive from adjacent-overload-signatures ([#206](https://github.com/typescript-eslint/typescript-eslint/issues/206)) ([07e950e](https://github.com/typescript-eslint/typescript-eslint/commit/07e950e))
- **ts-estree:** align typeArguments and typeParameters across nodes ([#223](https://github.com/typescript-eslint/typescript-eslint/issues/223)) ([3306198](https://github.com/typescript-eslint/typescript-eslint/commit/3306198))
- **ts-estree:** convert decorators on var and fn decs ([#211](https://github.com/typescript-eslint/typescript-eslint/issues/211)) ([0a1777f](https://github.com/typescript-eslint/typescript-eslint/commit/0a1777f))
- **ts-estree:** fix issues with typeParams in FunctionExpression ([#208](https://github.com/typescript-eslint/typescript-eslint/issues/208)) ([d4dfa3b](https://github.com/typescript-eslint/typescript-eslint/commit/d4dfa3b))

### Features

- change TypeScript version range to >=3.2.1 <3.4.0 ([#184](https://github.com/typescript-eslint/typescript-eslint/issues/184)) ([f513a14](https://github.com/typescript-eslint/typescript-eslint/commit/f513a14))
- **eslint-plugin:** add new rule no-for-in-array ([#155](https://github.com/typescript-eslint/typescript-eslint/issues/155)) ([84162ba](https://github.com/typescript-eslint/typescript-eslint/commit/84162ba))
- **eslint-plugin:** add new rule no-require-imports ([#199](https://github.com/typescript-eslint/typescript-eslint/issues/199)) ([683e5bc](https://github.com/typescript-eslint/typescript-eslint/commit/683e5bc))
- **eslint-plugin:** added new rule promise-function-async ([#194](https://github.com/typescript-eslint/typescript-eslint/issues/194)) ([5f3aec9](https://github.com/typescript-eslint/typescript-eslint/commit/5f3aec9))
- **ts-estree:** enable errors 1098 and 1099 ([#219](https://github.com/typescript-eslint/typescript-eslint/issues/219)) ([fc50167](https://github.com/typescript-eslint/typescript-eslint/commit/fc50167))

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
- **ts-estree:** expand optional property to include question token ([#138](https://github.com/typescript-eslint/typescript-eslint/issues/138)) ([9068b62](https://github.com/typescript-eslint/typescript-eslint/commit/9068b62))

### Performance Improvements

- **ts-estree:** don't create Program in parse() ([#148](https://github.com/typescript-eslint/typescript-eslint/issues/148)) ([aacf5b0](https://github.com/typescript-eslint/typescript-eslint/commit/aacf5b0))

# [1.1.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.0.0...v1.1.0) (2019-01-23)

### Bug Fixes

- **eslint-plugin:** don’t mark `declare class` as unused ([#110](https://github.com/typescript-eslint/typescript-eslint/issues/110)) ([5841cd2](https://github.com/typescript-eslint/typescript-eslint/commit/5841cd2)), closes [#106](https://github.com/typescript-eslint/typescript-eslint/issues/106)
- **eslint-plugin:** improve detection of used vars in heritage ([#102](https://github.com/typescript-eslint/typescript-eslint/issues/102)) ([193b434](https://github.com/typescript-eslint/typescript-eslint/commit/193b434))
- **typescript-estree:** correct range of parameters with comments ([#128](https://github.com/typescript-eslint/typescript-eslint/issues/128)) ([91eedf2](https://github.com/typescript-eslint/typescript-eslint/commit/91eedf2))
- **typescript-estree:** fix range of assignment in parameter ([#115](https://github.com/typescript-eslint/typescript-eslint/issues/115)) ([4e781f1](https://github.com/typescript-eslint/typescript-eslint/commit/4e781f1))

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
- **parser:** support ecmaFeatures.jsx flag and tests ([#85](https://github.com/typescript-eslint/typescript-eslint/issues/85)) ([b321736](https://github.com/typescript-eslint/typescript-eslint/commit/b321736))

## [0.2.1](https://github.com/typescript-eslint/typescript-eslint/compare/v0.2.0...v0.2.1) (2019-01-20)

**Note:** Version bump only for package @typescript-eslint/typescript-eslint
