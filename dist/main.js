import { Configuration } from "./config/config.js";
main();
function main() {
    var heyzo = Configuration.getInstance();
    heyzo.name = "idk";
    console.log(heyzo.name);
    heyzo.name = "Changed";
    var secondary = Configuration.getInstance();
    console.log(secondary);
}
