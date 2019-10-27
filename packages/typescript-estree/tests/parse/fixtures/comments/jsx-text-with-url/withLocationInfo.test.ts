import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/jsx-text-with-url.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
