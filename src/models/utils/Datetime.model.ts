let regex = /^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]) ([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/
export class Datetime {
    value: string;
    isValid: boolean;
    constructor(datetime: string) {
        this.value = "";
        this.isValid = false
        if (regex.test(datetime)) {
            this.isValid = true;
            this.value = datetime;
        }
    }
}
export function Datetime_Test() {
    let testObj = [{
        str: "2022-10-27 12:35:58",
        expected: true
    },
    {
        str: "2022-16-27 12:35:58",
        expected: false
    },
    {
        str: "2022-12-27 12:65:58",
        expected: false
    }]
    testObj.forEach((test, i) => {
        let d = new Datetime(test.str);
        console.log(`Round ${i + 1}: ${test.expected == d.isValid ? "Passed" : "Failed"}`);
    })
}