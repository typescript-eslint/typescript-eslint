import type { NewPlugin } from 'pretty-format';

type ConstructorSignature = new (...args: never) => unknown;

export function createSerializer<Constructor extends ConstructorSignature>(
  type: Constructor,
  keys: (keyof InstanceType<Constructor>)[],
): NewPlugin;
// A hack of signature to enable this to work with abstract classes
export function createSerializer<Constructor extends ConstructorSignature>(
  abstractConstructor: unknown,
  keys: (keyof InstanceType<Constructor>)[],
  instanceConstructorThatsNeverUsed: Constructor,
): NewPlugin;

export function createSerializer<Constructor extends ConstructorSignature>(
  type: Constructor,
  keys: (keyof InstanceType<Constructor>)[],
): NewPlugin {
  const SEEN_THINGS = new Set<unknown>();

  return {
    serialize(
      thing: { $id?: number } & Record<string, unknown>,
      config,
      indentation,
      depth,
      refs,
      printer,
    ): string {
      const id = thing.$id != null ? `$${thing.$id}` : '';
      // If `type` is a base class, we should print out the name of the subclass
      // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
      const constructorName = (Object.getPrototypeOf(thing) as Object)
        .constructor.name;

      if (constructorName === 'ImplicitLibVariable' && thing.name === 'const') {
        return 'ImplicitGlobalConstTypeVariable';
      }

      const name = `${constructorName}${id}`;

      if (thing.$id) {
        if (SEEN_THINGS.has(thing)) {
          return name;
        }
        SEEN_THINGS.add(thing);
      }

      const outputLines = [];
      const childIndentation = indentation + config.indent;
      for (const key of keys) {
        let value = thing[key as string];
        // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish
        if (value === undefined) {
          continue;
        }
        if (typeof value === 'function') {
          value = value.call(thing);
        }

        outputLines.push(
          `${childIndentation}${key as string}: ${printer(
            value,
            config,
            childIndentation,
            depth,
            refs,
          )},`,
        );
      }

      outputLines.unshift(`${name} {`);
      outputLines.push(`${indentation}}`);

      const out = outputLines.join('\n');
      return out;
    },
    test(val): boolean {
      return val instanceof type;
    },
  };
}
