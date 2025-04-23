// commands/echo.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activity')
    .setDescription('get the activity of a staff member')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('roblox username only')
        .setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString('username'); // not 'username'
    await interaction.reply('This command is not enabled yet.. try again later!');
  }
};

