import { AttachmentBuilder, TextChannel } from 'discord.js';

export const uploadFile = async (
  channel: TextChannel,
  file: Buffer,
  fileName: string
): Promise<string> => {
  const attachment = new AttachmentBuilder(file, { name: fileName });

  const message = await channel.send({
    content: fileName,
    files: [attachment],
  });

  return message.id;
};
