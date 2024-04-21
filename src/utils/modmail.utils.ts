import { DMChannel, Message, Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder, Base, BaseGuildTextChannel, ThreadChannel, GuildMember } from "discord.js";
import type { MessageComponent, Modmail, ModmailConfig } from "@/types/models";
import { createModmail, getOpenModmailByUserId } from "@/services/modmail.service";
import { createDefaultConfigForGuild, getModmailConfig } from "@/services/config.service";
import client from "./discordClient.utils";
import { getMember } from "@/action";

interface ModmailDiscord extends Modmail {
    userChannel: DMChannel | BaseGuildTextChannel;
    modmailChannel: BaseGuildTextChannel;
    threadChannel: ThreadChannel;
    member: GuildMember;
    modmailConfig: ModmailConfig;
    lastSystemMessage?: MessageComponent;
}

const ongoingModmails = new Collection<string, ModmailDiscord>();

async function modmailHandler(modmail: ModmailDiscord) {
    modmail.threadChannel.send({
        content: `New Modmail from ${modmail.member.user.tag} (${modmail.member.id})`,
        embeds: [],
    });
    const InteractionCollector = modmail.modmailChannel.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === modmail.member.id,
    });
    InteractionCollector.on("collect", async (interaction) => {
        await interaction.reply({
            content: `${interaction.customId.split("-")[1]} option selected.`,
            ephemeral: true,
        });

        if(!modmail.lastSystemMessage) return; // instead of returning send the first initial message which should be modulariezed from the code below
        const sent = modmail?.lastSystemMessage?.buttons.find((button) => {
            if (button.label === interaction.customId.split("-")[1]) {
                modmail.lastSystemMessage = button.linkedComponent;
                const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    modmail.lastSystemMessage.buttons.map((button) => {
                        return new ButtonBuilder()
                            .setLabel(button.label)
                            .setStyle(button.style)
                            .setCustomId(`modmail_button-${button.label}`)
                            .setEmoji(button.emoji);
                    })
                );
                modmail.modmailChannel?.send({
                    content: modmail.lastSystemMessage.message.content,
                    embeds: modmail.lastSystemMessage.message.embeds,
                    components: [newRow]
                });
                return true;
            }
        }
        );
        if (!sent) {
            modmail.modmailChannel.send({
                content: "Invalid button pressed",
            });
        } // here also the thing is not invalid , should start from the beginning again
    });

    const messageCollectorForUserChannel = modmail.userChannel.createMessageCollector();
    messageCollectorForUserChannel.on("collect", async (message) => {
        modmail.modmailChannel.send({
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

async function getModmailArchiveThread(userId: string, guildId: string) {
    const modmailConfig = await getModmailConfig(guildId);
    if (!modmailConfig) return null;
    const archiveChannel = modmailConfig.archiveChannelId;
    if (!archiveChannel) return null;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return null;
    const archiveThreadChannel = guild.channels.cache.get(archiveChannel) as BaseGuildTextChannel;
    if (!archiveThreadChannel ) return null;
    const thread = await archiveThreadChannel.threads.cache.find(x => x.name === `Modmail Archive - ${userId}`);
    if (thread) return thread;
    return await archiveThreadChannel.threads.create({
        name: `Modmail Archive - ${userId}`,
        autoArchiveDuration: 1440,
        reason: `Modmail Archive - ${userId}`,
    });
}

async function getActiveModmail(userChannel: DMChannel | BaseGuildTextChannel, message: Message) {
    const modmail = ongoingModmails.get(userChannel.id);
    if (modmail) return modmail;
    const guildId = message?.guild?.id ? message.guild.id : "get some thing from env if whitelable"; //get some thing from env if whitelable and  write this in env

    const modmailConfig = await getModmailConfig(guildId);
    if (!modmailConfig) {
        return null;
    }

    const fetchedModmail = await getOpenModmailByUserId(message.author.id, guildId);
    if (fetchedModmail) {
        const userChannel = await client.channels.fetch(fetchedModmail.userChannelId) as DMChannel | BaseGuildTextChannel;
        const modmailChannel = await client.channels.fetch(fetchedModmail.modmailChannelId) as BaseGuildTextChannel;
        const threadChannel = await client.channels.fetch(fetchedModmail.threadId) as ThreadChannel;
        const member = await getMember(message.author.id, guildId);
        
        const fetchedModmailWithChannels: ModmailDiscord = {
            ...fetchedModmail,
            userChannel,
            modmailChannel,
            threadChannel,
            member,
            modmailConfig
        };
        ongoingModmails.set(userChannel.id, fetchedModmailWithChannels);// this wont be needed when we prefetch all the modmails when the bot starts into ongoingModmails
        return fetchedModmailWithChannels;
    }

    

    const buttons = modmailConfig.initialMessage.buttons.map((button) => {
        return new ButtonBuilder()
            .setLabel(button.label)
            .setStyle(button.style as any)// actually it is validated but the typesafety part needs to be implemented as the data is coming from the frontend and then stored as string in the db
            .setCustomId(`modmail_button-${button.label}`)
            .setEmoji(button.emoji);
    });

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    const reply = await userChannel.send({
        content: modmailConfig.initialMessage.message.content,
        embeds: modmailConfig.initialMessage.message.embeds,
        components: [actionRow]
    });

    const guild = message.client.guilds.cache.get(guildId);
    if (!guild) return null;

    const modmailCategory = guild.channels.cache.get(modmailConfig.modmailCategoryId);
    if (!modmailCategory) return null;

    const modmailChannel = await guild.channels.create({
        name:'New Modmail',
        topic: `Modmail channel for user ${message.author.tag} (${message.author.id})`,
        nsfw: true,
        reason: `Modmail channel for user ${message.author.tag} (${message.author.id})`,
        parent: modmailCategory.id,
    });

    const thread = await getModmailArchiveThread(message.author.id, guildId);
    if (!thread) return null;

    const newModmail = await createModmail({
        userId: message.author.id,
        guildId: guildId,
        modmailChannelId: modmailChannel.id,
        threadId: thread.id,
        status: "open",
        userChannelId: userChannel.id,
    });

    const newModmailWithChannels: ModmailDiscord = {
        ...newModmail,
        userChannel,
        modmailChannel,
        threadChannel: thread,
        modmailConfig,
        member: await getMember(message.author.id, guildId),
        lastSystemMessage: modmailConfig.initialMessage
    };
    ongoingModmails.set(userChannel.id, newModmailWithChannels);

    modmailHandler(newModmailWithChannels);

    return newModmailWithChannels;
}