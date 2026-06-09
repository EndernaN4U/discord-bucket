import { Client, TextChannel, Guild } from 'discord.js';
import { getGuild } from './guild/getGuild.js';
import { initClient } from './client/init.js';
import { createChannel } from './channels/createChannel.js';
import { getTextChannel } from './channels/getTextChannel.js';
import { uploadFile } from './files/uploadFile.js';
import { downloadFile } from './files/downloadFile.js';
import { LogLevelKey, log } from './logger/log.js';

type DiscordBucketOptions = {
  discordToken: string;
  guildId: string;
  loggerChannelId?: string;
};

export default class DiscordBucket {
  discordClient: Client;

  guild: Guild;
  loggerChannel?: TextChannel = undefined;

  constructor(client: Client, guild: Guild) {
    this.discordClient = client;
    this.guild = guild;
  }

  /**
   * Initializes the DiscordBucket instance by creating a Discord client and fetching the specified guild.
   * @param options Config options
   * @returns A promise that resolves to an initialized DiscordBucket instance.
   */
  static async init(options: DiscordBucketOptions): Promise<DiscordBucket> {
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

  /**
   * Inits the logger channel for DiscordBucket.log method
   * @param channelId Copied from discord channel id
   */
  async initLoggerChannel(channelId: string): Promise<void> {
    const channel = await getTextChannel(this.discordClient, channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found or is not a TextChannel.`);
    }
    this.loggerChannel = channel;
  }

  // CHANNELS
  /**
   * Creates a new text channel in the guild specified during init.
   * @param channelName Channel name to create.
   * @returns The ID of the created channel.
   */
  async createChannel(channelName: string): Promise<string> {
    return await createChannel(this.guild, channelName);
  }

  // FILES
  /**
   * Uploads a file to the specified channel.
   * @param channelId The ID of the channel to upload the file to.
   * @param file The file buffer to upload.
   * @param fileName The name of the file to upload.
   * @returns The URL of the uploaded file.
   */
  async uploadFile(channelId: string, file: Buffer, fileName: string): Promise<string> {
    const channel = await getTextChannel(this.discordClient, channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found or is not a TextChannel.`);
    }

    return await uploadFile(channel, file, fileName);
  }

  /**
   * Downloads a file from the specified channel using its message ID.
   * @param channelId The ID of the channel to download the file from.
   * @param messageId The ID of the message containing the file.
   * @returns A promise resolving to the downloaded file buffer and its name.
   */
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

  // LOGGER
  /**
   * Logs a message to specified logger channel
   * @param level INFO | SUCCESS | WARN | ERROR
   * @param title Title of the log message
   * @param content Content that will be logged in the logger channel
   */
  async log(level: LogLevelKey, title: string, content: string): Promise<void> {
    if (!this.loggerChannel) {
      throw new Error('Logger channel is not initialized. Please call initLoggerChannel() first.');
    }

    await log(this.loggerChannel, level, title, content);
  }
}
