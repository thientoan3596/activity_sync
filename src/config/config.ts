
import { FileState } from "../index.js";
export class Configuration {
    dir = "./dist/data";



    test_dir = "./dist/data/test";
    test_priFile = "activity_sheet_short.xlsx";
    test_auxFile_inc = "incident_test_short.csv";
    test_auxFile_sctask = "sc_task_test_short.csv"
    primaryFile = "activity_sheet.xlsx";
    auxFile = "downloaded.xlsx";
    exportFile = "final.xlsx";
    xmlSample = "incident.xml";
    sampleDir = "./dist/data/sample";
    csvSample = "incident.csv";
    readonly validate_priority = [1, 2, 3, 4, 5];
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

export class State {
    filesState: {
        input: {
            pri: FileState,
            aux: FileState,
        },
        output: {
            fin: FileState,
        }
    }
    private static INSTANCE: State;
    private constructor() {
        this.filesState = {
            input: {
                aux: "Unloaded",
                pri: "Unloaded",

            },
            output: {

                fin: "Unloaded"
            }
        }
        // this.fileState.aux = "Unloaded";
        // this.fileState.pri = "Unloaded";
        // this.fileState.fin = "Unloaded";

    }
    static getInstance(): State {
        if (!State.INSTANCE) {
            State.INSTANCE = new State();
        }
        return State.INSTANCE;
    }
}