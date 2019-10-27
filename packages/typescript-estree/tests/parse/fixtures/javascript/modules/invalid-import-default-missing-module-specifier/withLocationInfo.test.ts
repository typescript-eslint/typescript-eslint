import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/invalid-import-default-missing-module-specifier.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
