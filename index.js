import venom from 'venom-bot';
import axios from 'axios';
import express from 'express';

/* ───────────────────────────────────────────────
   1. Tiny Express server → keeps Railway happy
   ─────────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;
const app  = express();
app.get('/', (_, res) => res.send('WA bot live'));
app.listen(PORT, () => console.log(`Health‑check on ${PORT}`));

/* ───────────────────────────────────────────────
   2. Env vars
   ─────────────────────────────────────────────── */
const WEBHOOK_URL  = process.env.N8N_WEBHOOK;        // set in Railway > Variables
const CHROME_PATH  = process.env.CHROMIUM_PATH;      // set by Dockerfile

if (!WEBHOOK_URL) {
  console.error('❌  N8N_WEBHOOK env var missing'); // fail fast
  process.exit(1);
}

/* ───────────────────────────────────────────────
   3. Launch Venom
   ─────────────────────────────────────────────── */
venom
  .create({
    session: 'waibot',
    headless: true,
    executablePath: CHROME_PATH || undefined,        // use system Chrome
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    disableWelcome: true,
    updatesLog: false
  })
  .then(start)
  .catch(err => console.error('Venom init error →', err));

/* ───────────────────────────────────────────────
   4. Bot logic
   ─────────────────────────────────────────────── */
function start(client) {
  console.log('✅ Venom client ready');

  client.onMessage(async message => {
    if (!message.isGroupMsg && message.body) {
      try {
        // Forward the text to your n8n webhook
        const { data } = await axios.post(WEBHOOK_URL, {
          message: message.body,
          from:    message.from,
          sender:  message.sender?.pushname || ''
        });

        // Send back n8n’s reply (if any)
        if (data?.reply) {
          await client.sendText(message.from, data.reply);
        }
      } catch (e) {
        console.error('Webhook error →', e.message);
        await client.sendText(message.from, '❌ Bot error.');
      }
    }
  });
}
