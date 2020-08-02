const TrunkedBodyParser = require('./trunkedBodyParser');

class ResponseParser {
    constructor() {
        this.WAITING_STATUS_LINE = 0;
        this.WAITING_STATUS_LINE_END = 1;
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WATITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        this.WAITING_BODY = 7;
        this.currentStatus = this.WAITING_STATUS_LINE;
        this.statusLine = '';
        this.headers = {};
        this.headerName = '';
        this.headerValue = '';
    }

    receive(str) {
        for (let i = 0, length = str.length;i < length;i++) {
            this.receiveChar(str.charAt(i));
        }
    }

    receiveChar(char) {
        if (this.currentStatus === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.currentStatus = this.WAITING_STATUS_LINE_END;
            } else {
                this.statusLine += char;
            }
        } else if (this.currentStatus === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.currentStatus = this.WAITING_HEADER_NAME;
            }
        } else if (this.currentStatus === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.currentStatus = this.WAITING_HEADER_SPACE;
            } else if (char === '\r') {
                this.currentStatus = this.WAITING_HEADER_BLOCK_END;
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new TrunkedBodyParser();
                }
            } else {
                this.headerName += char;
            }
        } else if (this.currentStatus === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.currentStatus = this.WAITING_HEADER_VALUE;
            }
        } else if (this.currentStatus === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.currentStatus = this.WATITING_HEADER_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            } else {
                this.headerValue += char;
            }
        } else if (this.currentStatus === this.WATITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.currentStatus = this.WAITING_HEADER_NAME;
            }
        } else if (this.currentStatus === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.currentStatus = this.WAITING_BODY;
            }
        } else if (this.currentStatus === this.WAITING_BODY) {
            this.bodyParser.receive(char);
        }
    }

    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished;
    }

    get response() {
        const statusLine = this.statusLine;
        const statusLineRegExp = /HTTP\/1.1 ([0-9]+) ([\S]+)/;
        const [, statusCode, statusText] = statusLine.match(statusLineRegExp);

        return {
            statusCode,
            statusText,
            headers: this.headers,
            body: this.bodyParser && this.bodyParser.content.join(''),
        }
    }
}

module.exports = ResponseParser;