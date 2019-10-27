import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/basics/typeof-expression.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
