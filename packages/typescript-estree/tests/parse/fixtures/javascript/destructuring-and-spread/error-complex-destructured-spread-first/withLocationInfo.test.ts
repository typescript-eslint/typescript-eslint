import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
