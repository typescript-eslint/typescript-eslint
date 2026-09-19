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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
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
          messageId: 'noObjectLiteralClassInstance',
        },
      ],
    },
  ],
});
