import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring-and-spread/var-destructured-array-literal.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
