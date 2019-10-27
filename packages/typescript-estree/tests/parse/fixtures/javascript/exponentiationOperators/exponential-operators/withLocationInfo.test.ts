import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
