import model from "@/models/warn.model";
import type { IWarn, Warn } from "@/types/models";

export const create = async (data: Warn): Promise<IWarn> => model.create(data);