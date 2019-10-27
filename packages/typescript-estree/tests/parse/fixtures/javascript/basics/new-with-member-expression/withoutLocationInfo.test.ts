import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/basics/new-with-member-expression.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
