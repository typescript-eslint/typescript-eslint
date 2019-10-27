import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/generators/generator-declaration.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
