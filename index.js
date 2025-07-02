import venom from 'venom-bot';
import axios from 'axios';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => res.send('WA Bot Live!'));
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

const WEBHOOK_URL = process.env.N8N_WEBHOOK;

venom
  .create({
    session: 'waibot',
    headless: true,
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  .then((client) => {
    client.onMessage(async (message) => {
      if (!message.isGroupMsg && message.body) {
        try {
          const { data } = await axios.post(WEBHOOK_URL, {
            message: message.body,
            from: message.from,
          });
          await client.sendText(message.from, data.reply);
        } catch (err) {
          console.error('Webhook Error:', err.message);
          await client.sendText(message.from, '❌ Bot error.');
        }
      }
    });
  })
  .catch((err) => {
    console.error('Venom init error →', err);
  });
