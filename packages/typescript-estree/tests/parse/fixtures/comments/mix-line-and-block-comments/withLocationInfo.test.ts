import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/mix-line-and-block-comments.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
