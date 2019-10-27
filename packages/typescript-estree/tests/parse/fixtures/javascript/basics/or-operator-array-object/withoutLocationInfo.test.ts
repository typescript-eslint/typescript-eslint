import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/basics/or-operator-array-object.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
