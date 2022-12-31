import { EventEmitter } from "stream";

export declare type TicketCSV = {
    number: string;
    short_description: string;
    opened_at: string;
    priority: string;
    state: string;
    hold_reason?: string;
    u_category: string;
    u_subcategory: string;
    assignment_group: string;
    assign_to: string;
    effort: number;
    caller: string;
    opened_by: string;
    ritm: string;
}
export type TicketsObj = {
    name?: "aux" | "pri" | "fin";
    type: TicketType;
    value: { data: {} };
    event: EventEmitter;
    count?: number;
}
export type FileState = "Unloaded" | "Loaded";

export type TicketType = "SCTASK" | "INCIDENT" | "MIX" | "UNDEFINED"