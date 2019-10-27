import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/invalid-mismatched-namespace-tag.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
