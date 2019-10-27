import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/forOf/for-of-array.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
