import { getActiveModmail } from "@/utils/modmail.utils";
import { ChannelType, Client, Message, MessageType } from "discord.js";
import { mmclient } from "@/utils/discordClient.utils";
// import { modlogs } from "@/action/moderation";
// import OpenAI from "openai";
// import type {
//   ChatCompletionMessageParam,
//   ChatCompletionTool,
// } from "openai/resources/index.mjs";

// const openai = new OpenAI();


export default async function (client: Client, message: Message) {
  if (message.partial) message = await message.fetch();
  if (message.author.bot) return;
  if (message.channel.type !== ChannelType.DM) return;
  if (message.type !== MessageType.Default) return;
  let dmChannel = message.channel;
  if (dmChannel.partial) dmChannel = await message.channel.fetch();

  mmclient.messageListner(message);

  // getActiveModmail(dmChannel, message);

  

  // try {
  //   const messages: ChatCompletionMessageParam[] = [
  //     {
  //       role: "user",
  //       content: message.content,
  //     },
  //   ];

  //   const availableFunctions = {
  //     get_user_modlogs: modlogs,
  //   };

  //   const tools: ChatCompletionTool[] = [
  //     {
  //       type: "function",
  //       function: {
  //         name: "get_user_modlogs",
  //         description: "Get the modlogs of the user",
  //         parameters: {
  //           type: "object",
  //           properties: {
  //             user: {
  //               type: "string",
  //               description: "The user to get the modlogs",
  //             },
  //             type: {
  //               type: "string",
  //               description: "The type of modlogs to get",
  //             },
  //             guild: {
  //               type: "string",
  //               description: "The guild to get the modlogs",
  //             },
  //           },
  //           required: ["user", "type", "guild"],
  //         },
  //       },
  //     },
  //   ];

  //   const response = await openai.chat.completions.create({
  //     model: "gpt-3.5-turbo-0125",
  //     messages,
  //     tools: tools,
  //     tool_choice: "auto",
  //   });

  //   const responseMessage = response.choices[0].message;
  //   const toolCalls = responseMessage.tool_calls;
  //   if (toolCalls) {
  //     messages.push(responseMessage);
  //     for (const toolCall of toolCalls) {
  //       const functionName = toolCall.function.name;
  //       const functionToCall = availableFunctions[functionName];
  //       const functionArgs = JSON.parse(toolCall.function.arguments);
  //       console.log({ functionArgs });
  //       const functionResponse = await functionToCall(functionArgs);
  //       console.log({ functionResponse });
  //       messages.push({
  //         tool_call_id: toolCall.id,
  //         role: "tool",
  //         name: functionName,
  //         content: JSON.stringify(functionResponse),
  //       }); // extend conversation with function response
  //     }
  //     const secondResponse = await openai.chat.completions.create({
  //       model: "gpt-3.5-turbo-0125",
  //       messages: messages,
  //     });

  //     console.log({ secondResponse });

  //     message.channel.send(
  //       secondResponse?.choices[0]?.message?.content as string
  //     );
  //   }
  // } catch (error) {
  //   console.error(error);
  //   message.reply("There was an error trying to execute that command!");
  // }
}
