import { Ticket } from "./Ticket.model.js";
export class Incident extends Ticket {
    Caller;
    Onhold_reason;
}
export function MakeIncident(incident) {
    let inc = new Incident();
    // inc.Number=obj.number;
    inc;
    return inc;
}
