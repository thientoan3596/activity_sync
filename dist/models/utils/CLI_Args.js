export function GetArgs(agrs_string) {
    let args = agrs_string.slice();
    args.splice(0, 2);
    console.log(args);
    let mode = args.find(a => a.includes("mode"));
    mode = mode == undefined ? undefined : mode.replace("mode=", "") || undefined;
    let env = args.find(a => a.includes("env"));
    env = env == undefined ? undefined : env.replace("run_type=", "") || undefined;
    // console.log(args.indexOf("mode"));
    // console.log(run_type);
    let cliArgs = {
        mode,
        env
    };
    return cliArgs;
}
