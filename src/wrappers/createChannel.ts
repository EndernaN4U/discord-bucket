import { ChannelType, Client } from 'discord.js';

export const createChannel = async (
  client: Client,
  guildId: string,
  channelName: string
): Promise<string> => {
  const guild = await client.guilds.fetch(guildId);

  if (!guild) {
    throw new Error(`Missing or invalid guild ID: ${guildId}`);
  }

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
  });

  return channel.id;
};
