import { deprecatedFunction, takesString } from './dependency.js';
declare const stringValue: string;
declare const anyValue: any;
-stringValue;
takesString(anyValue);
await 1;
deprecatedFunction();
