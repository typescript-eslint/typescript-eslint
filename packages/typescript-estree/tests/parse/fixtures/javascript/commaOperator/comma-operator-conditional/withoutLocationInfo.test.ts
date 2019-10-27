import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/commaOperator/comma-operator-conditional.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
