import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/invalid-namespace-value-with-dots.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
