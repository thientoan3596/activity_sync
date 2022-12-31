import { Configuration, State } from "./config/config.js"
import { Datetime_Test, Datetime } from "./models/utils/Datetime.model.js";
import fs from 'fs';
import path from 'path';
import csv from "csv-parser";
import { TicketCSV, TicketsObj } from "./index.js";
import { ParseCSVToTicket, ParseCSVToTicket_V2, ParseCSVToTicket_V3 } from "./models/Ticket.model.js";
import * as events from "events"

main()
function main() {
    let args = process.argv.slice();
    args.splice(0, 2);
    console.log(args);
    let config = Configuration.getInstance();
    // let inc = {};
    let e = new events.EventEmitter();
    // ParseCSVToTicket(path.join(config.sampleDir, config.csvSample), e);
    // e.on("ticket_parsed", (inc) => { console.log(inc); });
    // ParseCSVToTicket_V2(path.join(config.sampleDir, config.csvSample), e);
    /**
     * Instanciate FileState 
     */

    let STATE = State.getInstance();

    // Create Incidents  Processer
    let inc: TicketsObj = {
        name: "aux",
        type: "INCIDENT",
        value: { data: {} },
        event: new events.EventEmitter(),
        count: 0
    };

    ParseCSVToTicket_V3(path.join(config.sampleDir, config.csvSample), inc);
    inc.event.on("loaded", onSucessLoadTickets);
    // STATE.filesState.fin = "Loaded";
    // STATE.filesState.pri = "Loaded";
}

function onSucessLoadTickets(data: TicketsObj) {

    let STATE = State.getInstance();
    STATE.filesState[data.name] = "Loaded";
    let isReady = true;
    Object.keys(STATE.filesState).every((file) => {
        if (STATE.filesState[file] == "Unloaded") {
            isReady = false;
            return isReady;
        }
        return isReady;
    });

    console.log(isReady);


}