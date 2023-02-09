// TODO: This fixture might be too large, and if so should be split up.

type LinkedList<T> = T & { next: LinkedList<T> };
