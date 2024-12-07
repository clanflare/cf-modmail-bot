import model from "@/models/warnConfig.model";
import type { WarnConfig, IWarnConfig } from "@/types/models";

export const create = async (data: WarnConfig): Promise<IWarnConfig> =>
  model.create(data);

export const getServersWarnConfigs = async (
  query: Partial<Pick<WarnConfig, "guildId">>
): Promise<IWarnConfig[]> => model.find(query).exec() as Promise<IWarnConfig[]>;

export const getWarnConfig = async (
  query: Partial<Pick<WarnConfig, "guildId" | "warnNumber">>
): Promise<IWarnConfig> => model.findOne(query).exec() as Promise<IWarnConfig>;
