# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.1.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.1.0...v4.1.1) (2020-09-14)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





# [4.1.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.0.1...v4.1.0) (2020-09-07)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





## [4.0.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.0.0...v4.0.1) (2020-08-31)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





# [4.0.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.10.1...v4.0.0) (2020-08-31)


### Bug Fixes

* correct decorator traversal for AssignmentPattern ([#2375](https://github.com/typescript-eslint/typescript-eslint/issues/2375)) ([d738fa4](https://github.com/typescript-eslint/typescript-eslint/commit/d738fa4eff0a5c4cfc9b30b1c0502f8d1e78d7b6))


### Features

* support ESTree optional chaining representation ([#2308](https://github.com/typescript-eslint/typescript-eslint/issues/2308)) ([e9d2ab6](https://github.com/typescript-eslint/typescript-eslint/commit/e9d2ab638b6767700b52797e74b814ea059beaae))


### BREAKING CHANGES

* - Removed decorators property from several Nodes that could never semantically have them (FunctionDeclaration, TSEnumDeclaration, and TSInterfaceDeclaration)
- Removed AST_NODE_TYPES.Import. This is a minor breaking change as the node type that used this was removed ages ago.





## [3.10.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.10.0...v3.10.1) (2020-08-25)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





# [3.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.9.1...v3.10.0) (2020-08-24)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





## [3.9.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.9.0...v3.9.1) (2020-08-17)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





# [3.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.8.0...v3.9.0) (2020-08-10)


### Features

* **typescript-estree:** support TSv4 labelled tuple members ([#2378](https://github.com/typescript-eslint/typescript-eslint/issues/2378)) ([00d84ff](https://github.com/typescript-eslint/typescript-eslint/commit/00d84ffbcbe9d0ec98bdb2f2ce59959a27ce4dbe))





# [3.8.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.7.1...v3.8.0) (2020-08-03)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





## [3.7.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.7.0...v3.7.1) (2020-07-27)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





# [3.7.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.6.1...v3.7.0) (2020-07-20)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





## [3.6.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.6.0...v3.6.1) (2020-07-13)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





# [3.6.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.5.0...v3.6.0) (2020-07-06)

**Note:** Version bump only for package @typescript-eslint/visitor-keys





# [3.5.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.4.0...v3.5.0) (2020-06-29)


### Features

* split visitor keys into their own package ([#2230](https://github.com/typescript-eslint/typescript-eslint/issues/2230)) ([689dae3](https://github.com/typescript-eslint/typescript-eslint/commit/689dae37392d527c64ae83db2a4c3e6b7fecece7))
