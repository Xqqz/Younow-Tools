"use strict";
const module_utils_1 = require("./module_utils");
const module_db_1 = require("./module_db");
const younow = require("./module_younow");
const _async = require("async");
function cmdIgnore(users) {
    module_db_1.openDB()
        .then(db => {
        _async.eachSeries(users, function (user, callback) {
            user = younow.extractUser(user);
            let userdb = module_db_1.isUsernameInDB(db, user);
            if (userdb) {
                userdb.ignore = !userdb.ignore;
                db[userdb.userId] = userdb; // writeDB
                module_utils_1.log(`${userdb.profile} in the db has been ${userdb.ignore ? "ignored" : "unignored"}`);
                callback();
            }
            else {
                younow.resolveUser(db, user)
                    .then(function (infos) {
                    if (infos.errorCode) {
                        module_utils_1.error(`${user} ${infos.errorCode} ${infos.errorMsg}`);
                        callback();
                    }
                    else {
                        let userdb = module_db_1.convertToUserDB(infos.userId, infos);
                        userdb.ignore = true;
                        db[infos.userId] = userdb;
                        module_utils_1.log(`${infos.profile} has been ignored and added to the db`);
                        callback();
                    }
                })
                    .catch(err => {
                    module_utils_1.error(err);
                    callback();
                });
            }
        });
    })
        .catch(module_utils_1.error);
}
exports.cmdIgnore = cmdIgnore;
