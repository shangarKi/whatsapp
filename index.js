const venom = require('venom-bot');
const axios  = require('axios');
const express = require('express');

const app = express();
app.get('/', (_, res) => res.send('OK')); // Ping for Railway
app.listen(process.env.PORT || 3000);

// Your live webhook URL
const N8N_WEBHOOK = 'https://primary-production-cd26.up.railway.app/webhook/whatsapp-ai';

venom
  .create({
    session: 'waibot',
    headless: true,
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    updatesLog: false,
    disableWelcome: true
  })
  .then(start)
  .catch(err => console.error('Venom init error →', err));

async function start(client) {
  client.onMessage(async (message) => {
    if (!message.isGroupMsg && message.body) {
      try {
        const { data } = await axios.post(N8N_WEBHOOK, {
          message: message.body,
          from: message.from
        });
        await client.sendText(message.from, data.reply);
      } catch (e) {
        console.error('Webhook/AI error →', e.message);
        await client.sendText(message.from, 'Bot error occurred.');
      }
    }
  });
}
