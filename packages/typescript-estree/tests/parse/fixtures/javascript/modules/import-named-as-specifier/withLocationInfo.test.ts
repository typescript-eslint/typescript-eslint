import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/import-named-as-specifier.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
