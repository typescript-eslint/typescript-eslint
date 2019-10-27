import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/invalid-import-named-after-named.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
