import model from "@/models/modmailConfig.model";
import type { Ban, IBan, IModmailConfig, ISupportMessage } from "@/types/models";

export const getModmailConfig = async (guildId: string): Promise<IModmailConfig | null> => model.findOne({
    guildId
  })

export const createDefaultConfigForGuild = async (guildId: string): Promise<IModmailConfig> => {
    return model.create({
        guildId,
        archiveChannelId: "",
        modmailCategoryId: "",
        initialMessage: {
          message: <ISupportMessage>{
            content: "Hello! How can we help you?",
          },
          aiPrompt: "Please describe your issue in detail.",
          buttons: [],
        },
      });
}

export const updateModmailConfig = async (guildId: string, data: Partial<IModmailConfig>): Promise<IModmailConfig | null> => {
    return model.findOneAndUpdate({
        guildId
    }, data, {
        new: true,
        upsert: true,
    })
}