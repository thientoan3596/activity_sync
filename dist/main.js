import { Configuration } from "./config/config.js";
import { Datetime_Test } from "./models/utils/Datetime.model.js";
main();
function main() {
    let config = Configuration.getInstance();
    Datetime_Test();
}
