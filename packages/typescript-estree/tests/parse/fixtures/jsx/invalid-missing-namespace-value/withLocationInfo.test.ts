import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/invalid-missing-namespace-value.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
