import type { Customization } from "@/types/models";

export const defaultCustomization: Customization = {
  serverId: "",
  supportMessage: {
    content: "Support message",
    embeds: [],
  },
  commandId: "",
  variables: [],
};
