"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const request = require("request");
var fix = https;
fix.globalAgent.keepAlive = true;
fix.globalAgent.keepAliveMsecs = 10000;
fix.globalAgent.maxSockets = 100;
var get = request.defaults({
    gzip: true,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:53.0) Gecko/20100101 Firefox/53.0",
        "Accept-Language": "en-us, en; q=0.5"
    },
    encoding: null
});
var Verbosity;
(function (Verbosity) {
    Verbosity[Verbosity["log"] = 0] = "log";
    Verbosity[Verbosity["info"] = 1] = "info";
    Verbosity[Verbosity["debug"] = 2] = "debug";
    Verbosity[Verbosity["dump"] = 3] = "dump";
})(Verbosity || (Verbosity = {}));
exports.verbose = 0;
function setVerbose(level) {
    exports.verbose = level;
}
exports.setVerbose = setVerbose;
exports.log = console.log;
function info(...args) {
    if (exports.verbose >= Verbosity.info) {
        exports.log("\u001b[94m" + args.join(" ") + "\u001b[39m");
    }
}
exports.info = info;
function debug(...args) {
    if (exports.verbose >= Verbosity.debug) {
        exports.log("\u001b[92m" + args.join(" ") + "\u001b[39m");
    }
}
exports.debug = debug;
function dump(o) {
    if (exports.verbose >= Verbosity.dump) {
        exports.log(o);
    }
}
exports.dump = dump;
function error(err) {
    process.stdout.write(`\u001b[91m`);
    if (err.stack) {
        exports.log(err);
    }
    else {
        exports.log(err);
    }
    process.stdout.write(`\u001b[39m`);
    return null;
}
exports.error = error;
function prettify(obj) {
    return JSON.stringify(obj, null, "\t").replace(/,|{|}|\"/g, "");
}
exports.prettify = prettify;
function getURL(url, encoding = "json") {
    return new Promise(function (resolve, reject) {
        if (!url || url.length == 0) {
            error(`getURL ${url}`);
            reject(0);
            return;
        }
        debug(`NET:${url} as ${encoding}`);
        get(url, function (err, res, body) {
            if (err) {
                error(`NET ${err} ${url}`);
                reject(new Error(err.message));
            }
            else if (res.statusCode != 200) {
                debug(`NET:statusCode=${res.statusCode}`);
                reject(res.statusCode);
            }
            else {
                debug(`NET:statusCode:${res.statusCode} Type:${typeof body}`);
                var data;
                try {
                    switch (encoding) {
                        case "json":
                            data = JSON.parse(body.toString());
                            dump(data);
                            break;
                        case null:
                            data = body;
                            break;
                        default:
                            data = body.toString(encoding);
                            dump(data);
                    }
                    resolve(data);
                }
                catch (e) {
                    error(`NET:encoding ${e}`);
                    reject(1);
                }
            }
        });
    });
}
exports.getURL = getURL;
function formatDate(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return '' + y + '.' + (m < 10 ? '0' + m : m) + '.' + (d < 10 ? '0' + d : d);
}
exports.formatDate = formatDate;
function formatTime(date) {
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    return `${(h < 10 ? "0" + h : h)}-${(m < 10 ? "0" + m : m)}-${(s < 10 ? "0" + s : s)}`;
}
exports.formatTime = formatTime;
function formatDateTime(date) {
    return formatDate(date) + "_" + formatTime(date);
}
exports.formatDateTime = formatDateTime;
