"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const fs = require("fs");
const _path = require("path");
const vm = require("vm");
const module_utils_1 = require("./module_utils");
const _younow = require("./module_younow");
const module_db_1 = require("./module_db");
let liveusers = {};
let script = null;
function cmdScan(script_file, scan_interval) {
    module_utils_1.info("scan interval", scan_interval);
    new module_db_1.FakeDB()
        .open(_path.join(main_1.settings.pathConfig, "streams.txt"), "streams")
        .then(streams => {
        return module_db_1.openDB()
            .then((db) => {
            script = parseScript(script_file);
            setInterval(() => {
                update_scan(db, streams);
            }, scan_interval * 1000);
            update_scan(db, streams);
            fs.watchFile(main_1.settings.pathDB, (curr, prev) => {
                module_utils_1.error(`DATABASE UPDATED`);
                db.self.update();
            });
        });
    })
        .catch(module_utils_1.error);
}
exports.cmdScan = cmdScan;
function update_scan(db, streams) {
    _younow.getTrendings()
        .then(function (trendings) {
        let tags = trendings.trending_tags.filter(function (tag) {
            return runScript(tag, null, null) || false;
        }).map(tag => tag.tag);
        var new_users = 0;
        var new_resolve = 0;
        tags.forEach(function (tag) {
            _younow.getTagInfo(tag)
                .then(function (infos) {
                if (infos.errorCode) {
                    throw new Error(`${tag} ${infos.errorCode} ${infos.errorMsg}`);
                }
                else if (!infos.items) {
                    throw new Error(`WTF`);
                }
                module_utils_1.info(`Tag:${tag} Users:${infos.items.length}`);
                infos.items.forEach(function (user) {
                    function showInfos(result, user, liveuser) {
                        module_utils_1.info(`1ST Result ${result} ${liveuser.check}:${liveuser.infos ? "*" : ""} ${user.profile} BC:${liveuser.infos && liveuser.infos.broadcastsCount} LVL:${user.userlevel} VW:${user.viewers}/${user.views} Language:${user.l}`);
                    }
                    var liveuser = liveusers[user.userId];
                    if (!liveuser) {
                        new_users++;
                        liveuser = liveusers[user.userId] =
                            {
                                userId: user.userId,
                                broadcastId: null,
                                isIgnored: false,
                                isFollowed: false,
                                infos: null,
                                check: 0
                            };
                    }
                    if (user.userId in streams) {
                        if (streams[user.userId].indexOf(user.broadcastId) < 0) {
                            let items = streams[user.userId];
                            items.push(user.broadcastId);
                            streams[user.userId] = items;
                        }
                    }
                    else {
                        streams[user.userId] = [user.broadcastId];
                    }
                    let dbuser = db[user.userId];
                    if (dbuser) {
                        if (dbuser.ignore) {
                            if (liveuser.isIgnored == false) {
                                module_utils_1.log(`${user.profile} is ignored`);
                                liveuser.isIgnored = true;
                            }
                            liveuser.isFollowed = false;
                            return;
                        }
                        else if (liveuser.isFollowed == false) {
                            module_utils_1.log(`${user.profile} is live note:${dbuser.comment}`);
                            liveuser.isFollowed = true;
                            liveuser.isIgnored = false;
                        }
                    }
                    if (liveuser.isFollowed) {
                        if (liveuser.broadcastId == user.broadcastId) {
                            return;
                        }
                        module_utils_1.log(`NEW ${user.profile} ${user.broadcastId}`);
                    }
                    else if (liveuser.isIgnored) {
                        return;
                    }
                    else {
                        liveuser.check++;
                        let result = runScript(null, user, liveuser.infos);
                        showInfos(result, user, liveuser);
                        if (result == "follow") {
                            liveuser.isFollowed = true;
                        }
                        else if (result == "ignore") {
                            liveuser.isIgnored = true;
                            return;
                        }
                        else if (result != "resolve") {
                            return;
                        }
                    }
                    Promise.resolve(liveuser.infos)
                        .then(function (infos) {
                        if (infos) {
                            if (infos.broadcastId != user.broadcastId) {
                                new_resolve++;
                                module_utils_1.info(`update infos for ${user.profile}`);
                                return _younow.getLiveBroadcastByUID(user.userId);
                            }
                            else {
                                return infos;
                            }
                        }
                        else {
                            new_resolve++;
                            return _younow.getLiveBroadcastByUID(user.userId);
                        }
                    })
                        .then(function (infos) {
                        if (infos.errorCode == 206) {
                            module_utils_1.info(`${user.profile} ${infos.errorCode} ${infos.errorMsg}`);
                            return;
                        }
                        else if (infos.errorCode) {
                            throw new Error(`${infos.errorCode} ${infos.errorMsg}`);
                        }
                        liveuser.infos = infos;
                        if (liveuser.isFollowed == false) {
                            liveuser.check++;
                            let result = runScript(null, user, infos) || null;
                            showInfos(result, user, liveuser);
                            if (result == "follow") {
                                liveuser.isFollowed = true;
                            }
                            else if (result == "ignore") {
                                liveuser.isIgnored = true;
                                return;
                            }
                            else {
                                return;
                            }
                        }
                        if (liveuser.isFollowed) {
                            if (infos.lastSegmentId == undefined) {
                                module_utils_1.error(`${infos.profile} not ready yet`);
                                liveuser.infos = null;
                                return;
                            }
                            module_utils_1.log(`MATCH ${user.profile} Viewers:${infos.viewers}/${user.viewers} ${infos.country} state:${infos.stateCopy + " " + infos.state} BC:${infos.broadcastsCount} Partner:${infos.partner} Platform:${infos.platform}`);
                            liveuser.infos = infos;
                            liveuser.broadcastId = user.broadcastId;
                            _younow.downloadThemAll(infos)
                                .then(([thumb, video, json]) => {
                                module_utils_1.log(`${user.profile} is over json : ${thumb} image : ${video} video :${json}`);
                            }, err => {
                                module_utils_1.error(err);
                            });
                        }
                    })
                        .catch(module_utils_1.error);
                });
            })
                .catch(module_utils_1.error)
                .then(function () {
                if (new_resolve)
                    module_utils_1.info(`result new users:${new_users} resolve:${new_resolve}`);
            });
        });
    })
        .catch((err) => {
        module_utils_1.error(err);
    });
}
function parseScript(filename) {
    var code = fs.readFileSync(filename).toString();
    return new vm.Script(code);
}
function runScript(tag, user, broadcast) {
    try {
        var context = new vm.createContext({
            "tag": tag,
            "user": user,
            "broadcast": broadcast,
            "log": module_utils_1.log
        });
        return script.runInContext(context);
    }
    catch (e) {
        module_utils_1.error(e);
        return null;
    }
}
//# sourceMappingURL=cmd_scan.js.map