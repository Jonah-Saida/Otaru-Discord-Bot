const noblox = require('noblox.js');

let lastCount = null;

module.exports = async function startRobloxAutoTracker(client) {
  const groupId = parseInt(process.env.GROUP);
  const channel = await client.channels.fetch(process.env.MEMBERC);

  async function checkMemberCount() {
    try {
      const info = await noblox.getGroup(groupId);
      const currentCount = info.memberCount;

      if (lastCount === null) {
        lastCount = currentCount;
        await channel.send(`**Otaru** currently has ${currentCount} members!`);
      } else if (currentCount > lastCount) {
        lastCount = currentCount;
        await channel.send(`**Otaru** currently has ${currentCount} members!`);
      }
    } catch (err) {
      console.error("Error checking Roblox group:", err);
    }
  }

  // Run every 5 minutes
  setInterval(checkMemberCount, 120000);
  await checkMemberCount();
};
