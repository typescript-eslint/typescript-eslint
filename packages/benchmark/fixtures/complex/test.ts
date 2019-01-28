class Red extends Color {
  public shade() {
    var getHue = () => {
      return this.hue();
    };
    return getHue() + ' red';
  }
}

class Color {
  public shade() {
    return 'some shade';
  }
  public hue() {
    return 'some hue';
  }
}

class Blue extends Color {
  public shade() {
    var getHue = () => {
      return this.hue();
    };
    return getHue() + ' blue';
  }
}

var r = new Red();
var b = new Blue();

r.shade();
r.hue();
b.shade();
b.hue();

// @declaration: true
// @filename: foo.ts
const foo = {
  bar: 'hello',
  bat: 'world',
  bam: { bork: { bar: 'a', baz: 'b' } }
};
const arr: [0, 1, 2, ['a', 'b', 'c', [{ def: 'def' }, { sec: 'sec' }]]] = [
  0,
  1,
  2,
  ['a', 'b', 'c', [{ def: 'def' }, { sec: 'sec' }]]
];

const {
  bar: baz,
  bat,
  bam: {
    bork: { bar: ibar, baz: ibaz }
  }
} = foo;
{ baz, ibaz };

const [, one, , [, bee, , [, { sec }]]] = arr;
{ one, bee, sec };

const getFoo = () => ({
  foo: 'foo'
});

const { foo: foo2 } = getFoo();
class TestFile {
  name: string;
  foo(message: string): () => string {
    return (...x: string[]) =>
      /// <summary>Test summary</summary>
      /// <param name="message" type="String" />
      /// <returns type="Function" />

      message + this.name;
  }
}
var simpleExample = class {
  static getTags() {}
  tags() {}
};
var circularReference = class C {
  static getTags(c: C): C {
    return c;
  }
  tags(c: C): C {
    return c;
  }
};

// repro from #15066
class FooItem {
  foo(): void {}
  name?: string;
}

type Constructor<T> = new (...args: any[]) => T;
function WithTags<T extends Constructor<FooItem>>(Base: T) {
  return class extends Base {
    static getTags(): void {}
    tags(): void {}
  };
}

class Test extends WithTags(FooItem) {}

const test = new Test();

Test.getTags();
test.tags();
interface Foo {
  a: string;
  b: number;
};

interface Bar {
  b: string;
}

interface Other {
  totallyUnrelatedProperty: number;
}

let x = { a: '', b: '' };

declare function f(x: Foo | Other): any;

f(x);
f({ a: '', b: '' })

declare function g(x: Bar | Other): any;

g(x);
g({ a: '', b: '' })

declare function h(x: Foo | Bar | Other): any;

h(x);
h({ a: '', b: '' })

interface CatDog { cat: any, dog: any }
interface ManBearPig { man: any, bear: any, pig: any }
interface Platypus { platypus: any }

type ExoticAnimal =
  | CatDog
  | ManBearPig
  | Platypus;

declare function addToZoo(animal: ExoticAnimal): void;

addToZoo({ dog: "Barky McBarkface" });
addToZoo({ man: "Manny", bear: "Coffee" });

const manBeer = { man: "Manny", beer: "Coffee" };
addToZoo({ man: "Manny", beer: "Coffee" });
addToZoo(manBeer);
interface I {
}

enum E {
  Red, Green, Blue
}

function f() {
  var a: any;
  var n=3;
  var s="";
  var b=false;
  var i:I;
  var e:E;

  n&&a;
  n&&s;
  n&&b;
  n&&i;
  n&&n;
  n&&e;

  s&&a;
  s&&n;
  s&&b;
  s&&i;
  s&&s;
  s&&e;

  a&&n;
  a&&s;
  a&&b;
  a&&i;
  a&&a;
  a&&e;

  i&&n;
  i&&s;
  i&&b;
  i&&a;
  i&&i;
  i&&e;

  e&&n;
  e&&s;
  e&&b;
  e&&a;
  e&&i;
  e&&e;

  n||a;
  n||s;
  n||b;
  n||i;
  n||n;
  n||e;

  s||a;
  s||n;
  s||b;
  s||i;
  s||s;
  s||e;

  a||n;
  a||s;
  a||b;
  a||i;
  a||a;
  a||e;

  i||n;
  i||s;
  i||b;
  i||a;
  i||i;
  i||e;

  e||n;
  e||s;
  e||b;
  e||a;
  e||i;
  e||e;

  n==a;
  n==s;
  n==b;
  n==i;
  n==n;
  n==e;

  s==a;
  s==n;
  s==b;
  s==i;
  s==s;
  s==e;

  a==n;
  a==s;
  a==b;
  a==i;
  a==a;
  a==e;

  i==n;
  i==s;
  i==b;
  i==a;
  i==i;
  i==e;

  e==n;
  e==s;
  e==b;
  e==a;
  e==i;
  e==e;

  +i;
  +s;
  +n;
  +a;
  +b;

  -i;
  -s;
  -n;
  -a;
  -b;

  !i;
  !s;
  !n;
  !a;
  !b;


  n+a;
  n+s;
  n+b;
  n+i;
  n+n;
  n+e;

  s+a;
  s+n;
  s+b;
  s+i;
  s+s;
  s+e;

  a+n;
  a+s;
  a+b;
  a+i;
  a+a;
  a+e;

  i+n;
  i+s;
  i+b;
  i+a;
  i+i;
  i+e;

  e+n;
  e+s;
  e+b;
  e+a;
  e+i;
  e+e;

  n^a;
  n^s;
  n^b;
  n^i;
  n^n;
  n^e;

  s^a;
  s^n;
  s^b;
  s^i;
  s^s;
  s^e;

  a^n;
  a^s;
  a^b;
  a^i;
  a^a;
  a^e;

  i^n;
  i^s;
  i^b;
  i^a;
  i^i;
  i^e;

  e^n;
  e^s;
  e^b;
  e^a;
  e^i;
  e^e;

  n-a;
  n-s;
  n-b;
  n-i;
  n-n;
  n-e;

  s-a;
  s-n;
  s-b;
  s-i;
  s-s;
  s-e;

  a-n;
  a-s;
  a-b;
  a-i;
  a-a;
  a-e;

  i-n;
  i-s;
  i-b;
  i-a;
  i-i;
  i-e;

  e-n;
  e-s;
  e-b;
  e-a;
  e-i;
  e-e;

}
