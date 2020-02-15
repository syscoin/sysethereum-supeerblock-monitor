const app = require('express')();
const cors = require('cors');
const nodemailer = require('nodemailer');

const config = require('./config');
const utils = require('./utils');

let mailConfig = utils.configMailer(config);
let transporter = nodemailer.createTransport(mailConfig);
let checkInterval;

async function checkForAlerts(mailer) {
  return await utils.checkEthereumSuperblockContract(mailer);
}

// start passively checking for uptime
checkInterval = setInterval(checkForAlerts, config.interval * 1000, transporter);

// enable a webserver for proactive status checks
app.use(cors());

app.get('/status', async (req, res) => {
  const status = await checkForAlerts(transporter);
  return res.send({ ...status });
});

app.listen(config.port);
console.log(`Sysethereum sb monitor started on port ${config.port}`);
