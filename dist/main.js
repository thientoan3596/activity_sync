import { Configuration, State } from "./config/config.js";
import fs from 'fs';
import path from 'path';
import { ParseCSVToTicket_V3, ParseXLXSToTicket } from "./models/Ticket.model.js";
import * as events from "events";
import { GetArgs } from "./models/utils/CLI_Args.js";
import * as XLSX from 'xlsx';
let ARR = [];
let CONFIG;
let STATE;
let INC;
let WORKBOOK;
let INCTemp;
let App;
main();
function main() {
    /**
     * CLI Args
     */
    let cli_args = GetArgs(process.argv);
    /**
     * Instanciate Singletons
     */
    init();
    console.log(App.STATE);
    STATE = State.getInstance();
    let config = Configuration.getInstance();
    CONFIG = Configuration.getInstance();
    let inc;
    INC = inc;
    let inc_aux_path;
    // let workbook: XLSX.WorkBook;
    // WORKBOOK = workbook;
    let priData = {
        name: "pri",
        type: "MIX",
        event: new events.EventEmitter(),
    };
    priData.event.on('loaded', () => console.log("loaded"));
    let priSCTask, priInc;
    if (cli_args.run_type == "dev") {
        INC = {
            name: "aux",
            type: "INCIDENT",
            value: { data: {} },
            event: new events.EventEmitter(),
        };
        inc_aux_path = path.join(config.test_dir, config.test_auxFile_inc);
        ParseCSVToTicket_V3(inc_aux_path, INC);
        priData.event.on("loaded", onSucessLoadTickets);
        INC.event.on("loaded", onSucessLoadTickets);
        /**
         * Load fileto Workbook;
         */
        WORKBOOK = XLSX.read(fs.readFileSync(path.join(config.test_dir, config.test_priFile)));
        ({ sctask: priSCTask, incident: INCTemp } = ParseXLXSToTicket(WORKBOOK, priData));
    }
    // Create Incidents  Processer
    /**
     * ticket event register
     */
}
function onSucessLoadTickets(data) {
    let STATE = State.getInstance();
    STATE.filesState.input[data.name] = "Loaded";
    let isReady = true;
    Object.keys(STATE.filesState.input).every((file) => {
        if (STATE.filesState.input[file] == "Unloaded") {
            isReady = false;
            return isReady;
        }
        return isReady;
    });
    if (isReady) {
    }
}
/**
 * Initialize App
 */
function init() {
    App = {};
    App.STATE = State.getInstance();
    App.CONF = Configuration.getInstance();
}
