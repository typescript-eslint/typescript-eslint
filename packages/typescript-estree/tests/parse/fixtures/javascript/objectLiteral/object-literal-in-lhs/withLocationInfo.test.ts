import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/objectLiteral/object-literal-in-lhs.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
