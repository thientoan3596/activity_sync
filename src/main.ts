import { Configuration, State } from "./config/config.js"
import { Datetime_Test, Datetime } from "./models/utils/Datetime.model.js";
import fs from 'fs';
import path from 'path';
import csv from "csv-parser";
import { CLI_Args, TicketCSV, TicketsMixedObj, TicketsObj, Application } from "./index.js";
import { ParseCSVToTicket, ParseCSVToTicket_V2, ParseCSVToTicket_V3, ParseXLXSToTicket } from "./models/Ticket.model.js";
import * as events from "events";
import { GetArgs } from "./models/utils/CLI_Args.js";
import * as XLSX from 'xlsx';
import { config } from "process";

let ARR = [];
let CONFIG: Configuration;
let STATE: State;
let INC: TicketsObj;
let WORKBOOK: XLSX.WorkBook;
let INCTemp: any[];
let App: Application;
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
        src.aux = {}
        src.aux.inc = path.join(App.CONF.test_dir, App.CONF.test_auxFile_inc);
        src.pri = path.join(App.CONF.test_dir, App.CONF.test_priFile);

    } else if (App.ENV.toString().toLocaleLowerCase() == "prod") {
        throw new Error("PROD ENV is not ready!");
    } else {
        throw new Error(`Invalid env ->${App.ENV}`);
    }

    /**
     * Load CSV
     */
    ParseCSVToTicket_V3(src.aux.inc, App.TicketData.inc);

    App.XLSX.input = XLSX.read(fs.readFileSync(src.pri));
    /**
     * XLXS Input checking
     */
    let sheetNames = App.XLSX.input.SheetNames;
    if (sheetNames.length < 3) {
        throw new Error(`Incorrect workbook(file): received only ${sheetNames.length} sheet(s)| ${sheetNames}`)
    }
    let incSheet = {
        name: "",
        exist: false
    },
        sctaskSheet = {
            name: "",
            exist: false,
        };
    sheetNames.forEach((name) => {
        if (name.match(/inc/i)) {
            incSheet.name = name;
            incSheet.exist = true;
        }
        if (name.match(/service request/i)) {
            sctaskSheet.name = name;
            sctaskSheet.exist = true;
        }
    });
    if (!sctaskSheet.exist || !incSheet.exist) {
        throw new Error(`Workbook does not contain required sheet(s)\nWorkbook contains:${sheetNames}\nRequires: <Incident> & <Service Request>`);
    }
    /**
     * Duplicate XLSX file
     */
    fs.copyFile(src.pi, path.join(App.CONF.test_dir, App.CONF.output), (err) => {
        if (err)
            throw err;

    });

    fs
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
function onSucessLoadTickets(data: TicketsObj | TicketsMixedObj) {

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
function init(args: CLI_Args) {
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
            output: undefined,
        },
    }

    App.TicketData.input.event.once("loaded", onSucessLoadTickets);
    App.TicketData.inc.event.once("loaded", onSucessLoadTickets);
}