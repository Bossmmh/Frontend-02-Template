class TrunkedBodyParser {
    constructor() {
        this.WAITING_LENGTH = 0;
        this.WAITING_LENGTH_END = 1;
        this.READING_CHUNK = 2;
        this.WAITING_NEW_LINE = 3;
        this.WAITING_NEW_LINE_END = 4;
        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.currentStatus = this.WAITING_LENGTH;
    }

    receive(char) {
        if (this.currentStatus === this.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true;
                }
                this.currentStatus = this.WAITING_LENGTH_END;
            } else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if (this.currentStatus === this.WAITING_LENGTH_END) {
            if (char === '\n' && !this.isFinished) {
                this.currentStatus = this.READING_CHUNK;
            }
        } else if (this.currentStatus === this.READING_CHUNK) {
            this.content.push(char);
            this.length--;
            if (this.length === 0) {
                this.currentStatus = this.WAITING_NEW_LINE;
            }
        } else if (this.currentStatus === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.currentStatus = this.WAITING_NEW_LINE_END;
            }
        } else if (this.currentStatus === this.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.currentStatus = this.WAITING_LENGTH;
            }
        }
    }
}

module.exports = TrunkedBodyParser;