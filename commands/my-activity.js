const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
require('dotenv').config();
const admin = require('firebase-admin');
const firebaseKey = require('../firebase-key.json');
const axios = require('axios');

const errormessage = process.env.ERROR;
const HR = process.env.HR;
const SR = process.env.SR;
const MR = process.env.MR;

const db = admin.database();
const activityRef = db.ref("activity");

async function getActivity(interaction, robloxID) {
  const userRef = activityRef.child(robloxID.toString());
  const snapshot = await userRef.once("value");

  const username = await noblox.getUsernameFromId(robloxID);

  if (snapshot.exists()) {
    const data = snapshot.val();
    const minuteData = data.minutes || 0;

    return interaction.reply({
      content: `**${username}** (<https://www.roblox.com/users/${robloxID}/profile>) currently has **${minuteData}** minutes.`,
      ephemeral: true
    });
  } else {
    return interaction.reply({
      content: `No activity data found for **${username}** (<https://www.roblox.com/users/${robloxID}/profile>).`,
      ephemeral: true
    });
  }
}

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
    .setName('myactivity') 
    .setDescription('Get the activity of yourself'),

  async execute(interaction) {
    const authorID = interaction.member.user.id;
    const robloxID = await getRobloxID(authorID);

    if (!robloxID) {
      return interaction.reply({ content: "Unable to retrieve your Roblox ID.", ephemeral: true });
    }

    if (!interaction.member.roles.cache.has(MR) && !interaction.member.roles.cache.has(HR) && !interaction.member.roles.cache.has(SR)) {
      return interaction.reply({ content: errormessage, ephemeral: true });
    }

    try {
      const rankID = await noblox.getRankInGroup(parseInt(process.env.GROUP), robloxID);

      if (rankID <= 242) {
        const username = await noblox.getUsernameFromId(robloxID);
        return interaction.reply({
          content: `**${username}** holds an insufficient rank to be activity tracked.`,
          ephemeral: true
        });
      }

      await getActivity(interaction, robloxID);

    } catch (error) {
      console.error("Error getting Roblox ID or activity data:", error);
      await interaction.reply({ content: "Invalid Roblox user or an error occurred.", ephemeral: true });
    }
  }
};
