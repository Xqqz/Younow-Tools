"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_utils_1 = require("./module_utils");
const module_db_1 = require("./module_db");
const younow = require("./module_younow");
const _async = require("async");
function cmdAdd(users) {
    module_db_1.openDB()
        .then((db) => {
        _async.eachSeries(users, function (user, callback) {
            user = younow.extractUser(user);
            let userdb = module_db_1.isUsernameInDB(db, user);
            if (userdb) {
                module_utils_1.log(`${userdb.profile} is already in the db`);
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
                        db[infos.userId] = module_db_1.convertToUserDB(infos.userId, infos);
                        module_utils_1.log(`${infos.profile} added to the db`);
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
exports.cmdAdd = cmdAdd;
//# sourceMappingURL=cmd_add.js.map