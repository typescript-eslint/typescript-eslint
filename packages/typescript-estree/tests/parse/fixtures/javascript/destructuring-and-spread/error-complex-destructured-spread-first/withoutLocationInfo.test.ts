import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring-and-spread/error-complex-destructured-spread-first.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
