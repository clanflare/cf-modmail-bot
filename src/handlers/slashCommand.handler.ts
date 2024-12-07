import { Client, type Interaction } from "discord.js";
import slashCommands from "@/commands/slash";
import { CustomDiscordError } from "@/types/errors";
import { cfClients } from "..";

export default async function (client: Client<true>, interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;
  const cfClient = cfClients.get(client.application?.id);
  if (!cfClient)
    throw new CustomDiscordError("CFClient not found for the given client ID.");
  const command = cfClient.slashCommands.get(interaction.commandName);
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
    if (interaction.replied)
      return await interaction.followUp(
        `Failed to execute ${interaction.commandName} command.`
      ); //change this to look better
    await interaction.reply(
      `Failed to execute ${interaction.commandName} command.`
    );
  }
}
