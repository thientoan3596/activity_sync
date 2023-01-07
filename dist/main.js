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
let src;
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
    if (App.ENV.toString().toLowerCase() === "dev") {
        src = {};
        src.aux = {};
        src.aux.inc = path.join(App.CONF.test_dir, App.CONF.test_auxFile_inc);
        src.pri = path.join(App.CONF.test_dir, App.CONF.test_priFile);
        src.output = path.join(App.CONF.test_dir, App.CONF.output);
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
    /**
     * XLXS Input checking
     */
    //#region
    let sheetNames = App.XLSX.input.SheetNames;
    if (sheetNames.length < 3) {
        throw new Error(`Incorrect workbook(file): received only ${sheetNames.length} sheet(s)| ${sheetNames}`);
    }
    let incSheet = {
        name: "",
        exist: false
    }, sctaskSheet = {
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
    //#endregion
    /**
     * Duplicate XLSX file
     */
    // let output = path.join(App.CONF.test_dir)
    ParseXLXSToTicket(App.XLSX.input, App.TicketData.input);
    // let wbout = XLSX.write(App.XLSX.output,{bookType:'xlsx',type:"binary"});
    // let temp;
    // ({ sctask: temp, incident: INCTemp } = ParseXLXSToTicket(App.XLSX.input, App.TicketData.input));
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
        _insertTicketsToXLSX();
    }
}
function _insertTicketsToXLSX() {
    let _data = [];
    let invalidTickets = [];
    // console.log(App.TicketData.input.value.inc);
    App.TicketData.input.value.inc.forEach((i) => {
        let number = i["TKE Number"];
        if (number in App.TicketData.inc.value.data) {
            if (i["Assigned to"] == App.TicketData.inc.value.data[number].assigned_to) {
                _data.push({
                    "TKE Number": number,
                    "Short description": App.TicketData.inc.value.data[number].short_description,
                    Opened: App.TicketData.inc.value.data[number].opened_at,
                    Prioriy: App.TicketData.inc.value.data[number].priority,
                    State: App.TicketData.inc.value.data[number].state,
                    "On hold reason": App.TicketData.inc.value.data[number].hold_reason || "",
                    Category: App.TicketData.inc.value.data[number].u_category,
                    Subcategory: App.TicketData.inc.value.data[number].u_subcategory,
                    Caller: App.TicketData.inc.value.data[number].caller_id,
                    "Assignment group": App.TicketData.inc.value.data[number].assignment_group,
                    "Assigned to": App.TicketData.inc.value.data[number].assigned_to,
                    "Efforts (Hours)": i["Efforts (Hours)"]
                });
            }
            else {
                _data.push({
                    "TKE Number": number,
                    "Short description": "",
                    Opened: "",
                    Prioriy: "",
                    State: "",
                    "On hold reason": "",
                    Category: "",
                    Subcategory: "",
                    Caller: "",
                    "Assignment group": "",
                    "Assigned to": i["Assigned to"],
                    "Effort (Hours)": i["Effort (Hours)"],
                });
                invalidTickets.push({ number: number, reason: `Assigned to not match: ${i["Assigned to"]} vs ${App.TicketData.inc.value.data[number].assigned_to}` });
            }
            // console.log(_data);
        }
        else {
            _data.push({
                "TKE Number": number,
                "Short description": "",
                Opened: "",
                Prioriy: "",
                State: "",
                "On hold reason": "",
                Category: "",
                Subcategory: "",
                Caller: "",
                "Assignment group": "",
                "Assigned to": i["Assigned to"],
                "Effort (Hours)": i["Effort (Hours)"],
            });
            invalidTickets.push({ number: number, reason: "Cannot find any related record from downloaded file." });
        }
    });
    if (invalidTickets.length > 0) {
        console.log(invalidTickets);
    }
    else {
        App._data = _data;
        App.TicketData.output.inc.value.data = _data;
        App.TicketData.output.inc.count = _data.length;
    }
    App.TicketData.output.inc.event.emit("ready");
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
            },
            output: {
                inc: {
                    name: "fin",
                    event: new events.EventEmitter(),
                    type: "INCIDENT",
                    value: { data: [] }
                }
            }
        },
        XLSX: {
            input: undefined,
            output: undefined,
        },
    };
    App.TicketData.input.event.once("loaded", onSucessLoadTickets);
    App.TicketData.inc.event.once("loaded", onSucessLoadTickets);
    App.TicketData.output.inc.event.on("ready", _writeFile);
    App.XLSX.output = XLSX.utils.book_new();
    App.XLSX.output.Props = {
        Title: "Cooked",
        Author: "NODEJS BOT"
    };
}
function _writeFile() {
    // App.XLSX.output.Sheets["Incidents"] = XLSX.utils.json_to_sheet(App._data, { skipHeader: false, header: ["TKE Number", "Short Description", "Opened", "Priority", "State", "On hold reason", "Category", "Subcategory", "Assignment group", "Assigned to", "Efforts (Hours)"] });
    // console.log(App.TicketData.output.inc.value.data);
    const ws = XLSX.utils.json_to_sheet(App.TicketData.output.inc.value.data, { skipHeader: false });
    XLSX.utils.book_append_sheet(App.XLSX.output, ws, "Incidents 2");
    const wb = App.XLSX.output;
    wb.SheetNames.push("Incident");
    wb.Sheets["Incident"] = ws;
    // App.XLSX.output.a
    // XLSX.utils.sheet_add_json(App.XLSX.output.Sheets["Incidents"], App.TicketData.output.inc.value.data, { skipHeader: true, origin: "B2" });
    XLSX.writeFile(App.XLSX.output, src.output);
}
