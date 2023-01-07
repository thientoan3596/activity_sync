import fs from "fs";
import csv from "csv-parser";
import * as events from "events";
import * as XLSX from 'xlsx';
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
 * Parsing csv from filePath to ticketHodler - async func
 * When data is parsed, emit "loaded" on ticketHolder.event
 * @param filePath
 * @param ticketHolder
 */
export function ParseCSVToTicket_V3(filePath, ticketHolder) {
    let reader = fs.createReadStream(filePath, { encoding: "utf8" });
    let parser = reader.pipe(csv());
    if (ticketHolder.count == undefined || ticketHolder.count < 1) {
        ticketHolder.count = 0;
        if (ticketHolder.value == undefined) {
            ticketHolder.value = { data: {} };
        }
        parser.on('data', (data) => {
            ticketHolder.value.data[data.number] = data;
            ticketHolder.count++;
        });
        parser.on("end", () => {
            ticketHolder.event.emit("loaded", ticketHolder);
        });
    }
    else
        throw new Error("Re-use <TicketsObj> variable");
}
/**
 *
 * @param ori the original (primary) version (Contains number and effor and assign to)
 * @param sec the exported version directly from SNOW instance
 * @returns
 */
export function TicketsMerger(ori, sec) {
    let fin = {
        type: ori.type,
        name: "fin",
        value: { data: {} },
        event: new events.EventEmitter(),
    };
    let invalidTickets;
    Object.keys(ori.value.data).forEach((t) => {
        if (sec.value.data.hasOwnProperty(t)) {
            fin.value.data[t] = sec.value.data[t];
            fin.value.data[t].effort = ori.value.data[t].effort;
        }
        else {
            fin.value.data[t] = ori.value.data[t];
            invalidTickets.push(t.toString());
        }
    });
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
/**
 * Synchronous function
 * @param filePath
 * @param ticketHolder
 * @return {SCTask_and_INC}
 */
export function ParseXLXSToTicket(workbook, ticketHolder) {
    let sheetNames = workbook.SheetNames;
    let incSheet = "", sctaskSheet = "";
    sheetNames.forEach((name) => {
        if (name.match(/inc/i)) {
            incSheet = name;
        }
        if (name.match(/service request/i)) {
            sctaskSheet = name;
        }
    });
    let scTask = XLSX.utils.sheet_to_json(workbook.Sheets[sctaskSheet], { defval: "" });
    let incTicket = XLSX.utils.sheet_to_json(workbook.Sheets[incSheet], { defval: "" });
    ticketHolder.value = {
        inc: [],
        sctask: [],
    };
    ticketHolder.value.inc = incTicket;
    ticketHolder.value.sctask = scTask;
    ticketHolder.count = incTicket.length + scTask.length;
    // console.log(`XLSX: Loaded ${incTicket.length} row(s)`);
    ticketHolder.event.emit("loaded", ticketHolder);
    return { sctask: scTask, incident: incTicket };
}
