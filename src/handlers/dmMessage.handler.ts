import { ChannelType, Client, Message, MessageType } from "discord.js";

export default async function (client: Client, message: Message) {
  if (message.partial) message = await message.fetch();
  if (message.author.bot) return;
  if (message.channel.type !== ChannelType.DM) return;
  if (message.type !== MessageType.Default) return;
  try {
    console.log(message.content);
  } catch (error) {
    console.error(error);
    message.reply("There was an error trying to execute that command!");
  }
}
