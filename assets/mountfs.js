var MountJS = require('mount-js');
// console.log(MountFS);

// var MountJS = new MountFS();

MountJS.on('mounted', function(m) {
    console.log(m);
});

MountJS.on('fail', function(m) {
    console.log(m);
});

MountJS.mount({
    domain: 'WORKGROUP',
    username: 'alice',
    password: '123456',
    location: '10.10.1.99/alice',
    protocol: 'smb',
    timeout: 60
});
