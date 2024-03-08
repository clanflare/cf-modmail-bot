import type { Customization } from "@/types/models";

export const defaultCustomization: Customization = {
  guildId: "",
  supportMessage: {
    content: "Support message",
    embeds: [],
  },
  commandId: "",
  variables: [],
  logChannelId: "",
};
