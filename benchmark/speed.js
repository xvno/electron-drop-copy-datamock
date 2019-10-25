const record = {
    start_time: new Date(),
    trxing: 0,
    trxed: 0,
    acc: 0,
    speed: 0,
    phases: [
        {
            start_time: new Date(),
            speed: 0, // Bytes per second
            trxed: 0,
            trxing: 0,
            acc: 0
        }
    ]
};

const {
    basePath, umount
} = switch (process.platform) {
    case 'win32':
        return require
}