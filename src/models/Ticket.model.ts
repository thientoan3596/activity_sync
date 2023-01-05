import fs from "fs"
import csv from "csv-parser"
import * as events from "events"
import { SCTask_and_INC, TicketCSV, TicketsMixedObj, TicketsObj, TicketType } from "../index.js";
import * as XLSX from 'xlsx';
/**
 * @deprecated
 * @param {string} filePath 
 * @param {events.EventEmitter} eventHandler
 */
export function ParseCSVToTicket(filePath: string, eventHandler: events.EventEmitter) {
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
        })
}
/**
 * @deprecated
 */
export function ParseCSVToTicket_V2(filePath: string, eventHandler: events.EventEmitter) {
    let reader = fs.createReadStream(filePath, { encoding: "utf8" });
    let parser = reader.pipe(csv());
    parser.on('data', (data: TicketCSV) => {
        console.log(data.number);
    });
    parser.on("end", () => {
        console.log("ended");
    })
}
/**
 * Parsing csv from filePath to ticketHodler - async func
 * When data is parsed, emit "loaded" on ticketHolder.event 
 * @param filePath 
 * @param ticketHolder 
 */
export function ParseCSVToTicket_V3(filePath: string, ticketHolder: TicketsObj) {
    let reader = fs.createReadStream(filePath, { encoding: "utf8" });
    let parser = reader.pipe(csv());
    if (ticketHolder.count == undefined || ticketHolder.count < 1) {
        ticketHolder.count = 0;
        if (ticketHolder.value == undefined) {
            ticketHolder.value = { data: {} };
        }
        parser.on('data', (data: TicketCSV) => {
            ticketHolder.value.data[data.number] = data;
            ticketHolder.count++;
        });
        parser.on("end", () => {
            console.log("______");
            console.log("CSV");
            console.log(ticketHolder.value.data);

            console.log("_______");


            ticketHolder.event.emit("loaded", ticketHolder);
        });
    } else
        throw new Error("Re-use <TicketsObj> variable");

}
/**
 * 
 * @param ori the original (primary) version (Contains number and effor and assign to)
 * @param sec the exported version directly from SNOW instance
 * @returns 
 */
export function TicketsMerger(ori: TicketsObj, sec: TicketsObj): TicketsObj {
    let fin: TicketsObj = {
        type: ori.type,
        name: "fin",
        value: { data: {} },
        event: new events.EventEmitter(),
    };
    let invalidTickets: string[];
    Object.keys(ori.value.data).forEach((t) => {
        if (sec.value.data.hasOwnProperty(t)) {
            fin.value.data[t] = sec.value.data[t];
            fin.value.data[t].effort = ori.value.data[t].effort;
        } else {
            fin.value.data[t] = ori.value.data[t];
            invalidTickets.push(t.toString());
        }
    });
    return fin;
}
function getTicketsType(tickets: TicketsObj): TicketType {
    let incTicketCount = 0,
        sctaskCount = 0;
    let type: TicketType = "UNDEFINED";
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
            type = "SCTASK"
    }
    return type;
}
/**
 * Synchronous function 
 * @param filePath 
 * @param ticketHolder 
 * @return {SCTask_and_INC} 
 */
export function ParseXLXSToTicket(workbook: XLSX.WorkBook, ticketHolder: TicketsMixedObj): SCTask_and_INC {
    let sheetNames = workbook.SheetNames;
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
    let scTask = XLSX.utils.sheet_to_json(workbook.Sheets[sctaskSheet.name], { defval: "" });
    let incTicket = XLSX.utils.sheet_to_json(workbook.Sheets[incSheet.name], { defval: "" });
    ticketHolder.value = {
        inc: [],
        sctask: [],
    }
    ticketHolder.value.inc = incTicket;
    ticketHolder.value.sctask = scTask;
    ticketHolder.count = incTicket.length + scTask.length;
    ticketHolder.event.emit("loaded", ticketHolder);
    console.log("_______");
    console.log("XLSX");
    console.log(incTicket);
    console.log("_______");




    return { sctask: scTask, incident: incTicket };
}