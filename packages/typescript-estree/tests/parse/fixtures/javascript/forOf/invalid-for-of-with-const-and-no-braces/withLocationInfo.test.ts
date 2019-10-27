import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/forOf/invalid-for-of-with-const-and-no-braces.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
