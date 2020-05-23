const ID_CACHE = new Map<number, number>();
let NEXT_KEY = 0;

function createIdGenerator(): () => number {
  const key = (NEXT_KEY += 1);
  ID_CACHE.set(key, 0);

  return (): number => {
    const current = ID_CACHE.get(key) ?? 0;
    const next = current + 1;
    ID_CACHE.set(key, next);
    return next;
  };
}

function resetIds(): void {
  ID_CACHE.clear();
}

export { createIdGenerator, resetIds };
