require('arraync');
const Jtr = require('json-token-replace');
const syscoin = require('@syscoin/syscoin-js');
const rp = require('request-promise');
const jtr = new Jtr();

const config = require('./config');

const syscoinClient = new syscoin.SyscoinRpcClient({host: config.syscoin.host, rpcPort: config.syscoin.port, username: config.syscoin.user, password: config.syscoin.pass});

async function sendMail(mailer, message, tokenObj = null) {
  console.log('sendmail');
  message.to = config.notify_email;
  message.from = config.sender_email;
  if (tokenObj) {
    message.subject = jtr.replace(tokenObj, message.subject);
    message.text = jtr.replace(tokenObj, message.text);
    message.html = jtr.replace(tokenObj, message.html);
  }
  console.log("message:", JSON.stringify(message));

  try {
    let info = await mailer.sendMail(message);
    console.log('sendmail result', info);
  } catch (e) {
    console.log(e);
  }
}

async function checkEthereumSuperblockContract(mailer) {
  //determine fromBlock for ethLogs call based on local geth data
  let localGethHeight = await getLocalEthereumChainHeight();
  localGethHeight = localGethHeight.geth_current_block;

  //get sb contract data
  let remote = await getRemoteEthereumSuperblockContract(localGethHeight - config.eth_block_threshold);

  //get block height of last tx
  let lastSbTxHeight;
  try {
    lastSbTxHeight = parseInt(remote.result[remote.result.length - 1].blockNumber, 16);
  }catch(e) {
    console.log("Error getting remote height, response was:", remote);
  }


  if (remote.result.length === 0 || (localGethHeight - lastSbTxHeight) >= config.eth_block_threshold) {
    console.log('Eth SB contract has fallen behind!');
    console.log('Local chain:', localGethHeight);
    console.log('Last tx height chain:', lastSbTxHeight);
    const tokenObj = {
      local: JSON.stringify(localGethHeight),
      remote: JSON.stringify(lastSbTxHeight)
    };
    await sendMail(mailer, require('./messages/agent_eth_chain_height'), tokenObj);
    process.exit(0);
  } else {
    let diff = localGethHeight - lastSbTxHeight;
    console.log(`Eth height within threshold, local/remote height difference: ${diff}`);
    console.log('Local chain:', localGethHeight);
    console.log('Last tx height chain:', lastSbTxHeight);
  }
}

async function getLocalEthereumChainHeight() {
  try {
    return await syscoinClient.callRpc("getblockchaininfo", []).call();
  } catch (e) {
    console.log("ERR getChainTips", JSON.stringify(e.response.data.error));
  }
}

function configMailer(config) {
  let result = {
    host: config.smtp.host,
    secure: config.smtp.secure,
    port: config.smtp.port
  };

  // if we have non-empty auth, use it
  if (config.smtp.auth.user !== '' && config.smtp.auth.pass !== '') {
    result.auth = config.smtp.auth;
  }

  // if not secure
  if (!config.smtp.secure) {
    result.tls = {
      rejectUnauthorized: false
    };
  }

  return result;
}

async function getRemoteEthereumSuperblockContract(fromBlock) {
  const options = {
    uri: `${config.infura_api}`,
    method: 'POST',
    body: {
      "jsonrpc": "2.0",
      "method": "eth_getLogs",
      "params": [{
        "address": "0xd03a860F481e83a8659640dC75008e9FcDF5d879",
        "fromBlock": '0x' + fromBlock.toString(16)
      }],
      "id": 1
    },
    json: true // Automatically parses the JSON string in the response
  };

  return await rp(options);
}


module.exports = {
  sendMail,
  checkEthereumSuperblockContract,
  configMailer
};
