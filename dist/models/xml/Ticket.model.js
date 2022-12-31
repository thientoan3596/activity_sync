export class Ticket {
    Number;
    Short_desc;
    Opened;
    Prioriy;
    State;
    Catagory;
    Subcategory;
    Assignment_group;
    Assign_to;
    Effort;
    isValid;
    constructor() {
        // this.Number = xmlParsedObj.number;
        // this.Short_desc = xmlParsedObj.short_description;
    }
    /**
     *
     * @param acceptedValues array of valid values for priority
     * @returns boolean
     */
    validate_priority(acceptedValues) {
        let converted_priority = parseInt(this.Prioriy);
        if (acceptedValues.indexOf(converted_priority) >= 0) {
            return true;
        }
        return false;
    }
    validate_state(acceptedValues) {
        let converted_state = parseInt(this.State);
        if (acceptedValues.indexOf(converted_state) >= 0) {
            return true;
        }
        return false;
    }
    validate_ticket(priorityAcceptedValues, stateAcceptedValues) {
        this.isValid = false;
        if (this.validate_priority(priorityAcceptedValues)) {
            if (this.validate_state(stateAcceptedValues))
                this.isValid = true;
        }
        return this.isValid;
    }
}
