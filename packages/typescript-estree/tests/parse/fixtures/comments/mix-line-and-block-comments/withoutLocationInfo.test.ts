import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
