// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class Service {
  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.title = config.title;
  }
}
