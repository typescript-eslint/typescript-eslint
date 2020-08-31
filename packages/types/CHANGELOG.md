# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.10.1...v4.0.0) (2020-08-31)


### Bug Fixes

* correct decorator traversal for AssignmentPattern ([#2375](https://github.com/typescript-eslint/typescript-eslint/issues/2375)) ([d738fa4](https://github.com/typescript-eslint/typescript-eslint/commit/d738fa4eff0a5c4cfc9b30b1c0502f8d1e78d7b6))
* **typescript-estree:** correct ChainExpression interaction with parentheses and non-nulls ([#2380](https://github.com/typescript-eslint/typescript-eslint/issues/2380)) ([762bc99](https://github.com/typescript-eslint/typescript-eslint/commit/762bc99584ede4d0b8099a743991e957aec86aa8))


### Features

* consume new scope analysis package ([#2039](https://github.com/typescript-eslint/typescript-eslint/issues/2039)) ([3be125d](https://github.com/typescript-eslint/typescript-eslint/commit/3be125d9bdbee1984ac6037874edf619213bd3d0))
* support ESTree optional chaining representation ([#2308](https://github.com/typescript-eslint/typescript-eslint/issues/2308)) ([e9d2ab6](https://github.com/typescript-eslint/typescript-eslint/commit/e9d2ab638b6767700b52797e74b814ea059beaae))


### BREAKING CHANGES

* - Removed decorators property from several Nodes that could never semantically have them (FunctionDeclaration, TSEnumDeclaration, and TSInterfaceDeclaration)
- Removed AST_NODE_TYPES.Import. This is a minor breaking change as the node type that used this was removed ages ago.





## [3.10.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.10.0...v3.10.1) (2020-08-25)

**Note:** Version bump only for package @typescript-eslint/types





# [3.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.9.1...v3.10.0) (2020-08-24)

**Note:** Version bump only for package @typescript-eslint/types





## [3.9.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.9.0...v3.9.1) (2020-08-17)

**Note:** Version bump only for package @typescript-eslint/types





# [3.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.8.0...v3.9.0) (2020-08-10)


### Features

* **typescript-estree:** support TSv4 labelled tuple members ([#2378](https://github.com/typescript-eslint/typescript-eslint/issues/2378)) ([00d84ff](https://github.com/typescript-eslint/typescript-eslint/commit/00d84ffbcbe9d0ec98bdb2f2ce59959a27ce4dbe))





# [3.8.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.7.1...v3.8.0) (2020-08-03)

**Note:** Version bump only for package @typescript-eslint/types





## [3.7.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.7.0...v3.7.1) (2020-07-27)

**Note:** Version bump only for package @typescript-eslint/types





# [3.7.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.6.1...v3.7.0) (2020-07-20)


### Features

* **eslint-plugin:** [no-empty-function] add `decoratedFunctions` option ([#2295](https://github.com/typescript-eslint/typescript-eslint/issues/2295)) ([88f08f4](https://github.com/typescript-eslint/typescript-eslint/commit/88f08f410760f58fdc2de58ecd9dab9610821642))
* **typescript-estree:** support short-circuiting assignment operators ([#2307](https://github.com/typescript-eslint/typescript-eslint/issues/2307)) ([2c90d9f](https://github.com/typescript-eslint/typescript-eslint/commit/2c90d9fa3aa5ebd7db697dddb7762bca2dd0e06b))





## [3.6.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.6.0...v3.6.1) (2020-07-13)

**Note:** Version bump only for package @typescript-eslint/types





# [3.6.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.5.0...v3.6.0) (2020-07-06)

**Note:** Version bump only for package @typescript-eslint/types





# [3.5.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.4.0...v3.5.0) (2020-06-29)


### Features

* add package scope-manager ([#1939](https://github.com/typescript-eslint/typescript-eslint/issues/1939)) ([682eb7e](https://github.com/typescript-eslint/typescript-eslint/commit/682eb7e009c3f22a542882dfd3602196a60d2a1e))
* split types into their own package ([#2229](https://github.com/typescript-eslint/typescript-eslint/issues/2229)) ([5f45918](https://github.com/typescript-eslint/typescript-eslint/commit/5f4591886f3438329fbf2229b03ac66174334a24))
