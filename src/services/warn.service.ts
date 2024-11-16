import model from "@/models/warn.model";
import type { IWarn, Warn } from "@/types/models";

export const create = async (data: Warn): Promise<IWarn> => model.create(data);

export const getWarns = async (
  query: Partial<Pick<Warn, "guildId" | "userId" | "actionBy">>
): Promise<IWarn[]> => model.find(query).sort({ createdAt: -1 }).populate('actions.action').exec();

export const deleteWarn = async (
  query: Partial<{
    warnId: string;
    guildId: string;
    userId: string;
  }>
): Promise<IWarn | null> => model.findOneAndDelete({_id: query.warnId, guildId: query.guildId, userId: query.userId}).exec();
