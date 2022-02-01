# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.10.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.10.0...v5.10.1) (2022-01-24)

**Note:** Version bump only for package @typescript-eslint/type-utils





# [5.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.9.1...v5.10.0) (2022-01-17)


### Bug Fixes

* **type-utils:** check IndexSignature internals when checking isTypeReadonly ([#4417](https://github.com/typescript-eslint/typescript-eslint/issues/4417)) ([ef3147c](https://github.com/typescript-eslint/typescript-eslint/commit/ef3147cf73767ddece91ce57f6028a83ce074b60)), closes [#4410](https://github.com/typescript-eslint/typescript-eslint/issues/4410) [#3714](https://github.com/typescript-eslint/typescript-eslint/issues/3714)
* **type-utils:** intersection types involving readonly arrays are now handled in most cases ([#4429](https://github.com/typescript-eslint/typescript-eslint/issues/4429)) ([5046882](https://github.com/typescript-eslint/typescript-eslint/commit/5046882025e3bc8cb122ecef703aebd0b5e79017))
* **type-utils:** isTypeReadonly now handles conditional types ([#4421](https://github.com/typescript-eslint/typescript-eslint/issues/4421)) ([39a6806](https://github.com/typescript-eslint/typescript-eslint/commit/39a6806c61a48bbca93f9ffb965dd8b3fe0575b3))
* **type-utils:** union types always being marked as readonly ([#4419](https://github.com/typescript-eslint/typescript-eslint/issues/4419)) ([99ab193](https://github.com/typescript-eslint/typescript-eslint/commit/99ab193bb02f181bed4ed917b1d121ed189d3fe4))


### Features

* rename `experimental-utils` to `utils` and make `experimental-utils` an alias to the new package ([#4172](https://github.com/typescript-eslint/typescript-eslint/issues/4172)) ([1d55a75](https://github.com/typescript-eslint/typescript-eslint/commit/1d55a7511b38d8e2b2eabe59f639e0a865e6c93f))
* **type-utils:** make isTypeReadonly's options param optional ([#4415](https://github.com/typescript-eslint/typescript-eslint/issues/4415)) ([3a07a56](https://github.com/typescript-eslint/typescript-eslint/commit/3a07a563c987ff25f6cd8925eeeb2ede47cc19e8))





## [5.9.1](https://github.com/typescript-eslint/typescript-eslint/compare/v5.9.0...v5.9.1) (2022-01-10)

**Note:** Version bump only for package @typescript-eslint/type-utils





# [5.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v5.8.1...v5.9.0) (2022-01-03)


### Features

* **experimental-utils:** move isTypeReadonly from eslint-plugin to experimental-utils ([#3658](https://github.com/typescript-eslint/typescript-eslint/issues/3658)) ([a9eb0b9](https://github.com/typescript-eslint/typescript-eslint/commit/a9eb0b9eb2db291ea36065ec34f84bf5c5504b43))
