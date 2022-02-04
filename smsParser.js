
class SMSParser {
    constructor(options) {
        this.port = options.port;
        this.debug = options.debug;
        this.smsInterval = 20 * 1000;

        this.incomingSMS = false;
        this.isCMGLCommand = false;
        this.sms = [];
        this.previousLine = '';
    }

    parse = (line) => {
        if (Buffer.from(line).toString('hex') == '0d') return;
        // if (this.debug) {
        //     console.log('RX : ' , line);
        //     console.log('BUFFER : ',  Buffer.from(line));
        // }


        switch (line) {
            case 'status=READY\r':
                console.log('MODULE READY.');
                this.port.write('AT+CMGL="ALL"');
                setInterval(() => {
                    this.port.write('AT+CMGL="ALL"');
                }, this.smsInterval)
                break;
            case 'AT+CMGL="ALL"\r':
                console.log('START RECV SMS');
                this.sms = [];
                this.incomingSMS = true;
                break;
            default:
                if (this.incomingSMS) {
                    if (this.line == '\r') return;
                    if (line === "OK\r") {
                        this.incomingSMS = false;
                        
                        console.log('DONE RECV SMS');
                        this.formatSMS();
                    }

                    if (line.substring(0,5) == "+CMGL") {
                        this.previousLine = line;
                    } else {
                        let parsedHeader = this.parseSMSHeader(this.previousLine);
                        this.sms.push ({
                            header : this.previousLine,
                            sender : parsedHeader.sender,
                            timeStamp : parsedHeader.timeStamp,
                            message : line
                        });
                    }
                }
                break;
        }
    };

    parseSMSHeader = (headerString) => {
        let header = headerString.replace(/(\r\n|\n|\r)/gm, '');
        header = header.replaceAll('\"', '');
        header = header.split(',');

        return {
            sender : header[2],
            timeStamp : `${header[4]} ${header[5]}`
        }
    };

    formatSMS = () => {
        console.log('---------- SMS ----------');
        for (let i = 0; i < this.sms.length; i++) {
            // let header = this.sms[i].header.split(",");
            // console.log(header);

            console.log(`${this.sms[i].sender} ${this.sms[i].timeStamp} - ${this.sms[i].message}`)
        }
        console.log('-------------------------');
    }
}

module.exports = SMSParser;