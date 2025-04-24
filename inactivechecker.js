const admin = require('firebase-admin'); 
const db = admin.database();
const inactiveRef = db.ref("inactiveUsers");

function checkInactives(client, guildID) {
  setInterval(async () => {
    try {
      const snapshot = await inactiveRef.once("value");
      const now = new Date();

      snapshot.forEach(async (child) => {
        const userId = child.key;
        const data = child.val();
        const untilDate = new Date(data.until);

        if (now >= untilDate) {
          try {
            const guild = client.guilds.cache.get(guildID);
            if (!guild) return;

            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) return;

            const currentNick = member.nickname || member.user.username;
            const updatedNick = currentNick.replace(/\s*IN$/, '');

            if (currentNick !== updatedNick) {
              await member.setNickname(updatedNick);
            }

            await inactiveRef.child(userId).remove();
            console.log(`Restored nickname for ${userId}`);
          } catch (err) {
            console.error(`Failed to restore nickname for ${userId}:`, err.message);
          }
        }
      });
    } catch (error) {
      console.error('Failed to check inactives:', error.message);
    }
  }, 5 * 60 * 1000); 
}

module.exports = checkInactives;
