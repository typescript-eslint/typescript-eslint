import rule from '../../src/rules/no-object-literal-class-instances';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-object-literal-class-instances', rule, {
  valid: [
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point = new Point(1, 2);
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point = new Point(1, 2);
    `,
    `
interface Point {
  x: number;
  y: number;
}
const point: Point = { x: 1, y: 2 };
    `,
    `
type Point = { x: number; y: number };
const point: Point = { x: 1, y: 2 };
    `,
    `
const point = { x: 1, y: 2 };
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Partial<Point> = { x: 1 };
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Pick<Point, 'x'> = { x: 1 };
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point | { x: number; y: number } = { x: 1, y: 2 };
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point = { x: 1, y: 2 } as unknown as Point;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: typeof Point = class {
  constructor(
    public x: number,
    public y: number,
  ) {}
};
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const points: Point[] = [new Point(1, 2)];
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare function draw(point: Point): void;
draw(new Point(1, 2));
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
function make(): Point {
  return new Point(1, 2);
}
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const shape: { origin: Point } = { origin: new Point(1, 2) };
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point = { ...new Point(1, 2) } as any;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point | object = { x: 1, y: 2 };
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point | Record<string, number> = { x: 1, y: 2 };
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point = { x: 1, y: 2 } as any;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
class Point3 extends Point {
  z = 0;
}
const point: Point = new Point3(1, 2);
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
interface Fancy extends Point {
  z: number;
}
declare const fancy: Fancy;
const point: Point = fancy;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
function get<T extends Point>(value: T) {
  const point: Point = value;
}
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point = Object.assign(new Point(1, 2), { x: 3 });
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const draw: (point: Point) => void = (point: { x: number; y: number }) => {};
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Promise<Point> = Promise.resolve(new Point(1, 2));
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Promise<Point | null> = Promise.resolve(null);
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const points: Point[] = [new Point(1, 2)].map(point => point);
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const points: Set<Point>;
const array: Point[] = [...points];
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const maybe: Point | undefined;
const point: Point = maybe!;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const PointClass: typeof Point = Point;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
type Constructor<T = {}> = new (...args: any[]) => T;
function Tagged<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    tag = '';
  };
}
const TaggedPoint = Tagged(Point);
const point: Point = new TaggedPoint(1, 2);
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const value: any;
const point: Point = value;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const readonlyPoint: Readonly<Point>;
const point: Point = readonlyPoint;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Required<Point> = new Point(1, 2);
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
type Shape = Point | { kind: 'plain'; x: number };
const shape: Shape = { kind: 'plain', x: 1 };
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const points: Point[];
const readonlyPoints: readonly Point[] = points;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const points: Record<string, Point>;
const record: Record<string, Point> = { origin: new Point(0, 0), ...points };
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const points: { [key: string]: Point };
const record: Record<string, Point> = points;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const record: Record<number, Point> = { 0: new Point(0, 0) };
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const holder: { point: Point } = {
  get point() {
    return new Point(1, 2);
  },
};
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Readonly<Point> = Object.freeze(new Point(1, 2));
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const pair: [Point, number] = [new Point(1, 2), 1];
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
class Point3 extends Point {}
declare const union: Point | Point3;
const point: Point = union;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
function unwrap<T>(value: Readonly<T>): T {
  return value as T;
}
    `,
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare function Marker(props: { children: Point }): null;
const marker = <Marker>{new Point(1, 2)}</Marker>;
      `,
      filename: 'react.tsx',
    },
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const point: Readonly<Point> = plain;
    `,
    `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const point: Readonly<Point> = Object.freeze(plain);
    `,
    `
class Alpha {
  type = 'alpha' as const;
}
class Beta {
  type = 'beta' as const;
}
declare function useBeta(beta: Beta): void;
declare const definition: (Alpha | Beta) & { type: 'beta' };
useBeta(definition);
    `,
    `
