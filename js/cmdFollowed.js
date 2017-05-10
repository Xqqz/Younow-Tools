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
const module_utils_1 = require("./module_utils");
function cmdFollowed(users) {
    return __awaiter(this, void 0, void 0, function* () {
        let db = yield database.openDB();
        users.forEach(function (user) {
            return __awaiter(this, void 0, void 0, function* () {
                let userinfo = yield younow.resolveUser(db, user);
                let hasNext = 0, start = 0;
                do {
                    let result = yield younow.getFollowed(userinfo.userId, start);
                    if (result.errorCode) {
                        module_utils_1.error(younow.errortoString(result));
                        break;
                    }
                    if (start == 0) {
                        module_utils_1.log(`#\n# ${userinfo.userId},${userinfo.profile}\n#`);
                    }
                    result.fans.forEach(fan => module_utils_1.log(`${fan.userId},${fan.profileUrlString},${fan.firstName},${fan.lastName},${fan.description}`.replace(/[\x00-\x1f]/g, " ")));
                    start += result.count;
                    hasNext = result.hasNext;
                } while (hasNext);
            });
        });
    });
}
exports.cmdFollowed = cmdFollowed;
//# sourceMappingURL=cmdFollowed.js.map