"use strict";
const fs = require("fs");
/** returns Promise(exists:boolean or err) */
function exists(filename) {
    return new Promise((resolve, reject) => {
        fs.exists(filename, resolve);
    });
}
exports.exists = exists;
/** returns Promise(data or err) */
function readFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => err ? reject(err) : resolve(data));
    });
}
exports.readFile = readFile;
/** returns Promise(null or err) */
function writeFile(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, err => err ? reject(err) : resolve(err));
    });
}
exports.writeFile = writeFile;
/** returns Promise(null or err) */
function appendFile(filename, data) {
    return new Promise((resolve, reject) => {
        fs.appendFile(filename, data, err => err ? reject(err) : resolve(err));
    });
}
exports.appendFile = appendFile;
/** returns Promise(null or err) */
function rename(oldpath, newpath) {
    return new Promise((resolve, reject) => {
        fs.rename(oldpath, newpath, err => err ? reject(err) : resolve(err));
    });
}
exports.rename = rename;
