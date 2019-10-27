import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/basics/and-operator-array-object.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
