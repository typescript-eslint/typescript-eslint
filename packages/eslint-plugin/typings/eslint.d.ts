// module augmentation is weird
import { Scope } from 'eslint';
declare module 'eslint' {
  namespace Scope {
    interface Variable {
      eslintUsed: boolean;
    }
  }
}
