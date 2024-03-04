import model from "@/models/ban.model";
import type { Ban, IBan } from "@/types/models";

export const create = async (data: Ban): Promise<IBan> => model.create(data);

export const getBans = async (
  query: Pick<Ban, "serverId" | "userId" | "actionBy">,
): Promise<IBan[]> => model.find(query).exec();
