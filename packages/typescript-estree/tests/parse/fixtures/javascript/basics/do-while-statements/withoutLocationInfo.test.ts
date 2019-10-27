import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/basics/do-while-statements.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
