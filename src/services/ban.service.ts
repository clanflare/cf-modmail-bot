import model from "@/models/ban.model";
import type { Ban, IBan } from "@/types/models";

export const create = async (data: Ban): Promise<IBan> => model.create(data);

export const getBans = async (
  query: Partial<Pick<Ban, "serverId" | "userId" | "actionBy">>,
): Promise<IBan[]> => model.find(query).exec();

export const getLatestBan = async (
  query: Partial<Pick<Ban, "serverId" | "userId" | "actionBy">>,
): Promise<IBan> => model.findOne(query).sort({ createdAt: -1 }).exec() as Promise<IBan>;

