// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

interface UIElement {
  addClickListener(onclick: (this: void, e: Event) => void): void;
}
