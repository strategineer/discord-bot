"use strict";

const fs = require("fs");

const { Client, Collection, Intents } = require("discord.js");
const { token } = require("./secret.json");
const { gmId } = require("./config.json");

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });

const CHANNEL_ID_GENERAL = "913078425139421186";
const CHANNEL_ID_EVERYONE_IS_JOHN = "913078485193490443";
const CHANNEL_ID_SECRET = "913113539726700584";

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.snackbox = {
  bids: {},
  willpowers: {},
  skills: {},
  obsessions: {},
  currentVoice: undefined,
};

// Util functions
client.utils = {};

client.utils.sleep = function (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

client.utils.rollD = function (n) {
  return getRandomInt(1, n);
};

client.utils.rollOffHelper = function (users, msg) {
  if (users.length === 0) {
    return [undefined, msg];
  }
  if (users.length === 1) {
    return [users[0], msg];
  }
  msg += `\nRolling off with: ${users.join(",")}`;
  var maxRollers = [];
  var maxRoll = -1000;
  users.forEach(async function (user, index) {
    var roll = client.utils.rollD(6);
    msg += `\n${user} rolled a ${roll}`;
    if (roll === maxRoll) {
      maxRollers.push(user);
    }
    if (roll > maxRoll) {
      maxRollers = [user];
      maxRoll = roll;
    }
  });
  return client.utils.rollOffHelper(maxRollers, msg);
};

client.utils.rollOff = function (users) {
  msg = "";
  return client.utils.rollOffHelper(users, msg);
};

client.utils.sendSecret = async function (secret) {
  const secretChannel = await client.channels.fetch(CHANNEL_ID_SECRET);
  await secretChannel.send(secret);
};

client.utils.getWillpower = function (user) {
  const v = client.snackbox.willpowers[user];
  if (v !== undefined) {
    return v;
  }
  return 10;
};

client.utils.setWillpower = function (user, willpower) {
  client.snackbox.willpowers[user] = willpower;
};

client.utils.getBid = function (user) {
  const v = client.snackbox.bids[user];
  if (v !== undefined) {
    return v;
  }
  return 0;
};

client.utils.setBid = function (user, bid) {
  client.snackbox.bids[user] = bid;
};

client.utils.isGm = function (user) {
  return user.id === gmId;
};

client.utils.hasGameStarted = function () {
  return client.snackbox.currentVoice !== undefined;
};

client.utils.formatVoiceStats = function (user) {
  var msg = `Voice: ${user}\n`;
  msg += `Willpower: ${client.utils.getWillpower(user)}\n`;
  msg += `Skills: ${client.utils.formatSkills(user)}\n`;
  msg += `Obsessions: ${client.utils.formatObsessions(user)}\n`;
  return msg;
};

client.utils.formatSkills = function (user) {
  const skills = client.snackbox.skills[user];
  if (skills === undefined) {
    return "No skills set";
  } else {
    return `Your skills are:    \n${skills.join("    \n")}`;
  }
};

client.utils.formatObsessions = function (user) {
  const obsessions = client.snackbox.obsessions[user];
  if (obsessions === undefined) {
    return "No obsessions set";
  } else {
    return `Your obsessions are:\n    Level 1: ${obsessions[0]}\n    Level 2: ${obsessions[1]}\n    Level 3: ${obsessions[2]}`;
  }
};

client.login(token);
