const conf = require('../config/smb.conf.js');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const fs = require('fs');
let { username, password, host, share, mountPoint } = conf;

mountPoint = path.resolve(os.homedir(), mountPoint);
const mountCMD = `mount -t smbfs smb://${username}:${password}@${host}/${share} ${mountPoint}`;
const umountCMD = `diskutil unmount force ${mountPoint}`;
const checkMountedCMD = `mount | grep "//${username}@${host}/${share}"`;

/**
 * Mount smb to local folder/DiskLtr
 */
function mount() {
    try {
        cp.execSync(mountCMD);
    } catch (err) {
        console.log(err);
    }
}
function umount() {
    try {
        cp.execSync(umountCMD);
    } catch (err) {
        console.log(err);
    }
}

/**
 * check mountpoint and/or mkdir mountpoint
 */
function checkMountPoint() {
    // sync写法
    try {
        fs.accessSync(mountPoint, fs.constants.R_OK | fs.constants.W_OK);
        return true;
    } catch (err) {
        const { code, errno } = err;
        if (code === 'ENOENT' && errno === -2) {
            // no such file/folder
            try {
                fs.mkdirSync(mountPoint);
                return true;
            } catch (err) {
                console.log(err);
                return false;
            }
        } else {
            return false;
        }
    }
}

/**
 * check mounted
 */
function checkMounted() {
    if (checkMountPoint()) {
        try {
            let buf = cp.execSync(checkMountedCMD);
            let str = buf.toString();
            let reg = new RegExp(`${mountPoint.slice(0, -1)}`);
            let mounted = reg.test(str) || false;
            if (mounted) {
                return {
                    umount,
                    mountPoint
                };
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}

module.exports = function mountFS() {
    let ret = checkMounted();
    if (!ret) {
        try {
            ret = mount();
        } catch (err) {
            console.log(ret);
            throw err;
        }
    }
    return ret;
};
