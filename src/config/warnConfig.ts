import type { WarnConfig } from "@/types/models/warnConfig";

export const defaultWarnConfig: WarnConfig[] = [
  {
    guildId: "default",
    warnNumber: 0,
    actions: [
      {
        duration: 2000,
        reason: "Warn Timeout",
        type: "timeout",
      },
    ],
  },
  {
    guildId: "default",
    warnNumber: 1,
    actions: [
      {
        duration: 2000,
        reason: "Warn 1 Timeout",
        type: "timeout",
      },
      {
        roleIds: [],
        action: "grant",
        duration: 2000,
        reason: "Warn 1 Role Moderation",
        type: "roleModeration",
      },
    ],
  },
  {
    guildId: "default",
    warnNumber: 2,
    actions: [
      {
        duration: 1000,
        reason: "Warn 2 Ban",
        type: "ban",
      },
    ],
  },
];
