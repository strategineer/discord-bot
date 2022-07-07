const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription(
      "rolls the given number (Stat + Skill usually) of d6s (and a bonus Computer Dice)!"
    )
    .addIntegerOption((option) =>
      option.setName("number").setDescription("The number of d6s to roll")
    ),
  async execute(interaction) {
    let numberOfDice = interaction.options.getInteger("number");
    let isNumberOfDiceNegative = numberOfDice < 0;
    numberOfDice = Math.abs(numberOfDice);
    let n = 0;
    let roll = 0;
    let rollMsg = `Rolled [`;
    let successes = 0;
    let failures = 0;
    while (n < numberOfDice + 1) {
      roll = interaction.client.utils.rollD(6);
      if (roll >= 5) {
        successes += 1;
      } else if (isNumberOfDiceNegative) {
        failures += 1;
      }
      // computer dice
      if (n == numberOfDice) {
        rollMsg += ` ${roll} ] `;
      } else {
        rollMsg += ` ${roll} `;
      }
      n += 1;
    }
    rollMsg += `\n\n${successes - failures} successes.`;
    if (n == numberOfDice + 1) {
      if (roll == 6) {
        rollMsg += "\n\nBut... The computer notices you...";
      }
    }
    await interaction.reply(rollMsg);
  },
};
