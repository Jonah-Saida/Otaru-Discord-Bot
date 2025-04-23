// commands/echo.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('repeat message')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('message')
        .setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString('message'); // not 'username'
    await interaction.reply(message);
  }
};


