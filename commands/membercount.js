const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
const group = parseInt(process.env.GROUP);
require('dotenv').config();


module.exports = {
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('Get the current member count of the Roblox group'),

  async execute(interaction) {
    try {
      const groupInfo = await noblox.getGroup(group);
      const memberCount = groupInfo.memberCount;
      const discordMembers = interaction.guild.memberCount;

      await interaction.reply(`The Roblox group currently has **${memberCount}** members.\nThe discord server currently has **${discordMembers}** members!`);
    } catch (error) {
      console.error('Error fetching member count:', error);
      await interaction.reply({ content: 'Failed to fetch member count.', ephemeral: true });
    }
  },
};

