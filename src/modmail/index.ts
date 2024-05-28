import {
  CategoryChannel,
  Collection,
  DMChannel,
  GuildMember,
  InteractionCollector,
  MessageCollector,
  TextChannel,
  User,
  Webhook,
  type CollectedInteraction,
  type Message,
} from "discord.js";
import { createModmail } from "@/services/modmail.service";
import type {
  IModmail,
  IModmailConfig,
  MessageComponent,
  Modmail,
  ModmailConfig,
  SupportMessage,
} from "@/types/models";
import { client } from "@/.";
import { getModmailConfig } from "@/services/config.service";
import { defaultPrefix, guildId } from "@/config/config";
import { messageParser, supportMessageParser } from "@/action";

export class ModmailClient {
  modmails: Collection<string, ModmailListener | null> = new Collection();
  lastModmail: number = 0;
  constructor() {}

  async messageListner(message: Message) {
    const modmailConfig = await getModmailConfig(guildId);
    if (!modmailConfig) return; //err
    if (modmailConfig && !this.modmails.has(message.author.id)) {
      const firstMessage = supportMessageParser(modmailConfig.initialMessage);
      const userMessage = await message.reply(firstMessage);
      this.createNewModmail(
        guildId,
        message.author,
        modmailConfig,
        userMessage,
        message
      );
    }
  }

  async createNewModmail(
    guildId: string,
    user: User,
    modmailConfig: IModmailConfig,
    userMessage: Message,
    firstMessage: Message
  ) {
    this.modmails.set(user.id, null);

    const modmailCategory = client.channels.cache.get(
      modmailConfig.modmailCategoryId
    );
    if (!modmailCategory || !(modmailCategory instanceof CategoryChannel))
      return; //err
    let userChannel = user.dmChannel;
    if (!user.dmChannel) userChannel = await user.createDM();
    if (!userChannel) return; //err

    const modmailChannel = await modmailCategory.guild.channels.create({
      name: `Modmail #${this.lastModmail + 1}`,
      topic: `Modmail channel for user ${user.tag} (${user.id})`,
      nsfw: true,
      reason: `Modmail channel for user ${user.tag} (${user.id})`,
      parent: modmailCategory.id,
    });

    modmailChannel.send(messageParser(firstMessage));
    modmailChannel.send(
      supportMessageParser(modmailConfig.initialMessage, true)
    );

    const dbObject = await createModmail({
      guildId,
      userId: user.id,
      status: "open",
      modmailChannelId: modmailChannel.id,
      userChannelId: userChannel.id,
    });

    this.modmails.set(
      user.id,
      new ModmailListener(
        dbObject,
        modmailConfig,
        userMessage,
        modmailChannel,
        userChannel
      )
    );
  }
}

class ModmailListener implements Omit<Modmail, "status"> {
  dbId: string;
  guildId: string; // guild where the modmail was opened
  userId: string; // user who opened the modmail
  user?: GuildMember;
  modmailChannelId: string; // modmail channel Id for modmail (if open)
  modmailChannel?: TextChannel;
  userChannelId: string; // user channel Id for modmail (if open)
  userChannel?: DMChannel;
  webhook?: Webhook;
  component: MessageComponent;
  interactiveMessage: Message;

  userChannelMessageCollector?: MessageCollector;
  modmailChannelMessageCollector?: MessageCollector;
  userChannelInteractionCollector?: InteractionCollector<CollectedInteraction>;

  constructor(
    modmailData: IModmail,
    modmailConfig: ModmailConfig,
    firstMessage: Message,
    modmailChannel?: TextChannel,
    userChannel?: DMChannel
  ) {
    this.dbId = modmailData._id;
    this.guildId = modmailData.guildId;
    this.userId = modmailData.userId;
    this.modmailChannelId = modmailData.modmailChannelId;
    this.userChannelId = modmailData.modmailChannelId;
    if (modmailChannel) this.modmailChannel = modmailChannel;
    if (userChannel) this.userChannel = userChannel;
    this.component = modmailConfig.initialMessage;
    this.interactiveMessage = firstMessage;
    this.onStart();
  }

  async onStart() {
    await this.loadDiscordObjects();
    this.messageListeners();
    this.interactionListeners();
  }

  async loadDiscordObjects() {
    if (!this.modmailChannel)
      this.modmailChannel = (await client.channels.fetch(
        this.modmailChannelId
      )) as TextChannel;
    if (!this.userChannel)
      this.userChannel = (await client.channels.fetch(
        this.userChannelId
      )) as DMChannel;
    this.user = await this.modmailChannel.guild.members.fetch(this.userId);
    const webhooks = await this.modmailChannel.fetchWebhooks();
    if (!webhooks.first()) {
      this.webhook = await this.modmailChannel.createWebhook({
        name: "Modmail",
        avatar: null,
        reason: `Modmail channel for user ${this.user.user.tag} (${this.user.id})`,
      });
      return;
    }
    this.webhook = webhooks.first();
  }

  messageListeners() {
    const modmailMessageCollector = this.modmailChannel?.createMessageCollector(
      {
        filter: (msg) =>
          !msg.author.bot && !msg.content.startsWith(defaultPrefix), //replace with a prefix for guild when functionalit  is implemented
      }
    );
    modmailMessageCollector?.on("collect", (message) => {
      this.userChannel?.send(messageParser(message));
    });
    const userMessageCollector = this.userChannel?.createMessageCollector({
      filter: (msg) => !msg.author.bot,
    });
    userMessageCollector?.on("collect", (message) => {
      const { content, files } = messageParser(message);
      this.webhook?.send({
        content,
        files,
        username: this.user?.displayName,
        avatarURL:
          this.user?.user.avatarURL() || this.user?.avatarURL() || undefined,
      });
    });

    this.userChannelMessageCollector = userMessageCollector;
    this.modmailChannelMessageCollector = modmailMessageCollector;
  }

  interactionListeners() {
    const interactionListener =
      this.interactiveMessage.createMessageComponentCollector({
        time: 3600_000,
      });
    interactionListener.on("collect", (i) => {
      i.deferUpdate();
      const newComponent = this.component.buttons.find(btn=>btn.label==i.customId)?.linkedComponent;
      
      if(!newComponent) {
        this.userChannel?.send("ERROR");
        this.modmailChannel?.send("ERROR");//remove if this never occurs aise hi daaldia hai
        return;
      }
      this.component = newComponent;
      this.interactiveMessage.edit(supportMessageParser(newComponent));
      this.modmailChannel?.send(supportMessageParser(newComponent,true))
    });
  }
}
