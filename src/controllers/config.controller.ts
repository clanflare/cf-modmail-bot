import { jwtSecret } from "@/config/config";
import serverConfigModel from "@/models/modmailConfig.model";
import type { Payload } from "@/types/jwt";
import type { IModmailConfig, ISupportMessage } from "@/types/models";
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
  const decoded = jwt.verify(token, jwtSecret) as Payload;

  const serverConfig: IModmailConfig =
    (await serverConfigModel.findOne({
      guildId: decoded.guildId,
    })) || ({} as IModmailConfig);

  if (!serverConfig) {
    context.set.status = 404;
    return {
      message: "Server not found",
      code: 404,
      data: undefined,
    };
  }

  const { body } = context;
  const { archiveChannelId, modmailCategoryId } = body;
  if (archiveChannelId && modmailCategoryId) {
    const data = await serverConfigModel.findOneAndUpdate(
      { guildId: decoded.guildId },
      {
        ...body,
      },
      { new: true }
    );
    return {
      message: "Successful",
      data,
      code: 200,
    };
  }

  return {
    message: "Invalid data",
    code: 400,
    data: undefined,
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
  const decoded = jwt.verify(token, jwtSecret) as Payload;

  const serverConfig: IModmailConfig =
    (await serverConfigModel.findOne({
      guildId: decoded.guildId,
    })) || ({} as IModmailConfig);
  if (!serverConfig) {
    const data: IModmailConfig = await serverConfigModel.create({
      serverId: decoded.guildId,
      archiveChannelId: "",
      modmailCategoryId: "",
      initialMessage: {
        message: <ISupportMessage>{
          content: "Hello! How can we help you?",
        },
        buttons: [],
      },
    });
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
