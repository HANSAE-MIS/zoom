const env = process.env.NODE_ENV || 'production'

//insert your API Key & Secret for each environment, keep this file local and never push it to a public repo for security purposes.
// 2023-10-17 백은지 추가 grant_type account_id
const config = {
	development :{
		APIKey : '',
		APISecret : '',
    ZOOM_ACCOUNT_ID: '9xf-UzsySTyUI2S8Yw6fzA',
    ZOOM_CLIENT_ID: 'jcYCmYvmS2qgjss78BA2DQ',
    ZOOM_CLIENT_SECRET: 'rkq5m8bw67B6SxQ5O07YDuSEs9Rwow5R'
	},
	production:{
		APIKey : '-8jDOvR3T1mdZW2WGrYLbQ',
		APISecret : 'jZuc7dWlVB9CdKSdG3XyHaPhpV2YYvZmwtHB',
    ZOOM_ACCOUNT_ID: '9xf-UzsySTyUI2S8Yw6fzA',
    ZOOM_CLIENT_ID: 'jcYCmYvmS2qgjss78BA2DQ',
    ZOOM_CLIENT_SECRET: 'rkq5m8bw67B6SxQ5O07YDuSEs9Rwow5R'
	}
};

module.exports = config[env]

const https = require('https');
const fs = require('fs');
const options = {
  pfx: fs.readFileSync('/Users/ejbaek/Desktop/zoom/hansae.pfx'),
  passphrase: 'hansae',
  minVersion: "TLSv1.2"
};
https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello Secure Page\n');
}).listen(443);
