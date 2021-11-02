import fs from 'fs';

export default class IOHandler {
    static createDir(dir: string): void {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }

    static createDirs(dirs: string[]): void {
        dirs.forEach(dir => {
            IOHandler.createDir(dir);
        });
    }

    static dirExists(dir: string): boolean {
        return fs.existsSync(dir);
    }
}
