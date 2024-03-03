import { jwtSecret } from "@/config";
import serverConfigModel from "@/models/serverConfig.model";
import type { Payload } from "@/types/jwt";
import type { IServerConfig, ISupportMessage } from "@/types/models";
import type { PostConfigContext } from "@/validators/configEditor";
import type { Context } from "elysia";
import jwt from "jsonwebtoken";

export const saveConfig = async (context: PostConfigContext) => {
  const token = context.headers.authorization?.split(" ")[1];
  if (!token) {
    return {
      message: "No token provided",
    };
  }
  const decoded = jwt.verify(token, jwtSecret) as Payload;

  const serverConfig: IServerConfig =
    (await serverConfigModel.findOne({
      guildId: decoded.guildId,
    })) || ({} as IServerConfig);

  if (!serverConfig) {
    context.set.status = 404;
    return {
      message: "Server not found",
      code: 404,
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
      message: "signup controller",
      data,
    };
  }

  return {
    message: "signup controller",
  };
};

export const getConfig = async (context: Context) => {
  const token = context.headers.authorization?.split(" ")[1];
  if (!token) {
    return {
      message: "No token provided",
    };
  }
  const decoded = jwt.verify(token, jwtSecret) as Payload;

  const serverConfig: IServerConfig =
    (await serverConfigModel.findOne({
      guildId: decoded.guildId,
    })) || ({} as IServerConfig);
  if (!serverConfig) {
    const data: IServerConfig = await serverConfigModel.create({
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
