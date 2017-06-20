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
const _fs = require("fs");
const _path = require("path");
function exists(filename) {
    return new Promise((resolve, reject) => {
        _fs.exists(filename, resolve);
    });
}
exports.exists = exists;
function readFile(filename) {
    return new Promise((resolve, reject) => {
        _fs.readFile(filename, (err, data) => err ? reject(err) : resolve(data));
    });
}
exports.readFile = readFile;
function writeFile(filename, data) {
    return new Promise((resolve, reject) => {
        _fs.writeFile(filename, data, err => err ? reject(err) : resolve(err));
    });
}
exports.writeFile = writeFile;
function appendFile(filename, data) {
    return new Promise((resolve, reject) => {
        _fs.appendFile(filename, data, err => err ? reject(err) : resolve(err));
    });
}
exports.appendFile = appendFile;
function rename(src, dst) {
    return new Promise((resolve, reject) => {
        _fs.rename(src, dst, err => err ? reject(err) : resolve(err));
    });
}
exports.rename = rename;
function moveTo(filename, path) {
    let newpath = _path.join(path, filename);
    return rename(filename, newpath);
}
exports.moveTo = moveTo;
function createDirectory(path) {
    return exists(path)
        .then(bool => {
        if (!bool) {
            return new Promise((resolve, reject) => {
                _fs.mkdir(path, err => err ? reject(err) : resolve(true));
            });
        }
    });
}
exports.createDirectory = createDirectory;
function setCurrentDirectory(path) {
    return __awaiter(this, void 0, void 0, function* () {
        process.chdir(path);
        return true;
    });
}
exports.setCurrentDirectory = setCurrentDirectory;
function getCurrentDirectory() {
    return __awaiter(this, void 0, void 0, function* () {
        return process.cwd();
    });
}
exports.getCurrentDirectory = getCurrentDirectory;
function timeout(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, timeout);
    });
}
exports.timeout = timeout;
//# sourceMappingURL=module_promises.js.map