"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_utils_1 = require("./module_utils");
const module_db_1 = require("./module_db");
const younow = require("./module_younow");
function cmdAnnotation(user, note) {
    module_db_1.openDB()
        .then(db => {
        user = younow.extractUser(user);
        let userdb = module_db_1.isUsernameInDB(db, user);
        if (userdb) {
            userdb.comment = note;
            db[userdb.userId] = userdb;
            module_utils_1.log(`${userdb.profile} in db annotated as ${note}`);
        }
        else {
            younow.resolveUser(db, user)
                .then(function (infos) {
                if (infos.errorCode) {
                    module_utils_1.error(`${user} ${infos.errorCode} ${infos.errorMsg}`);
                }
                else {
                    let userdb = module_db_1.convertToUserDB(infos.userId, infos);
                    userdb.comment = note;
                    db[infos.userId] = userdb;
                    module_utils_1.log(`${infos.profile} added and annotated as ${note}`);
                }
            })
                .catch(err => {
                module_utils_1.error(err);
            });
        }
    })
        .catch(module_utils_1.error);
}
exports.cmdAnnotation = cmdAnnotation;
//# sourceMappingURL=cmd_annotation.js.map