import { EmbedBuilder, TextChannel } from 'discord.js';

export enum LogLevel {
  INFO = 0x3498db, // Light Blue
  SUCCESS = 0x2ecc71, // Green
  WARN = 0xf1c40f, // Yellow
  ERROR = 0xe74c3c, // Red
}

export type LogLevelKey = keyof typeof LogLevel;

const LogIcons: Record<LogLevelKey, string> = {
  ['INFO']: 'ℹ️',
  ['SUCCESS']: '✅',
  ['WARN']: '⚠️',
  ['ERROR']: '🚨',
};

export const log = async (
  channel: TextChannel,
  level: LogLevelKey,
  title: string,
  content: string
): Promise<void> => {
  const icon = LogIcons[level] || '📝';

  const embed = new EmbedBuilder()
    .setColor(LogLevel[level])
    .setTitle(`${icon} ${title}`)
    .setDescription(content)
    .setTimestamp();

  await channel.send({ embeds: [embed] });
};
