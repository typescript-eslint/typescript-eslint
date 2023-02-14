// TODO: This fixture might be too large, and if so should be split up.

class SomeComponent {
  @Input() data;
  @Output()
  click = new EventEmitter();
}
