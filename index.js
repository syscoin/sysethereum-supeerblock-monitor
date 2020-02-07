const nodemailer = require('nodemailer');
const os = require('os');
const io = require('socket.io')(9991);

const config = require('./config');
const utils = require('./utils');

let mailConfig = utils.configMailer(config);
let transporter = nodemailer.createTransport(mailConfig);
let checkInterval;
console.log('Sysethereum sb monitor started.');

async function checkForAlerts(mailer) {
  await utils.checkEthereumSuperblockContract(mailer, io);
}

checkInterval = setInterval(checkForAlerts, config.interval * 1000, transporter);




