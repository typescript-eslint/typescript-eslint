import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/import-default-as.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
