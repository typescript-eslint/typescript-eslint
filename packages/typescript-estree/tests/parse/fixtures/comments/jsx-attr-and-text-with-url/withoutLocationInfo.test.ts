import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/jsx-attr-and-text-with-url.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
