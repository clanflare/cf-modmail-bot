import { DMChannel, Message, Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder, BaseGuildTextChannel, GuildMember, Client } from "discord.js";
import type { MessageComponent, Modmail, ModmailConfig } from "@/types/models";
import { createModmail, getOpenModmailByUserId } from "@/services/modmail.service";
import { getModmailConfig } from "@/services/config.service";
import { getMember } from "@/action";

interface ModmailDiscord extends Modmail {
    userChannel: DMChannel | BaseGuildTextChannel;
    modmailChannel: BaseGuildTextChannel;
    member: GuildMember;
    modmailConfig: ModmailConfig;
    lastSystemMessage?: MessageComponent;
}

const ongoingModmails = new Collection<string, ModmailDiscord>();

async function modmailHandler(modmail: ModmailDiscord) {
    const InteractionCollector = modmail.userChannel.createMessageComponentCollector(
        //     {
        //     filter: (interaction) => interaction.user.id === modmail.member.id,
        // }
    );
    InteractionCollector.on("collect", async (interaction) => {
        await interaction.reply({
            content: `${interaction.customId.split("-")[1]} option selected.`,
            ephemeral: true,
        });

        if (!modmail.lastSystemMessage) return; // instead of returning send the first initial message which should be modularized from the code below
        const sent = modmail?.lastSystemMessage?.buttons?.find((button) => {
            if (button.label === interaction.customId.split("-")[1]) {
                console.log(button, button.linkedComponent);
                modmail.lastSystemMessage = button.linkedComponent;
                console.log(modmail.lastSystemMessage);
                const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    (modmail.lastSystemMessage.buttons || []).map((button) => {
                        return new ButtonBuilder()
                            .setLabel(button.label)
                            .setStyle(button.style ? button.style : ButtonStyle.Secondary)
                            .setCustomId(`modmail_button-${button.label}`)
                        // .setEmoji(button.emoji);
                    })
                );
                modmail.userChannel?.send({
                    content: modmail.lastSystemMessage.message.content,
                    embeds: modmail.lastSystemMessage.message.embeds,
                    components: [newRow]
                });
                return true;
            }
        }
        );
        if (!sent) {
            await modmail.modmailChannel.send({
                content: "Invalid button pressed",
            });
        } // here also the thing is not invalid , should start from the beginning again
    });

    const messageCollectorForUserChannel = modmail.userChannel.createMessageCollector();
    messageCollectorForUserChannel.on("collect", async (message) => {
        return await modmail.modmailChannel.send({
            content: message.content,
            embeds: message.embeds,
        });
    });

    const messageCollectorForModmailChannel = modmail.modmailChannel.createMessageCollector();
    messageCollectorForModmailChannel.on("collect", async (message) => {
        modmail.userChannel.send({
            content: message.content,
            embeds: message.embeds,
        });
    });

}
// export async function getActiveModmail(userChannel: DMChannel | BaseGuildTextChannel, message: Message, client: Client) {
//     const modmail = ongoingModmails.get(userChannel.id);
//     if (modmail) return modmail;
//     const guildId = message?.guild?.id ? message.guild.id : "1170627136059609118"; //get something from env if white label and  write this in env

//     const modmailConfig = await getModmailConfig(guildId);
//     if (!modmailConfig) {
//         return null;
//     }

//     const fetchedModmail = await getOpenModmailByUserId(message.author.id, guildId);
//     if (fetchedModmail) {
//         const userChannel = await client.channels.fetch(fetchedModmail.userChannelId) as DMChannel | BaseGuildTextChannel;
//         const modmailChannel = await client.channels.fetch(fetchedModmail.modmailChannelId) as BaseGuildTextChannel;
//         const member = await getMember(message.author.id, guildId);

//         const fetchedModmailWithChannels: ModmailDiscord = {
//             ...fetchedModmail,
//             userChannel,
//             modmailChannel,
//             member,
//             modmailConfig
//         };
//         ongoingModmails.set(userChannel.id, fetchedModmailWithChannels);// this won't be needed when we prefetch all the modmails when the bot starts into ongoingModmails
//         return fetchedModmailWithChannels;
//     }

//     const buttons = (modmailConfig.initialMessage.buttons || []).map((button) => {
//         return new ButtonBuilder()
//             .setLabel(button.label)
//             .setStyle(button.style ? button.style : ButtonStyle.Secondary)// actually it is validated but the type safety part needs to be implemented as the data is coming from the frontend and then stored as string in the db
//             .setCustomId(`modmail_button-${button.label}`)
//         // .setEmoji(button.emoji ? button.emoji : "Hehe");
//     });

//     const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

//     await userChannel.send({
//         content: modmailConfig.initialMessage.message.content,
//         embeds: modmailConfig.initialMessage.message.embeds,
//         components: [actionRow]
//     });

//     const guild = message.client.guilds.cache.get(guildId);
//     if (!guild) return null;

//     const modmailCategory = guild.channels.cache.get(modmailConfig.modmailCategoryId);
//     if (!modmailCategory) return null;

//     const modmailChannel = await guild.channels.create({
//         name: 'New Modmail',
//         topic: `Modmail channel for user ${message.author.tag} (${message.author.id})`,
//         nsfw: true,
//         reason: `Modmail channel for user ${message.author.tag} (${message.author.id})`,
//         parent: modmailCategory.id,
//     });

//     const newModmail = await createModmail({
//         userId: message.author.id,
//         guildId: guildId,
//         modmailChannelId: modmailChannel.id,
//         status: "open",
//         userChannelId: userChannel.id,
//         interactiveMessageId: "",//idk just to fix the type error T-T
//     });

//     const newModmailWithChannels: ModmailDiscord = {
//         ...newModmail,
//         userChannel,
//         modmailChannel,
//         modmailConfig,
//         member: await getMember(message.author.id, guildId),
//         lastSystemMessage: modmailConfig.initialMessage
//     };
//     ongoingModmails.set(userChannel.id, newModmailWithChannels);

//     modmailHandler(newModmailWithChannels);

//     return newModmailWithChannels;
// }