import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/exponentiationOperators/exponential-operators.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
