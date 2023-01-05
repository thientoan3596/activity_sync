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
    init(cli_args);
    /**
     * @type {{aux:{inc:fs.PathLike,sctask:fs.PathLike},pri:fs.PathLike}}
     */
    let src;
    if (App.ENV.toString().toLowerCase() === "dev") {
        src = {};
        src.aux = {};
        src.aux.inc = path.join(App.CONF.test_dir, App.CONF.test_auxFile_inc);
        src.pri = path.join(App.CONF.test_dir, App.CONF.test_priFile);
    }
    else if (App.ENV.toString().toLocaleLowerCase() == "prod") {
        throw new Error("PROD ENV is not ready!");
    }
    else {
        throw new Error(`Invalid env ->${App.ENV}`);
    }
    /**
     * Load CSV
     */
    ParseCSVToTicket_V3(src.aux.inc, App.TicketData.inc);
    App.XLSX.input = XLSX.read(fs.readFileSync(src.pri));
    let temp;
    ({ sctask: temp, incident: INCTemp } = ParseXLXSToTicket(App.XLSX.input, App.TicketData.input));
}
/**
 * Function for TicketsObj>event
 *
 * Set the file state to be loaded
 *
 * Once all required file are loaded, fire the @function {run}
 *
 * @param data
 */
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
function init(args) {
    App = {
        STATE: State.getInstance(),
        CONF: Configuration.getInstance(),
        MODE: args.mode || "normal",
        ENV: args.env || "dev",
        TicketData: {
            inc: {
                name: "aux",
                type: "INCIDENT",
                value: { data: {} },
                event: new events.EventEmitter(),
            },
            input: {
                name: "pri",
                type: "MIX",
                event: new events.EventEmitter(),
            }
        },
        XLSX: {
            input: undefined,
        },
    };
    App.TicketData.input.event.once("loaded", onSucessLoadTickets);
    App.TicketData.inc.event.once("loaded", onSucessLoadTickets);
}
