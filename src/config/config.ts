
export class Configuration {
    primaryFile = "activity_sheet.xlsx";
    auxFile = "downloaded.xlsx"
    exportFile = "final.xlsx"
    private static INSTANCE: Configuration;
    private constructor() {
    }
    static getInstance(): Configuration {
        if (!Configuration.INSTANCE) {
            Configuration.INSTANCE = new Configuration();
        }
        return Configuration.INSTANCE;
    }
}