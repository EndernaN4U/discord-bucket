import { Client, TextChannel } from 'discord.js';

export const downloadFile = async (
  client: Client,
  channelId: string,
  messageId: string
): Promise<{ file: Buffer; fileName: string }> => {
  const channel = await client.channels.fetch(channelId);

  if (!channel || !(channel instanceof TextChannel)) {
    throw new Error(`Missing or invalid channel ID: ${channelId}`);
  }

  const message = await channel.messages.fetch(messageId);
  const attachment = message.attachments.first();

  if (!attachment) {
    throw new Error(`Message with ID ${messageId} does not contain an attachment.`);
  }

  const response = await fetch(attachment.url);

  if (!response.ok) {
    throw new Error(`Failed to download file from URL: ${attachment.url}`);
  }

  const fileBuffer = Buffer.from(await response.arrayBuffer());

  return { file: fileBuffer, fileName: attachment.name };
};
