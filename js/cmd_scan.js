"use strict";
const fs = require("fs");
const vm = require("vm");
const module_utils_1 = require("./module_utils");
const _younow = require("./module_younow");
const module_db_1 = require("./module_db");
// global
let liveusers = {};
let script = null;
function cmdScan(script_file, scan_interval) {
    module_utils_1.info("scan interval", scan_interval);
    module_db_1.openDB()
        .then(db => {
        script = parseScript(script_file);
        setInterval(() => {
            update_scan(db);
        }, scan_interval * 1000);
        update_scan(db);
    })
        .catch(module_utils_1.error);
}
exports.cmdScan = cmdScan;
function update_scan(db) {
    _younow.getTrendings()
        .then(function (trendings) {
        let tags = trendings.trending_tags.filter(function (tag) {
            // 1st pass tag filtering
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
                    if (liveuser.isFollowed) {
                        if (liveuser.broadcastId == user.broadcastId) {
                            return;
                        }
                        module_utils_1.log(`NEW ${user.profile} ${user.broadcastId}`);
                    }
                    else if (liveuser.isIgnored) {
                        return;
                    }
                    else if (user.userId in db) {
                        let dbuser = db[user.userId];
                        if (dbuser.ignore) {
                            module_utils_1.log(`${user.profile} is ignored`);
                            liveuser.isIgnored = true;
                            return;
                        }
                        else {
                            module_utils_1.log(`${user.profile} is live note:${dbuser.comment}`);
                            liveuser.isFollowed = true;
                        }
                    }
                    else {
                        // 1st pass
                        liveuser.check++;
                        var result = runScript(null, user, liveuser.infos);
                        module_utils_1.info(`1ST ${liveuser.check}:${liveuser.infos ? "*" : ""} ${result} ${user.profile} BC:${liveuser.infos && liveuser.infos.broadcastsCount} Level:${user.userlevel} VW:${user.viewers}/${user.views} Language:${user.l}`);
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
                        if (!liveuser.isFollowed) {
                            // 2nd pass with more informations
                            liveuser.check++;
                            var result = runScript(null, user, infos) || null;
                            if (result == "follow") {
                                liveuser.isFollowed = true;
                            }
                            else if (result == "ignore") {
                                liveuser.isIgnored = true;
                                return;
                            }
                            else {
                                // waiting
                                return;
                            }
                        }
                        if (liveuser.isFollowed) {
                            if (liveuser.broadcastId == user.broadcastId) {
                                throw new Error("WTF");
                            }
                            else {
                                module_utils_1.log(`MATCH ${user.profile} Viewers:${infos.viewers}/${user.viewers} ${infos.country} BC:${infos.broadcastsCount} Partner:${infos.partner} Platform:${infos.platform}`);
                                liveuser.infos = infos;
                                liveuser.broadcastId = user.broadcastId;
                                return _younow.downloadThemAll(infos)
                                    .then(([thumb, video, json]) => {
                                    module_utils_1.log(`${user.profile} is over json : ${thumb} image : ${video} video :${json}`);
                                }, err => {
                                    module_utils_1.error(err);
                                });
                            }
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
