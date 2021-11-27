const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gm")
    .setDescription("Manage the game")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leaderboard")
        .setDescription("Display the leaderboard secretly")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a voice to the game")
        .addUserOption((option) =>
          option
            .setName("voice")
            .setDescription("The voice to add to the game")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("voice")
        .setDescription("Secretly view a voice's stats")
        .addUserOption((option) =>
          option
            .setName("voice")
            .setDescription("The voice's stats to view")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("bids").setDescription("View all current bids")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("obsessions").setDescription("View all obsessions")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("score")
        .setDescription(
          "Score an obsession for the given score. Starts a test for control..."
        )
        .addUserOption((option) =>
          option
            .setName("voice")
            .setDescription("The voice who achieved the obsession.")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("level")
            .setDescription("The level of obsession achieved.")
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
        content: "You're not the GM!",
        ephemeral: true,
      });
      return;
    }
    if (interaction.options.getSubcommand() === "add") {
      voice = interaction.options.getUser("voice");
      interaction.client.snackbox.voices.push(voice);
      await interaction.reply(`${voice} added to the game`);
    } else if (interaction.options.getSubcommand() === "leaderboard") {
      await interaction.reply({
        content: interaction.client.utils.formatLeaderboard(),
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "voice") {
      await interaction.reply({
        content: `${interaction.client.utils.formatVoiceStats(
          interaction.options.getUser("voice")
        )}`,
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "bids") {
      bidsMsg = "Bids:\n";
      Object.entries(interaction.client.snackbox.bids).forEach(
        ([user, bid]) => {
          bidsMsg += `${user}: ${bid}\n`;
        }
      );
      await interaction.reply({
        content: bidsMsg,
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "obsessions") {
      await interaction.reply({
        content: interaction.client.utils.formatAllObsessions(),
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "score") {
      if (!interaction.client.utils.hasGameStarted()) {
        await interaction.reply({
          content: "Game hasn't started...",
          ephemeral: true,
        });
        return;
      }
      levelOfObsessionAchieved = interaction.options.getInteger("level");
      if (levelOfObsessionAchieved <= 0 || levelOfObsessionAchieved > 3) {
        await interaction.reply({
          content: "Level of obsession achieved must be 1, 2, or 3",
          ephemeral: true,
        });
        return;
      }
      scoringVoice = interaction.options.getUser("voice");
      currentScore = interaction.client.snackbox.scores[scoringVoice];
      interaction.client.snackbox.scores[
        scoringVoice
      ] += levelOfObsessionAchieved;

      msg = `${scoringVoice} achieved their level ${levelOfObsessionAchieved}: ${
        interaction.client.snackbox.obsessions[scoringVoice][
          levelOfObsessionAchieved - 1
        ]
      }\n You should start a test for control '/gm control start' unless there are other obsessions that have been achieved in the same action.`;

      await interaction.reply({
        content: msg,
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "start") {
      // Game Start Verifications
      if (!interaction.client.utils.hasGameStarted()) {
        errors = [];
        n_players = 0;
        interaction.client.utils.getVoices().forEach((user) => {
          willpower = interaction.client.utils.getWillpower(user);
          interaction.client.snackbox.scores[user] = 0;
          n_players += 1;
          skills = interaction.client.snackbox.skills[user];
          if (skills === undefined) {
            errors.push(`${user} has not set their skills...`);
          } else {
            if (skills.length === 3 && willpower !== 7) {
              errors.push(`${user} has 3 skills but not 7 willpower...`);
            }
            if (skills.length === 2 && willpower !== 10) {
              errors.push(`${user} has 2 skills but not 10 willpower...`);
            }
          }
          obsessions = interaction.client.snackbox.obsessions[user];
          if (obsessions === undefined) {
            errors.push(`${user} has not set their obsessions...`);
          }
        });
        if (n_players === 0) {
          errors.push(`No players...`);
        }
        if (errors.length > 0) {
          await interaction.reply(
            `Can't start game because:\n     ${errors.join("\n    ")}`
          );
          return;
        }
      }
      if (interaction.client.snackbox.isInTestForControl) {
        await interaction.reply({
          content: "Already in a test for control, so we can't 'start' one.",
          ephemeral: true,
        });
        return;
      }
      // Reset all bids
      interaction.client.utils.getVoices().forEach((user) => {
        interaction.client.utils.setBid(user, 0);
      });
      currentVoice = interaction.client.snackbox.currentVoice;
      const placeYourBidsMsg =
        "Place your bids using '/set bid [WILLPOWER]' to take control of John";
      interaction.client.snackbox.isInTestForControl = true;
      if (currentVoice !== undefined) {
        await interaction.reply(
          `${interaction.client.snackbox.currentVoice} has lost control. ${placeYourBidsMsg}`
        );
      } else {
        await interaction.reply(`Let's play! ${placeYourBidsMsg}`);
      }
    } else if (interaction.options.getSubcommand() === "end") {
      if (!interaction.client.snackbox.isInTestForControl) {
        await interaction.reply({
          content: "Not in a test for control, so we can't 'end' one!",
          ephemeral: true,
        });
        return;
      }
      // all current players should place a bid of zero if they haven't placed one yet
      interaction.client.utils.getVoices().forEach((user) => {
        if (interaction.client.snackbox.bids[user] === undefined) {
          interaction.client.utils.setBid(user, 0);
        }
      });
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
        )}\nHere's a reminder of all Obsessions (they can be achieved at any time) ${interaction.client.utils.formatAllObsessions()}`
      );

      interaction.client.snackbox.currentVoice = nextVoice;
      // Remove willpower from test for control nextVoice
      interaction.client.snackbox.willpowers[nextVoice] -= maxBid;
      // clear out all bids
      interaction.client.snackbox.bids = {};
      interaction.client.snackbox.isInTestForControl = false;
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
      desiredBid = interaction.options.getInteger("bid");
      currentBid = interaction.client.utils.getBid(user);
      interaction.client.utils.setBid(user, desiredBid);
      await interaction.reply({
        content: `Bid set to ${desiredBid} from ${currentBid} for user ${user}`,
        ephemeral: true,
      });
    }
  },
};
