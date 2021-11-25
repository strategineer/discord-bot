const { SlashCommandBuilder } = require("@discordjs/builders");

const { helpUrl } = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Need some help?"),
  async execute(interaction) {
    await interaction.reply(
      `Never played Everyone is John before? Here's some quick instructions: [${helpUrl}](${helpUrl})!`
    );
  },
};
