const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gm")
    .setDescription("Manage the game")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("endtestforcontrol")
        .setDescription("End the bidding war and declare the winner.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("overridewillpower")
        .setDescription("Override the willpower value for a given user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to set the willpower of")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("willpower")
            .setDescription("The number of willpower to set this user")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("overridebid")
        .setDescription("Override the bid value for a given user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to set the bid of")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("bid")
            .setDescription("The number of bid to set this user")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (!interaction.client.utils.isGm(interaction.user)) {
      await interaction.reply({
        content: "You're not the GM! Fuck right off.",
        ephemeral: true,
      });
      return;
    }
    if (interaction.options.getSubcommand() === "endtestforcontrol") {
      // all current players should place a bid of zero if they haven't placed one yet
      Object.entries(interaction.client.snackbox.willpowers).forEach(
        ([user, value]) => {
          if (interaction.client.snackbox.bids[user] === undefined) {
            interaction.client.utils.setBid(user, 0);
          }
        }
      );
      maxBidders = [];
      maxBid = -1000;
      // Get user with highest bid
      Object.entries(interaction.client.snackbox.bids).forEach(
        ([user, bid]) => {
          if (bid === maxBid) {
            maxBidders.push(user);
          }
          if (bid > maxBid) {
            maxBidders = [user];
            maxBid = bid;
          }
        }
      );
      winner = undefined;
      msg = "";
      if (maxBidders.length > 1) {
        allBidMsg = `${maxBidders.join(
          ","
        )} all bid ${maxBid}, rolling to see who gets control!`;
        const results = interaction.client.utils.rollOff(maxBidders);
        winner = results[0];
        rollOffMsg = results[1];
        msg = `${allBidMsg}\n${rollOffMsg}\n${winner} wins Test for Control with a bid of ${maxBid}, they take control!`;
      } else {
        winner = maxBidders[0];
        msg = `${winner} wins Test for Control with a bid of ${maxBid}, they take control!`;
      }
      interaction.client.snackbox.currentVoice = winner;
      // Remove willpower from test for control winner
      interaction.client.snackbox.willpowers[winner] -= maxBid;
      // clear out all bids
      interaction.client.snackbox.bids = {};
      await interaction.reply(msg);
    } else if (interaction.options.getSubcommand() === "overridewillpower") {
      user = interaction.options.getUser("user");
      desiredWillpower = interaction.options.getInteger("willpower");
      currentWillpower = interaction.client.utils.getWillpower(user);
      interaction.client.utils.setWillpower(user, desiredWillpower);
      await interaction.reply({
        content: `Willpower set to ${desiredWillpower} from ${currentWillpower} for user ${user}`,
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "overridebid") {
      user = interaction.options.getUser("user");
      desiredWillpower = interaction.options.getInteger("bid");
      currentWillpower = interaction.client.utils.getWillpower(user);
      interaction.client.utils.setWillpower(user, desiredWillpower);
      await interaction.reply({
        content: `Willpower set to ${desiredWillpower} from ${currentWillpower} for user ${user}`,
        ephemeral: true,
      });
    }
  },
};
