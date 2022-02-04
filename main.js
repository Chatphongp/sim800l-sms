const SerialPort = require('serialport')
require('dotenv').config()
const SMSParser = require('./smsParser');


const Readline = SerialPort.parsers.Readline
const port = new SerialPort(process.env.SERIAL_PORT , {
    baudRate: 9600
});
const parser = new Readline()
port.pipe(parser);

const smsParser = new SMSParser({
    port : port,
    debug : process.env.DEBUG
});
parser.on('data', smsParser.parse)
port.write('ROBOT PLEASE RESPOND\n')
// ROBOT ONLINE
