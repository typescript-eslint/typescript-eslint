import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
