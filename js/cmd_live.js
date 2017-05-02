"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_utils_1 = require("./module_utils");
const module_db_1 = require("./module_db");
const _younow = require("./module_younow");
const _async = require("async");
function cmdLive(users) {
    module_db_1.openDB()
        .then((db) => {
        _async.eachSeries(users, function (user, cbAsync) {
            user = _younow.extractUser(user);
            let p = isNaN(user) ? _younow.getLiveBroadcastByUsername(user) : _younow.getLiveBroadcastByUID(user);
            p.then(live => {
                if (live.errorCode) {
                    module_utils_1.error(`${user} ${live.errorCode} ${live.errorMsg}`);
                }
                else if (live.state != "onBroadcastPlay") {
                    module_utils_1.error(`${live.state} ${live.stateCopy}`);
                }
                else {
                    _younow.downloadThemAll(live)
                        .then(result => {
                        module_utils_1.log(`${live.profile} broadcast is over`);
                        return true;
                    }, module_utils_1.error);
                }
            }, module_utils_1.error)
                .then(() => {
                cbAsync();
            });
        });
    })
        .catch(module_utils_1.error);
}
exports.cmdLive = cmdLive;
//# sourceMappingURL=cmd_live.js.map