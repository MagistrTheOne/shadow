const https = require('https');
const fs = require('fs');
const path = require('path');

// Настройка HTTPS агента с сертификатом
const certPath = path.resolve(process.cwd(), 'certs', 'russian_trusted_root_ca_pem.crt');
const httpsAgent = new https.Agent({
  ca: fs.readFileSync(certPath),
});

const options = {
  hostname: 'ngw.devices.sberbank.ru',
  port: 9443,
  path: '/api/v2/oauth',
  method: 'POST',
  agent: httpsAgent,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'RqUID': 'test-123',
    'Authorization': 'Basic MDE5OTgyNGItNGMxZS03ZWYxLWI0MjMtYmIzMTU2ZGRlY2VlOjQ2OTkxY2ViLWU4MzEtNGIxYS1iNjNhLTI1ZDE4YTM3ZDVjNw=='
  }
};

const postData = 'scope=GIGACHAT_API_PERS';

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers:`, res.headers);

  res.on('data', (d) => {
    console.log('Response:', d.toString());
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(postData);
req.end();