class Alpha {
  alpha = 1;
}
class Beta {
  beta = 1;
}
declare const scope: Alpha | Beta;
const beta = scope as Beta;
    `,
  ],
  invalid: [
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point = { x: 1, y: 2 };
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 36,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    if (x < 0 || y < 0) {
      throw new Error('Point must have positive values');
    }

    this.x = x;
    this.y = y;
  }
}
const point: Point = { x: -1, y: -2 };
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 38,
          endLine: 15,
          line: 15,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point = { x: 1, y: 2 } as Point;
      `,
      errors: [
        {
          column: 15,
          data: { type: 'Point' },
          endColumn: 29,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point = <Point>{ x: 1, y: 2 };
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 36,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point = { x: 1, y: 2 } satisfies Point;
      `,
      errors: [
        {
          column: 15,
          data: { type: 'Point' },
          endColumn: 29,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare function draw(point: Point): void;
draw({ x: 1, y: 2 });
      `,
      errors: [
        {
          column: 6,
          data: { type: 'Point' },
          endColumn: 20,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
function make(): Point {
  return { x: 1, y: 2 };
}
      `,
      errors: [
        {
          column: 10,
          data: { type: 'Point' },
          endColumn: 24,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const make = (): Point => ({ x: 1, y: 2 });
      `,
      errors: [
        {
          column: 28,
          data: { type: 'Point' },
          endColumn: 42,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const points: Point[] = [{ x: 1, y: 2 }];
      `,
      errors: [
        {
          column: 26,
          data: { type: 'Point' },
          endColumn: 40,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const shape: { origin: Point } = { origin: { x: 1, y: 2 } };
      `,
      errors: [
        {
          column: 44,
          data: { type: 'Point' },
          endColumn: 58,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
let point: Point;
point = { x: 1, y: 2 };
      `,
      errors: [
        {
          column: 9,
          data: { type: 'Point' },
          endColumn: 23,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point | undefined = { x: 1, y: 2 };
      `,
      errors: [
        {
          column: 34,
          data: { type: 'Point' },
          endColumn: 48,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point & { z: number } = { x: 1, y: 2, z: 3 };
      `,
      errors: [
        {
          column: 38,
          data: { type: 'Point' },
          endColumn: 58,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
class Label {
  constructor(public text: string) {}
}
const value: Label | Point = { text: 'origin' };
      `,
      errors: [
        {
          column: 30,
          data: { type: 'Label' },
          endColumn: 48,
          endLine: 11,
          line: 11,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Box<T> {
  constructor(public value: T) {}
}
const box: Box<number> = { value: 1 };
      `,
      errors: [
        {
          column: 26,
          data: { type: 'Box<number>' },
          endColumn: 38,
          endLine: 5,
          line: 5,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare function identity<T>(value: T): T;
identity<Point>({ x: 1, y: 2 });
      `,
      errors: [
        {
          column: 17,
          data: { type: 'Point' },
          endColumn: 31,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
abstract class Shape {
  abstract area(): number;
}
const shape: Shape = { area: () => 1 };
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Shape' },
          endColumn: 39,
          endLine: 5,
          line: 5,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
declare class Point {
  x: number;
  y: number;
}
const point: Point = { x: 1, y: 2 };
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 36,
          endLine: 6,
          line: 6,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point = { ...new Point(1, 2) };
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 44,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const condition: boolean;
const point: Point = condition ? { x: 1, y: 2 } : new Point(3, 4);
      `,
      errors: [
        {
          column: 34,
          data: { type: 'Point' },
          endColumn: 48,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
class Line {
  start: Point = { x: 0, y: 0 };
}
      `,
      errors: [
        {
          column: 18,
          data: { type: 'Point' },
          endColumn: 32,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
function draw(point: Point = { x: 0, y: 0 }) {}
      `,
      errors: [
        {
          column: 30,
          data: { type: 'Point' },
          endColumn: 44,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare function Marker(props: { point: Point }): null;
const marker = <Marker point={{ x: 1, y: 2 }} />;
      `,
      errors: [
        {
          column: 31,
          data: { type: 'Point' },
          endColumn: 45,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: InstanceType<typeof Point> = { x: 1, y: 2 };
      `,
      errors: [
        {
          column: 43,
          data: { type: 'Point' },
          endColumn: 57,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const origin = new Point(0, 0);
const point: typeof origin = { x: 1, y: 2 };
      `,
      errors: [
        {
          column: 30,
          data: { type: 'Point' },
          endColumn: 44,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
async function make(): Promise<Point> {
  return { x: 1, y: 2 };
}
      `,
      errors: [
        {
          column: 10,
          data: { type: 'Point' },
          endColumn: 24,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const value: { point?: Point };
const { point = { x: 0, y: 0 } } = value;
      `,
      errors: [
        {
          column: 17,
          data: { type: 'Point' },
          endColumn: 31,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
class Holder {
  get point(): Point {
    return { x: 0, y: 0 };
  }
}
      `,
      errors: [
        {
          column: 12,
          data: { type: 'Point' },
          endColumn: 26,
          endLine: 10,
          line: 10,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
const Point = class {
  constructor(
    public x: number,
    public y: number,
  ) {}
};
const point: InstanceType<typeof Point> = { x: 1, y: 2 };
      `,
      errors: [
        {
          column: 43,
          data: { type: 'Point' },
          endColumn: 57,
          endLine: 8,
          line: 8,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const point: Point = plain;
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 27,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Promise<Point> = Promise.resolve({ x: 1, y: 2 });
      `,
      errors: [
        {
          column: 31,
          data: { type: 'Point' },
          endColumn: 62,
          endLine: 8,
          line: 8,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const points: Point[] = [1].map(x => ({ x, y: 1 }));
      `,
      errors: [
        {
          column: 25,
          data: { type: 'Point' },
          endColumn: 52,
          endLine: 8,
          line: 8,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare function identity<T>(value: T): T;
const point: Point = identity({ x: 1, y: 2 });
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 46,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const points: Map<string, Point> = new Map([['origin', plain]]);
      `,
      errors: [
        {
          column: 36,
          data: { type: 'Point' },
          endColumn: 64,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const points: [Point, number] = [plain, 1];
      `,
      errors: [
        {
          column: 34,
          data: { type: 'Point' },
          endColumn: 39,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const point: Point = { ...plain };
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 34,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const shape: { origin: Point } = { origin: plain };
      `,
      errors: [
        {
          column: 44,
          data: { type: 'Point' },
          endColumn: 49,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare function getPlain(): Promise<{ x: number; y: number }>;
async function get() {
  const point: Point = await getPlain();
}
      `,
      errors: [
        {
          column: 24,
          data: { type: 'Point' },
          endColumn: 40,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
declare const fallback: Point;
const point: Point = plain ?? fallback;
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 27,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const point = Promise.resolve(plain) satisfies Promise<Point>;
      `,
      errors: [
        {
          column: 15,
          data: { type: 'Point' },
          endColumn: 37,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
declare function draw(...points: Point[]): void;
draw(new Point(1, 2), plain);
      `,
      errors: [
        {
          column: 23,
          data: { type: 'Point' },
          endColumn: 28,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
class Vector {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
const point: Point = new Vector(1, 2);
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 38,
          endLine: 14,
          line: 14,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
class Box<T> {
  constructor(public value: T) {}
}
const box: Box<Point> = new Box(plain);
      `,
      errors: [
        {
          column: 25,
          data: { type: 'Point' },
          endColumn: 39,
          endLine: 12,
          line: 12,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
interface Fancy extends Point {
  z: number;
}
const fancy: Fancy = { x: 1, y: 2, z: 3 };
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 42,
          endLine: 11,
          line: 11,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
function getPoints(): Point[] {
  return [plain].filter(Boolean);
}
      `,
      errors: [
        {
          column: 10,
          data: { type: 'Point' },
          endColumn: 33,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
class Line {
  constructor(
    public start: Point,
    public end: Point,
  ) {}
}
new Line(plain, new Point(1, 2));
      `,
      errors: [
        {
          column: 10,
          data: { type: 'Point' },
          endColumn: 15,
          endLine: 15,
          line: 15,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
class Base {
  constructor(public point: Point) {}
}
class Derived extends Base {
  constructor() {
    super(plain);
  }
}
      `,
      errors: [
        {
          column: 11,
          data: { type: 'Point' },
          endColumn: 16,
          endLine: 14,
          line: 14,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
declare const draw: ((point: Point) => void) | undefined;
draw?.(plain);
      `,
      errors: [
        {
          column: 8,
          data: { type: 'Point' },
          endColumn: 13,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
interface Repository {
  get(): Point;
}
const repository: Repository = {
  get() {
    return { x: 1, y: 2 };
  },
};
      `,
      errors: [
        {
          column: 12,
          data: { type: 'Point' },
          endColumn: 26,
          endLine: 13,
          line: 13,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
class Repository {
  get(): Point {
    return plain;
  }
}
      `,
      errors: [
        {
          column: 12,
          data: { type: 'Point' },
          endColumn: 17,
          endLine: 11,
          line: 11,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
function* points(): Generator<Point> {
  yield plain;
}
      `,
      errors: [
        {
          column: 9,
          data: { type: 'Point' },
          endColumn: 14,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const make: () => Point = () => {
  return plain;
};
      `,
      errors: [
        {
          column: 10,
          data: { type: 'Point' },
          endColumn: 15,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const draw: (point?: Point) => void = (point = plain) => {};
      `,
      errors: [
        {
          column: 48,
          data: { type: 'Point' },
          endColumn: 53,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
class Holder {
  constructor(public point: Point = plain) {}
}
      `,
      errors: [
        {
          column: 37,
          data: { type: 'Point' },
          endColumn: 42,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
class Holder {
  accessor point: Point = plain;
}
      `,
      errors: [
        {
          column: 27,
          data: { type: 'Point' },
          endColumn: 32,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
let point: Point;
({ point } = { point: plain });
      `,
      errors: [
        {
          column: 23,
          data: { type: 'Point' },
          endColumn: 28,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
class Holder {
  set origin(value: Point) {}
}
new Holder().origin = plain;
      `,
      errors: [
        {
          column: 23,
          data: { type: 'Point' },
          endColumn: 28,
          endLine: 12,
          line: 12,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
declare const points: Point[];
points[0] = plain;
      `,
      errors: [
        {
          column: 13,
          data: { type: 'Point' },
          endColumn: 18,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
let point: Point | undefined;
point ??= plain;
      `,
      errors: [
        {
          column: 11,
          data: { type: 'Point' },
          endColumn: 16,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const point: Point = (0, plain);
      `,
      errors: [
        {
          column: 26,
          data: { type: 'Point' },
          endColumn: 31,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
declare const condition: boolean;
const point: Point = condition ? plain || new Point(1, 2) : new Point(3, 4);
      `,
      errors: [
        {
          column: 34,
          data: { type: 'Point' },
          endColumn: 39,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
declare const key: string;
const record: Record<string, Point> = { [key]: plain };
      `,
      errors: [
        {
          column: 48,
          data: { type: 'Point' },
          endColumn: 53,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const grid: Point[][] = [[plain]];
      `,
      errors: [
        {
          column: 27,
          data: { type: 'Point' },
          endColumn: 32,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
function make<T extends Point>(): T {
  return { x: 1, y: 2 } as T;
}
      `,
      errors: [
        {
          column: 10,
          data: { type: 'Point' },
          endColumn: 24,
          endLine: 9,
          line: 9,
          messageId: 'objectLiteral',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const maybe: { x: number; y: number } | undefined;
const point: Point = maybe!;
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 28,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const point = new Promise<Point>(resolve => resolve(plain));
      `,
      errors: [
        {
          column: 53,
          data: { type: 'Point' },
          endColumn: 58,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
interface Shape {
  origin: Point;
}
const point: Shape['origin'] = plain;
      `,
      errors: [
        {
          column: 32,
          data: { type: 'Point' },
          endColumn: 37,
          endLine: 12,
          line: 12,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plains: { x: number; y: number }[];
const points: readonly Point[] = plains;
      `,
      errors: [
        {
          column: 34,
          data: { type: 'Point' },
          endColumn: 40,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plains: Record<string, { x: number; y: number }>;
const points: Record<string, Point> = plains;
      `,
      errors: [
        {
          column: 39,
          data: { type: 'Point' },
          endColumn: 45,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const points: Map<string, Point[]> = new Map([['origin', [plain]]]);
      `,
      errors: [
        {
          column: 38,
          data: { type: 'Point' },
          endColumn: 68,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const union: Point | { x: number; y: number };
const point: Point = union;
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 27,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const intersection: { x: number } & { y: number };
const point: Point = intersection;
      `,
      errors: [
        {
          column: 22,
          data: { type: 'Point' },
          endColumn: 34,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const points: (Point | null)[] = [plain, null];
      `,
      errors: [
        {
          column: 35,
          data: { type: 'Point' },
          endColumn: 40,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
declare const condition: boolean;
const points: Point[] = [condition ? plain : new Point(1, 2)];
      `,
      errors: [
        {
          column: 38,
          data: { type: 'Point' },
          endColumn: 43,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
declare function draw(point: Point): void;
draw(plain as Point);
      `,
      errors: [
        {
          column: 6,
          data: { type: 'Point' },
          endColumn: 11,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const points: [string, ...Point[]] = ['origin', plain];
      `,
      errors: [
        {
          column: 49,
          data: { type: 'Point' },
          endColumn: 54,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
const shape: { origin?: Point } = { origin: plain };
      `,
      errors: [
        {
          column: 45,
          data: { type: 'Point' },
          endColumn: 50,
          endLine: 9,
          line: 9,
          messageId: 'nonInstance',
        },
      ],
    },
    {
      code: `
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
declare const plain: { x: number; y: number };
declare function Marker(props: { children: Point }): null;
const marker = <Marker>{plain}</Marker>;
      `,
      errors: [
        {
          column: 25,
          data: { type: 'Point' },
          endColumn: 30,
          endLine: 10,
          line: 10,
          messageId: 'nonInstance',
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
class Beta {
  beta = 1;
}
declare const value: string | { beta: number };
const beta = value as Beta;
      `,
      errors: [
        {
          column: 14,
          data: { type: 'Beta' },
          endColumn: 19,
          endLine: 6,
          line: 6,
          messageId: 'nonInstance',
        },
      ],
    },
  ],
});
