import { Client, GatewayIntentBits } from 'discord.js';

export const initClient = async (discordToken: string): Promise<Client> => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  await client.login(discordToken);

  return client;
};

export * from './wrappers/downloadFile.js';
export * from './wrappers/uploadFile.js';
export * from './wrappers/createChannel.js';
