SMB = require('./node_modules/@marsaud/smb2')

client = new SMB({
  domain: 'WORKGROUP',

//   share: '\\\\10.10.1.55\\ff',
//   username: 'pi',
//   password: 'Qwer1234',

  share: 'smb:\\\\10.10.1.196\\',
  username: 'smb',
  password: '123456'
});

client.readdir('abc', function() {
    console.log(arguments[0])
})

// client.readdir('abc', function(err, exists) {
//     console.log(err, exists);
// });

client.exists('README.md', function(err, exists) {
  if (err) throw err;
  console.log(exists ? "it's there" : "it's not there!");
});

client.exists('abc.txt', '', function() {
    console.log(arguments[0])
})

/*
smb://10.10.1.196
smb
123456

*/