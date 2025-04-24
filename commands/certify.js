const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('certify')
    .setDescription('certify a staff member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('user to certify')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('certificate')
        .setDescription('message')
        .setRequired(true)
        .addChoices(
          { name: 'Entertainer', value: "1364883039192350784" },
          { name: 'Host', value: "1344215406101008425"}
        )
    ),
    async execute(interaction) {
      const member = interaction.options.getMember('user');
      const roleID = interaction.options.getString('certificate');
      const role = interaction.guild.roles.cache.get(roleID);
      const userName = member.nickname || member.user.username
  
      if (!role) {
        return interaction.reply({ content: "Role not found.", ephemeral: true });
      }
  
      try {
        await member.roles.add(role);
        await interaction.reply({
          content: `Certified  ${userName} as **${role.name}**.`,
          ephemeral: true
        });
      const log = process.env.LOG;
      const channel = await interaction.client.channels.fetch(log);
      const authorID = interaction.member?.nickname || interaction.user.tag;

      if (channel) {
        await channel.send(
          `**${userName}** has been certified: ${role.name} by **${authorID}**`
        );
      }
      } catch (error) {
        console.error("Error assigning role:", error);
        await interaction.reply({
          content: `Failed to assign role: ${error.message}`,
          ephemeral: true
        });
      }
    }
  };
