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
import {
  createModmail,
  getAllOpenModmails,
  updateModmail,
} from "@/services/modmail.service";
import type {
  IModmail,
  IModmailConfig,
  MessageComponent,
  Modmail,
  ModmailConfig,
  ModmailsMessage,
  ModmailStatus,
} from "@/types/models";
import { client } from "@/.";
import { getModmailConfig } from "@/services/config.service";
import { DEFAULT_PREFIX, GUILD_ID } from "@/config/config";
import { messageStickerAndAttachmentParser, messageComponentParser } from "@/action";
import dbConnect from "@/utils/dbConn.utils";

export class ModmailClient {
  modmails: Collection<string, ModmailListener | null> = new Collection();
  ready = false;
  constructor() {
    this.onLoad().then(() => (this.ready = true));
  }

  async onLoad() {
    await dbConnect();
    const openModmails = await getAllOpenModmails();
    await Promise.all(
      openModmails?.map(async (openModmail) => {
        const modmailConfig = await getModmailConfig(openModmail.guildId);
        if (!modmailConfig) return;
        const firstMessageId = openModmail.interactiveMessageId;
        const user = await client.users.fetch(openModmail.userId);
        const userChannel = user.dmChannel || (await user.createDM());
        const interactiveMessage = await userChannel?.messages.fetch(
          firstMessageId
        );
        if (!interactiveMessage) return;
        const modmailListener = new ModmailListener(
          openModmail,
          modmailConfig,
          interactiveMessage
        );
        const interval = setInterval(() => {
          if (!modmailListener.ready) return;
          if (modmailListener.error) {
            updateModmail(openModmail.id, { status: "errored" });
            clearInterval(interval);
            return;
          }
          this.modmails.set(openModmail.userId, modmailListener);
          clearInterval(interval);
        }, 1000);
      }) || []
    );
  }

  async messageListener(message: Message) {
    if (!this.ready) return;
    const modmailConfig = await getModmailConfig(GUILD_ID);
    if (!modmailConfig) return; //err
    if (modmailConfig && !this.modmails.has(message.author.id)) {
      const userMessage = await message.reply("Creating a modmail...");
      await this.createNewModmail(
        GUILD_ID,
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
    let userChannel = user.dmChannel || (await user.createDM());
    if (!userChannel) return; //err

    const modmailChannel = await modmailCategory.guild.channels.create({
      name: `Modmail ${user.id.slice(-3)}${Math.floor(Math.random() * 10)}`,
      topic: `Modmail channel for user ${user.tag} (${user.id})`,
      nsfw: true,
      reason: `Modmail channel for user ${user.tag} (${user.id})`,
      parent: modmailCategory.id,
    });

    await modmailChannel.send(messageStickerAndAttachmentParser(firstMessage));
    await modmailChannel.send(
      messageComponentParser(modmailConfig.initialMessage, true)
    );
    if(modmailConfig.initialMessage.messageToSupportTeam) modmailChannel.send(`**System:** ${modmailConfig.initialMessage.messageToSupportTeam}`);

    const dbObject = await createModmail({
      guildId,
      userId: user.id,
      status: "open",
      modmailChannelId: modmailChannel.id,
      userChannelId: userChannel.id,
      interactiveMessageId: userMessage.id,
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
    await userMessage.edit(messageComponentParser(modmailConfig.initialMessage));
  }

  async deleteModmail(userId: string, status: ModmailStatus = "closed") {
    const modmail = this.modmails.get(userId);
    if (!modmail) return;
    modmail?.stop();
    modmail.modmailChannel?.delete();
    await updateModmail(modmail.dbId, { status });
    //any transcript creation code will go here
    this.modmails.delete(userId);
  }
}

class ModmailListener implements Omit<Modmail, "status"> {
  dbId: string;
  guildId: string; // guild where the modmail was opened
  userId: string; // user who opened the modmail
  user?: GuildMember;
  modmailChannelId: string; // modmail channel Id for modmail (if open)
  modmailChannel?: TextChannel;
  userChannelId: string; // user channel id for modmail (if open)
  userChannel?: DMChannel;
  webhook?: Webhook;
  component: MessageComponent;
  interactiveMessage: Message;
  interactiveMessageId: string;
  ready = false;
  error = false;
  messages?: ModmailsMessage[] = [];
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
    this.dbId = modmailData._id as string;
    this.guildId = modmailData.guildId;
    this.userId = modmailData.userId;
    this.modmailChannelId = modmailData.modmailChannelId;
    this.userChannelId = modmailData.userChannelId;
    if (modmailChannel) this.modmailChannel = modmailChannel;
    if (userChannel) this.userChannel = userChannel;
    this.component = modmailConfig.initialMessage;
    this.interactiveMessage = firstMessage;
    this.interactiveMessageId = firstMessage.id; //can be taken from db also , look for inconsistencies if ever there is a problem
    this.onStart()
      .catch(() => {this.error = true})
      .then(() => (this.ready = true));
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
          !msg.author.bot && !msg.content.startsWith(DEFAULT_PREFIX), //replace with a prefix for guild when functionality  is implemented
      }
    );
    modmailMessageCollector?.on("collect",async (message) => {
      await this.userChannel?.send(messageStickerAndAttachmentParser(message));
      message.react('✅');
    });
    const userMessageCollector = this.userChannel?.createMessageCollector({
      filter: (msg) => !msg.author.bot,
    });
    userMessageCollector?.on("collect",async (message) => {
      const { content, files } = messageStickerAndAttachmentParser(message);
      await this.webhook?.send({
        content,
        files,
        username: this.user?.displayName,
        avatarURL:
          this.user?.user.avatarURL() || this.user?.avatarURL() || undefined,
      });
      message.react('✅');
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
      const newComponent = this.component.buttons?.find(
        (btn) => btn.label == i.customId
      )?.linkedComponent;

      if (newComponent?.categoryId) {
        this.modmailChannel
          ?.setParent(newComponent?.categoryId)
          .catch(() =>
            this.modmailChannel?.send(
              "SYSTEM: INVALID CONFIG, please update the category id in modmail config."
            )
          ); //change this later
      }
      if (!newComponent) {
        this.userChannel?.send("ERROR");
        this.modmailChannel?.send("ERROR"); //remove if this never occurs
        return;
      }
      this.component = newComponent;
      this.interactiveMessage.edit(messageComponentParser(newComponent));
      this.modmailChannel?.send(messageComponentParser(newComponent, true));
      if(newComponent.messageToSupportTeam) this.modmailChannel?.send(`**System:** ${newComponent.messageToSupportTeam}`);
    });
  }

  stop() {
    this.userChannelInteractionCollector?.stop();
    this.modmailChannelMessageCollector?.stop();
    this.userChannelMessageCollector?.stop();
  }
}
