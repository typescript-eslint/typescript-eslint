// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createEventsBinder<T extends (...args: any[]) => void>(): {
  trigger: (...args: Parameters<T>) => void;
  register: (cb: T) => { dispose(): void };
} {
  const events = new Set<T>();

  return {
    trigger(...args: Parameters<T>): void {
      events.forEach(cb => cb(...args));
    },
    register(cb: T): { dispose(): void } {
      events.add(cb);
      return {
        dispose(): void {
          events.delete(cb);
        },
      };
    },
  };
}
