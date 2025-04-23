const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
require('dotenv').config();
const admin = require('firebase-admin');
const firebaseKey = require('../firebase-key.json');

const errormessage = process.env.ERROR;
const HR = process.env.HR;
const SR = process.env.SR;



const db = admin.database();
const activityRef = db.ref("activity");

async function getActivity(interaction, robloxID) {
  const userRef = activityRef.child(robloxID.toString());
  const snapshot = await userRef.once("value");

  if (snapshot.exists()) {
    const data = snapshot.val();
    const minuteData = data.minutes || 0;
    const username = await noblox.getUsernameFromId(robloxID);

    return interaction.reply(
      `**${username}** (<https://www.roblox.com/users/${robloxID}/profile>) currently has **${minuteData}** minutes.`
    );
  } else {
    const username = await noblox.getUsernameFromId(robloxID);
    return interaction.reply(
      `No activity data found for **${username}** (<https://www.roblox.com/users/${robloxID}/profile>).`
    );
  }
}

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
      const rankID = await noblox.getRankInGroup(parseInt(process.env.GROUP), robloxID);

      if (rankID <= 242) {
        return interaction.reply({
          content: `**${robloxUser}** holds an insufficient rank to be activity tracked.`,
          ephemeral: true
        });
      }

      await getActivity(interaction, robloxID);

    } catch (error) {
      console.error("Error getting Roblox ID or activity data:", error);
      await interaction.reply("Invalid Roblox username or an error occurred.");
    }
  }
};
