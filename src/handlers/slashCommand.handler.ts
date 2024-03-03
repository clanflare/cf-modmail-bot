import { Client, type Interaction } from "discord.js";
import commands from "@/commands";

export default async function (client: Client, interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  try {
    if (!command) throw new Error("Command not found");
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
}
