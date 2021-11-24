const { SlashCommandBuilder } = require("@discordjs/builders");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  data: new SlashCommandBuilder().setName("roll").setDescription("rolls a d6!"),
  async execute(interaction) {
    await interaction.reply(`Rolled a ${getRandomInt(1, 6)}`);
  },
};
