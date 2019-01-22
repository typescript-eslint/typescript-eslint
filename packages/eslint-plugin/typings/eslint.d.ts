// module augmentation is weird
import { Scope } from 'eslint';
declare module 'eslint' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace Scope {
    interface Variable {
      eslintUsed: boolean;
    }
  }
}
