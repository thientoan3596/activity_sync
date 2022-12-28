export class Configuration {
    name = "";
    static INSTANCE;
    constructor() {
        this.name = "hallo";
    }
    static getInstance() {
        if (!Configuration.INSTANCE) {
            Configuration.INSTANCE = new Configuration();
        }
        return Configuration.INSTANCE;
    }
}
