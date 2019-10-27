import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/import-default-and-named-specifiers.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
