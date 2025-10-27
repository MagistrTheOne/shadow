const axios = require('axios');
const https = require('https');

console.log('Testing Gigachat OAuth with exact curl format...');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const testOAuth = async () => {
  try {
    // Используем точно такой же формат как в curl
    const response = await axios.post('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', 
      'scope=GIGACHAT_API_PERS',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'RqUID': 'b911b495-028f-4427-8fd4-8ec3057864dc', // Используем тот же RqUID что в документации
          'Authorization': 'Basic MDE5OTgyNGItNGMxZS03ZWYxLWI0MjMtYmIzMTU2ZGRlY2VlOjQ2OTkxY2ViLWU4MzEtNGIxYS1iNjNhLTI1ZDE4YTM3ZDVjNw=='
        },
        httpsAgent
      }
    );

    console.log('Success! Token:', response.data.access_token);
    console.log('Expires at:', response.data.expires_at);
    
    // Теперь попробуем получить модели
    const modelsResponse = await axios.get('https://gigachat.devices.sberbank.ru/api/v1/models', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${response.data.access_token}`
      },
      httpsAgent
    });
    
    console.log('Models:', JSON.stringify(modelsResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

testOAuth();
