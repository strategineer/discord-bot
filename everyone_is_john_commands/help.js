const { SlashCommandBuilder } = require("@discordjs/builders");

const { helpUrl } = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Need some help?"),
  async execute(interaction) {
    await interaction.reply(interaction.client.utils.helpMessage());
  },
};
