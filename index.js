const nodemailer = require('nodemailer');
const os = require('os');

const config = require('./config');
const io = require('socket.io')(config.ws_port);
const utils = require('./utils');

let mailConfig = utils.configMailer(config);
let transporter = nodemailer.createTransport(mailConfig);
let checkInterval;
console.log('Sysethereum sb monitor started.');

async function checkForAlerts(mailer) {
  const status = await utils.checkEthereumSuperblockContract(mailer);

  io.sockets.emit('superblockchain', {
    topic: 'superblockchain',
    message: {
      ...status
    }
  });
}

checkInterval = setInterval(checkForAlerts, config.interval * 1000, transporter);




