import { dependency as importedDependency } from './dependency';

function sealed<T extends new (...arguments_: any[]) => object>(value: T): T {
  return value;
}

@sealed
class Component {
  value = importedDependency;
}

const identity = <Value>(value: Value): Value => value;
const configuration = { enabled: true } satisfies Record<string, boolean>;
const optional = configuration?.enabled?.valueOf();
const pattern = /native\s+adapter/giu;
const message = `adapter: ${identity(optional)}`;

// Preserve this comment in the converted output.
export { configuration, message, optional, pattern };
