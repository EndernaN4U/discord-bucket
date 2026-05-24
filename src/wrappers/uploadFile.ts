import { AttachmentBuilder, Client, TextChannel } from 'discord.js';

export const uploadFile = async (
  client: Client,
  channelId: string,
  file: Buffer,
  fileName: string
): Promise<string> => {
  const channel = await client.channels.fetch(channelId);

  if (!channel || !(channel instanceof TextChannel)) {
    throw new Error(`Missing or invalid channel ID: ${channelId}`);
  }

  const attachment = new AttachmentBuilder(file, { name: fileName });

  const message = await channel.send({
    content: fileName,
    files: [attachment],
  });

  return message.id;
};
