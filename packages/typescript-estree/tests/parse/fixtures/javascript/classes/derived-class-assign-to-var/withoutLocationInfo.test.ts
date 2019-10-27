import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/derived-class-assign-to-var.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
