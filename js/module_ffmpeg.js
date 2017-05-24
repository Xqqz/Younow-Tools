"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const child_process_1 = require("child_process");
const module_utils_1 = require("./module_utils");
class VideoWriter {
    constructor(filename, useFFMPEG) {
        this.stream = null;
        this.ffmpeg = null;
        this.filename = null;
        this.filename = filename;
        if (useFFMPEG) {
            let params = `-i - ${useFFMPEG} ${filename}`.split(" ");
            module_utils_1.info(`FFMPEG : ${params.join(" ")}`);
            try {
                this.ffmpeg = child_process_1.spawn("ffmpeg", params);
                this.ffmpeg.on("error", err => {
                    this.ffmpeg = null;
                    module_utils_1.error(err);
                });
                this.ffmpeg.on("close", result => {
                    this.ffmpeg = null;
                    module_utils_1.info("FFMPEG close", result);
                });
                this.ffmpeg.on("exit", code => {
                    this.ffmpeg = null;
                    if (code) {
                        module_utils_1.error(`FFMPEG exit ${code}`);
                    }
                });
                this.ffmpeg.stderr.on("data", data => module_utils_1.error(data.toString()));
            }
            catch (e) {
                module_utils_1.error(e);
            }
        }
        else {
            this.stream = fs.createWriteStream(filename);
        }
    }
    close(callback) {
        try {
            if (this.ffmpeg) {
                this.ffmpeg.stdin.end(callback);
            }
            else if (this.stream) {
                this.stream.end(callback);
            }
        }
        catch (e) {
            module_utils_1.error(e);
        }
    }
    write(data, callback) {
        try {
            if (this.ffmpeg && data) {
                this.ffmpeg.stdin.write(data, callback);
            }
            else if (this.stream && data) {
                this.stream.write(data, callback);
            }
        }
        catch (e) {
            module_utils_1.error(e);
        }
    }
}
exports.VideoWriter = VideoWriter;
//# sourceMappingURL=module_ffmpeg.js.map