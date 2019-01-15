// [43:1] All 'foo' signatures should be adjacent
 export function baz(): void { }
 
>function foo(s: string);
 ^
 function foo(n: number);
 function foo(sn: string | number) { }
 function bar(): void { }


// [46:1] All 'bar' signatures should be adjacent
 function foo(n: number);
 function foo(sn: string | number) { }
>function bar(): void { }
 ^
 function baz(): void { }
 
 declare function foo(s: string);


// [47:1] All 'baz' signatures should be adjacent
 function foo(sn: string | number) { }
 function bar(): void { }
>function baz(): void { }
 ^
 
 declare function foo(s: string);
 declare function foo(n: number);


// [49:1] All 'foo' signatures should be adjacent
 function baz(): void { }
 
>declare function foo(s: string);
 ^
 declare function foo(n: number);
 declare function foo(sn: string | number);
 declare function bar(): void;


// [52:1] All 'bar' signatures should be adjacent
 declare function foo(n: number);
 declare function foo(sn: string | number);
>declare function bar(): void;
 ^
 declare function baz(): void;
 
 declare module "Foo" {


// [53:1] All 'baz' signatures should be adjacent
 declare function foo(sn: string | number);
 declare function bar(): void;
>declare function baz(): void;
 ^
 
 declare module "Foo" {
     export function foo(s: string): void;


// [165:1] All 'foo' signatures should be adjacent
 export default function named<T>(foo: T) { }
 
>export function foo(s: string);
 ^
 export function foo(n: number);
 export function bar(): void { }
 export function baz(): void { }


// [167:1] All 'bar' signatures should be adjacent
 export function foo(s: string);
 export function foo(n: number);
>export function bar(): void { }
 ^
 export function baz(): void { }
 export function foo(sn: string | number) { }
 


// [168:1] All 'baz' signatures should be adjacent
 export function foo(n: number);
 export function bar(): void { }
>export function baz(): void { }
 ^
 export function foo(sn: string | number) { }
 
 


// [169:1] All 'foo' signatures should be adjacent
 export function bar(): void { }
 export function baz(): void { }
>export function foo(sn: string | number) { }
 ^
 
 
 export function foo(s: string);


// [176:1] All 'foo' signatures should be adjacent
 export type bar = number;
 export type baz = number | string;
>export function foo(sn: string | number) { }
 ^
 
 
 function foo(s: string);


// [181:1] All 'bar' signatures should be adjacent
 function foo(s: string);
 function foo(n: number);
>function bar(): void { }
 ^
 function baz(): void { }
 function foo(sn: string | number) { }
 


// [182:1] All 'baz' signatures should be adjacent
 function foo(n: number);
 function bar(): void { }
>function baz(): void { }
 ^
 function foo(sn: string | number) { }
 
 


// [183:1] All 'foo' signatures should be adjacent
 function bar(): void { }
 function baz(): void { }
>function foo(sn: string | number) { }
 ^
 
 
 function foo(s: string);


// [190:1] All 'foo' signatures should be adjacent
 type bar = number;
 type baz = number | string;
>function foo(sn: string | number) { }
 ^
 
 function foo(s: string) { }
 function foo(n: number) { }


// [196:1] All 'foo' signatures should be adjacent
 const a = "";
 const b = "";
>function foo(sn: string | number) { }
 ^
 
 function foo(s: string) { }
 function foo(n: number) { }


// [201:1] All 'foo' signatures should be adjacent
 function foo(n: number) { }
 class Bar { }
>function foo(sn: string | number) { }
 ^
 
 function foo(s: string) { }
 function foo(n: number) { }


// [210:5] All 'foo' signatures should be adjacent
     foo(n: number);
     name: string;
>    foo(sn: string | number) { }
     ^
 }
 
 declare function foo(s: string);


// [213:1] All 'foo' signatures should be adjacent
 }
 
>declare function foo(s: string);
 ^
 declare function foo(n: number);
 declare function bar(): void;
 declare function baz(): void;


// [215:1] All 'bar' signatures should be adjacent
 declare function foo(s: string);
 declare function foo(n: number);
>declare function bar(): void;
 ^
 declare function baz(): void;
 declare function foo(sn: string | number);
 


// [216:1] All 'baz' signatures should be adjacent
 declare function foo(n: number);
 declare function bar(): void;
>declare function baz(): void;
 ^
 declare function foo(sn: string | number);
 
 declare function foo(s: string);


// [217:1] All 'foo' signatures should be adjacent
 declare function bar(): void;
 declare function baz(): void;
