const CP = require('child_process');
const drivelist = require('drivelist');

const conf = require('../config/smb.conf.js');

let { host, share, username, password } = conf;

let driveLtr = getDriveLtrs()[0] || 'V:';

let mountCMD = `net use ${driveLtr} \\\\${host}\\${share} ${password} /user:${username}`;
let umountCMD = `net use ${driveLtr} /d`;
let mounted = [];

module.exports = function mountFS() {
    let basePath = getBasePath();
    if (!basePath) {
        CP.execSync(mountCMD);
        basePath = getBasePath();
    }

    return {
        basePath,
        umount() {
            CP.execSync(umountCMD);
        }
    };
};

function getBasePath() {
    mounted = checkMounted(host, share);
    if (mounted.length > 0) {
        return mounted[0].path;
    }
}

async function checkMounted(host, share) {
    const drives = await drivelist.list();
    const deviceStr = `\\\\${host}\\${share}`;
    let found = [];
    drives.forEach(i => {
        if (i.device === deviceStr) found = found.concat(i.mountpoints);
    });
    mounted = [...new Set(found)];
    return mounted;
}

async function getDriveLtrs() {
    const drives = await drivelist.list();
    let ltrs = [];
    drives.forEach(i => {
        let mountpoints = i.mountpoints;
        let mplist = mountpoints.map(i => i.path);
        if (mplist.length > 0) {
            ltrs.concat(mplist);
        }
    });
    return ltrs; //['c:', 'd:', ...]
}
