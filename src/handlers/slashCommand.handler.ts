import { Client, type Interaction } from "discord.js";
import commands from "@/commands";
import { CustomDiscordError } from "@/types/errors";

export default async function (client: Client, interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  try {
    if (!command) throw new Error("Command not found");
    await command.execute(interaction);
  } catch (err) {
    if (err instanceof CustomDiscordError && err.display) {
      //check if interation is acknoledged
      if (interaction.replied) {
        await interaction.followUp(err.message);
        return;
      }
      await interaction.reply(err.message);
      return;
    }
    console.error(err); //setup pino later
    if(interaction.replied) return await interaction.followUp(`Failed to execute ${interaction.commandName} command.`); //change this to look better
    await interaction.reply(`Failed to execute ${interaction.commandName} command.`);
  }
}
