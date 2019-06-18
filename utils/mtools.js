function mockUID(len = 32) {
    let digits = [];
    for (let i = 0; i < len; i++) {
        digits[i] = Math.floor(16 * Math.random());
    }
    let ret = digits.map(i => {
        return i.toString(16);
    });
    return ret.join('').toUpperCase();
}
function mockFileList() {
    console.log('mocking files\n\n');
    let ret = ['LICENSE',
        'Makefile',
        'README.md',
        'component.json',
        'index.js',
        'package.json'
    ].map(item => {
        return {
            uid: mockUID(),
            origin: '/Users/xvno/Downloads/' + item,
            status: Math.floor(4 * Math.random())
        };
    });
    console.log(ret);
    return ret;
}

module.exports = {
    mockUID,
    mockFileList
};