
import { CLI_Args } from "../../index.js";
export function GetArgs(agrs_string: string[]): CLI_Args {
    let args: string[] = agrs_string.slice();
    args.splice(0, 2);

    console.log(args);
    let mode = args.find(a => a.includes("mode"));
    mode = mode == undefined ? undefined : mode.replace("mode=", "") || undefined as CLI_Args["mode"];

    let run_type = args.find(a => a.includes("run_type"));
    run_type = run_type == undefined ? undefined : run_type.replace("run_type=", "") || undefined;
    // console.log(args.indexOf("mode"));
    // console.log(run_type);
    let cliArgs = {
        mode,
        run_type
    } as CLI_Args;

    return cliArgs;
}