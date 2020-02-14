const app = require('express')();
const cors = require('cors')
const nodemailer = require('nodemailer');

const config = require('./config');
const utils = require('./utils');

let mailConfig = utils.configMailer(config);
let transporter = nodemailer.createTransport(mailConfig);

app.use(cors())

app.get('/status', async (req, res) => {
  const status = await utils.checkEthereumSuperblockContract(transporter);

  return res.send({ ...status });
});

app.listen(config.port);

console.log('Sysethereum sb monitor started.');
