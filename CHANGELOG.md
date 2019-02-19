# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
