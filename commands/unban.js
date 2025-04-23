const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
require('dotenv').config();
const admin = require('firebase-admin');
const errormessage = process.env.ERROR;
const ED = process.env.ED;
const SR = process.env.SR;
const log = process.env.LOG;


const firebaseKey = require('../firebase-key.json');


const db = admin.database();
const blacklistRef = db.ref("blacklists");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban someone permanently from the game')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Roblox username only')
        .setRequired(true)
    ),

  async execute(interaction) {
    const robloxUser = interaction.options.getString('username');
    let reason = interaction.options.getString('reason');
    const authorID = interaction.member?.nickname || interaction.user.tag;

    

    if (!reason) {
      reason = 'No reason provided.';
    }

    if (!interaction.member.roles.cache.has(SR) && !interaction.member.roles.cache.has(ED)) {
      return interaction.reply({ content: errormessage, ephemeral: true });
    }

    try {
      const robloxID = await noblox.getIdFromUsername(robloxUser);
      let rank = await noblox.getRankNameInGroup(parseInt(process.env.GROUP), robloxID)

      const userRef = blacklistRef.child(robloxID);
      const snapshot = await userRef.once("value");

      if (robloxID == 326671671) {
        return interaction.reply(`This user cannot be unbanned banned`)
      }
      
      if (snapshot.exists()) {
        await userRef.remove();
      } else {
        interaction.reply(`**${robloxUser}** (<https://www.roblox.com/users/${robloxID}/profile>) isn't banned.`)
        return
      }
    

      await interaction.reply(
        `**${robloxUser}** (<https://www.roblox.com/users/${robloxID}/profile>) has been unbanned banned from Otaru`
      );

      const channel = await interaction.client.channels.fetch(log);
      if (channel) {
        await channel.send(
          `**${robloxUser}** has been unbanned banned from Otaru.\n\`\`\`\nUsername: ${robloxUser} (${robloxID})\nUnbanned by: ${authorID}\n\`\`\``
        );
      }
    } catch (error) {
      console.error("Error getting Roblox ID:", error);
      await interaction.reply("Invalid Roblox username or user not found.");
    }
  }
};
