class Service {
    constructor(@Inject(APP_CONFIG) config: AppConfig) {
        this.title = config.title;
    }
}
