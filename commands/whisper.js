const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whisper")
    .setDescription("Tell a secret to the GM!")
    .addStringOption((option) =>
      option
        .setName("secret")
        .setDescription("The secret to tell")
        .setRequired(true)
    ),
  async execute(interaction) {
    interaction.client.utils.sendSecret(
      `Secret sent by ${interaction.user}: ${interaction.options.getString(
        "secret"
      )}`
    );
    await interaction.reply({ content: "Secret sent!", ephemeral: true });
  },
};
