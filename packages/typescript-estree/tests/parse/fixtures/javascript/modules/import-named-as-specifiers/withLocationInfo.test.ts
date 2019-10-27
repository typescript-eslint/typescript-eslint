import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/import-named-as-specifiers.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
