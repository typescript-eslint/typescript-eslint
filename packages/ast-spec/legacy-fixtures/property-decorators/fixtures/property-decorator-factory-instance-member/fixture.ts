// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class SomeComponent {
  @Input() data;
  @Output()
  click = new EventEmitter();
}
