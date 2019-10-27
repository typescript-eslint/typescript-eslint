import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/member-expression.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
