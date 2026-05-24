import { Client, TextChannel, EmbedBuilder } from 'discord.js';

export enum LogLevel {
  INFO = 0x3498db, // Light Blue
  SUCCESS = 0x2ecc71, // Green
  WARN = 0xf1c40f, // Yellow
  ERROR = 0xe74c3c, // Red
}

const LogIcons: Record<LogLevel, string> = {
  [LogLevel.INFO]: 'ℹ️',
  [LogLevel.SUCCESS]: '✅',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '🚨',
};

export class DiscordLogger {
  private static instance: DiscordLogger | null = null;
  private channel!: TextChannel;

  private constructor() {}

  public static async init(client: Client, channelId: string): Promise<DiscordLogger> {
    if (!DiscordLogger.instance) {
      DiscordLogger.instance = new DiscordLogger();
    }

    const fetchedChannel = await client.channels.fetch(channelId);
    if (!fetchedChannel || !(fetchedChannel instanceof TextChannel)) {
      throw new Error('The provided ID does not point to a valid text channel.');
    }

    DiscordLogger.instance.channel = fetchedChannel;
    return DiscordLogger.instance;
  }

  public static getInstance(): DiscordLogger {
    if (!DiscordLogger.instance) {
      throw new Error(
        'DiscordLogger instance has not been initialized yet. Call DiscordLogger.init() first.'
      );
    }
    return DiscordLogger.instance;
  }

  public async log(level: LogLevel, title: string, content: string): Promise<void> {
    const icon = LogIcons[level] || '📝';

    const embed = new EmbedBuilder()
      .setColor(level)
      .setTitle(`${icon} ${title}`)
      .setDescription(content)
      .setTimestamp();

    await this.channel.send({ embeds: [embed] });
  }
}
