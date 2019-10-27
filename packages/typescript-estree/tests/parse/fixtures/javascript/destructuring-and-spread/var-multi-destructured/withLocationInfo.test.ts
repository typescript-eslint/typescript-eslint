import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring-and-spread/var-multi-destructured.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
