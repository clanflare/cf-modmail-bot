export type SlashCommand = {
  data: import("@discordjs/builders").SlashCommandBuilder;
  execute: (
    interaction: import("discord.js").CommandInteraction
  ) => Promise<void>;
};
