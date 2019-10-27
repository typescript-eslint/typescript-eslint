import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/tsx/generic-jsx-element.src.tsx',
  ),
  {
    useJSXTextNode: false,
  },
);
