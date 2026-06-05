import { Client, TextChannel, Guild } from 'discord.js';
import { getGuild } from './guild/getGuild';
import { initClient } from './client/init';
import { createChannel } from './channels/createChannel';
import { getTextChannel } from './channels/getTextChannel';
import { uploadFile } from './files/uploadFile';
import { downloadFile } from './files/downloadFile';
import { LogLevel, log } from './logger/log';

type DiscordBucketOptions = {
  discordToken: string;
  guildId: string;
  loggerChannelId?: string;
};

export default class DiscordBucket {
  discordClient: Client;

  guildId: Guild;
  loggerChannel?: TextChannel = undefined;

  constructor(client: Client, guildId: Guild) {
    this.discordClient = client;
    this.guildId = guildId;
  }

  static async init(options: DiscordBucketOptions) {
    const client = await initClient(options.discordToken);
    if (!client) {
      throw new Error(
        'Failed to initialize Discord client. Please check your token and try again.'
      );
    }

    const guild = await getGuild(client, options.guildId);

    const bucket = new DiscordBucket(client, guild);

    if (options.loggerChannelId) {
      await bucket.initLoggerChannel(options.loggerChannelId);
    }

    return bucket;
  }

  async initLoggerChannel(channelId: string) {
    const channel = await getTextChannel(this.discordClient, channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found or is not a TextChannel.`);
    }
    this.loggerChannel = channel;
  }

  //Channels
  async createChannel(channelName: string): Promise<string> {
    return await createChannel(this.guildId, channelName);
  }

  //Files
  async uploadFile(channelId: string, file: Buffer, fileName: string): Promise<string> {
    const channel = await getTextChannel(this.discordClient, channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found or is not a TextChannel.`);
    }

    return await uploadFile(channel, file, fileName);
  }

  async downloadFile(
    channelId: string,
    messageId: string
  ): Promise<{ file: Buffer; fileName: string }> {
    const channel = await getTextChannel(this.discordClient, channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found or is not a TextChannel.`);
    }

    return await downloadFile(channel, messageId);
  }

  //Logger
  async log(level: LogLevel, title: string, content: string): Promise<void> {
    if (!this.loggerChannel) {
      throw new Error('Logger channel is not initialized. Please call initLoggerChannel() first.');
    }

    await log(this.loggerChannel, level, title, content);
  }
}
