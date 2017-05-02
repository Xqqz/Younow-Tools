"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const module_utils_1 = require("./module_utils");
const module_ffmpeg_1 = require("./module_ffmpeg");
function downloadSegments(url, video_filename, total_segment, bar, isLive) {
    let running = 0;
    let counter = 0;
    let ptr = 0;
    let buffers = [];
    let stream = new module_ffmpeg_1.VideoWriter(video_filename, main_1.settings.useFFMPEG);
    return new Promise(resolve => {
        function downloadSegment() {
            while (running < main_1.settings.parallelDownloads && counter < total_segment) {
                let segment = counter;
                running++;
                counter++;
                module_utils_1.getURL(`${url}${segment}.ts`, null)
                    .catch(err => {
                    module_utils_1.error(`segment ${segment} fail with ${err}`);
                    return null;
                })
                    .then(buffer => {
                    if (bar) {
                        bar.tick();
                    }
                    buffers[segment] = buffer;
                    if (segment == ptr) {
                        while (ptr in buffers) {
                            stream.write(buffers[ptr], null);
                            delete buffers[ptr];
                            ptr++;
                        }
                    }
                    running--;
                    if (counter < total_segment) {
                        downloadSegment();
                    }
                    else if (running == 0) {
                        if (isLive) {
                            resolve(stream);
                        }
                        else {
                            stream.close(err => {
                                resolve(err);
                            });
                        }
                    }
                })
                    .catch(err => {
                    module_utils_1.error(err);
                    return false;
                });
            }
        }
        downloadSegment();
    });
}
exports.downloadSegments = downloadSegments;
//# sourceMappingURL=module_hls.js.map