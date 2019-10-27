import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/comment-within-condition.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
