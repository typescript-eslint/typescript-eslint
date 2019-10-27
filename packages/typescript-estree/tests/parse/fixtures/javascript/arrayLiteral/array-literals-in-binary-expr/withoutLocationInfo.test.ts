import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
