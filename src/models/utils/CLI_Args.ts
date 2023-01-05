
import { CLI_Args } from "../../index.js";
export function GetArgs(agrs_string: string[]): CLI_Args {
    let args: string[] = agrs_string.slice();
    args.splice(0, 2);

    console.log(args);
    let mode = args.find(a => a.includes("mode"));
    mode = mode == undefined ? undefined : mode.replace("mode=", "") || undefined as CLI_Args["mode"];

    let env = args.find(a => a.includes("env"));
    env = env == undefined ? undefined : env.replace("run_type=", "") || undefined;
    // console.log(args.indexOf("mode"));
    // console.log(run_type);
    let cliArgs = {
        mode,
        env
    } as CLI_Args;

    return cliArgs;
}