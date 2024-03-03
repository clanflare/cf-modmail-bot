import model from "@/models/ban.model";
import type { IBan } from "@/types/models";

export const create = async (data: IBan): Promise<IBan> => model.create(data);

export const getBans = async (
  query: Pick<IBan, "serverId" | "userId" | "actionBy">,
): Promise<IBan[]> => model.find(query).exec();
