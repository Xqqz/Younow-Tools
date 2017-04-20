#!/usr/bin/env node
"use strict";
const _fs = require("fs");
const _path = require("path");
const _cli = require("commander");
let pkg = require("../package.json");
exports.settings = {
    version: pkg.version,
    pathDB: null,
    pathDownload: null,
    pathMove: null,
    dbBroadcasters: null,
    pathConfig: _path.join(process.env.APPDATA || process.env.HOME, "YounowTools"),
    parallelDownloads: null
};
const module_utils_1 = require("./module_utils");
const module_db_1 = require("./module_db");
const cmd_add_1 = require("./cmd_add");
const cmd_annotation_1 = require("./cmd_annotation");
const cmd_api_1 = require("./cmd_api");
const cmd_ignore_1 = require("./cmd_ignore");
const cmd_remove_1 = require("./cmd_remove");
const cmd_scan_1 = require("./cmd_scan");
const cmd_search_1 = require("./cmd_search");
const cmd_vcr_1 = require("./cmd_vcr");
const cmd_live_1 = require("./cmd_live");
const cmd_broadcast_1 = require("./cmd_broadcast");
var CommandID;
(function (CommandID) {
    CommandID[CommandID["add"] = 0] = "add";
    CommandID[CommandID["remove"] = 1] = "remove";
    CommandID[CommandID["ignore"] = 2] = "ignore";
    CommandID[CommandID["search"] = 3] = "search";
    CommandID[CommandID["resolve"] = 4] = "resolve";
    CommandID[CommandID["annotation"] = 5] = "annotation";
    CommandID[CommandID["vcr"] = 6] = "vcr";
    CommandID[CommandID["live"] = 7] = "live";
    CommandID[CommandID["broadcast"] = 8] = "broadcast";
    CommandID[CommandID["api"] = 9] = "api";
    CommandID[CommandID["fixdb"] = 10] = "fixdb";
    CommandID[CommandID["scan"] = 11] = "scan";
    CommandID[CommandID["debug"] = 12] = "debug";
})(CommandID || (CommandID = {}));
if (!_fs.existsSync(exports.settings.pathConfig)) {
    module_utils_1.log("config path", exports.settings.pathConfig);
    _fs.mkdirSync(exports.settings.pathConfig);
}
_cli
    .version(exports.settings.version)
    .option("-v, --verbose", "verbosity level (-v -vv -vvv)", ((x, v) => v + 1), 0)
    .option("--db <path>", "database filename (default ./broadcasters.json")
    .option("--dl <path>", "download path (default current)")
    .option("--mv <path>", "at the end MOVE files to this path (default do nothing)")
    .option("-t --timer <minutes>", "scan interval (default 5 minutes)")
    .option("-l --limit <number>", "number of parallel downloads for a stream (default 5)");
//.option("-f --format <format","change video format container mkv/mp4 without re-encoding (default ts)")
_cli
    .command("add <users...>")
    .description("add user(s) by username, uid, URL to db")
    .action((users, cmd) => commandId = CommandID.add);
_cli
    .command("remove <users...>")
    .description("remove users(s) by username, uid, URL from db")
    .action((users, cmd) => commandId = CommandID.remove);
_cli
    .command("ignore <users...>")
    .description("ignore/unignore users(s) by username, uid, URL from db")
    .action((users, cmd) => commandId = CommandID.ignore);
_cli
    .command(`note <user> [text]`)
    .description(`add a "note" (quoted) to a user in db`)
    .action((users, cmd) => commandId = CommandID.annotation);
_cli
    .command("search <patterns...>")
    .description("search in db for matching pattern(s)")
    .action((users, cmd) => commandId = CommandID.search);
_cli
    .command("resolve <users...>")
    .description("resolve user(s) online")
    .action((users, cmd) => commandId = CommandID.resolve);
_cli
    .command("vcr <users...>")
    .description("download archived broadcast if available")
    .action((users, cmd) => commandId = CommandID.vcr);
_cli
    .command("live <users...>")
    .description("download live broadcast from the beginning")
    .action((users, cmd) => commandId = CommandID.live);
_cli
    .command("broadcast <broadcastId...>")
    .description("download broadcastId ")
    .action((users, cmd) => commandId = CommandID.broadcast);
_cli
    .command("scan <config_file>")
    .description("scan live broadcasts")
    .action((users, cmd) => commandId = CommandID.scan);
_cli
    .command("api")
    .description("api compatibility test (advanced)")
    .action((users, cmd) => commandId = CommandID.api);
_cli
    .command("fixdb")
    .description("normalize db informations (advanced)")
    .action((users, cmd) => commandId = CommandID.fixdb);
_cli
    .command("debug")
    .description("debug tool ignore this")
    .action(() => commandId = CommandID.debug);
// list
// info user(s)
let commandId = -1;
_cli.parse(process.argv);
let params = _cli.args[0]; // string|string[]
module_utils_1.setVerbose(_cli["verbose"] || 0);
exports.settings.pathDB = _cli["db"] || _path.join(exports.settings.pathConfig, "broadcasters.txt");
exports.settings.pathDownload = _cli["dl"] || ".";
exports.settings.pathMove = _cli["mv"] || null;
exports.settings.parallelDownloads = _cli["limit"] || 5;
module_utils_1.info(module_utils_1.prettify(exports.settings));
if (exports.settings.pathMove) {
    _fs.existsSync(exports.settings.pathMove);
}
_fs.existsSync(exports.settings.pathDownload);
/*

    main

*/
switch (commandId) {
    case CommandID.scan:
        cmd_scan_1.cmdScan(params, _cli["timer"] * 60 || 5 * 60 * 60);
        break;
    case CommandID.search:
        cmd_search_1.cmdSearch(params);
        break;
    case CommandID.resolve:
        cmd_search_1.cmdResolve(params);
        break;
    case CommandID.annotation:
        cmd_annotation_1.cmdAnnotation(params, _cli.args[1] || "---");
        break;
    case CommandID.vcr:
        cmd_vcr_1.cmdVCR(params);
        break;
    case CommandID.live:
        cmd_live_1.cmdLive(params);
        break;
    case CommandID.broadcast:
        cmd_broadcast_1.cmdBroadcast(params);
        break;
    case CommandID.api:
        cmd_api_1.cmdAPI();
        break;
    case CommandID.fixdb:
        /**	normalize db */
        module_db_1.openDB()
            .then((db) => {
            _fs.rename(exports.settings.pathDB, exports.settings.pathDB + ".tmp", err => {
                if (err) {
                    module_utils_1.error(err);
                }
                else {
                    for (let user in db) {
                        if (!isNaN(user)) {
                            db[user] = module_db_1.convertToUserDB(user, db[user]);
                        }
                    }
                }
            });
        })
            .catch(module_utils_1.error);
        break;
    case CommandID.remove:
        cmd_remove_1.cmdRemove(params);
        break;
    case CommandID.add:
        cmd_add_1.cmdAdd(params);
        break;
    case CommandID.ignore:
        cmd_ignore_1.cmdIgnore(params);
        break;
    case CommandID.debug:
        require("./cmd_debug").cmdDebug(params);
        break;
    default:
        module_utils_1.log(`
Younow-tools version ${exports.settings.version}

As an open source project use it at your own risk. Younow can break it down at any time.

Report any bug or missing feature at your will.

If you like this software, please consider a Ƀitcoin donation to 34fygtqeAP62xixpTj6w9XTtfKmqjFqpo6`);
        _cli.help();
}
