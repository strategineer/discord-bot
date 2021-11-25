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
    if (interaction.user != interaction.client.snackbox.currentVoice) {
      await interaction.reply({
        content: "You can't roll unless you're in control of John",
        ephemeral: true,
      });
      return;
    }
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
    rollMsg = undefined;
    if (willpowerBonus === null) {
      rollMsg = `Rolled a ${roll} with a d6`;
    } else {
      newWillpower = currentWillpower - willpowerBonus;
      interaction.client.utils.setWillpower(interaction.user, newWillpower);
      rollMsg = `Rolled a ${
        roll + willpowerBonus
      } with a d6 + ${willpowerBonus} willpower. ${
        interaction.user
      } now have ${newWillpower} willpower left.`;
    }
    await interaction.reply(rollMsg);
    await interaction.client.utils.sendSecret(
      `${interaction.user}: ${rollMsg}`
    );
  },
};
