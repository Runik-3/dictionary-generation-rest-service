// eslint-disable-next-line class-methods-use-this
const gc = (): void => {
    try {
        if (global.gc) {
            global.gc();
        }
    } catch (e) {
        console.log('`--expose-gc` not passed the process');
        process.exit();
    }
};

export default gc;
