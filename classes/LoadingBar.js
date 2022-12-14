import rdl from 'readline';

export class LoadingBar {
    static ID = 0;
    static SIZE = 50;

    constructor() {
        this.id = 3 * LoadingBar.ID++;
        this.progress = 0;

        this.reset();
    }

    reset() {
        this.progress = 0;
        rdl.cursorTo(process.stdout, 0, this.id + 2);
        rdl.clearLine(process.stdout, 0);
        for (let i = 0; i < LoadingBar.SIZE; i++) {
            process.stdout.write('\u2591')
        }
    }

    updateProgress(string, ratio) {
        this.writeProgressStatus(string);
        this.writeProgressPercentage(ratio);

        const newProgress = Math.floor(ratio * LoadingBar.SIZE);
        rdl.cursorTo(process.stdout, this.progress, this.id + 2);
        for (let i = this.progress; i < newProgress; i++) {
            process.stdout.write('\u2588')
        }
        this.progress = newProgress;

        this.moveCursorToEnd();
    }

    writeProgressStatus(string) {
        rdl.cursorTo(process.stdout, 0, this.id + 1);
        rdl.clearLine(process.stdout, 0);
        process.stdout.write(string);
    }

    writeProgressPercentage(ratio) {
        rdl.cursorTo(process.stdout, LoadingBar.SIZE + 1, this.id + 2);
        process.stdout.write(`${Math.floor(ratio * 100)}%`);
    }

    moveCursorToEnd() {
        rdl.cursorTo(process.stdout, 0, LoadingBar.ID + 4);
    }
}
