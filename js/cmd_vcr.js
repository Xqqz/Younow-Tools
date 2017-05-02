"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _younow = require("./module_younow");
const _async = require("async");
const module_utils_1 = require("./module_utils");
const module_db_1 = require("./module_db");
function cmdVCR(users) {
    module_db_1.openDB()
        .then(db => {
        _async.eachSeries(users, function (user, callback_users) {
            user = _younow.extractUser(user);
            _younow.resolveUser(db, user)
                .then((userinfo) => {
                if (userinfo.errorCode == 0) {
                    let uid = userinfo.userId;
                    let n = 0;
                    let downloadableMoments = [];
                    _async.forever(function (next) {
                        _younow.getMoments(uid, n)
                            .then((moments) => {
                            if (moments.errorCode == 0) {
                                for (let moment of moments.items) {
                                    if (moment.broadcaster.userId == uid) {
                                        downloadableMoments.push(moment);
                                    }
                                }
                                module_utils_1.log(`current broadcast extracted ${downloadableMoments.length}`);
                                if (moments.hasMore && moments.items.length) {
                                    n = moments.items[moments.items.length - 1].created;
                                    next(false);
                                }
                                else {
                                    next(true);
                                }
                            }
                            else {
                                throw new Error(`${userinfo.profile} ${userinfo.errorCode} ${userinfo.errorMsg}`);
                            }
                        })
                            .catch(err => {
                            module_utils_1.error(err);
                            next(false);
                        });
                    }, function (err) {
                        if (downloadableMoments.length == 0) {
                            callback_users();
                        }
                        else {
                            _async.eachSeries(downloadableMoments.reverse(), function (moment, callback_moments) {
                                _younow.downloadArchive(userinfo, moment.broadcastId, moment.created)
                                    .then(result => {
                                    callback_moments();
                                }, err => {
                                    module_utils_1.error(err);
                                    return false;
                                });
                            }, callback_users);
                        }
                    });
                }
                else {
                    module_utils_1.error(`${user} ${userinfo.errorCode} ${userinfo.errorMsg}`);
                }
            })
                .catch((err) => {
                module_utils_1.error(err);
                callback_users();
            });
        });
    })
        .catch(module_utils_1.error);
}
exports.cmdVCR = cmdVCR;
//# sourceMappingURL=cmd_vcr.js.map