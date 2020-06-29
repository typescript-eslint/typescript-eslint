import { NewPlugin } from 'pretty-format';

type ConstructorSignature = new (...args: never) => unknown;

function createSerializer<TConstructor extends ConstructorSignature>(
  type: TConstructor,
  keys: (keyof InstanceType<TConstructor>)[],
): NewPlugin;
// A hack of signature to enable this to work with abstract classes
function createSerializer<TConstructor extends ConstructorSignature>(
  abstractConstructor: unknown,
  keys: (keyof InstanceType<TConstructor>)[],
  instanceConstructorThatsNeverUsed: TConstructor,
): NewPlugin;

function createSerializer<TConstructor extends ConstructorSignature>(
  type: TConstructor,
  keys: (keyof InstanceType<TConstructor>)[],
): NewPlugin {
  const SEEN_THINGS = new Set<unknown>();

  return {
    test(val): boolean {
      return val instanceof type;
    },
    serialize(
      thing: Record<string, unknown> & { $id?: number },
      config,
      indentation,
      depth,
      refs,
      printer,
    ): string {
      const id = thing.$id != null ? `$${thing.$id}` : '';
      // If `type` is a base class, we should print out the name of the subclass
      const constructorName = Object.getPrototypeOf(thing).constructor.name;

      const name = `${constructorName}${id}`;

      if (thing.$id) {
        if (SEEN_THINGS.has(thing)) {
          return `${name}`;
        }
        SEEN_THINGS.add(thing);
      }

      const outputLines = [];
      const childIndentation = indentation + config.indent;
      for (const key of keys) {
        let value = thing[key as string];
        if (value === undefined) {
          continue;
        }
        if (typeof value === 'function') {
          value = value.call(thing);
        }

        outputLines.push(
          `${childIndentation}${key}: ${printer(
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
  };
}

export { createSerializer };
