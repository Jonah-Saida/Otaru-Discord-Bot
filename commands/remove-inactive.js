const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
const axios = require('axios');
require('dotenv').config();
const admin = require('firebase-admin');
const firebaseKey = require('../firebase-key.json');

const db = admin.database();
const inactiveRef = db.ref("inactiveUsers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('endinactive')
    .setDescription('Remove an inactivity notice early')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to revoke notice for')
        .setRequired(true)
    ),

  async execute(interaction) {

    if (!interaction.member.roles.cache.has(HR) && !interaction.member.roles.cache.has(SR)) {
      return interaction.reply({ content: errormessage, ephemeral: true });
    }

    try {
      const discordUser = interaction.options.getUser('user');
      const userID = discordUser.id;

      const userRef = inactiveRef.child(userID);
      const snapshot = await userRef.once("value");

      if (!snapshot.exists()) {
        return interaction.reply({
          content: 'That user is not on inactivity notice.',
          ephemeral: true
        });
      }

      const member = await interaction.guild.members.fetch(userID);
      const currentNick = member.nickname || member.user.username;
      const cleaned = currentNick.replace(/\s*IN$/, '');

      if (currentNick !== cleaned) {
        await member.setNickname(cleaned);
      }

      await userRef.remove();

      await interaction.reply({
        content: `Inactivity notice for **${member.nickname}** has been removed.`,
        ephemeral: true
      });

    } catch (err) {
      console.error("Error in /endinactive:", err);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while trying to end the inactivity notice.',
          ephemeral: true
        });
      }
    }
  }
};

