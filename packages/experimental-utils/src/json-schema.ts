/*
This is a types-only package, so there's no actual json-schema package

This is the reason that we export it from here - so consumers don't need to do
this weird pseudo-import to have type-checked JSON schemas.
*/
// eslint-disable-next-line import/no-extraneous-dependencies
export * from 'json-schema';
