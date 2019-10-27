import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
