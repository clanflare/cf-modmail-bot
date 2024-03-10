import type { WarnActions, IWarnConfig } from "@/types/models/warnConfig";
import { Schema, model } from "mongoose";

// Validation: Allowed format: [Ban] | (Timeout | RoleModeration)[] | null
const actionsValidator = (actions: WarnActions) => {
  if (actions === null) return true;
  if (!Array.isArray(actions)) return false;
  if (actions.length === 0) return false;
  for (const action of actions) {
    if (action.type === "ban") {
      if (actions.length > 1) return false;
    }
  }
  return true;
};

const actionSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["ban", "timeout", "roleModeration"],
    },
    duration: { type: Number, required: true },
    reason: { type: String, required: true },
    roleIds: [{ type: String, required: false }], // Only relevant for 'roleModeration'
    action: { type: String, enum: ["grant", "revoke"], required: false }, // Only relevant for 'roleModeration'
  },
  { _id: false, strict: "throw" }
);

const WarnConfigSchema = new Schema<IWarnConfig>({
  guildId: { type: String, required: true },
  warnNumber: { type: Number, required: true },
  actions: { type: [actionSchema], validate: actionsValidator, required: true },
});

export default model<IWarnConfig>("WarnConfig", WarnConfigSchema);
