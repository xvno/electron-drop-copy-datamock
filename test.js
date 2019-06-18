ws = new WebSocket('ws://localhost:3333/ws');
ws.onopen = function (e) {
    console.log('Websocket to localhost:3333/ws connected!\n', e);
};
ws.onmessage = function (e) {
    console.log(e);
}
ws.onclose = function (e) {
    console.log(e);
}

setTimeout(() => {
    let cmds = [
        {
            cmd: 'upload', opt: {}
        },
        {
            cmd: 'list', opt: {}
        },
        {
            cmd: 'watch', opt: {
                list: [{
                    uid: 'F14932ABAD75B35977638111FBCE79C1',
                    origin: '/Users/xvno/Downloads/LICENSE',
                    status: 2
                },
                {
                    uid: 'DCC7CAC05BC1E189D1538A6831F44546',
                    origin: '/Users/xvno/Downloads/Makefile',
                    status: 3
                },
                {
                    uid: 'C82A25ACB78D19433BF72EEAFFBBD58C',
                    origin: '/Users/xvno/Downloads/README.md',
                    status: 1
                },
                {
                    uid: '8989BC5A46D031B935BB9352654CBA71',
                    origin: '/Users/xvno/Downloads/component.json',
                    status: 0
                },
                {
                    uid: 'FBCA3442E1E99EE7EE518BB4F436604F',
                    origin: '/Users/xvno/Downloads/index.js',
                    status: 3
                },
                {
                    uid: 'B742BD8B540A62F94669BF45C926FF2B',
                    origin: '/Users/xvno/Downloads/package.json',
                    status: 2
                }]
            }
        },
        {
            cmd: 'offwatch', opt: {}
        }
    ]

    cmds.map(c => {
        ws.send(JSON.stringify(c));
    });
}, 500);