import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/import-default-and-namespace-specifiers.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
