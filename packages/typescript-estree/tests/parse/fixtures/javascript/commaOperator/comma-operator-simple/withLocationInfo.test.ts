import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/commaOperator/comma-operator-simple.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
