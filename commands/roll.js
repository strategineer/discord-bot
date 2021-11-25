const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("rolls a d6!")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("The number of willpower to spend on this roll")
    ),
  async execute(interaction) {
    willpowerBonus = interaction.options.getInteger("number");
    if (willpowerBonus !== null) {
      currentWillpower = interaction.client.utils.getWillpower(
        interaction.user
      );
      if (willpowerBonus > currentWillpower) {
        await interaction.reply(`You only have ${currentWillpower}!`);
        return;
      }
    }
    roll = interaction.client.utils.rollD(6);
    if (willpowerBonus === null) {
      await interaction.reply(`Rolled a ${roll} with a d6`);
    } else {
      newWillpower = currentWillpower - willpowerBonus;
      interaction.client.utils.setWillpower(interaction.user, newWillpower);
      await interaction.reply(
        `Rolled a ${
          roll + willpowerBonus
        } with a d6 + ${willpowerBonus} willpower. ${
          interaction.user
        } now have ${newWillpower} willpower left.`
      );
    }
  },
};
