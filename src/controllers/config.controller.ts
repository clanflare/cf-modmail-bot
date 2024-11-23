import { JWT_SECRET } from "@/config/config";
import modmailConfigModel from "@/models/modmailConfig.model";
import { createDefaultConfigForGuild, getModmailConfig, updateModmailConfig } from "@/services/config.service";
import type { Payload } from "@/types/jwt";
import type { IModmailConfig } from "@/types/models";
import type { PostConfigContext } from "@/validators/config";
import type { Context } from "elysia";
import jwt from "jsonwebtoken";

export const saveConfig = async (context: PostConfigContext) => {
  const token = context.headers.authorization?.split(" ")[1];
  if (!token) {
    return {
      message: "No token provided",
      code: 400,
      data: undefined,
    };
  }
  const decoded = jwt.verify(token, JWT_SECRET) as Payload;

  const serverConfig: IModmailConfig =
    (await modmailConfigModel.findOne({
      guildId: decoded.guildId,
    })) || ({} as IModmailConfig);


  console.log(serverConfig);
  if (!serverConfig || !serverConfig.guildId) {
    context.set.status = 404;
    return {
      message: "Server not found",
      code: 404,
      data: undefined,
    };
  }

  const { body } = context;
  // const { archiveChannelId, modmailCategoryId } = body;
  const { expiresAt } = decoded;
  if (Date.now() > expiresAt) {
    return {
      message: "Token expired",
      code: 400,
      data: undefined,
    };
  }

  const data = await updateModmailConfig(decoded.guildId, body);
  if (!data) {
    return {
      message: "Failed to update server",
      code: 500,
      data: undefined,
    };
  }
  return {
    message: "Successful",
    data,
    code: 200,
  };

};

export const getConfig = async (context: Context) => {
  const token = context.headers.authorization?.split(" ")[1];
  if (!token) {
    return {
      message: "No token provided",
      code: 400,
      data: undefined,
    };
  }
  const decoded = jwt.verify(token, JWT_SECRET) as Payload;

  const serverConfig = await getModmailConfig(decoded.guildId);
  if (!serverConfig || !serverConfig.guildId) {
    const data = createDefaultConfigForGuild(decoded.guildId);
    if (!data) {
      return {
        message: "Failed to create server",
        code: 500,
        data: undefined,
      };
    }
    return {
      message: "Successful",
      data,
      code: 200,
    };
  }
  return {
    message: "Successful",
    data: serverConfig,
    code: 200,
  };
};
