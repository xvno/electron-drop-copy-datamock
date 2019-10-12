const Koa = require('koa2');
const route = require('koa-route');
const websockify = require('koa-websocket');
// const io = require('socket.io')();
const { mockUID, mockFileList } = require('./utils/mtools');
const filewriter = require('./assets/filewriter');


const app = new Koa();
const static = require('koa-static');
app.use(static('public'));

const wsapp = websockify(app);
// const conns = new WeakSet();

wsapp.ws.use(function (ctx, next) {
    return next(ctx);
});
/*
    - 0        CONNECTING        连接尚未建立
    - 1        OPEN            WebSocket的链接已经建立
    - 2        CLOSING            连接正在关闭
    - 3        CLOSED            连接已经关闭或不可用
*/
wsapp.ws.use(route.all('/ws', function (ctx) {
    let ws = ctx.websocket
    ws.watched = [];
    // ws.send('\n\nConnected!');
    ws.fileList = []; // || mockFileList();
    let msgObj = null;
    ws.on('message', function (message) {
        console.log('messaging....')
        try {
            msgObj = JSON.parse(message);
        } catch (e) {
            console.log(`Error occurred! ${e}\t${message}`);
            return false;
        }
        let { cmd, opt, msg } = msgObj;
        let ret = null;
        let watched = ws.watched || [];
        let newWatched = [];
        switch (cmd) {
            case 'upload':
                console.log('upload');

                filewriter.writeToSMB(msgObj, '', function(i) {
                    return {
                        uid: mockUID(),
                        origin: i.origin,
                        name: i.name,
                        status: 0
                    }
                });

                var list = msgObj.opt.list || []
                list = list.map(i => {
                    return {
                        uid: mockUID(),
                        origin: i.origin,
                        name: i.name,
                        status: 0
                    }
                })
                ws.fileList = list
                ret = {
                    cmd: 'upload',
                    data: {
                        list: list.map(item => {
                            return Object.assign(item, { trxed: 0, total: 10000 * Math.random() });
                        })
                    },
                    timestamp: Date.now(),
                    status: '请求成功',
                    code: 200,
                    request: message
                }
                break;
            case 'list':
                console.log('list');
                ret = {
                    cmd: 'list',
                    data: {
                        list: ws.fileList
                    },
                    timestamp: Date.now(),
                    status: '请求成功',
                    code: 200,
                    request: message
                }
                break;
            case 'watch':
                console.log('watch');
                // 遍历当前传输列表, 插入该项
                var { list = [], interval = 500 } = msgObj && msgObj.opt;
                console.log(list)
                if (list.length > 0) {
                    let newFile = null;
                    list.forEach(i => {
                        console.log(i);
                        newFile = watched.find(w => w.origin === i.origin);
                        if (!newFile) {
                            newWatched.push(Object.assign(i, { trxed: 0, total: 10000 * Math.random() }))
                        }
                    })
                } else {
                    ws.fileList.map(f => {
                        if (f.trxed < f.total) {
                            newWatched.push(Object.assign(f, { trxed: 0, total: 10000 * Math.random() }))
                        }
                    })
                }
                console.log('heya----------');
                console.log(ws.fileList)
                console.log(newWatched);
                console.log('----------yahe');
                ws.watched = newWatched; //watched.concat(newWatched)
                // ws.watched = [...watched, ...newWatched];
                initTrxQue(newWatched, interval, ws, message)
                break;
            case 'offwatch':
                console.log('offwatch');
                // 遍历当前传输列表, 把该项剔除
                var list = msgObj && msgObj.opt && msgObj.opt.list || [];
                if (list.length === 0) {
                    ws.cnt = ws.amt;
                    ws.watched = [];
                } else {
                    let offwatched = [];
                    list.forEach(i => {
                        offwatched = watched.find(w => w.origin === i.origin);
                    })
                    let cnt = 0;
                    let amt = 0;
                    watched.forEach(w => {
                        let onwatched = list.find(i => w.origin !== i.origin);
                        if (onwatched) {
                            newWatched.push(onwatched)
                            ++amt;
                            if (onwatched.trxed === onwatched.total) {
                                ++cnt;
                            }
                        }
                    })
                    initTrxQue(newWatched, interval, ws, message);
                }
                break;
            case 'close':
                console.log('close: ');
                break;
            default:
                console.log(message);
                break;
        }
        if (ret) {
            ws.send(JSON.stringify(ret));
        }

    });
    // ws.on('message', );
    ws.on('close', () => {
        // conns.delete(ws);
        console.log('closing')
    });
}));

const PORT = process.env.PORT || 3333

wsapp.listen(PORT, () => {
    console.log('Server started listening on port:' + PORT);
});


function initTransfer() {
    let i = 0;
    return {
        mockTransfer: function (ws) {
            let itv = setInterval(function () {
                if (i < 10) {
                    ws.send(getProgress(i));
                    i++;
                } else {
                    clearInterval(itv);
                }
            })
        },
        getStatus: function () {
            return getProgress(i);
        }
    }
}

function getProgress(i) {
    return i * 10 + '%';
}

// function create(cmd = 'message', opt, msg) {
//     let ret = Object.assign({}, tmp, { cmd, opt, msg });
//     console.log(ret);
//     return JSON.stringify(ret);
// }

function initTrxQue(watchedFileList, interval, ws, message = '') {
    console.log(watchedFileList);
    clearTimeout(ws.timer);
    ws.amt = watchedFileList.length || 0;

    if (ws.amt <= 0) {
        return null;
    }
    ws.cnt = 0;
    heartBeat();

    function heartBeat() {
        ws.timer = setTimeout(function () {
            watchedFileList.map(f => {
                let percent = f.trxed / f.total;

                let untrxed = f.total - f.trxed;
                if (percent < 0.95) {
                    f.trxed += untrxed / 10
                } else {
                    f.trxed = f.total;
                    ws.cnt++;
                }
            });
            let ret =
            {
                cmd: 'watch',
                data: {
                    list: watchedFileList
                },
                interval: 500,
                timestamp: Date.now(),
                status: '请求成功',
                code: 200,
                request: message
            }
            ws.send(JSON.stringify(ret));
            if (ws.cnt < ws.amt) {
                heartBeat();
            }
        }, interval)
    }
}