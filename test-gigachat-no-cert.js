const https = require('https');

console.log('Testing Gigachat OAuth without certificate...');

const options = {
  hostname: 'ngw.devices.sberbank.ru',
  port: 9443,
  path: '/api/v2/oauth',
  method: 'POST',
  rejectUnauthorized: false, // Отключаем проверку сертификата для теста
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'RqUID': 'test-' + Date.now(),
    'Authorization': 'Basic MDE5OTgyNGItNGMxZS03ZWYxLWI0MjMtYmIzMTU2ZGRlY2VlOjQ2OTkxY2ViLWU4MzEtNGIxYS1iNjNhLTI1ZDE4YTM3ZDVjNw=='
  }
};

const postData = 'scope=GIGACHAT_API_PERS';

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response body:', data);
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed response:', jsonData);
    } catch (e) {
      console.log('Response is not JSON');
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(postData);
req.end();
