"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _path = require("path");
const _async = require("async");
const _progress = require("progress");
const younow_1 = require("./younow");
const module_utils_1 = require("./module_utils");
const module_db_1 = require("./module_db");
const dos = require("./module_promises");
const module_ffmpeg_1 = require("./module_ffmpeg");
const API_URL = "https://api.younow.com";
function extractUser(user) {
    if (isNaN(user)) {
        var pos = user.lastIndexOf("/");
        return (pos < 0) ? user : user.substring(pos + 1);
    }
    else {
        return user;
    }
}
exports.extractUser = extractUser;
function resolveUser(db, user) {
    let userdb = module_db_1.isUsernameInDB(db, user);
    if (userdb) {
        userdb.errorCode = 0;
        return Promise.resolve(userdb);
    }
    else {
        if (isNaN(user)) {
            return getLiveBroadcastByUsername(user)
                .then(infos => {
                if (infos.errorCode == 0 || infos.errorCode == 206) {
                    return getUserInfoByUID(infos.userId)
                        .then(infos => infos);
                }
                else {
                    return infos;
                }
            });
        }
        else {
            return getUserInfoByUID(user)
                .then(infos => {
                if (infos.userId) {
                    return infos;
                }
                else {
                    infos.errorCode = 101;
                    infos.errorMsg = "Invalid user Id";
                    return infos;
                }
            });
        }
    }
}
exports.resolveUser = resolveUser;
function getUserInfoByUID(uid) {
    return module_utils_1.getURL(`${API_URL}/php/api/channel/getInfo/channelId=${uid}`);
}
exports.getUserInfoByUID = getUserInfoByUID;
function getLiveBroadcastByUsername(username) {
    return module_utils_1.getURL(`${API_URL}/php/api/broadcast/info/user=${username}`);
}
exports.getLiveBroadcastByUsername = getLiveBroadcastByUsername;
function getLiveBroadcastByUID(uid) {
    return module_utils_1.getURL(`${API_URL}/php/api/broadcast/info/channelId=${uid}`);
}
exports.getLiveBroadcastByUID = getLiveBroadcastByUID;
function getArchivedBroadcast(bid) {
    return module_utils_1.getURL(`${API_URL}/php/api/broadcast/videoPath/broadcastId=${bid}`);
}
exports.getArchivedBroadcast = getArchivedBroadcast;
function getMoments(uid, next) {
    return module_utils_1.getURL(`${API_URL}/php/api/moment/profile/channelId=${uid}/createdBefore=${next}`);
}
exports.getMoments = getMoments;
function getTrendings() {
    return module_utils_1.getURL(`${API_URL}/php/api/younow/dashboard/locale=en/trending=50`);
}
exports.getTrendings = getTrendings;
function getTagInfo(tag) {
    return module_utils_1.getURL(`https://playdata.younow.com/live/tags/${new Buffer(tag).toString("base64")}.json`);
}
exports.getTagInfo = getTagInfo;
async function downloadArchive(user, bid, started) {
    module_utils_1.info("downloadArchive", user.profile, bid);
    let archive = await getArchivedBroadcast(bid);
    if (archive.errorCode) {
        module_utils_1.error(`${user.profile} ${bid} ${archive.errorCode} ${archive.errorMsg}`);
        return false;
    }
    let fix = archive;
    fix.dateStarted = started;
    fix.profile = user.profile;
    fix.broadcastId = bid;
    fix.country = user.country;
    fix.awsUrl = archive.broadcastThumbnail;
    let video_filename = createFilename(archive) + "." + younow_1.settings.videoFormat;
    await saveJSON(archive);
    await downloadThumbnail(archive);
    let exists = await dos.exists(video_filename);
    if (!exists) {
        return module_utils_1.getURL(archive.hls, "utf8")
            .then((playlist) => {
            let m = playlist.match(/\d+\.ts/g);
            if (!m) {
                module_utils_1.error(playlist);
                return false;
            }
            let total_segment = m.length;
            m = archive.hls.match(/(https:.+)playlist.m3u8/i);
            if (!m) {
                module_utils_1.error(archive.hls);
                return false;
            }
            let url = m[1];
            let bar = new _progress(`${user.profile} ${bid} :bar :percent :elapseds/:etas :rate/bps`, {
                total: total_segment,
                width: 20,
                complete: "●",
                incomplete: "○",
                clear: true
            });
            return new Promise(resolve => {
                _async.timesLimit(total_segment, younow_1.settings.parallelDownloads, (segment, next) => {
                    module_utils_1.getURL(`${url}${segment}.ts`, null)
                        .then(buffer => {
                        bar.tick();
                        next(null, buffer);
                    }, err => {
                        next(null, null);
                    });
                }, (err, buffers) => {
                    let stream = new module_ffmpeg_1.VideoWriter(video_filename, younow_1.settings.useFFMPEG);
                    for (let buffer of buffers) {
                        if (buffer) {
                            stream.write(buffer, null);
                        }
                    }
                    stream.close(err => {
                        resolve(true);
                    });
                });
            })
                .then(err => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(moveFile(video_filename));
                    }, 10000);
                });
            });
        });
    }
}
exports.downloadArchive = downloadArchive;
function getPlaylist(bid) {
    return module_utils_1.getURL(`${API_URL}/php/api/broadcast/videoPath/hls=1/broadcastId=${bid}`, "utf8");
}
exports.getPlaylist = getPlaylist;
function downloadThemAll(live) {
    return Promise.all([saveJSON(live), downloadThumbnail(live), downloadLiveStream(live)]);
}
exports.downloadThemAll = downloadThemAll;
async function downloadLiveStream(live) {
    if (live.errorCode == 0) {
        let filename = createFilename(live) + "." + younow_1.settings.videoFormat;
        let exists = await dos.exists(filename);
        if (!exists) {
            return getPlaylist(live.broadcastId)
                .then((playlist) => {
                let m = playlist.match(/https:.+\d+.ts/gi);
                if (m) {
                    m = m.pop().match(/(https:.+\/)(\d+).ts/i);
                    if (m) {
                        let url = m[1];
                        let current_segment = Number(m[2]);
                        return new Promise(promisify => {
                            module_utils_1.log(`REWIND ${filename}`);
                            _async.timesLimit(current_segment, younow_1.settings.parallelDownloads, (n, next) => {
                                module_utils_1.getURL(`${url}${n}.ts`, null)
                                    .then(buffer => {
                                    next(false, buffer);
                                }, err => {
                                    module_utils_1.error(err);
                                    next(false, null);
                                });
                            }, (err, buffers) => {
                                module_utils_1.log(`WATCH ${filename}`);
                                let stream = new module_ffmpeg_1.VideoWriter(filename, younow_1.settings.useFFMPEG);
                                for (let buffer of buffers) {
                                    if (buffer) {
                                        stream.write(buffer, null);
                                    }
                                }
                                let interval = 0;
                                let fail = 0;
                                let step = 250;
                                let slow_down = 0.01;
                                _async.forever(next => {
                                    module_utils_1.getURL(`${url}${current_segment}.ts`, null)
                                        .then(buffer => {
                                        fail = 0;
                                        interval = interval - interval * slow_down;
                                        current_segment++;
                                        stream.write(buffer, err => {
                                            setTimeout(next, interval);
                                        });
                                    }, err => {
                                        fail++;
                                        if (fail < 10 && err == 403) {
                                            interval += step;
                                            setTimeout(next, interval);
                                        }
                                        else {
                                            next(true);
                                        }
                                    });
                                }, err => {
                                    stream.close(err => {
                                        promisify(true);
                                    });
                                });
                            });
                        })
                            .then(() => {
                            return new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    resolve(moveFile(filename));
                                }, 10000);
                            });
                        });
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            });
        }
    }
}
exports.downloadLiveStream = downloadLiveStream;
async function downloadThumbnail(live) {
    if (live.errorCode == 0) {
        let filename = createFilename(live) + ".jpg";
        let exists = await dos.exists(filename);
        if (!exists) {
            let image = await module_utils_1.getURL(live.awsUrl, null);
            await dos.writeFile(filename, image);
            await moveFile(filename);
            module_utils_1.info("downloadThumbnail", image.length, filename);
        }
        return true;
    }
    return false;
}
exports.downloadThumbnail = downloadThumbnail;
async function saveJSON(live) {
    if (live.errorCode == 0) {
        let filename = createFilename(live) + ".json";
        let exists = await dos.exists(filename);
        if (!exists) {
            await dos.writeFile(filename, module_utils_1.prettify(live));
            await moveFile(filename);
            module_utils_1.info("saveJSON", filename);
        }
        return true;
    }
    return false;
}
exports.saveJSON = saveJSON;
function createFilename(live) {
    let filename = _path.join(younow_1.settings.pathDownload, `${live.country || "XX"}_${live.profile}_${module_utils_1.formatDateTime(new Date((live.dateStarted || live.dateCreated || Date.now() / 1000) * 1000))}_${live.broadcastId}`);
    module_utils_1.debug("createFilename", filename);
    return filename;
}
exports.createFilename = createFilename;
async function moveFile(filename) {
    if (younow_1.settings.pathMove) {
        let newpath = _path.join(younow_1.settings.pathMove, _path.parse(filename).base);
        module_utils_1.info("moveFile", filename, newpath);
        return dos.rename(filename, newpath);
    }
}
