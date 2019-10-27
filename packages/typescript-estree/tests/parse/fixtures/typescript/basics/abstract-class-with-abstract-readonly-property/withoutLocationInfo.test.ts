import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/abstract-class-with-abstract-readonly-property.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
