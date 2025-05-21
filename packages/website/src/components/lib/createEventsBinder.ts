// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createEventsBinder<T extends (...args: any[]) => void>(): {
  register: (cb: T) => () => void;
  trigger: (...args: Parameters<T>) => void;
} {
  const events = new Set<T>();

  return {
    register(cb: T): () => void {
      events.add(cb);
      return (): void => {
        events.delete(cb);
      };
    },
    trigger(...args: Parameters<T>): void {
      events.forEach(cb => cb(...args));
    },
  };
}
