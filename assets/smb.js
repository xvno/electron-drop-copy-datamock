// load the library
var SMB2 = require('smb2');

// create an SMB2 instance
var smb2Client = new SMB2({
  share: '10.10.1.55/ff',
  domain: 'WORKGROUP',
  username: 'ff',
  password: 'Feelfine',
});

smb2Client.readFile('foo.txt', function(err, content) {
  if (err) throw err;
  console.log(content);
});

// With promise, ideal with ES2017 async functions
//   const content = await smb2Client.readFile('foo.txt');
//   console.log(content);

smb2Client.exists('README.md', function(err, exists) {
  if (err) throw err;
  console.log(exists ? "it's there" : "it's not there!");
});

export default smb2Client;
