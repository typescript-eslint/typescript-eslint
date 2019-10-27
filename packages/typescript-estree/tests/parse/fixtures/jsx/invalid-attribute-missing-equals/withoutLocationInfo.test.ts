import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
