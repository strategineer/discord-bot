const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("rolls the given number of d6s for Blades in the Dark")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription(
          "The number of d6s to roll, 0 or negative numbers work."
        )
    ),
  async execute(interaction) {
    let numberOfDice = interaction.options.getInteger("number");
    let isNumberOfDiceNotPositive = numberOfDice <= 0;
    numberOfDice = isNumberOfDiceNotPositive ? 2 : numberOfDice;
    let n = 0;
    let roll = 0;
    let rollMsg = `Rolled ${numberOfDice}${
      isNumberOfDiceNotPositive ? " (negative)" : ""
    } dice...\n\n[`;
    let nCrits = 0;
    let nPartials = 0;
    let nFails = 0;
    while (n < numberOfDice) {
      roll = interaction.client.utils.rollD(6);
      if (roll == 6) {
        nCrits += 1;
      } else if (roll >= 4) {
        nPartials += 1;
      } else {
        nFails += 1;
      }
      if (n == numberOfDice - 1) {
        rollMsg += ` ${roll} ] `;
      } else {
        rollMsg += ` ${roll} `;
      }
      n += 1;
    }
    resultType = "";
    if (!isNumberOfDiceNotPositive) {
      if (nCrits > 1) {
        resultType =
          "Critical success! _(effective with an extra benefit)_";
      } else if (nCrits > 0) {
        resultType = "Full success! _(effective with no complication)_";
      } else if (nPartials > 0) {
        resultType = "Partial success! _(effective with a complication)_";
      } else {
        resultType = "Failure... _(not effective with a complication)_";
      }
    } else {
      if (nFails > 0) {
        resultType = "Failure... _(not effective with a complication)_";
      } else if (nPartials > 0) {
        resultType = "Partial success! _(effective with a complication)_";
      } else {
        resultType = "Full success! _(effective with no complication)_";
      }
    }
    rollMsg += `\n\n${resultType}`;
    await interaction.reply(rollMsg);
  },
};
