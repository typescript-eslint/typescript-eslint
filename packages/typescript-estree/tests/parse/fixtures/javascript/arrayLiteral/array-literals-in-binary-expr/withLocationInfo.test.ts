import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/arrayLiteral/array-literals-in-binary-expr.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
