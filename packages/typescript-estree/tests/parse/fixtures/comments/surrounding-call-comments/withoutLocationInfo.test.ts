import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/surrounding-call-comments.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
