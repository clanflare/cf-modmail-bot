import type { SlashCommand } from "@/types/comands";
import { ban } from "./moderation";
import { ping } from "./utility";
import { Collection } from "discord.js";

const collelection = new Collection<string, SlashCommand>();

collelection.set("ban", ban);
collelection.set("ping", ping);

export default collelection;
