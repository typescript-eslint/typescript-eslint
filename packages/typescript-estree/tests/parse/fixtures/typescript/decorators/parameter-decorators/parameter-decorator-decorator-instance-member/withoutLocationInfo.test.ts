import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/decorators/parameter-decorators/parameter-decorator-decorator-instance-member.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
