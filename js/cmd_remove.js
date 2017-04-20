"use strict";
const younow = require("./module_younow");
const module_db_1 = require("./module_db");
const module_utils_1 = require("./module_utils");
const _async = require("async");
function cmdRemove(users) {
    module_db_1.openDB()
        .then(db => {
        _async.eachSeries(users, function (user, callback) {
            user = younow.extractUser(user);
            let dbuser = module_db_1.isUsernameInDB(db, user);
            if (dbuser) {
                module_utils_1.log(`${user} removed from the db`);
                delete db[dbuser.userId];
            }
            else {
                module_utils_1.error(`${user} is not in the db`);
                callback();
            }
        });
    })
        .catch(module_utils_1.error);
}
exports.cmdRemove = cmdRemove;
