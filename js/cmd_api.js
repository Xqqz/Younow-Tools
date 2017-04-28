"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _younow = require("./module_younow");
const module_utils_1 = require("./module_utils");
async function cmdAPI() {
    _younow.getTrendings()
        .then(async (trendings) => {
        if (trendings.errorCode) {
            throw new Error("Fatal");
        }
        module_utils_1.log(`getTrendings result:${trendings.errorCode} users:${trendings.trending_users.length}`);
        let user = trendings.trending_users[0];
        let tag = trendings.trending_tags[0];
        let live = await _younow.getLiveBroadcastByUID(user.userId);
        if (live.errorCode) {
            throw new Error("Fatal");
        }
        module_utils_1.log(`getLiveBroadcastByUID:${live.errorCode ? live.errorMsg : "OK"}`);
        module_utils_1.log(`getLiveBroadcastByUsername:${await _younow.getLiveBroadcastByUsername(user.profile).then(x => x.errorCode ? x.errorMsg : "OK", module_utils_1.error)}`);
        module_utils_1.log(`getUserInfoByUID:${await _younow.getUserInfoByUID(user.userId).then(x => x.errorCode ? x.errorMsg : "OK", module_utils_1.error)}`);
        module_utils_1.log(`getTagInfo:${await _younow.getTagInfo(tag.tag).then(x => x.errorCode ? x.errorMsg : "OK", module_utils_1.error)}`);
        module_utils_1.log(`getMoments:${await _younow.getMoments(user.userId, 0).then(x => x.errorCode ? x.errorMsg : "OK", module_utils_1.error)}`);
        module_utils_1.log(`getPlaylist:${await _younow.getPlaylist(user.broadcastId).then(x => x.length ? "OK" : "Error", module_utils_1.error)}`);
    })
        .catch(module_utils_1.error);
}
exports.cmdAPI = cmdAPI;
