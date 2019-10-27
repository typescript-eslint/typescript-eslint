import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/forOf/for-of-with-function-initializer.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
