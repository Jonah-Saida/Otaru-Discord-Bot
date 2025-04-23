const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
require('dotenv').config();

const errormessage = process.env.ERROR;
const HR = process.env.HR;
const SR = process.env.SR;
const log = process.env.LOG;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban someone permanently from the game')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Roblox username only')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false)
    ),

  async execute(interaction) {
    const robloxUser = interaction.options.getString('username');
    let reason = interaction.options.getString('reason');
    const authorID = interaction.member?.nickname || interaction.user.tag;

    if (!reason) {
      reason = 'No reason provided.';
    }

    if (!interaction.member.roles.cache.has(HR) && !interaction.member.roles.cache.has(SR)) {
      return interaction.reply({ content: errormessage, ephemeral: true });
    }

    try {
      const robloxID = await noblox.getIdFromUsername(robloxUser);

      await interaction.reply(
        `**${robloxUser}** (https://www.roblox.com/users/${robloxID}/profile) has been permanently banned from Otaru.\n> **Reason**: ${reason}`
      );

      const channel = await interaction.client.channels.fetch(log);
      if (channel) {
        await channel.send(
          `**${robloxUser}** has been permanently banned from Otaru.\n\`\`\`\nUsername: ${robloxUser} (${robloxID})\nReason: ${reason}\nBanned by: ${authorID}\n\`\`\``
        );
      }
    } catch (error) {
      console.error("Error getting Roblox ID:", error);
      await interaction.reply("Invalid Roblox username or user not found.");
    }
  }
};
