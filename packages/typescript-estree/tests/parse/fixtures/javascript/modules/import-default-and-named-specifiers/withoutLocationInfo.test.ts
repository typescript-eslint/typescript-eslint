import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
