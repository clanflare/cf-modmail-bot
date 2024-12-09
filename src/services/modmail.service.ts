import model from "@/models/modmail.model";
import type { Modmail, IModmail } from "@/types/models";

export const getModmailById = async (id: string): Promise<IModmail | null> =>
  model.findById(id);

export const getOpenModmailByUserId = async (
  userId: string,
  guildId: string
): Promise<IModmail | null> =>
  model.findOne({
    userId,
    guildId,
    status: "open",
  });

export const getAllOpenModmails = async (guildId: string): Promise<IModmail[] | null> =>
  model.find({
    status: "open",
    guildId,
  });

export const updateModmail = async (
  id: string,
  data: Partial<IModmail>
): Promise<IModmail | null> => {
  return model.findByIdAndUpdate(id, data, {
    new: true,
  });
};

export const createModmail = async (data: Modmail): Promise<IModmail> => {
  return model.create(data);
};
