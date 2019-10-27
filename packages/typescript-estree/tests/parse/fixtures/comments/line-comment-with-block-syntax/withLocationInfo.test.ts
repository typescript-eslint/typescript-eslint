import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/line-comment-with-block-syntax.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
