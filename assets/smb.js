// load the library
var SMB2 = require('@marsaud/smb2');

// create an SMB2 instance
let username = decodeURI('alice');
var smb2Client = new SMB2({
    share: '\\\\10.10.1.99\\alice',
    domain: 'WORKGROUP',
    username: 'alicesss',
    password: 'Qwer1234',
    autoCloseTimeout: 0
});
/*
smb2Client.readFile('readme.txt', function(err, content) {
    if (err) throw err;
    console.log(content);
});
*/
// With promise, ideal with ES2017 async functions
//   const content = await smb2Client.readFile('foo.txt');
//   console.log(content);

smb2Client.exists('readme.txt', function(err, exists) {
    if (err) throw err;
    console.log(exists ? "it's there" : "it's not there!");
    smb2Client.close();
});

// export default smb2Client;
