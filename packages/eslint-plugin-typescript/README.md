# eslint-plugin-typescript

TypeScript support for ESLint. (This is still in the very early stages, so please be patient.)

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `typescript-eslint-parser`:

```
$ npm install typescript-eslint-parser --save-dev
```

Last, install `eslint-plugin-typescript`:

```
$ npm install eslint-plugin-typescript --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-typescript` globally.

## Usage

Add `typescript-eslint-parser` to the `parser` field and `typescript` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "parser": "typescript-eslint-parser",
    "plugins": [
        "typescript"
    ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "typescript/rule-name": "error"
    }
}
```

## Supported Rules

* `typescript/type-annotation-spacing` - enforces one space after the colon and zero spaces before the colon of a type annotation.
* `typescript/explicit-member-accessibility` - enforces accessibility modifiers on class properties and methods.
