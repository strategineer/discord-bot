const CHANNEL_ID_SECRET = "913113539726700584";

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return undefined;
    if (message.channelId != CHANNEL_ID_SECRET) {
      const channel = await message.client.channels.fetch(CHANNEL_ID_SECRET);
      await channel.send(message.content);
    }
  },
};
