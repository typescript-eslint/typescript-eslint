interface Foos {
  bar?: number;
}
const foos: Foos[] = [];
foos.flatMap(({ bar = 42 }) => bar);
