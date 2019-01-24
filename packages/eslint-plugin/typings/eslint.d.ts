/* eslint-disable @typescript-eslint/no-unused-vars */

// module augmentation is weird
import { Scope } from 'eslint';
declare module 'eslint' {
  namespace Scope {
    interface Variable {
      eslintUsed: boolean;
    }
  }
}
