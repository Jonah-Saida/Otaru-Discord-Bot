// index.js
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const noblox = require('noblox.js');
const { start } = require('repl');

async function startApp () {
    const currentUser = await noblox.setCookie(process.env.COOKIE);
    console.log(`Logged in as ${currentUser.UserName} [${currentUser.UserID}]`)
}

startApp()

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`⚠️ Skipped command in file: ${file}`);
  }
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
});


client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
  }
});

client.login(process.env.TOKEN);
