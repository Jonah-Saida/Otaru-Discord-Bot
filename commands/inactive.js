const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
const axios = require('axios');
require('dotenv').config();
const admin = require('firebase-admin');
const firebaseKey = require('../firebase-key.json');

const db = admin.database();
const inactiveRef = db.ref("inactiveUsers");

async function getRobloxID(userID) {
  try {
    const response = await axios.get(`https://api.blox.link/v4/public/guilds/1287524205482741822/discord-to-roblox/${userID}`, {
      headers: {
       'Authorization': '5824cbab-2b23-4da3-93f0-c94beac1bf68',
      }
    });
    return parseInt(response.data.robloxID);
  } catch (error) {
    console.error('Error fetching Roblox ID from Bloxlink:', error?.response?.data || error.message);
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setinactive')
    .setDescription('File an inactive notice for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to mark inactive')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('until')
        .setDescription('Date inactivity ends (YYYY-MM-DD)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const discordUser = interaction.options.getUser('user');
    const until = interaction.options.getString('until');
    const userID = discordUser.id;

    const member = await interaction.guild.members.fetch(userID);

    const userRef = inactiveRef.child(userID);
    const snapshot = await userRef.once("value");
    if (snapshot.exists()) {
      return interaction.reply({
        content: 'That user already has an inactive notice.',
        ephemeral: true
      });
    }

    const robloxID = await getRobloxID(userID);
    if (!robloxID) {
      return interaction.reply({
        content: 'Failed to fetch Roblox ID.',
        ephemeral: true
      });
    }

    const currentNick = member.nickname || member.user.username;
    if (!currentNick.endsWith('IN')) {
      await member.setNickname(currentNick + ' IN');
    }

    const rank = await noblox.getRankNameInGroup(parseInt(process.env.GROUP), robloxID);

    await userRef.set({
      until: new Date(until).toISOString(),
      rank
    });

    const robloxUserame = await noblox.getUsernameFromId(robloxID)

    await interaction.reply({
      content: `${robloxUserame} is now marked as inactive until ${until}.`,
      ephemeral: true
    });
  }
};

