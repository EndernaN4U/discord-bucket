import { Client, TextChannel } from 'discord.js';

export const getTextChannel = async (
  client: Client,
  channelId: string
): Promise<TextChannel | null> => {
  const cachedChannel = client.channels.cache.get(channelId);
  if (cachedChannel && cachedChannel instanceof TextChannel) {
    return cachedChannel;
  }

  const fetchedChannel = await client.channels.fetch(channelId).catch(() => null);
  return fetchedChannel instanceof TextChannel ? fetchedChannel : null;
};
