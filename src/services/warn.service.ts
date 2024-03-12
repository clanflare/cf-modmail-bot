import model from "@/models/warn.model";
import type { IWarn, Warn } from "@/types/models";

export const create = async (data: Warn): Promise<IWarn> => model.create(data);

export const getWarns = async (
  query: Partial<Pick<Warn, "guildId" | "userId" | "actionBy">>,
): Promise<IWarn[]> => model.find(query).sort({ createdAt: -1 }).exec();