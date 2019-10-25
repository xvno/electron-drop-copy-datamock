const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const config = require('../config/smb.conf.js');
const { host, share, username, password } = config;

let { macMountPoint } = config;
macMountPoint = path.resolve(os.homedir(), macMountPoint);
function checkMountPoint() {
    fs.access(macMountPoint, err => {
        if (err) {
            console.log('error occurred!');
            const { code, errno } = err;
            if (code === 'ENOENT' && errno === -2) {
                console.log('No such file/folder');
                let ret = fs.mkdirSync(macMountPoint, 0x0777);
                console.log(ret);
                return true;
            }
        } else {
            console.log(macMountPoint + ' exists!');
        }
    });
}

// mount -t smbfs smb://alice:Qwer_1234@10.10.1.99/alice ~/._MOVTILE_SMB_001

function checkMount() {
    let buf = cp.execSync(`mount | grep "//${username}@${host}/${share}`);
    let str = buf.toString();
    let reg = new RegExp(`${macMountPoint}$`);
    let ret = reg.test(str);
    if (ret) {
        return true;
    } else {
        if (checkMountPoint()) {
            mount({ host, share, username, password, macMountPoint });
        }
    }
}

function mount(opt) {
    const { host, share, username, password, macMountPoint } = opt;
    let mountCMD = `mount -t smbfs smb://${username}:${password}@${host}/${share} ${macMountPoint}`;
    let ret = cp.execSync(mountCMD);
    let str = ret.toString();
    let reg = new RegExp(`${macMountPoint}$`);
    if (reg.test(str)) {
        return true;
    } else {
        throw new Error('Mount failed!');
    }
}

module.exports = checkMount;
