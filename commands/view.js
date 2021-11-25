const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("view")
    .setDescription("View values")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("willpower")
        .setDescription("View willpower value for all players")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("bid").setDescription("View your last bid")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("skills")
        .setDescription("View the skills of all players")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("obsessions").setDescription("View your obsessions")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("voice")
        .setDescription("View the current voice in control of John")
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "willpower") {
      // Show the current willpower of all players
      var willpowersMsg = "\n";
      Object.entries(interaction.client.snackbox.willpowers).forEach(
        ([user, value]) => {
          willpowersMsg += `${user}: ${value}\n`;
        }
      );
      await interaction.reply(`Willpowers: ${willpowersMsg}`);
    } else if (interaction.options.getSubcommand() === "bid") {
      // Secretly show your own bid
      bid = interaction.client.utils.getBid(interaction.user);
      await interaction.reply({
        content: `Bid is set to ${bid}`,
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "voice") {
      const currentVoice = interaction.client.snackbox.currentVoice;
      if (currentVoice === undefined) {
        await interaction.reply("No voice is in control of John currently.");
      } else {
        await interaction.reply(
          `Voice of ${interaction.client.snackbox.currentVoice} is currently in control of John.`
        );
      }
    } else if (interaction.options.getSubcommand() === "skills") {
      // Show the current skills for all players
      var skillsMsg = "";
      Object.entries(interaction.client.snackbox.skills).forEach(
        ([user, skills]) => {
          skillsMsg += `${user}:\n${skills.join("\n")}\n`;
        }
      );
      if (skillsMsg !== "") {
        await interaction.reply(skillsMsg);
      } else {
        await interaction.reply("No players have set their skills yet.");
      }
    } else if (interaction.options.getSubcommand() === "obsessions") {
      // Secretly show your own obsessions
      obsessions = interaction.client.snackbox.obsessions[interaction.user];
      if (obsessions === undefined) {
        await interaction.reply({
          content: `Use the "\\set obsessions" to set your obsessions`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: interaction.client.utils.formatObsessions(interaction.user),
          ephemeral: true,
        });
      }
    }
  },
};
