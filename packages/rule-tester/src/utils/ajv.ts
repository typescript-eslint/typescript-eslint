// Forked from https://github.com/eslint/eslint/blob/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/lib/shared/ajv.js

import Ajv from 'ajv';
import metaSchema from 'ajv/lib/refs/json-schema-draft-04.json';

export function ajvBuilder(additionalOptions = {}): Ajv.Ajv {
  const ajv = new Ajv({
    meta: false,
    useDefaults: true,
    validateSchema: false,
    missingRefs: 'ignore',
    verbose: true,
    schemaId: 'auto',
    ...additionalOptions,
  });

  ajv.addMetaSchema(metaSchema);

  // @ts-expect-error -- this is an untyped part of the ajv API
  ajv._opts.defaultMeta = metaSchema.id;

  return ajv;
}
