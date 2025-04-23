const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
require('dotenv').config(); // Make sure this line is at the top if not already

const errormessage = process.env.ERROR;
const HR = process.env.HR;
const SR = process.env.SR;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activity')
    .setDescription('Get the activity of a staff member')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Roblox username only')
        .setRequired(true)
    ),
  async execute(interaction) {
    const robloxUser = interaction.options.getString('username');

    if (!interaction.member.roles.cache.has(HR) && !interaction.member.roles.cache.has(SR)) {
      return interaction.reply({ content: errormessage, ephemeral: true });
    }

    try {
      const robloxID = await noblox.getIdFromUsername(robloxUser);
      const rankID = await noblox.getRankInGroup(process.env.GROUP, robloxID)
      if (rankID <= 242) {
        return interaction.reply({content: `An error has occurred: **${robloxUser}** holds the insufficient rank to be activity tracked.`})
      }
      await interaction.reply(`**${robloxUser}** (https://www.roblox.com/users/${robloxID}/profile) currently has **0** minutes.`);
    } catch (error) {
      console.error("Error getting Roblox ID:", error);
      await interaction.reply("Invalid Roblox username or user not found.");
    }
  }
};
