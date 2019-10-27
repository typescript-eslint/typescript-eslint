import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/surrounding-return-comments.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
