import { CustomDiscordError } from "@/types/errors";
import type { MessageComponent } from "@/types/models";
import {
  Guild,
  User,
  GuildMember,
  Role,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildBan,
  Client,
} from "discord.js";

class DiscordUtils {
  client: Client;
  constructor(client: Client) {
    this.client = client;
  }
  /**
   * Fetch a user by ID or directly return if it's already a User or GuildMember instance.
   */
  async getUser(user: string | User | GuildMember): Promise<User> {
    if (user instanceof User) return user;
    if (user instanceof GuildMember) return user.user;
    try {
      return await this.client.users.fetch(user);
    } catch (error) {
      console.error(`Failed to fetch user: ${error}`);
      throw new CustomDiscordError(`Failed to fetch user: ${error}`);
    }
  }

  /**
   * Parse a message for stickers and attachments (supporting multiple stickers and attachments).
   */
  messageStickerAndAttachmentParser(message: Message) {
    const stickers = message.stickers
      .map((sticker) => `sticker: ${sticker.url}`)
      .join("\n");
    const attachments = message.attachments.map((attachment) => attachment.url);
    return {
      content: `${message.content}\n${stickers}`,
      files: attachments.length ? attachments : undefined,
    };
  }

  /**
   * Parse message components into Discord.js ActionRow and Button objects.
   */
  messageComponentParser(
    messageComponent: MessageComponent,
    disableButton = false
  ) {
    if (!messageComponent.buttons || messageComponent.buttons.length == 0) {
      return {
        content: messageComponent.message.content,
        embeds: messageComponent.message.embeds,
        files: [], // attachments to be implemented from messageComponent.message.attachments
        components: [],
      };
    }

    const parsedButtons = messageComponent?.buttons?.map((btn) =>
      new ButtonBuilder()
        .setCustomId(btn.label)
        .setLabel(btn.label)
        .setDisabled(disableButton)
        .setStyle(btn.style || ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      parsedButtons
    );

    return {
      content: messageComponent.message.content,
      embeds: messageComponent.message.embeds,
      files: [], // attachments to be implemented from messageComponent.message.attachments
      components: [row],
    };
  }

  /**
   * Fetch a guild by ID or directly return if it's already a Guild instance.
   */
  getGuild(guild: string | Guild): Guild {
    if (guild instanceof Guild) return guild;

    try {
      const fetchedGuild = this.client.guilds.cache.get(guild);
      if (!fetchedGuild) {
        throw new CustomDiscordError("Guild not found in cache.");
      }
      return fetchedGuild;
    } catch (error) {
      console.error(`Failed to fetch guild: ${error}`);
      throw new CustomDiscordError(`Failed to fetch guild: ${error}`);
    }
  }

  /**
   * Fetch a ban for a specific user in a guild.
   */
  async getBan({
    guild,
    user,
  }: {
    guild: Guild;
    user: User;
  }): Promise<GuildBan | null> {
    try {
      return await guild.bans.fetch({ user, force: true });
    } catch (error) {
      console.error(`Failed to fetch ban: ${error}`);
    }
    return null;
  }

  /**
   * Fetch a role by ID or directly return if it's already a Role instance.
   */
  getRole(role: string | Role, guild: string | Guild): Role {
    const fetchedGuild = this.getGuild(guild);
    if (!role) {
      throw new CustomDiscordError("Role parameter is invalid.");
    }
    if (role instanceof Role) return role;
    try {
      const fetchedRole = fetchedGuild.roles.cache.get(role);
      if (!fetchedRole) {
        throw new CustomDiscordError("Role not found in cache.");
      }
      return fetchedRole;
    } catch (error) {
      console.error(
        `Failed to fetch role (ID: ${role}) in guild (ID: ${guild}): ${error}`
      );
      throw new CustomDiscordError(`Failed to fetch role: ${error}`);
    }
  }

  /**
   * Fetch a guild member by ID or directly return if it's already a GuildMember instance.
   */
  async getMember(
    member: string | User | GuildMember,
    guild: string | Guild
  ): Promise<GuildMember> {
    if (member instanceof GuildMember) return member;
    const fetchedGuild = this.getGuild(guild);
    try {
      const fetchedMember: GuildMember = await fetchedGuild.members.fetch(
        member
      );
      return fetchedMember;
    } catch (error) {
      console.error(`Failed to fetch member: ${error}`);
      throw new CustomDiscordError(`Member not found in the guild.`);
    }
  }

  async notifyUser(member: GuildMember | User, message: string): Promise<void> {
    try {
      // ToDo: Has to be implemented with IMessage with customization options
      await member.send(message);
    } catch (error: any) {
      if (error.code === 50007) {
        console.log("Could not send DM to the user:", member.id);
      } else {
        console.error("Error sending DM:", error);
      }
    }
  }
}

export default DiscordUtils;
