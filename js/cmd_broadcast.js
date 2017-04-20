"use strict";
const module_utils_1 = require("./module_utils");
const module_db_1 = require("./module_db");
const _younow = require("./module_younow");
const _async = require("async");
function cmdBroadcast(bids) {
    module_db_1.openDB()
        .then((db) => {
        _async.eachSeries(bids, function (bid, cbAsync) {
            _younow.getArchivedBroadcast(bid)
                .then(archive => {
                if (archive.errorCode) {
                    module_utils_1.error(`${bid} ${archive.errorCode} ${archive.errorMsg}`);
                }
                else {
                    _younow.resolveUser(db, archive.userId)
                        .then(user => {
                        if (user.errorCode) {
                            module_utils_1.error(`${bid} ${user.errorCode} ${user.errorMsg}`);
                        }
                        else {
                            /** @todo created ? */
                            return _younow.downloadArchive(user, bid, 0);
                        }
                    })
                        .catch(module_utils_1.error);
                }
            })
                .catch(module_utils_1.error)
                .then(cbAsync);
        });
    })
        .catch(module_utils_1.error);
}
exports.cmdBroadcast = cmdBroadcast;
