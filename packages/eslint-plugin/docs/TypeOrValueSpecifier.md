This option takes an array of type specifiers to {props.verb}. Each item in the array must have one of the following forms:

- A type (or multiple types) defined in a file (`{ from: "file", name: "Foo", path: "src/foo-file.ts" }` with `path` being an optional path relative to the project root directory)
- A type (or multiple types) from the default library (`{ from: "lib", name: "Foo" }`)
- A type (or multiple types) from a package (`{ from: "package", name: "Foo", package: "foo-lib" }`, this also works for types defined in a typings package).

In any of the three forms, `name` can also be an array of strings representing multiple types, rather than just one string.

Additionally, a type may be defined just as a simple string, which then matches the type independently of its origin.
