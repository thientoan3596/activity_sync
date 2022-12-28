export class Configuration {
    primaryFile = "activity_sheet.xlsx";
    auxFile = "downloaded.xlsx";
    exportFile = "final.xlsx";
    static INSTANCE;
    constructor() {
    }
    static getInstance() {
        if (!Configuration.INSTANCE) {
            Configuration.INSTANCE = new Configuration();
        }
        return Configuration.INSTANCE;
    }
}
