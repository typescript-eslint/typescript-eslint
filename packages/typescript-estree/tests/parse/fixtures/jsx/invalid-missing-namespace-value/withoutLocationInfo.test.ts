import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
