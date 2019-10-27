import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/jsx-with-operators.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
