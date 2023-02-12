// TODO: This fixture might be too large, and if so should be split up.

interface UIElement {
  addClickListener(onclick: (this: void, e: Event) => void): void;
}
