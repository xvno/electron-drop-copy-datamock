const fs = require('fs');
const baseDir = '/Users/volving/Downloads/__smb__/';
const path = require('path');
// const { mockUID, mockFileList } = require('../utils/mtools');
const uid = require('uid-safe');

module.exports = {
    writeToSMB: function(msgObj, dest, cb) {
        dest = dest || baseDir;
        console.log(JSON.stringify(msgObj));
        let list = msgObj.opt.list;
        let result = {};
        let lanes = [];
        list.forEach(item => {
            let ret = {
                uid: uid.sync(32),
                origin: item.origin,
                name: item.name,
                status: 0,
                trxed: 0,
                total: 0
            };
            result[ret.uid] = ret;

            let opChain = new Promise(function(resolve, reject) {
                fs.access(item.origin, fs.constants.F_OK, err => {
                    if (err) {
                        cb('does not exist');
                        reject();
                    } else {
                        cb('exists');
                        resolve(item);
                    }
                });
            });
            opChain.then(function(item) {
                return new Promise(function(resolve, reject) {
                    fs.access(item.origin, fs.constants.R_OK, err => {
                        if (err) {
                            reject('unreadable');
                        } else {
                            const stats = fs.statSync(item.origin);
                            ret.total = stats.size;
                            console.log(stats.size);
                            let rStream = fs.createReadStream(item.origin);
                            let filenamne =
                                item.name ||
                                item.origin
                                    .replace(/\/+/g, '/')
                                    .split('/')
                                    .splice(-1, 1)[0];
                            let fileDest = path.join(baseDir, filenamne);
                            let wStream;

                            try {
                                wStream = fs.createWriteStream(fileDest, {
                                    flags: 'w+'
                                });
                                wStream.on('finish', function() {
                                    console.log(
                                        'Transmition finished:',
                                        fileDest
                                    );
                                    ret.status = 2;
                                    cb(Object.values(result));
                                });
                            } catch (e) {
                                console.log('File create error:');
                                reject('Cannot Create File');
                            }

                            let acc = 0;
                            rStream.on('data', function(data) {
                                acc += data.length;
                                ret.trxed = acc;
                                ret.status = 1;
                                ret.progress = Math.floor(acc / ret.total) || 1;
                            });
                            ret.status = 1;
                            rStream.pipe(
                                wStream,
                                {
                                    end: true
                                }
                            );
                        }
                    });
                });
            });
            let timer = setInterval(function() {
                console.log('timer runs');
                cb(Object.values(result));
            }, 500);
            lanes.push(opChain);
            console.log('Lanes: ', lanes.length);
            Promise.all(lanes).then(function() {
                clearInterval(timer);
                console.log('timer runs');
                cb(Object.values(result));
            });
            //   // Check if the file is readable.
        });
    }
};

/*
function readFile(srcPath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(srcPath, 'utf8', function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data);
            }
        });
    })
}

function writeFile(savPath, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(savPath, data, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve();
            }
        });
    })
}

readFile("path").then(function(results){
   results+=" test manipulation";
   return writeFile("path",results);
}).then(function(){
   //done writing file, can do other things
})
*/
