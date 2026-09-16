/*
We intentionally do not include ESLint's own types.

This is to ensure that nobody accidentally uses those incorrect types
instead of the ones declared within this package
*/

declare module 'eslint' {}
