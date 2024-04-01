import { getMember } from "@/action";
import type { TextCommand } from "@/types/commands";
import { GuildMember, PermissionFlagsBits } from "discord.js";

const regexforids = new RegExp(/^\d{16,20}$/); //put this as a util and use it for any id validation 

export const wvc: TextCommand = {
  name: "whichvc",
  aliases: ["wv"],
  argumentParser: async (message) => {
    const args = [];
    if (message.reference){
      args.push((await message.fetchReference()).member);
    }
    const parsedArgs = message.content.split(" ");
    parsedArgs.shift();
    parsedArgs.forEach((arg) => {
      if (message.guild && regexforids.test(arg)) {
        const member = getMember(arg, message.guild).catch(() => null); // write a utility to populate an array of ids to discord.js objects
        if (member) {
          args.push(member);
        }
      }
    });
    if (!args.length || !args[0]) {
      args.push(message.author);
    }
    return args;
  },
  validator: async (message,args) => {
     if(!message.guild && !message.member?.permissions.has(PermissionFlagsBits.ManageMessages))
        throw new Error("You need to be in a server to use this command"); //custom error implementation
      else if(args.length > 4)
        throw new Error("You can only mention upto 4 members at a time"); // in the custom error implementation, the error message will be sent to the user and then deleted after a certain time and all this config will be optional and present in the generic custom error implementation
  },
  execute: async (message,args) => {
    if(args.length === 1){
      // console.log(message.args[0]);
      const member = args[0];
      console.log(member.voice);
      if(member.voice.channel){
        message.reply(`${member.displayName} is in ${member.voice.channel.name} - <#${member.voice.channel.id}>`);
      }else{
        message.channel.send(`${member.displayName} is not in a voice channel`);
      }
  }
  else{
    const members = args; // need to be fixed when the argument parser type declaration is made
      message.channel.send(`The following members are in a voice channel: ${args.map((member:any) => `${member.displayName} - ${member.voice.channel?.id?`<#${member.voice.channel?.id}>`:"Not in VC"}`).join(", ")}`);
    }
  }
  }
