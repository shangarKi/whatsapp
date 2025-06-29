const venom = require('venom-bot');
const axios  = require('axios');

const N8N_URL = process.env.N8N_WEBHOOK_URL;  

venom
  .create({
    session:   'waibot',
    headless:  true,
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
   
  })
  .then(start)
  .catch(err => console.error('Venom init error →', err));

async function start(client) {
  client.onMessage(async (message) => {
    if (!message.isGroupMsg && message.body) {
      try {
        const { data } = await axios.post(
          N8N_URL,
          { message: message.body, user: message.from }
        );
        await client.sendText(message.from, data.reply || 'No AI reply.');
      } catch (e) {
        console.error('Webhook/AI error →', e.message);
        await client.sendText(message.from, 'Bot error occurred.');
      }
    }
  });
}
