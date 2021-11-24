"use strict";

const fs = require("fs");

const { Client, Collection, Intents } = require("discord.js");
const { token } = require("./secret.json");

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });

const CHANNEL_ID_GENERAL = "913078425139421186";
const CHANNEL_ID_EVERYONE_IS_JOHN = "913078485193490443";

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

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(token);
