const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gm")
    .setDescription("Manage the game")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("voice")
        .setDescription("Secretely view a voice's stats")
        .addUserOption((option) =>
          option
            .setName("voice")
            .setDescription("The voice's stats to view")
            .setRequired(true)
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName("control")
        .setDescription("Test for control related-commands.")
        .addSubcommand((start) =>
          start.setName("start").setDescription("Start a test for control.")
        )
        .addSubcommand((end) =>
          end.setName("end").setDescription("End a test for control.")
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName("override")
        .setDescription("Override player stats")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("willpower")
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
            .setName("bid")
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
    if (interaction.options.getSubcommand() === "voice") {
      await interaction.reply({
        content: `${interaction.client.utils.formatVoiceStats(
          interaction.options.getUser("voice")
        )}`,
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "start") {
      // Reset all bids
      Object.entries(interaction.client.snackbox.willpowers).forEach(
        ([user, value]) => {
          interaction.client.utils.setBid(user, 0);
        }
      );
      currentVoice = interaction.client.snackbox.currentVoice;
      const placeYourBidsMsg =
        "Place your bids using '/set bid [WILLPOWER]' to take control of John";
      if (currentVoice !== undefined) {
        await interaction.reply(
          `${interaction.client.snackbox.currentVoice} has lost control. ${placeYourBidsMsg}`
        );
      } else {
        await interaction.reply(`Let's play! ${placeYourBidsMsg}`);
      }
    } else if (interaction.options.getSubcommand() === "end") {
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
      nextVoice = undefined;
      msg = "";
      if (maxBidders.length > 1) {
        allBidMsg = `${maxBidders.join(
          ","
        )} all bid ${maxBid}, rolling to see who gets control!`;
        const results = interaction.client.utils.rollOff(maxBidders);
        nextVoice = results[0];
        rollOffMsg = results[1];
        msg = `${allBidMsg}\n${rollOffMsg}\n${nextVoice} wins Test for Control with a bid of ${maxBid},`;
      } else {
        nextVoice = maxBidders[0];
        msg = `${nextVoice} wins Test for Control with a bid of ${maxBid},`;
      }
      currentVoice = interaction.client.snackbox.currentVoice;
      if (currentVoice === undefined) {
        msg += " they take control of John at the start of play.";
      } else if (currentVoice !== nextVoice) {
        msg += ` they take control of John from ${currentVoice}`;
      } else {
        msg += " they stay in control of John";
      }

      interaction.client.utils.sendSecret(
        `The following voice has taken control, here's a reminder of all their stats:\n${interaction.client.utils.formatVoiceStats(
          nextVoice
        )}`
      );

      interaction.client.snackbox.currentVoice = nextVoice;
      // Remove willpower from test for control nextVoice
      interaction.client.snackbox.willpowers[nextVoice] -= maxBid;
      // clear out all bids
      interaction.client.snackbox.bids = {};
      await interaction.reply(msg);
    } else if (interaction.options.getSubcommand() === "willpower") {
      user = interaction.options.getUser("user");
      desiredWillpower = interaction.options.getInteger("willpower");
      currentWillpower = interaction.client.utils.getWillpower(user);
      interaction.client.utils.setWillpower(user, desiredWillpower);
      await interaction.reply({
        content: `Willpower set to ${desiredWillpower} from ${currentWillpower} for user ${user}`,
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "bid") {
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
