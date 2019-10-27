import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