>declare function foo(sn: string | number);
 ^
 
 declare function foo(s: string);
 declare function foo(n: number);


// [223:1] All 'foo' signatures should be adjacent
 const a = "";
 const b = "";
>declare function foo(sn: string | number);
 ^
 
 declare module "Foo" {
     export function foo(s: string): void;


// [230:5] All 'foo' signatures should be adjacent
     export function bar(): void;
     export function baz(): void;
>    export function foo(sn: string | number): void;
     ^
 }
 
 declare module "Foo" {


// [239:5] All 'baz' signatures should be adjacent
     function baz(s: string): void;
     export function bar(): void;
>    function baz(n: number): void;
     ^
     function baz(sn: string | number): void;
 }
 


// [248:5] All 'foo' signatures should be adjacent
     export function bar(): void;
     export function baz(): void;
>    export function foo(sn: string | number): void;
     ^
 }
 
 declare namespace Foo {


// [257:5] All 'baz' signatures should be adjacent
     function baz(s: string): void;
     export function bar(): void;
>    function baz(n: number): void;
     ^
     function baz(sn: string | number): void;
 }
 


// [266:5] All 'foo' signatures should be adjacent
     bar(): void;
     baz(): void;
>    foo(sn: string | number): void;
     ^
 }
 
 type Foo = {


// [274:5] All 'foo' signatures should be adjacent
     bar(): void;
     baz(): void;
>    foo(sn: string | number): void;
     ^
 }
 
 type Foo = {


// [280:5] All 'foo' signatures should be adjacent
     foo(s: string): void;
     name: string;
>    foo(n: number): void;
     ^
     foo(sn: string | number): void;
     bar(): void;
     baz(): void;


// [289:5] All 'call' signatures should be adjacent
     (s: string): void;
     foo(n: number): void;
>    (n: number): void;
     ^
     (sn: string | number): void;
     bar(): void;
     baz(): void;


// [300:5] All 'foo' signatures should be adjacent
     bar(): void;
     baz(): void;
>    foo(sn: string | number): void;
     ^
 }
 
 interface Foo {


// [308:5] All 'foo' signatures should be adjacent
     bar(): void;
     baz(): void;
>    foo(sn: string | number): void;
     ^
 }
 
 interface Foo {


// [316:5] All 'foo' signatures should be adjacent
     bar(): void;
     baz(): void;
>    foo(sn: string | number): void;
     ^
 }
 
 interface Foo {


// [322:5] All 'foo' signatures should be adjacent
     foo(s: string): void;
     name: string;
>    foo(n: number): void;
     ^
     foo(sn: string | number): void;
     bar(): void;
     baz(): void;


// [334:9] All 'baz' signatures should be adjacent
         baz(n: number): void;
         foo(): void;
>        baz(sn: string | number): void;
         ^
     }
 }
 


// [343:5] All 'new' signatures should be adjacent
     foo(): void;
     bar(): void;
>    new(sn: string | number);
     ^
 }
 
 interface Foo {


// [349:5] All 'new' signatures should be adjacent
     new(s: string);
     foo(): void;
>    new(n: number);
     ^
     bar(): void;
     new(sn: string | number);
 }


// [351:5] All 'new' signatures should be adjacent
     new(n: number);
     bar(): void;
>    new(sn: string | number);
     ^
 }
 
 class Foo {


// [359:5] All 'constructor' signatures should be adjacent
     bar(): void { }
     baz(): void { }
>    constructor(sn: string | number) { }
     ^
 }
 
 class Foo {


// [367:5] All 'foo' signatures should be adjacent
     bar(): void { }
     baz(): void { }
>    foo(sn: string | number): void { }
     ^
 }
 
 class Foo {


// [375:5] All 'foo' signatures should be adjacent
     bar(): void { }
     baz(): void { }
>    foo(sn: string | number): void { }
     ^
 }
 
 class Foo {


// [383:5] All 'foo' signatures should be adjacent
     bar(): void { }
     baz(): void { }
>    foo(sn: string | number): void { }
     ^
 }
 
 class Foo {


// [389:5] All 'constructor' signatures should be adjacent
     constructor(s: string);
     name: string;
>    constructor(n: number);
     ^
     constructor(sn: string | number) { }
     bar(): void { }
     baz(): void { }


// [398:5] All 'foo' signatures should be adjacent
     foo(s: string): void;
     name: string;
>    foo(n: number): void;
     ^
     foo(sn: string | number): void { }
     bar(): void { }
     baz(): void { }
