import { Datetime } from "../utils/Datetime.model.js";

export class Ticket {
    Number: string;
    Short_desc: string;
    Opened: Datetime;
    Prioriy: string;
    State: string;
    Catagory: string;
    Subcategory: string;
    Assignment_group: string;
    Assign_to: string;
    Effort: number;
}
