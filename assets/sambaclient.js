/*
var SambaClient = require('samba-client');

var client = new SambaClient({
    address: '//10.10.1.99/alice', // required
    username: 'alice', // not required, defaults to guest
    password: '123456', // not required
    domain: 'WORKGROUP' // not required
});

// send a file
client.fileExists('readme.txt', function(err, isthere) {
    if (err) throw err;
    console.log(isthere);
});

*/

import { SambaClient } from '@juangm/samba-client'

const config: SmbConfig = {
    address: '//10.10.1.99/alice',
    domain: 'WORKGROUP',
    username: 'alice',
    password: '123456'
};

const client = new SambaClient(config);

// send a file
// await client.sendFile('readme', 'destinationFolder/name');

// get a file
await client.getFile('readme.txt', './');