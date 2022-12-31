import fs from "fs";
import csv from "csv-parser";
import * as events from "events";
/**
 * @deprecated
 * @param {string} filePath
 * @param {events.EventEmitter} eventHandler
 */
export function ParseCSVToTicket(filePath, eventHandler) {
    let inc = {};
    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
        inc[data.number] = data;
    })
        .on("end", () => {
        eventHandler.emit("ticket_parsed", inc);
    })
        .on("error", (err) => {
        console.log(err);
    });
}
/**
 * @deprecated
 */
export function ParseCSVToTicket_V2(filePath, eventHandler) {
    let reader = fs.createReadStream(filePath, { encoding: "utf8" });
    let parser = reader.pipe(csv());
    parser.on('data', (data) => {
        console.log(data.number);
    });
    parser.on("end", () => {
        console.log("ended");
    });
}
/**
 *
 * @param filePath
 * @param ticketHolder
 */
export function ParseCSVToTicket_V3(filePath, ticketHolder) {
    let reader = fs.createReadStream(filePath, { encoding: "utf8" });
    let parser = reader.pipe(csv());
    if (ticketHolder.count == undefined || ticketHolder.count < 1) {
        ticketHolder.count = 0;
        parser.on('data', (data) => {
            ticketHolder.value.data[data.number] = data;
            ticketHolder.count++;
        });
        parser.on("end", () => {
            console.log(ticketHolder.count);
            ticketHolder.event.emit("loaded", ticketHolder);
        });
    }
    else
        throw new Error("Re-use <TicketsObj> variable");
}
export function TicketsMerger(aux, pri) {
    let type = getTicketsType(aux);
    let fin = {
        type: pri.type,
        name: "fin",
        event: new events.EventEmitter(),
        value: {
            data: {}
        }
    };
    return fin;
}
function getTicketsType(tickets) {
    let incTicketCount = 0, sctaskCount = 0;
    let type = "UNDEFINED";
    Object.keys(tickets).every((t) => {
        let prefix = t.substring(0, 3);
        switch (prefix) {
            case "INC":
                incTicketCount++;
                break;
            case "SCT":
                sctaskCount++;
                break;
            default:
                throw new Error(`Undefined prefix <${prefix}> [ticketNr: ${t}]
                \nOccuring while processing: [Name: ${tickets.name} |] `);
        }
        if (incTicketCount > 0 && sctaskCount > 0) {
            type = "MIX";
            return false;
        }
        return true;
    });
    if (type.toString() != "MIX") {
        if (incTicketCount > 0)
            type = "INCIDENT";
        if (sctaskCount > 0)
            type = "SCTASK";
    }
    return type;
}
function mergeTicketSync(ori, sec) {
    Object.keys(ori.value.data).forEach((t) => {
        // ori.value.data[t] = 
    });
    return null;
}
