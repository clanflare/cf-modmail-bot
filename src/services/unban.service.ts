import model from "@/models/unban.model";
import type { IUnban, Unban } from "@/types/models";

export const create = async (data: Unban): Promise<IUnban> => model.create(data);