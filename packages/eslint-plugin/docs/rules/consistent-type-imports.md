---
description: 'Enforce consistent usage of type imports.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/consistent-type-imports** for documentation.

TypeScript allows specifying a `type` keyword on imports to indicate that the export exists only in the type system, not at runtime.
This allows transpilers to drop imports without knowing the types of the dependencies.

> See [Blog > Consistent Type Exports and Imports: Why and How](/blog/consistent-type-imports-and-exports-why-and-how) for more details.

## Options

### `prefer`

This option defines the expected import kind for type-only imports. Valid values for `prefer` are:

- `type-imports` will enforce that you always use `import type Foo from '...'` except referenced by metadata of decorators. It is the default.
- `no-type-imports` will enforce that you always use `import Foo from '...'`.

Examples of **correct** code with `{prefer: 'type-imports'}`, and **incorrect** code with `{prefer: 'no-type-imports'}`.

```ts option='{ "prefer": "type-imports" }' showPlaygroundButton
import type { Foo } from 'Foo';
import type Bar from 'Bar';
type T = Foo;
const x: Bar = 1;
```

Examples of **incorrect** code with `{prefer: 'type-imports'}`, and **correct** code with `{prefer: 'no-type-imports'}`.

```ts option='{ "prefer": "type-imports" }' showPlaygroundButton
import { Foo } from 'Foo';
import Bar from 'Bar';
type T = Foo;
const x: Bar = 1;
```

### `fixStyle`

This option defines the expected type modifier to be added when an import is detected as used only in the type position. Valid values for `fixStyle` are:

- `separate-type-imports` will add the type keyword after the import keyword `import type { A } from '...'`. It is the default.
- `inline-type-imports` will inline the type keyword `import { type A } from '...'` and is only available in TypeScript 4.5 and onwards. See [documentation here](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names 'TypeScript 4.5 documentation on type modifiers and import names').

<!--tabs-->

#### ❌ Incorrect

```ts
import { Foo } from 'Foo';
import Bar from 'Bar';
type T = Foo;
const x: Bar = 1;
```

#### ✅ With `separate-type-imports`

```ts option='{ "fixStyle": "separate-type-imports" }'
import type { Foo } from 'Foo';
import type Bar from 'Bar';
type T = Foo;
const x: Bar = 1;
```

#### ✅ With `inline-type-imports`

```ts option='{ "fixStyle": "inline-type-imports" }'
import { type Foo } from 'Foo';
import type Bar from 'Bar';
type T = Foo;
const x: Bar = 1;
```

<!--tabs-->

### `disallowTypeAnnotations`

If `true`, type imports in type annotations (`import()`) are not allowed.
Default is `true`.

Examples of **incorrect** code with `{disallowTypeAnnotations: true}`:

```ts option='{ "disallowTypeAnnotations": true }' showPlaygroundButton
type T = import('Foo').Foo;
const x: import('Bar') = 1;
```

## Caveat: `@decorators` + `experimentalDecorators: true` + `emitDecoratorMetadata: true`

> TL;DR - the rule will **_not_** report any errors in files _that contain decorators_ when **both** `experimentalDecorators` and `emitDecoratorMetadata` are turned on.

When both the compiler options `experimentalDecorators` and `emitDecoratorMetadata` are turned on and a class is annotated with decorators, TypeScript will emit runtime metadata for the class that captures the property types, method parameter types, and method return types. This runtime code is derived using type information - meaning that the runtime code emitted changes based on the cross-file type information that TypeScript has computed.

This behavior is problematic for the style enforced by this lint rule because it also means that annotating an import with `type` can change the runtime metadata! For example in the following snippet TS:

```ts
import Foo from 'foo';
import decorator from 'decorator';

class Clazz {
  @decorator
  method(arg: Foo) {}
}
```

TS will emit metadata for `method`'s `arg` to annotate its type:

- If `Foo` is a value (eg a class declaration), then TS will annotate the type of `arg` as `Foo`
  - Put another way - there is an invisible runtime reference to `Foo`!
- If `Foo` is a type (eg an interface), then TS will annotate the type of `arg` as either `Object`, `String`, etc - depending on what the type is.

Syntactically it _looks_ like the `Foo` import is a type-only import because it's only used in a type location. However if we annotate the `Foo` import as `type` then it means that the runtime code always falls into the latter case of a type - which changes the runtime metadata! This is a problem for the rule because the rule is not type-aware - so it can't determine if an import is a type or a value - it works purely based on how the import is used.

