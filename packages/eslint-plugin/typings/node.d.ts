// augment nodejs global with ES2015+ things
declare namespace NodeJS {
  interface Global {
    Atomics: typeof Atomics;
    Proxy: typeof Proxy;
    Reflect: typeof Reflect;
  }
}
