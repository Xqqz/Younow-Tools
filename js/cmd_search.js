"use strict";
const module_utils_1 = require("./module_utils");
const module_db_1 = require("./module_db");
const younow = require("./module_younow");
const _async = require("async");
function cmdSearch(patterns) {
    module_db_1.openDB()
        .then(db => {
        _async.eachSeries(patterns, function (user, callback) {
            user = younow.extractUser(user);
            let regex = new RegExp(user, "i");
            /** @todo */
            Object.keys(db).forEach(key => {
                let dbuser = db[key];
                if (dbuser.userId) {
                    if (JSON.stringify(dbuser).match(regex)) {
                        let profile = dbuser.profile || "?";
                        module_utils_1.log(`${profile} (from db)`);
                        module_utils_1.log(module_utils_1.prettify(dbuser));
                    }
                }
            });
            callback();
        });
    })
        .catch(module_utils_1.error);
}
exports.cmdSearch = cmdSearch;
function cmdResolve(users) {
    module_db_1.openDB()
        .then(db => {
        _async.eachSeries(users, function (user, callback) {
            user = younow.extractUser(user);
            younow.resolveUser(db, user)
                .then(infos => {
                module_utils_1.log(`${user} (online result)`);
                module_utils_1.log(module_utils_1.prettify(infos));
                callback();
            })
                .catch(err => {
                module_utils_1.error(err);
                callback();
            });
        });
    })
        .catch(module_utils_1.error);
}
exports.cmdResolve = cmdResolve;
