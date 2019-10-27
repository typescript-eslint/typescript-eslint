import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/export-default-anonymous-class.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
