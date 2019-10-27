import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
