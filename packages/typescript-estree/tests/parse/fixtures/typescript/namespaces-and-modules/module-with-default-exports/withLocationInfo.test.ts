import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/namespaces-and-modules/module-with-default-exports.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
