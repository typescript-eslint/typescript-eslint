import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/invalid-attribute-missing-equals.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
