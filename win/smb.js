const cp = require('child_process');
const drivelist = require('drivelist');
const conf = require('../config/smb.conf.js');
let { username, password, host, share } = conf;

let mounted = [];
let lastLtr = '';
const LETTERS = 'qwrtuiopshjklvnm'
    .toUpperCase()
    .split('')
    .map(i => `${i}:`);

async function getAvailableLtr() {
    let driveLtrs = await getDriveLtrs();
    let availables = LETTERS.filter(i => {
        if (driveLtrs.indexOf(i) === -1) {
            return true;
        }
    });
    return availables;
}

async function getLastAvailableLtr() {
    let availables = await getAvailableLtr();
    let len = availables.length;
    lastLtr = availables[len - 1];
    return lastLtr;
}

async function getMountCMD() {
    let ltr = await getLastAvailableLtr();
    return `net use ${ltr} \\\\${host}\\${share} ${password} /user:${username}`;
}

function getUmountCMD(ltr) {
    return `net use ${ltr} /d`;
}

/**
 * Mount smb to local folder/DiskLtr
 */
async function mount() {
    try {
        cp.execSync(await getMountCMD());
        return {
            mountPoint: lastLtr,
            umount: getUmountFn(lastLtr)
        };
    } catch (err) {
        console.log(err);
    }
}

function getUmountFn(ltr) {
    let cmd = getUmountCMD(ltr);
    return function umount() {
        try {
            cp.execSync(cmd);
        } catch (err) {
            console.log(err);
        }
    };
}

async function getDriveLtrs() {
    const drives = await drivelist.list();
    let ltrs = [];
    drives.forEach(i => {
        let mountpoints = i.mountpoints;
        let mplist = mountpoints.map(i => i.path);
        if (mplist.length > 0) {
            ltrs = ltrs.concat(mplist);
        }
    });
    return [...new Set(ltrs)]; //['c:', 'd:', ...]
}

// function checkMountPoint() {}

async function checkMounted() {
    const drives = await drivelist.list();
    let deviceStr = `\\\\${host}\\${share}`;
    deviceStr = deviceStr.replace(/\/$/, '');
    let mountedSet = new Set();
    drives.forEach(i => {
        let mountPoints = i.mountPoints;
        if (deviceStr === i.device || deviceStr.indexOf(i.device) > -1) {
            mountPoints.forEach(j => {
                mountedSet.add(j.path);
            });
        }
    });
    mounted = [...mountedSet];
    return mounted;
}

module.exports = async function mountFS() {
    mounted = await checkMounted();
    if (mounted.length === 0) {
        return mount();
    } else {
        let ltr = mounted[0];
        return {
            mountPoint: ltr,
            umount: getUmountFn(ltr)
        };
    }
};
