# no-dynamic-delete

Bans usage of the delete operator with computed key expressions.

## Rule Details

Deleting dynamically computed keys is dangerous and not well optimized.

Also consider using a `Map` or `Set` if you’re storing collections of objects. Using
`Object`s can cause occasional edge case bugs, such as if a key is named “hasOwnProperty”.

### Options

Not configurable

## When Not To Use It

If you require deleting computed object property keys, consider
setting the property value to `undefined` instead, or creating a new
object without the property you wish to delete.

If those alternatives do not work for you, you should use `delete` and
disable this rule.

## Related to

- TSLint: [`no-dynamic-delete`](https://palantir.github.io/tslint/rules/no-dynamic-delete/)
