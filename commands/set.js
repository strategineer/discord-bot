const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("Set values")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("skills")
        .setDescription("Set your skills")
        .addStringOption((option) =>
          option.setName("skill1").setDescription("Skill 1").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("skill2").setDescription("Skill 2").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("skill3").setDescription("Skill 3")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("obsessions")
        .setDescription("Set your obsessions")
        .addStringOption((option) =>
          option
            .setName("obsession1")
            .setDescription("Level 1 Obsession")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("obsession2")
            .setDescription("Level 2 Obsession")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("obsession3")
            .setDescription("Level 3 Obsession")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bid")
        .setDescription("Set a new bid value")
        .addIntegerOption((option) =>
          option
            .setName("number")
            .setDescription("The number of willpower to bid")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "bid") {
      // Set your bid
      bid = interaction.options.getInteger("number");
      currentWillpower = interaction.client.utils.getWillpower(
        interaction.user
      );
      if (bid <= currentWillpower) {
        interaction.client.snackbox.bids[interaction.user] = bid;
        interaction.client.utils.sendSecret(
          `Bid set by ${interaction.user} to ${interaction.options.getInteger(
            "number"
          )}`
        );
        await interaction.reply({
          content: `Bid set to ${bid}`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `Bid can't be set to ${bid} because you only have ${currentWillpower} willpower left.`,
          ephemeral: true,
        });
      }
    } else if (interaction.options.getSubcommand() === "skills") {
      // Set your skills
      skills = [];
      skills.push(interaction.options.getString("skill1"));
      skills.push(interaction.options.getString("skill2"));
      skill3 = interaction.options.getString("skill3");
      if (skill3 !== null) {
        skills.push(skill3);
      }
      interaction.client.snackbox.skills[interaction.user] = skills;
      var willpower = undefined;
      if (skills.length === 3) {
        willpower = 7;
      } else {
        willpower = 10;
      }
      interaction.client.utils.setWillpower(interaction.user, 7);
      await interaction.reply(
        `Skills set to: \n${skills.join("\n")}\n Willpower set to ${willpower}`
      );
    } else if (interaction.options.getSubcommand() === "obsessions") {
      if (interaction.client.utils.hasGameStarted()) {
        await interaction.reply({
          content: "Can't set your obsessions after the game has started.",
          ephemeral: true,
        });
      }
      // Set your obsessions
      interaction.client.snackbox.obsessions[interaction.user] = [
        interaction.options.getString("obsession1"),
        interaction.options.getString("obsession2"),
        interaction.options.getString("obsession3"),
      ];
      await interaction.reply({
        content: interaction.client.utils.formatObsessions(interaction.user),
        ephemeral: true,
      });
    }
  },
};
