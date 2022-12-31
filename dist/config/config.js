export class Configuration {
    primaryFile = "activity_sheet.xlsx";
    auxFile = "downloaded.xlsx";
    exportFile = "final.xlsx";
    xmlSample = "incident.xml";
    sampleDir = "./dist/data/sample";
    csvSample = "incident.csv";
    validate_priority = [1, 2, 3, 4, 5];
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
export class State {
    filesState;
    static INSTANCE;
    constructor() {
        this.filesState = {
            aux: "Unloaded",
            pri: "Unloaded",
            fin: "Unloaded"
        };
        // this.fileState.aux = "Unloaded";
        // this.fileState.pri = "Unloaded";
        // this.fileState.fin = "Unloaded";
    }
    static getInstance() {
        if (!State.INSTANCE) {
            State.INSTANCE = new State();
        }
        return State.INSTANCE;
    }
}
