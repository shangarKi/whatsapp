const venom = require('venom-bot');
const axios  = require('axios');

venom
  .create({
    session:   'waibot',
    headless:  true,                       // set to false if you want to see the browser
    browserArgs: ['--no-sandbox'],
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  })
  .then(start)
  .catch(err => console.error('Venom init error →', err));

async function start(client) {
  client.onMessage(async (message) => {
    if (!message.isGroupMsg && message.body) {
      try {
        // 👇  production URL — matches the one shown in the Webhook node
        const { data } = await axios.post(
          'http://localhost:5678/webhook/whatsapp-ai',
          { message: message.body }
        );
        await client.sendText(message.from, data.reply);
      } catch (e) {
        console.error('Webhook/AI error →', e.message);
        await client.sendText(message.from, 'Bot error occurred.');
      }
    }
  });
}
