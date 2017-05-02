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
const _younow = require("./module_younow");
const module_utils_1 = require("./module_utils");
function cmdAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        _younow.getTrendings()
            .then((trendings) => __awaiter(this, void 0, void 0, function* () {
            if (trendings.errorCode) {
                throw new Error("Fatal");
            }
            module_utils_1.log(`getTrendings result:${trendings.errorCode} users:${trendings.trending_users.length}`);
            let user = trendings.trending_users[0];
            let tag = trendings.trending_tags[0];
            let live = yield _younow.getLiveBroadcastByUID(user.userId);
            if (live.errorCode) {
                throw new Error("Fatal");
            }
            module_utils_1.log(`getLiveBroadcastByUID:${live.errorCode ? live.errorMsg : "OK"}`);
            module_utils_1.log(`getLiveBroadcastByUsername:${yield _younow.getLiveBroadcastByUsername(user.profile).then(x => x.errorCode ? x.errorMsg : "OK", module_utils_1.error)}`);
            module_utils_1.log(`getUserInfoByUID:${yield _younow.getUserInfoByUID(user.userId).then(x => x.errorCode ? x.errorMsg : "OK", module_utils_1.error)}`);
            module_utils_1.log(`getTagInfo:${yield _younow.getTagInfo(tag.tag).then(x => x.errorCode ? x.errorMsg : "OK", module_utils_1.error)}`);
            module_utils_1.log(`getMoments:${yield _younow.getMoments(user.userId, 0).then(x => x.errorCode ? x.errorMsg : "OK", module_utils_1.error)}`);
            module_utils_1.log(`getPlaylist:${yield _younow.getPlaylist(user.broadcastId).then(x => x.length ? "OK" : "Error", module_utils_1.error)}`);
        }))
            .catch(module_utils_1.error);
    });
}
exports.cmdAPI = cmdAPI;
//# sourceMappingURL=cmd_api.js.map