In the past we tried to solve this problem by enforcing that imported names that are used in decorator metadata are specifically _not_ marked as type-only imports to ensure that values are correctly emitted in the runtime code.

However things get further complicated if you also turn on `isolatedModules` because TS will start enforcing that your imported types are marked as type-only. So to satisfy this the rule needs to enforce that imported values used in decorator metadata are imported _without_ a `type` qualifier, and imported types that are used in decorator metadata are imported _with_ a `type` qualifier. So our above solution of always removing the `type` doesn't work, and instead we need type-information to correctly report errors and fix code.

Ultimately we decided to just opt-out of handling this use-case entirely to avoid accidentally reporting the wrong thing and fixing to code that either fails to compile or alters the emitted runtime metadata. If you'd like more information please [check out the related issue and its discussion](https://github.com/typescript-eslint/typescript-eslint/issues/5468).

To be clear this means the following - the rule will **_not_** report any errors in files _that contain decorators_ when **both** `experimentalDecorators` and `emitDecoratorMetadata` are turned on.

If you are working in such a workspace and want to correctly have your imports consistently marked with `type`, we suggest using the [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax) compiler option which will use type information to correctly enforce that types are marked with `type` and values are not when they are used in decorator metadata.

### Note: TypeScript v5.0 (+ v5.2) decorators

[TypeScript v5.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators) added support for the latest stable decorator proposal. [TypeScript v5.2](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#decorator-metadata) added support for the latest stable decorator metadata proposal. If you are writing decorators on TS v5.2+ with `emitDecoratorMetadata: true` and `experimentalDecorators: false` then you are using the new decorator metadata support.

The new decorator metadata does not include any annotations derived from types -- meaning it does not have any runtime side-effects. This means that the rule will report on these files as normal because changing an import to a type-only import will not have side-effects on the runtime code.

### Configuring `experimentalDecorators` and `emitDecoratorMetadata` for the rule

If you are using [type-aware linting](https://typescript-eslint.io/linting/typed-linting) then we will automatically infer your setup from your tsconfig and you should not need to configure anything.

Otherwise you can explicitly tell our tooling to analyze your code as if the compiler option was turned on by setting both [`parserOptions.emitDecoratorMetadata = true`](https://typescript-eslint.io/packages/parser/#emitdecoratormetadata) and [`parserOptions.experimentalDecorators = true`](https://typescript-eslint.io/packages/parser/#experimentaldecorators).

## Comparison with `importsNotUsedAsValues` / `verbatimModuleSyntax`

[`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax) was introduced in TypeScript v5.0 (as a replacement for `importsNotUsedAsValues`). That being said we **do not** recommend that you use both this rule and `verbatimModuleSyntax` / `importsNotUsedAsValues` together at the same time.

As a comparison both this rule and `verbatimModuleSyntax` should _mostly_ behave in the same way. The main differences being:

- This rule includes an auto-fixer which can be applied from the ESLint CLI `--fix` flag or via your IDE's auto-fix-on-save feature.
- `verbatimModuleSyntax` will error on unused imports, where as this rule will ignore them
- `verbatimModuleSyntax` will work correctly when paired with both `experimentalDecorators` and `emitDecoratorMetadata`
- `verbatimModuleSyntax` will break your build if you have [`noEmitOnError`](https://www.typescriptlang.org/tsconfig#noEmitOnError) turned on
- `verbatimModuleSyntax` can change how imports are emitted from your build.
  - Given the code `import { type T } from 'T';`:
    - With `verbatimModuleSyntax: true` TS will emit `import {} from 'T'`.
    - With `verbatimModuleSyntax: false` TS will emit nothing (it will "elide" the entire import).

Because there are some differences - using both this rule and `verbatimModuleSyntax` at the same time can lead to conflicting errors. As such we recommend that you only ever use one _or_ the other -- never both.

## When Not To Use It

If you specifically want to use both import kinds for stylistic reasons, or don't wish to enforce one style over the other, you can avoid this rule.

However, keep in mind that inconsistent style can harm readability in a project.
We recommend picking a single option for this rule that works best for your project.

## Related To

- [`no-import-type-side-effects`](./no-import-type-side-effects.md)
- [`import/consistent-type-specifier-style`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/consistent-type-specifier-style.md)
- [`import/no-duplicates` with `{"prefer-inline": true}`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-duplicates.md#inline-type-imports)
