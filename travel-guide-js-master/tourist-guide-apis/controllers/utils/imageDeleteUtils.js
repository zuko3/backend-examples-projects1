const path = require('path');
const child_process = require('child_process');

exports.removeUnresolvedImages = function (images) {
    if (!Array.isArray(images)) return;
    var newImgArray = Array.prototype.concat.apply([], images);
    newImgArray.forEach(image => {
        const file = path.join(path.dirname(process.mainModule.filename), 'images', image);
        console.log("file:", file);
        var workerProcess = child_process.spawn('node', ['removeFile.js', file]);
        workerProcess.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });
        workerProcess.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        workerProcess.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
    });
}