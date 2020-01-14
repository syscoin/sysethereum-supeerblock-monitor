module.exports = {
  subject: `ACTION REQUIRED: No events on superblock contract since {{remote}}`,
  text: `The ETH SB chain appears to have stalled. Action may be required!\n Local height: {{local}} \n Last SB TX height: {{remote}}`,
  html: `<p>The ETH SB chain appears to have stalled. Action may be required!</p>
         <p><b>Local height:</b> {{local}}</p>
         <p><b>Last SB TX height:</b> {{remote}}</p>`
};
