// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createEventHelper<T extends (...args: any[]) => void>(): {
  trigger: (...args: Parameters<T>) => void;
  register: (cb: T) => () => void;
} {
  const events = new Set<T>();

  return {
    trigger(...args: Parameters<T>): void {
      events.forEach(cb => cb(...args));
    },
    register(cb: T): () => void {
      events.add(cb);
      return (): void => {
        events.delete(cb);
      };
    },
  };
}
