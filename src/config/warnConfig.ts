import type { WarnConfig } from "@/types/models/warnConfig";

export const defaultWarnConfig: WarnConfig[] = [
  {
    guildId: "default",
    warnNumber: 0,
    actions: [
      {
        duration: 24*60*60*1000,
        reason: "Max Warn Timeout",
        type: "Timeout",
      },
    ],
  },
  {
    guildId: "default",
    warnNumber: 1,
    actions: [ ],
  },
  {
    guildId: "default",
    warnNumber: 2,
    actions: [
      {
        duration: 2*60*60*1000,
        reason: "Warn 2 Timeout",
        type: "Timeout",
      },
    ],
  },
  {
    guildId: "default",
    warnNumber: 3,
    actions: [
      {
        duration: 4*60*60*1000,
        reason: "Warn 3 Timeout",
        type: "Timeout",
      },
    ],
  },
  {
    guildId: "default",
    warnNumber: 4,
    actions: [
      {
        duration: 8*60*60*1000,
        reason: "Warn 4 Timeout",
        type: "Timeout",
      },
    ],
  },
  {
    guildId: "default",
    warnNumber: 5,
    actions: [
      {
        duration: 12*60*60*1000,
        reason: "Warn 5 Timeout",
        type: "Timeout",
      },
    ],
  }
];
