export function GetArgs(agrs_string) {
    let args = agrs_string.slice();
    args.splice(0, 2);
    console.log(args);
    let mode = args.find(a => a.includes("mode"));
    mode = mode == undefined ? undefined : mode.replace("mode=", "") || undefined;
    let run_type = args.find(a => a.includes("run_type"));
    run_type = run_type == undefined ? undefined : run_type.replace("run_type=", "") || undefined;
    // console.log(args.indexOf("mode"));
    // console.log(run_type);
    let cliArgs = {
        mode,
        run_type
    };
    return cliArgs;
}
