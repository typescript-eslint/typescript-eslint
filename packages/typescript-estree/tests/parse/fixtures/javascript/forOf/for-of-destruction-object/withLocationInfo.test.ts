import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/forOf/for-of-destruction-object.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
