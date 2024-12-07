import model from "@/models/unban.model";
import type { IUnban, Unban } from "@/types/models";

export const create = async (data: Unban): Promise<IUnban> =>
  model.create(data);

export const getUnbans = async (
  query: Partial<Pick<Unban, "guildId" | "userId" | "actionBy" | "reason">>
): Promise<IUnban[]> => model.find(query).sort({ createdAt: -1 }).exec();
