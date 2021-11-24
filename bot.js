"use strict";

const fs = require("fs");

let rawdata = fs.readFileSync("secret.json");
let config = JSON.parse(rawdata);

const Discord = require("discord.js");
const client = new Discord.Client({ intents: ["GUILD_MESSAGES"] });

const CHANNEL_ID_GENERAL = "913078425139421186";
const CHANNEL_ID_EVERYONE_IS_JOHN = "913078485193490443";

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const channel = await client.channels.fetch(CHANNEL_ID_GENERAL);
  await channel.send("Hello fellow gamers!");
});

client.login(config.token);
