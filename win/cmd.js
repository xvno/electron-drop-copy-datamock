const CP = require('child_process');
const drivelist = require('drivelist');



const host = '10.10.1.99';
const share = 'alice';
const password = 'Qwer_1234';
const username = 'alice';

let driveLtr = getDriveLtrs()[0]||'V:';

let mountCMD = `net use ${driveLtr} \\\\${host}\\${share} ${password} /user:${username}`;
let umountCMD = `net use ${driveLtr} /d`;

try {
  let ret = CP.execSync(mountCMD);

} catch (error) {
  throw error;
}

function async getDriveLtrs() {
  const drives = await drivelist.list();
  let ltrs = [];
  drivers.forEach(i => {
    let mountpoints = i.mountpoints;
    let mplist = mountpoints.map(i => i.path)
    if (mplist.length > 0) {
      ltrs.concat(mplist)
    }
  })
  return ltrs; //['c:', 'd:', ...]
}
