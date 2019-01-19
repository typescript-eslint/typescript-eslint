class SomeComponent {
    @Input() data;
    @Output()
    click = new EventEmitter();
}