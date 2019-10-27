import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
