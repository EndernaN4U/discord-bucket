import { Client, GatewayIntentBits } from 'discord.js';

export const initClient = async (discordToken: string): Promise<Client> => {
  // Default settigs for the client, can be extended in the future if needed
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
