// TODO: This fixture might be too large, and if so should be split up.

function message(
  name: string,
  age: number = 100,
  ...args: Array<string>
): string {
  return name;
}
