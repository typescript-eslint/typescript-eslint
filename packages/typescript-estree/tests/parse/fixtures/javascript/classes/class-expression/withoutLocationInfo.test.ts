import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/class-expression.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
