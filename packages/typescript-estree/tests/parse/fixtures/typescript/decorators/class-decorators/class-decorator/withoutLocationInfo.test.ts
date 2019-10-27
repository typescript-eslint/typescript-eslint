import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/decorators/class-decorators/class-decorator.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
