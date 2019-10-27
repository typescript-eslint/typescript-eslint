import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/forOf/for-of-with-var-and-no-braces.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
