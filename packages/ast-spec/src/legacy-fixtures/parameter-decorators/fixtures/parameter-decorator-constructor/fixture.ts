// TODO: This fixture might be too large, and if so should be split up.

class Service {
  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.title = config.title;
  }
}
