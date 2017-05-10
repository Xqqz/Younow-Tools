"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const younow = require("./module_younow");
const database = require("./module_db");
const main_1 = require("./main");
const module_utils_1 = require("./module_utils");
function cmdFollow(users) {
    return __awaiter(this, void 0, void 0, function* () {
        let db = yield database.openDB();
        Promise.all(users.map(user => {
            return younow.resolveUser(db, younow.extractUser(user))
                .then(dbuser => {
                if (dbuser.errorCode) {
                    throw `${user} ${dbuser.errorCode} ${dbuser.errorMsg}`;
                }
                return dbuser;
            });
        }))
            .then((curators) => {
            let liveBroadcasters = {};
            function monitor() {
                return __awaiter(this, void 0, void 0, function* () {
                    Promise.all(curators.map(curator => {
                        return module_utils_1.getURL(`https://api.younow.com/php/api/channel/getLocationOnlineFansOf/channelId=${curator.userId}/numberOfRecords=50`)
                            .catch(err => {
                            module_utils_1.error(err);
                            return null;
                        });
                    }))
                        .then((curatorsFollowed) => {
                        let old = liveBroadcasters;
                        liveBroadcasters = {};
                        for (let curatorFollowed of curatorsFollowed) {
                            if (curatorFollowed) {
                                for (let followed of curatorFollowed.users) {
                                    let userId = followed.userId;
                                    if (userId in old) {
                                        liveBroadcasters[userId] = old[userId];
                                    }
                                    else {
                                        liveBroadcasters[userId] = { status: null };
                                    }
                                    let broadcaster = liveBroadcasters[userId];
                                    if (userId in db && db[userId].ignore) {
                                        if (broadcaster.status == null) {
                                            module_utils_1.error(`${followed.profile} is ignored`);
                                        }
                                        broadcaster.status = followed.status;
                                    }
                                    else {
                                        if (followed.status != broadcaster.status) {
                                            broadcaster.status = followed.status;
                                            switch (followed.status) {
                                                case 0:
                                                    module_utils_1.log(`${followed.profile} is watching ${followed.channelName}`);
                                                    break;
                                                case 2:
                                                    younow.getLiveBroadcastByUID(userId)
                                                        .then(live => {
                                                        if (live.errorCode || live.lastSegmentId == undefined) {
                                                            broadcaster.status = null;
                                                            module_utils_1.error(`${live.profile} is not ready`);
                                                        }
                                                        else {
                                                            return younow.downloadThemAll(live)
                                                                .then(([thumb, video, json]) => {
                                                                module_utils_1.log(`${followed.profile} is over json : ${thumb} image : ${video} video :${json}`);
                                                            });
                                                        }
                                                    })
                                                        .catch(module_utils_1.error);
                                                    break;
                                                default:
                                                    module_utils_1.error(`Status:${followed.status}`);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })
                        .catch(module_utils_1.error);
                });
            }
            setInterval(monitor, main_1.settings.timeout * 60000);
            monitor();
        })
            .catch(module_utils_1.error);
    });
}
exports.cmdFollow = cmdFollow;
//# sourceMappingURL=cmd_follow.js.map