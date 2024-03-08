import model from "@/models/timeout.model";
import type { Timeout, ITimeout } from "@/types/models";

export const create = async (data: Timeout): Promise<ITimeout> => model.create(data);

// export const getTimeouts = async (
//   query: Partial<Pick<Timeout, "guildId" | "userId" | "actionBy">>,
// ): Promise<ITimeout[]> => model.find(query).exec();

// export const getLatestTimeout = async (
//   query: Partial<Pick<Timeout, "guildId" | "userId" | "actionBy" | "reason">>,
// ): Promise<ITimeout> =>
//   model.findOne(query).sort({ createdAt: -1 }).exec() as Promise<ITimeout>;
