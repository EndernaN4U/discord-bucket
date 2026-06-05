import { ChannelType, Guild } from 'discord.js';

export const createChannel = async (guild: Guild, channelName: string): Promise<string> => {
  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
  });

  return channel.id;
};
