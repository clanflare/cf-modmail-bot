import model from "@/models/roleModeration.model";
import type { IRoleModeration, RoleModeration } from "@/types/models";

export const create = async (data: RoleModeration): Promise<IRoleModeration> => model.create(data);

export const getRoleModerations = async (
  query: Partial<Pick<RoleModeration, "guildId" | "userId" | "actionBy">>,
): Promise<IRoleModeration[]> => model.find(query).exec();