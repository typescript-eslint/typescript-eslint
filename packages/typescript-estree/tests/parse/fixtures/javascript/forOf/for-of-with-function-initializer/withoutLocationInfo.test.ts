import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
