import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/switch-fallthrough-comment-in-function.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
