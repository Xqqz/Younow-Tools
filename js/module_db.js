"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const module_utils_1 = require("./module_utils");
const _fs = require("fs");
const dos = require("./module_promises");
class FakeDB {
    constructor() {
        this.db = {
            self: this
        };
        this.proxy = null;
    }
    open(filename, title) {
        this.filename = filename;
        this.title = title;
        return dos.exists(filename)
            .then(exists => {
            if (exists) {
                return dos.readFile(filename)
                    .then(data => {
                    this.parse(this.db, data.toString().split("\n"));
                    this.proxy = this.proxify(this.db);
                    return this.proxy;
                });
            }
            else {
                return dos.appendFile(filename, `# ${title}\n`)
                    .then(err => {
                    this.proxy = this.proxify(this.db);
                    return this.proxy;
                });
            }
        });
    }
    update() {
        dos.readFile(this.filename)
            .then((data) => {
            this.parse(this.db, data.toString().split("\n"));
            module_utils_1.info(`DB broadcasters ${Object.keys(this.db).length}`);
        })
            .catch(module_utils_1.error);
    }
    proxify(obj) {
        return new Proxy(obj, {
            deleteProperty(target, key) {
                if (key in target) {
                    _fs.appendFile(target.self.filename, `-${key}\n`, err => err);
                    return delete target[key];
                }
                else {
                    return true;
                }
            },
            set(target, key, value, recv) {
                _fs.appendFile(target.self.filename, `+${key}:${JSON.stringify(value)}\n`, err => err);
                return target[key] = value;
            }
        });
    }
    parse(db, lines) {
        for (let line of lines) {
            let m = line.match(/([+-@])(\w+):*(.*)/);
            if (m) {
                switch (m[1]) {
                    case "@":
                        if (!db[m[2]]) {
                            db[m[2]] = [];
                        }
                        db[m[2]].push(JSON.parse(m[3]));
                        break;
                    case "+":
                        db[m[2]] = JSON.parse(m[3]);
                        break;
                    case "-":
                        if (m[2] in db) {
                            delete db[m[2]];
                        }
                        break;
                }
            }
        }
    }
}
exports.FakeDB = FakeDB;
function openDB() {
    return new FakeDB().open(main_1.settings.pathDB, "Broadcasters");
}
exports.openDB = openDB;
function isUsernameInDB(db, user) {
    if (isNaN(user)) {
        var regex = new RegExp("^" + user + "$", "i");
        for (let i of Object.keys(db)) {
            let dbuser = db[i];
            let profile = dbuser.profile;
            if (profile) {
                if (profile.match(regex)) {
                    return dbuser;
                }
            }
        }
        return null;
    }
    else {
        return db[user] || null;
    }
}
exports.isUsernameInDB = isUsernameInDB;
function convertToUserDB(uid, user) {
    let dbuser = {
        ignore: user.ignore || false,
        comment: user.comment || "---",
        profile: user.profile,
        userId: user.userId || uid,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country || "XX",
        state: user.state,
        city: user.city,
        description: user.description,
        twitterId: user.twitterId,
        twitterHandle: user.twitterHandle,
        youTubeUserName: user.youTubeUserName,
        youTubeChannelId: user.youTubeChannelId,
        youTubeTitle: user.youTubeTitle,
        googleId: user.googleId,
        googleHandle: user.googleHandle,
        facebookId: user.facebookId,
        instagramId: user.instagramId,
        instagramHandle: user.instagramHandle,
        facebookPageId: user.facebookId,
        websiteUrl: user.websiteUrl,
        dateCreated: user.dateCreated,
        locale: user.locale,
        language: user.language,
        tumblrId: user.tumblrId
    };
    for (let i in dbuser) {
        if (dbuser[i] === "" || dbuser[i] === null || dbuser[i] === undefined) {
            delete dbuser[i];
        }
    }
    return dbuser;
}
exports.convertToUserDB = convertToUserDB;
//# sourceMappingURL=module_db.js.map