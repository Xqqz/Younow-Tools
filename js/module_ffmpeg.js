"use strict";
const fs = require("fs");
const child = require("child_process");
const module_utils_1 = require("./module_utils");
/**
 * [VideoWriter description]
 * @type {[type]}
 */
class VideoWriter {
    /**
     * [constructor description]
     * @param {string} filename  [description]
     * @param {string} useFFMPEG [description]
     */
    constructor(filename, useFFMPEG) {
        this.stream = null;
        this.ffmpeg = null;
        this.filename = null;
        this.filename = filename;
        if (useFFMPEG) {
            let params = `-i - ${useFFMPEG} ${filename}`.split(" ");
            module_utils_1.info(`FFMPEG : ${params.join(" ")}`);
            try {
                this.ffmpeg = child.spawn("ffmpeg", params, {
                    stdio: ["pipe", process.stdout, "pipe"]
                });
                //this.ffmpeg.stdout.on("data",data=>log(data.toString()))
                this.ffmpeg.stderr.on("data", data => module_utils_1.error(data.toString()));
                this.ffmpeg.on("close", result => {
                    this.ffmpeg = null;
                    module_utils_1.info("FFMPEG close", result);
                });
                this.ffmpeg.on("error", err => {
                    this.ffmpeg = null;
                    module_utils_1.error(err);
                });
                this.ffmpeg.on("exit", result => {
                    module_utils_1.info("FFMPEG exit", result);
                    this.ffmpeg = null;
                });
            }
            catch (e) {
                module_utils_1.error(e);
            }
        }
        else {
            this.stream = fs.createWriteStream(filename);
        }
    }
    /**
     * [close description]
     * @param {Function} callback [description]
     */
    close(callback) {
        if (this.ffmpeg) {
            this.ffmpeg.stdin.end(callback);
        }
        else if (this.stream) {
            this.stream.end(callback);
        }
    }
    /**
     * [write description]
     * @param {Buffer}   data     [description]
     * @param {Function} callback [description]
     */
    write(data, callback) {
        if (this.ffmpeg) {
            this.ffmpeg.stdin.write(data, callback);
        }
        else if (this.stream) {
            this.stream.write(data, callback);
        }
    }
}
exports.VideoWriter = VideoWriter;
