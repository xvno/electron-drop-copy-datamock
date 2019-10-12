const fs = require('fs');
const baseDir = '/Users/volving/Downloads/__smb__/';
const path = require('path');
const { mockUID, mockFileList } = require('../utils/mtools');

module.exports = {
  writeToSMB: function(msgObj, dest, cb) {
    dest = dest || baseDir;
    console.log(JSON.stringify(msgObj));
    let list = msgObj.opt.list;
    let result = {};
    let lanes = []
    list.forEach(item => {
      // fs.exists(item.origin, (exists, err) => {
      //     if()
      // });
      let ret = {
        uid: mockUID(),
        origin: item.origin,
        name: item.name,
        status: 0,
        trxed: 0,
        total: 0
      }
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
              var rStream = fs.createReadStream(item.origin);
              let filenamne = item.name  || item.origin
                .replace(/\/+/g, '/')
                .split('/')
                .splice(-1, 1)[0];
              let fileDest = path.join(baseDir, filenamne);
              var wStream;

              try {
                wStream = fs.createWriteStream(fileDest, { flags: 'w+' });
                wStream.on('finish', function() {
                    console.log('Transmition finished:', fileDest);
                })
              } catch (e) {
                console.log('File create error:');
                reject('cannot create file');
              }

              let acc = 0;
              rStream.on('data', function(data) {
                acc += data.length || 0;
                ret.trxed = acc;
              });
              rStream.pipe(wStream, {
                  end: true
              });
            }
          });
        });
      });
      let timer = setInterval(function() {
          cb(result)
      }, 1000)
      lanes.push(opChain)
      Promise.all(lanes).then(function() {
        clearInterval(timer);
      })
      //   // Check if the file is readable.
    });
  },
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
