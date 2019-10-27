import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/arrayLiteral/array-literal-in-lhs.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
