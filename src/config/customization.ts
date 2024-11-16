import type { Customization } from "@/types/models";

export const defaultCustomization: Customization = {
  guildId: "",
  message: {
    content: "Support Message",
    embeds: [],
  },
  commandId: "",
  variables: [],
  logChannelId: "",
};
