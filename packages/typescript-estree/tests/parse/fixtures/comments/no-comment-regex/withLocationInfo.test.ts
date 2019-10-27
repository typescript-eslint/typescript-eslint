import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/no-comment-regex.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
