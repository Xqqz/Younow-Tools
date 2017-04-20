"use strict";
const fs = require("fs");
/** returns Promise(exists:boolean,err) */
function exists(filename) {
    return new Promise((resolve, reject) => {
        fs.exists(filename, resolve);
    });
}
exports.exists = exists;
/** returns Promise(null,err) */
function writeFile(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, err => err ? reject(err) : resolve(err));
    });
}
exports.writeFile = writeFile;
/** returns Promise(null,err) */
function rename(oldpath, newpath) {
    return new Promise((resolve, reject) => {
        fs.rename(oldpath, newpath, err => err ? reject(err) : resolve(err));
    });
}
exports.rename = rename;
